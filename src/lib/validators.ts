import { z } from 'zod';

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().trim().toLowerCase().pipe(z.email('Adresse e-mail invalide')),
  password: z
    .string()
    .min(10, 'Le mot de passe doit contenir au moins 10 caractères')
    .regex(/\p{L}/u, 'Le mot de passe doit contenir au moins une lettre')
    .regex(/\p{N}/u, 'Le mot de passe doit contenir au moins un chiffre')
    .refine(
      (value) => new TextEncoder().encode(value).length <= 72,
      'Le mot de passe ne doit pas dépasser 72 octets',
    ),
  phone: z.string().optional(),
});

// ─── Morocco phone ─────────────────────────────────────────────────────────────

// Strips common formatting chars before matching — accepts e.g. "06 12 34 56 78"
export const moroccoPhone = z
  .string()
  .transform((val) => val.replace(/[\s\-.\(\)]/g, ''))
  .pipe(
    z.string().regex(
      /^(0[67]\d{8}|\+212[67]\d{8})$/,
      'Numéro de téléphone invalide (ex: 0612345678)',
    ),
  );

// ─── Order create ──────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(120),
  customerPhone: moroccoPhone,
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères').max(100),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères").max(500),
  notes: z.string().max(500).optional(),
  company: z.string().max(0).optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, 'Au moins un article est requis'),
});

export const trackOrderSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  phone: moroccoPhone,
});

// ─── Products query params ─────────────────────────────────────────────────────

export const productsQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().optional(),
  min: z.coerce.number().min(0).optional(),
  max: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(24),
});

// ─── Admin product create / update ────────────────────────────────────────────

export const adminProductSchema = z.object({
  nameFr: z.string().min(2, 'Le nom (FR) doit contenir au moins 2 caractères'),
  nameAr: z.string().min(2, 'Le nom (AR) doit contenir au moins 2 caractères'),
  descriptionFr: z.string().optional(),
  descriptionAr: z.string().optional(),
  detailsFr: z.string().optional(),
  detailsAr: z.string().optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Prix invalide')
    .refine((v) => parseFloat(v) > 0, 'Le prix doit être supérieur à 0'),
  compareAtPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Prix barré invalide')
    .optional(),
  stock: z.number().int().min(0, 'Le stock ne peut pas être négatif'),
  categoryId: z.number().int().positive().optional(),
  images: z
    .array(z.string().regex(/^\/uploads\/[0-9a-f-]{36}\.webp$/, 'Chemin image invalide'))
    .max(10)
    .optional()
    .default([]),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;

// ─── Admin category create / update ───────────────────────────────────────────

export const adminCategorySchema = z.object({
  nameFr: z.string().min(2, 'Le nom (FR) doit contenir au moins 2 caractères'),
  nameAr: z.string().min(2, 'Le nom (AR) doit contenir au moins 2 caractères'),
  nameEn: z.string().min(2).optional(), // defaults to nameFr if omitted
  slug: z.string().optional(),           // auto-generated if empty
  parentId: z.number().int().positive().optional(),
});

export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;

// ─── Admin order status transition ────────────────────────────────────────────

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

// ─── Profile update ───────────────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(120).optional(),
  phone: z
    .string()
    .transform((val) => val.replace(/[\s\-.\(\)]/g, ''))
    .pipe(z.string().regex(/^(0[67]\d{8}|\+212[67]\d{8})$/, 'Numéro de téléphone invalide'))
    .optional(),
});
