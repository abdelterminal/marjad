'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slug';
import { Button } from '@/components/ui/button';

interface Category {
  id: number;
  nameFr: string;
  nameAr: string;
  nameEn: string;
  slug: string;
}

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = !!category;

  const [nameFr, setNameFr] = useState(category?.nameFr ?? '');
  const [nameAr, setNameAr] = useState(category?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(category?.nameEn ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameFrChange(val: string) {
    setNameFr(val);
    if (!isEdit) {
      setSlug(slugify(val));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const body = {
      nameFr,
      nameAr,
      nameEn: nameEn || nameFr,
      slug: slug || slugify(nameFr),
    };

    try {
      const url = isEdit ? `/api/admin/categories/${category.id}` : '/api/admin/categories';
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

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/categories');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Nom (FR) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nameFr}
            onChange={(e) => handleNameFrChange(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Nom (AR) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Nom (EN) <span className="text-gray-400 text-xs">(optionnel)</span>
          </label>
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder={nameFr || 'Identique à FR'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <p className="text-xs text-gray-400">Auto-généré depuis le nom FR</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer la catégorie'}
        </Button>
        {!isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/categories')}
          >
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}
