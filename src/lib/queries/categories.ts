import { db } from '@/db';
import { categories, products } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import type { AdminCategoryInput } from '@/lib/validators';

export async function listCategories() {
  return db.query.categories.findMany({
    orderBy: (c, { asc }) => [asc(c.nameFr)],
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });
}

// ─── Admin functions ───────────────────────────────────────────────────────────

export async function createCategory(data: AdminCategoryInput & { slug: string }) {
  const [category] = await db
    .insert(categories)
    .values({
      nameFr: data.nameFr,
      nameAr: data.nameAr,
      nameEn: data.nameEn ?? data.nameFr, // default to nameFr when omitted
      slug: data.slug,
      parentId: data.parentId ?? null,
    })
    .returning();
  return category;
}

export async function updateCategory(id: number, data: Partial<AdminCategoryInput>) {
  const [category] = await db
    .update(categories)
    .set({
      ...(data.nameFr !== undefined && { nameFr: data.nameFr }),
      ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
      ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
    })
    .where(eq(categories.id, id))
    .returning();
  if (!category) throw new Error(`Catégorie #${id} introuvable.`);
  return category;
}

/**
 * Delete a category — throws if any products reference it (409 guard).
 */
export async function deleteCategory(id: number): Promise<void> {
  const refs = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.categoryId, id));

  if (Number(refs[0]?.count ?? 0) > 0) {
    throw new Error('CATEGORY_HAS_PRODUCTS');
  }

  await db.delete(categories).where(eq(categories.id, id));
}

/**
 * Check whether a category slug is already taken (used by ensureUniqueSlug).
 */
export async function isCategorySlugTaken(slug: string): Promise<boolean> {
  const result = await db
    .select({ count: count() })
    .from(categories)
    .where(eq(categories.slug, slug));
  return Number(result[0]?.count ?? 0) > 0;
}
