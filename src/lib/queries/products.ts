import { db } from '@/db';
import { products, categories, orderItems } from '@/db/schema';
import { and, eq, gte, lte, asc, desc, count, ilike, or, SQL } from 'drizzle-orm';
import type { AdminProductInput } from '@/lib/validators';

export interface ProductFilters {
  category?: string;
  min?: number;
  max?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  pageSize?: number;
}

export async function listProducts(filters: ProductFilters = {}) {
  const { category, min, max, sort = 'newest', page = 1, pageSize = 24 } = filters;

  const conditions: SQL[] = [eq(products.isPublished, true)];

  // Price range filter
  if (min !== undefined) {
    conditions.push(gte(products.price, String(min)));
  }
  if (max !== undefined) {
    conditions.push(lte(products.price, String(max)));
  }

  // Category filter: join on categories.slug
  if (category) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, category),
    });
    if (cat) {
      conditions.push(eq(products.categoryId, cat.id));
    } else {
      // Unknown category slug — return empty
      return { items: [], total: 0 };
    }
  }

  const where = conditions.length > 1 ? and(...conditions) : conditions[0];

  // Determine sort order
  const orderBy =
    sort === 'price_asc'
      ? asc(products.price)
      : sort === 'price_desc'
        ? desc(products.price)
        : desc(products.createdAt); // newest

  const offset = (page - 1) * pageSize;

  const [items, totalResult] = await Promise.all([
    db.query.products.findMany({
      where,
      orderBy,
      limit: pageSize,
      offset,
      with: {
        category: {
          columns: { id: true, slug: true, nameFr: true, nameAr: true, nameEn: true },
        },
      },
    }),
    db.select({ count: count() }).from(products).where(where),
  ]);

  return { items, total: Number(totalResult[0]?.count ?? 0) };
}

export async function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isPublished, true)),
    with: {
      category: {
        columns: { id: true, slug: true, nameFr: true, nameAr: true, nameEn: true },
      },
    },
  });
}

// ─── Admin query functions ─────────────────────────────────────────────────────

/**
 * List ALL products (including unpublished) for the admin panel.
 * Supports optional text search on nameFr / nameAr.
 */
export async function adminListProducts(q?: string, page: number = 1) {
  const pageSize = 24;
  const offset = (page - 1) * pageSize;

  const conditions: SQL[] = [];
  if (q) {
    conditions.push(or(ilike(products.nameFr, `%${q}%`), ilike(products.nameAr, `%${q}%`))!);
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, totalResult] = await Promise.all([
    db.query.products.findMany({
      where,
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit: pageSize,
      offset,
      with: {
        category: {
          columns: { id: true, slug: true, nameFr: true, nameAr: true, nameEn: true },
        },
      },
    }),
    db.select({ count: count() }).from(products).where(where),
  ]);

  return { items, total: Number(totalResult[0]?.count ?? 0) };
}

export async function createProduct(data: AdminProductInput & { slug: string }) {
  const [product] = await db
    .insert(products)
    .values({
      nameFr: data.nameFr,
      nameAr: data.nameAr,
      descriptionFr: data.descriptionFr ?? null,
      descriptionAr: data.descriptionAr ?? null,
      detailsFr: data.detailsFr ?? null,
      detailsAr: data.detailsAr ?? null,
      slug: data.slug,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      stock: data.stock,
      categoryId: data.categoryId ?? null,
      images: data.images ?? [],
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
    })
    .returning();
  return product;
}

export async function updateProduct(id: number, data: Partial<AdminProductInput>) {
  const [product] = await db
    .update(products)
    .set({
      ...(data.nameFr !== undefined && { nameFr: data.nameFr }),
      ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
      ...(data.descriptionFr !== undefined && { descriptionFr: data.descriptionFr }),
      ...(data.descriptionAr !== undefined && { descriptionAr: data.descriptionAr }),
      ...(data.detailsFr !== undefined && { detailsFr: data.detailsFr }),
      ...(data.detailsAr !== undefined && { detailsAr: data.detailsAr }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.images !== undefined && { images: data.images }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  if (!product) throw new Error(`Produit #${id} introuvable.`);
  return product;
}

/**
 * Delete a product — throws if it has existing order items to prevent orphan refs.
 */
export async function deleteProduct(id: number): Promise<void> {
  // Guard: block if any order_items reference this product
  const refs = await db
    .select({ count: count() })
    .from(orderItems)
    .where(eq(orderItems.productId, id));

  if (Number(refs[0]?.count ?? 0) > 0) {
    throw new Error('PRODUCT_HAS_ORDERS');
  }

  await db.delete(products).where(eq(products.id, id));
}

/**
 * Check whether a product slug is already in use (used by ensureUniqueSlug).
 */
export async function isProductSlugTaken(slug: string): Promise<boolean> {
  const result = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.slug, slug));
  return Number(result[0]?.count ?? 0) > 0;
}
