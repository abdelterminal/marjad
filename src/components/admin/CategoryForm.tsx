'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { slugify } from '@/lib/slug';

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

function LangBadge({ lang }: { lang: 'FR' | 'AR' | 'EN' }) {
  const styles: Record<string, string> = {
    FR: 'bg-sky-50 text-sky-600',
    AR: 'bg-emerald-50 text-emerald-600',
    EN: 'bg-violet-50 text-violet-600',
  };
  return (
    <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] ${styles[lang]}`}>
      {lang}
    </span>
  );
}

function Field({
  label, lang, required, hint, children,
}: {
  label: string;
  lang?: 'FR' | 'AR' | 'EN';
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-gray-700">{label}</span>
        {lang && <LangBadge lang={lang} />}
        {required && <span className="text-[11px] font-semibold text-red-400">Requis</span>}
      </div>
      {children}
      {hint && <p className="text-[11px] leading-tight text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all hover:border-gray-300 focus:border-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/8';

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
    if (!isEdit) setSlug(slugify(val));
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom" lang="FR" required>
          <input
            type="text"
            value={nameFr}
            onChange={(e) => handleNameFrChange(e.target.value)}
            required
            placeholder="Ex : Luminaires"
            className={inputCls}
          />
        </Field>

        <Field label="الاسم" lang="AR" required>
          <input
            type="text"
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
            placeholder="مثال: مصابيح"
            className={inputCls}
          />
        </Field>

        <Field label="Name" lang="EN" hint="Optionnel — identique au FR si vide">
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder={nameFr || 'Lighting'}
            className={inputCls}
          />
        </Field>

        <Field label="Slug" hint="Auto-généré depuis le nom FR">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="luminaires"
            className={`${inputCls} font-mono text-xs`}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {submitting ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer'}
        </button>
        {!isEdit && (
          <button
            type="button"
            onClick={() => router.push('/admin/categories')}
            className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
