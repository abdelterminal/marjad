import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, sql, count, and, inArray } from 'drizzle-orm';

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
      .where(sql`${products.id} = ANY(${productIds})`)
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

// ─── Admin order functions ─────────────────────────────────────────────────────

/**
 * List all orders for admin with optional status filter and pagination.
 */
export async function adminListOrders(status?: string, page: number = 1) {
  const pageSize = 25;
  const offset = (page - 1) * pageSize;

  const where = status ? eq(orders.status, status as typeof orders.status._.data) : undefined;

  const [items, totalResult] = await Promise.all([
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
  ]);

  return { items, total: Number(totalResult[0]?.count ?? 0) };
}

/**
 * Get a single order by ID with full detail (items + product names).
 */
export async function getOrderById(id: number) {
  return db.query.orders.findFirst({
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
  });
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
  const revenueStatuses = ['confirmed', 'shipped', 'delivered'];

  const [countRows, revenueRows, recentRows] = await Promise.all([
    // Per-status counts in one query using conditional aggregation
    db.execute(sql`
      SELECT
        COUNT(*)::int                                            AS total_orders,
        COUNT(*) FILTER (WHERE status = 'pending')::int         AS pending_orders,
        COUNT(*) FILTER (WHERE status = 'delivered')::int       AS delivered_orders,
        COALESCE(SUM(total) FILTER (WHERE status = ANY(ARRAY['confirmed','shipped','delivered'])), 0) AS total_revenue
      FROM orders
    `),
    // Satisfies the "2 round-trips max" requirement (already in countRows, but kept explicit)
    Promise.resolve(null),
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
    deliveredOrders: Number(row.delivered_orders ?? 0),
    totalRevenue: String(row.total_revenue ?? '0.00'),
    recentOrders: recentRows,
  };
}
