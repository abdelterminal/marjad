'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Check, FileText, Globe, Image as ImageIcon, Loader2, Package2, ShoppingBag, Tag } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import type { LucideIcon } from 'lucide-react';

/* ── Types ──────────────────────────────────────────────── */

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
  detailsFr: string | null;
  detailsAr: string | null;
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

/* ── Sub-components ──────────────────────────────────────── */

function LangBadge({ lang }: { lang: 'FR' | 'AR' }) {
  return (
    <span
      className={[
        'rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em]',
        lang === 'FR' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600',
      ].join(' ')}
    >
      {lang}
    </span>
  );
}

function Field({
  label, lang, required, hint, children,
}: {
  label: string;
  lang?: 'FR' | 'AR';
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-gray-700">{label}</span>
        {lang && <LangBadge lang={lang} />}
        {required && <span className="text-[11px] text-red-400 font-semibold">Requis</span>}
      </div>
      {children}
      {hint && <p className="text-[11px] leading-tight text-gray-400">{hint}</p>}
    </div>
  );
}

function Toggle({
  checked, onChange, label, description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 hover:border-gray-300 hover:bg-white transition-all">
      <div>
        <p className="text-[13px] font-semibold text-gray-800">{label}</p>
        {description && <p className="mt-0.5 text-[11px] text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20',
          checked ? 'bg-gray-900' : 'bg-gray-200',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

function Section({
  icon: Icon, title, description, children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-x-10 gap-y-4 border-b border-gray-100 py-8 first:pt-0 last:border-0 lg:grid-cols-[220px_minmax(0,680px)]">
      <div className="lg:pt-1">
        <div className="mb-1.5 flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400" strokeWidth={1.8} />
          <h3 className="text-[13px] font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-[12px] leading-relaxed text-gray-500">{description}</p>
      </div>
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {children}
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all hover:border-gray-300 focus:border-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/8';

const textareaCls = `${inputCls} min-h-[96px] resize-vertical`;

const selectCls = `${inputCls} cursor-pointer`;

/* ── Main form ───────────────────────────────────────────── */

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
  const [detailsFr, setDetailsFr] = useState(product?.detailsFr ?? '');
  const [detailsAr, setDetailsAr] = useState(product?.detailsAr ?? '');
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
      detailsFr: detailsFr || undefined,
      detailsAr: detailsAr || undefined,
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:ml-[230px] max-w-[680px]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          {error}
        </div>
      )}

      {/* Section: Noms */}
      <Section icon={Globe} title="Noms" description="Nom du produit dans les deux langues du catalogue.">
        <Field label="Nom du produit" lang="FR" required>
          <input
            type="text"
            value={nameFr}
            onChange={(e) => setNameFr(e.target.value)}
            required
            placeholder="Ex : Lampe laiton Tameslouht"
            className={inputCls}
          />
        </Field>
        <Field label="اسم المنتج" lang="AR" required>
          <input
            type="text"
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
            placeholder="مثال: مصباح نحاسي تمسلوهت"
            className={inputCls}
          />
        </Field>
      </Section>

      {/* Section: Description */}
      <Section icon={FileText} title="Description" description="Texte court affiché sous le titre sur la fiche produit.">
        <Field label="Description" lang="FR">
          <textarea
            value={descriptionFr}
            onChange={(e) => setDescriptionFr(e.target.value)}
            rows={3}
            placeholder="Décrivez le produit en quelques lignes…"
            className={textareaCls}
          />
        </Field>
        <Field label="الوصف" lang="AR">
          <textarea
            dir="rtl"
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            rows={3}
            placeholder="صِف المنتج في بضعة أسطر…"
            className={textareaCls}
          />
        </Field>
      </Section>

      {/* Section: Détails */}
      <Section icon={Package2} title="Détails produit" description="Affiché dans l'onglet Détails — dimensions, matériaux, entretien.">
        <Field label="Détails" lang="FR" hint="Ex : Hauteur 35 cm · Laiton martelé · Nettoyage à sec">
          <textarea
            value={detailsFr}
            onChange={(e) => setDetailsFr(e.target.value)}
            rows={2}
            placeholder="Hauteur 35 cm · Laiton martelé · Nettoyage à sec"
            className={textareaCls}
          />
        </Field>
        <Field label="التفاصيل" lang="AR" hint="مثال: الارتفاع 35 سم · نحاس مطرقي · تنظيف جاف">
          <textarea
            dir="rtl"
            value={detailsAr}
            onChange={(e) => setDetailsAr(e.target.value)}
            rows={2}
            placeholder="الارتفاع 35 سم · نحاس مطرقي · تنظيف جاف"
            className={textareaCls}
          />
        </Field>
      </Section>

      {/* Section: Tarification */}
      <Section icon={Tag} title="Tarification" description="Prix public et prix barré pour les promotions.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prix" required hint="En dirhams">
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="0.00"
                className={`${inputCls} pe-14`}
              />
              <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                MAD
              </span>
            </div>
          </Field>
          <Field label="Prix barré" hint="Optionnel">
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="0.00"
                className={`${inputCls} pe-14`}
              />
              <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                MAD
              </span>
            </div>
          </Field>
        </div>
      </Section>

      {/* Section: Inventaire */}
      <Section icon={ShoppingBag} title="Inventaire" description="Stock disponible et catégorie du produit.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Stock" hint="Nombre de pièces disponibles">
            <input
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              className={inputCls}
            />
          </Field>
          <Field label="Catégorie">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectCls}
            >
              <option value="">— Aucune —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.nameFr}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Section: Médias */}
      <Section icon={ImageIcon} title="Médias" description="La première photo est l'image principale. Glissez pour réordonner.">
        <ImageUploader images={images} onChange={setImages} />
      </Section>

      {/* Section: Publication */}
      <Section icon={Check} title="Publication" description="Contrôle la visibilité dans le catalogue et sur la page d'accueil.">
        <Toggle
          checked={isPublished}
          onChange={setIsPublished}
          label="Publié"
          description="Le produit est visible dans le catalogue"
        />
        <Toggle
          checked={isFeatured}
          onChange={setIsFeatured}
          label="En vedette"
          description="Affiché dans la sélection et sur la page d'accueil"
        />
      </Section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6 lg:pl-[230px]">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {submitting ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer le produit'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="inline-flex h-10 items-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
