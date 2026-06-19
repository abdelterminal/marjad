'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './ImageUploader';

interface Category {
  id: number;
  nameFr: string;
  nameAr: string;
  slug: string;
}

interface Product {
  id: number;
  nameFr: string;
  nameAr: string;
  descriptionFr: string | null;
  descriptionAr: string | null;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  categoryId: number | null;
  images: string[];
  isPublished: boolean;
  isFeatured: boolean;
}

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameFr, setNameFr] = useState(product?.nameFr ?? '');
  const [nameAr, setNameAr] = useState(product?.nameAr ?? '');
  const [descriptionFr, setDescriptionFr] = useState(product?.descriptionFr ?? '');
  const [descriptionAr, setDescriptionAr] = useState(product?.descriptionAr ?? '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice ?? '');
  const [stock, setStock] = useState<number>(product?.stock ?? 0);
  const [categoryId, setCategoryId] = useState<string>(
    product?.categoryId ? String(product.categoryId) : '',
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [isPublished, setIsPublished] = useState(product?.isPublished ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const body = {
      nameFr,
      nameAr,
      descriptionFr: descriptionFr || undefined,
      descriptionAr: descriptionAr || undefined,
      price,
      compareAtPrice: compareAtPrice || undefined,
      stock,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      images,
      isPublished,
      isFeatured,
    };

    try {
      const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Une erreur est survenue');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form-panel w-full max-w-[46rem] space-y-6 p-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Nom FR */}
        <div className="admin-field">
          <label className="admin-label">
            Nom (FR) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nameFr}
            onChange={(e) => setNameFr(e.target.value)}
            required
            className="admin-input"
          />
        </div>

        {/* Nom AR */}
        <div className="admin-field">
          <label className="admin-label">
            Nom (AR) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
            className="admin-input"
          />
        </div>

        {/* Description FR */}
        <div className="admin-field sm:col-span-2">
          <label className="admin-label">Description (FR)</label>
          <textarea
            value={descriptionFr}
            onChange={(e) => setDescriptionFr(e.target.value)}
            rows={4}
            className="admin-textarea"
          />
        </div>

        {/* Description AR */}
        <div className="admin-field sm:col-span-2">
          <label className="admin-label">Description (AR)</label>
          <textarea
            dir="rtl"
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            rows={4}
            className="admin-textarea"
          />
        </div>

        {/* Prix */}
        <div className="admin-field">
          <label className="admin-label">
            Prix (MAD) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="admin-input"
          />
        </div>

        {/* Prix barré */}
        <div className="admin-field">
          <label className="admin-label">Prix barré (MAD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            className="admin-input"
          />
        </div>

        {/* Stock */}
        <div className="admin-field">
          <label className="admin-label">Stock</label>
          <input
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value) || 0)}
            className="admin-input"
          />
        </div>

        {/* Catégorie */}
        <div className="admin-field">
          <label className="admin-label">Catégorie</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="admin-select"
          >
            <option value="">— Aucune catégorie —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.nameFr}
              </option>
            ))}
          </select>
        </div>

        {/* Images */}
        <div className="admin-field sm:col-span-2">
          <label className="admin-label">Images</label>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        {/* Toggles */}
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="size-4 rounded border-gray-300 accent-gray-900"
            />
            <span className="text-sm font-medium text-gray-700">Publié</span>
          </label>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="size-4 rounded border-gray-300 accent-gray-900"
            />
            <span className="text-sm font-medium text-gray-700">En vedette</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer le produit'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
