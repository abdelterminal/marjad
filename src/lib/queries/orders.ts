import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, sql, count, inArray } from 'drizzle-orm';

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  notes?: string;
  items: OrderItemInput[];
  userId?: number;
}

export type OrderRiskHint = {
  type: 'repeat_phone' | 'repeat_address' | 'old_pending';
  label: string;
  tone: 'warning' | 'danger' | 'info';
};

export class StockError extends Error {
  constructor(
    public productId: number,
    public productName: string,
    public available: number,
    public requested: number,
  ) {
    super(
      `Stock insuffisant pour "${productName}": ${available} disponible(s), ${requested} demandé(s).`,
    );
    this.name = 'StockError';
  }
}

export async function createOrder(data: CreateOrderInput): Promise<{ orderId: number; total: string }> {
  return db.transaction(async (tx) => {
    // Re-fetch product prices + stock from DB — never trust client
    const productIds = data.items.map((i) => i.productId);

    // FOR UPDATE serializes concurrent transactions on the same product rows,
    // preventing two simultaneous orders from both passing the stock check.
    const dbProducts = await tx
      .select({
        id: products.id,
        nameFr: products.nameFr,
        price: products.price,
        stock: products.stock,
        isPublished: products.isPublished,
      })
      .from(products)
      .where(inArray(products.id, productIds))
      .for('update');

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Validate stock and compute total in integer minor units (centimes)
    let totalCentimes = 0;

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product || !product.isPublished) {
        throw new StockError(item.productId, `Produit #${item.productId}`, 0, item.quantity);
      }
      if (product.stock < item.quantity) {
        throw new StockError(item.productId, product.nameFr, product.stock, item.quantity);
      }
      // Price is a numeric string from Drizzle — multiply as integers using centimes
      const priceCentimes = Math.round(parseFloat(product.price) * 100);
      totalCentimes += priceCentimes * item.quantity;
    }

    const total = (totalCentimes / 100).toFixed(2);

    // Insert order
    const [order] = await tx
      .insert(orders)
      .values({
        userId: data.userId ?? null,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        city: data.city,
        address: data.address,
        notes: data.notes ?? null,
        paymentMethod: 'cod',
        status: 'pending',
        total,
      })
      .returning({ id: orders.id });

    // Insert order items
    await tx.insert(orderItems).values(
      data.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: productMap.get(item.productId)!.price,
      })),
    );

    // Decrement stock atomically for each product
    for (const item of data.items) {
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }

    return { orderId: order.id, total };
  });
}

export async function getUserOrders(userId: number) {
  return db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: (o, { desc }) => [desc(o.createdAt)],
    with: {
      items: {
        with: {
          product: {
            columns: { id: true, nameFr: true, nameAr: true, slug: true, images: true },
          },
        },
      },
    },
  });
}

export async function getUserOrderById(userId: number, orderId: number) {
  return db.query.orders.findFirst({
    where: sql`${orders.id} = ${orderId} AND ${orders.userId} = ${userId}`,
    with: {
      items: {
        with: {
          product: {
            columns: { id: true, nameFr: true, nameAr: true, slug: true, images: true },
          },
        },
      },
    },
  });
}

function normalizeMoroccoPhone(phone: string) {
  const compact = phone.replace(/[\s\-.\(\)]/g, '');
  return compact.startsWith('+212') ? `0${compact.slice(4)}` : compact;
}

function normalizeAddressKey(city: string, address: string) {
  return `${city.trim().toLowerCase()}|${address.trim().replace(/\s+/g, ' ').toLowerCase()}`;
}

async function getOrderRiskStats() {
  const [phoneRows, addressRows] = await Promise.all([
    db.execute(sql`
      SELECT
        regexp_replace(customer_phone, '[^0-9+]', '', 'g') AS phone_key,
        COUNT(*)::int AS total_count,
        COUNT(*) FILTER (WHERE status = ANY(ARRAY['pending','confirmed']::order_status[]))::int AS active_count
      FROM orders
      GROUP BY phone_key
      HAVING COUNT(*) > 1
    `),
    db.execute(sql`
      SELECT
        lower(trim(city)) || '|' || lower(regexp_replace(trim(address), '\\s+', ' ', 'g')) AS address_key,
        COUNT(*)::int AS total_count,
        COUNT(*) FILTER (WHERE status = ANY(ARRAY['pending','confirmed']::order_status[]))::int AS active_count
      FROM orders
      GROUP BY address_key
      HAVING COUNT(*) > 1
    `),
  ]);

  return {
    phone: new Map(
      (phoneRows.rows as Array<{ phone_key: string; total_count: number; active_count: number }>).map(
        (row) => [normalizeMoroccoPhone(row.phone_key), row],
      ),
    ),
    address: new Map(
      (addressRows.rows as Array<{ address_key: string; total_count: number; active_count: number }>).map(
        (row) => [row.address_key, row],
      ),
    ),
  };
}

function buildRiskHints(
  order: { customerPhone: string; city: string; address: string; status: string; createdAt: Date },
  stats: Awaited<ReturnType<typeof getOrderRiskStats>>,
): OrderRiskHint[] {
  const hints: OrderRiskHint[] = [];
  const phoneStat = stats.phone.get(normalizeMoroccoPhone(order.customerPhone));
  const addressStat = stats.address.get(normalizeAddressKey(order.city, order.address));

  if (phoneStat) {
    hints.push({
      type: 'repeat_phone',
      label: `Même téléphone utilisé sur ${phoneStat.total_count} commandes`,
      tone: phoneStat.active_count > 1 ? 'danger' : 'warning',
    });
  }

  if (addressStat) {
    hints.push({
      type: 'repeat_address',
      label: `Même adresse utilisée sur ${addressStat.total_count} commandes`,
      tone: addressStat.active_count > 1 ? 'danger' : 'warning',
    });
  }

  const ageHours = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60);
  if (order.status === 'pending' && ageHours >= 24) {
    hints.push({
      type: 'old_pending',
      label: `En attente depuis ${Math.floor(ageHours)}h`,
      tone: 'info',
    });
  }

  return hints;
}

export async function trackOrder(orderId: number, phone: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    columns: {
      id: true,
      customerName: true,
      customerPhone: true,
      city: true,
      status: true,
      total: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      items: {
        columns: {
          quantity: true,
          unitPrice: true,
        },
        with: {
          product: { columns: { nameFr: true, nameAr: true, slug: true, images: true } },
        },
      },
    },
  });

  if (!order) return null;

  if (normalizeMoroccoPhone(order.customerPhone) !== normalizeMoroccoPhone(phone)) {
    return null;
  }

  return {
    id: order.id,
    customerName: order.customerName,
    city: order.city,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      product: {
        nameFr: item.product.nameFr,
        nameAr: item.product.nameAr,
        slug: item.product.slug,
        image: item.product.images?.[0] ?? null,
      },
    })),
  };
}

// ─── Admin order functions ─────────────────────────────────────────────────────

/**
 * List all orders for admin with optional status filter and pagination.
 */
export async function adminListOrders(status?: string, page: number = 1) {
  const pageSize = 25;
  const offset = (page - 1) * pageSize;

  const where = status ? eq(orders.status, status as typeof orders.status._.data) : undefined;

  const [items, totalResult, riskStats] = await Promise.all([
    db.query.orders.findMany({
      where,
      orderBy: (o, { desc }) => [desc(o.createdAt)],
      limit: pageSize,
      offset,
      with: {
        user: { columns: { id: true, name: true, email: true } },
        items: {
          with: {
            product: { columns: { id: true, nameFr: true, nameAr: true, slug: true } },
          },
        },
      },
    }),
    db.select({ count: count() }).from(orders).where(where),
    getOrderRiskStats(),
  ]);

  return {
    items: items.map((order) => ({
      ...order,
      riskHints: buildRiskHints(order, riskStats),
    })),
    total: Number(totalResult[0]?.count ?? 0),
  };
}

export async function adminExportOrders(status?: string) {
  const where = status ? eq(orders.status, status as typeof orders.status._.data) : undefined;

  return db.query.orders.findMany({
    where,
    orderBy: (o, { desc }) => [desc(o.createdAt)],
    limit: 1000,
    with: {
      items: {
        with: {
          product: { columns: { nameFr: true, slug: true } },
        },
      },
    },
  });
}

/**
 * Get a single order by ID with full detail (items + product names).
 */
export async function getOrderById(id: number) {
  const [order, riskStats] = await Promise.all([
    db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      user: { columns: { id: true, name: true, email: true, phone: true } },
      items: {
        with: {
          product: {
            columns: { id: true, nameFr: true, nameAr: true, slug: true, images: true },
          },
        },
      },
    },
    }),
    getOrderRiskStats(),
  ]);

  return order
    ? {
        ...order,
        riskHints: buildRiskHints(order, riskStats),
      }
    : null;
}

// Valid COD lifecycle transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export class InvalidTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Transition invalide : ${from} → ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

/**
 * Update an order status, enforcing the COD lifecycle transition table.
 */
export async function updateOrderStatus(id: number, newStatus: string) {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) throw new Error(`Commande #${id} introuvable.`);

  const currentStatus = order.status;
  const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new InvalidTransitionError(currentStatus, newStatus);
  }

  const [updated] = await db
    .update(orders)
    .set({
      status: newStatus as typeof orders.status._.data,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
    .returning();

  return updated;
}

/**
 * Aggregate dashboard metrics.
 */
export async function getDashboardStats() {
  const [countRows, needsActionRows, recentRows] = await Promise.all([
    // Per-status counts in one query using conditional aggregation
    db.execute(sql`
      SELECT
        COUNT(*)::int                                                                    AS total_orders,
        COUNT(*) FILTER (WHERE status = 'pending'::order_status)::int                   AS pending_orders,
        COUNT(*) FILTER (WHERE status = 'confirmed'::order_status)::int                 AS confirmed_orders,
        COUNT(*) FILTER (WHERE status = 'shipped'::order_status)::int                   AS shipped_orders,
        COUNT(*) FILTER (WHERE status = 'delivered'::order_status)::int                 AS delivered_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled'::order_status)::int                 AS cancelled_orders,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::int                         AS today_orders,
        COALESCE(SUM(total) FILTER (WHERE status = ANY(ARRAY['confirmed','shipped','delivered']::order_status[])), 0) AS total_revenue
        ,COALESCE(SUM(total) FILTER (WHERE status = 'delivered'::order_status), 0)      AS delivered_revenue
        ,COALESCE(SUM(total) FILTER (WHERE created_at >= CURRENT_DATE), 0)              AS today_revenue
      FROM orders
    `),
    // Operational queue: orders that should be touched first
    db.query.orders.findMany({
      where: inArray(orders.status, ['pending', 'confirmed']),
      orderBy: (o, { asc, desc }) => [
        sql`CASE ${o.status} WHEN 'pending' THEN 0 WHEN 'confirmed' THEN 1 ELSE 2 END`,
        asc(o.createdAt),
        desc(o.id),
      ],
      limit: 6,
      with: {
        user: { columns: { id: true, name: true, email: true } },
        items: {
          with: {
            product: { columns: { id: true, nameFr: true, nameAr: true, slug: true } },
          },
        },
      },
    }),
    // Last 5 orders with customer info
    db.query.orders.findMany({
      orderBy: (o, { desc }) => [desc(o.createdAt)],
      limit: 5,
      with: {
        user: { columns: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const row = (countRows.rows as Record<string, unknown>[])[0] ?? {};

  return {
    totalOrders: Number(row.total_orders ?? 0),
    pendingOrders: Number(row.pending_orders ?? 0),
    confirmedOrders: Number(row.confirmed_orders ?? 0),
    shippedOrders: Number(row.shipped_orders ?? 0),
    deliveredOrders: Number(row.delivered_orders ?? 0),
    cancelledOrders: Number(row.cancelled_orders ?? 0),
    todayOrders: Number(row.today_orders ?? 0),
    totalRevenue: String(row.total_revenue ?? '0.00'),
    deliveredRevenue: String(row.delivered_revenue ?? '0.00'),
    todayRevenue: String(row.today_revenue ?? '0.00'),
    needsActionOrders: needsActionRows,
    recentOrders: recentRows,
  };
}
