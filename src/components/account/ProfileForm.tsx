'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { signOut } from 'next-auth/react';
import { Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { profileUpdateSchema } from '@/lib/validators';
import type { z } from 'zod';

type ProfileFormData = z.infer<typeof profileUpdateSchema>;

interface ProfileFormProps {
  initialName?: string;
  initialPhone?: string;
  email?: string;
  locale?: string;
}

export function ProfileForm({
  initialName = '',
  initialPhone = '',
  email = '',
  locale: localeProp,
}: ProfileFormProps) {
  const localeHook = useLocale();
  const locale = localeProp ?? localeHook;
  const router = useRouter();
  const isAr = locale === 'ar';

  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: initialName,
      phone: initialPhone,
    },
  });

  async function onSubmit(data: ProfileFormData) {
    setSubmitError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        setSubmitError(json.error ?? (isAr ? 'حدث خطأ.' : 'Une erreur est survenue.'));
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setSubmitError(isAr ? 'حدث خطأ، يرجى المحاولة مرة أخرى.' : 'Une erreur est survenue. Réessayez.');
    }
  }

  const inputClass =
    'w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-brand-border)] bg-white text-sm text-[var(--color-brand-text)] placeholder:text-[var(--color-brand-text-subtle)] focus:outline-none focus:border-[var(--color-brand-border-focus)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 disabled:opacity-60 transition-colors';

  const labelClass = 'block text-sm font-medium text-[var(--color-brand-text)] mb-1.5';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-md">
      {/* Success */}
      {success && (
        <div role="status" className="p-3 rounded-[var(--radius-sm)] bg-[var(--color-brand-success-light)] border-s-[3px] border-[var(--color-brand-success)] flex items-center gap-2 text-sm text-[var(--color-brand-success)]">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {isAr ? 'تم تحديث الملف الشخصي' : 'Profil mis à jour'}
        </div>
      )}

      {/* Error */}
      {submitError && (
        <div role="alert" className="p-3 rounded-[var(--radius-sm)] bg-[var(--color-brand-error-light)] border-s-[3px] border-[var(--color-brand-error)] flex items-center gap-2 text-sm text-[var(--color-brand-error)]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {submitError}
        </div>
      )}

      {/* Name */}
      <div>
        <label className={labelClass} htmlFor="profile-name">
          {isAr ? 'الاسم الكامل' : 'Nom complet'}
          <span aria-hidden="true" className="text-[var(--color-brand-error)] ms-0.5">*</span>
        </label>
        <input
          id="profile-name"
          type="text"
          autoComplete="name"
          disabled={isSubmitting}
          {...register('name')}
          className={[inputClass, errors.name ? 'border-[var(--color-brand-border-error)]' : ''].join(' ')}
        />
        {errors.name && (
          <p role="alert" aria-live="polite" className="mt-1 text-xs text-[var(--color-brand-error)]">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email (read-only) */}
      <div>
        <label className={labelClass} htmlFor="profile-email">
          {isAr ? 'البريد الإلكتروني' : 'E-mail'}
          <Lock className="w-3 h-3 inline ms-1 text-[var(--color-brand-text-muted)]" aria-hidden="true" />
        </label>
        <input
          id="profile-email"
          type="email"
          value={email}
          readOnly
          disabled
          dir="ltr"
          className={[inputClass, 'opacity-60 cursor-not-allowed'].join(' ')}
        />
        <p className="mt-1 text-xs text-[var(--color-brand-text-muted)]">
          {isAr ? 'لا يمكن تغيير البريد الإلكتروني' : "L'email ne peut pas être modifié."}
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass} htmlFor="profile-phone">
          {isAr ? 'رقم الهاتف' : 'Téléphone'}
        </label>
        <input
          id="profile-phone"
          type="tel"
          autoComplete="tel"
          dir="ltr"
          disabled={isSubmitting}
          placeholder="0612345678"
          {...register('phone')}
          className={[inputClass, errors.phone ? 'border-[var(--color-brand-border-error)]' : ''].join(' ')}
        />
        {errors.phone && (
          <p role="alert" aria-live="polite" className="mt-1 text-xs text-[var(--color-brand-error)]">
            {isAr
              ? 'رقم غير صحيح. أدخل رقما مغربيا (مثال: 0612345678)'
              : 'Numéro invalide. Entrez un numéro marocain (ex: 0612345678)'}
          </p>
        )}
      </div>

      {/* Save */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-10 px-6 w-fit rounded-[var(--radius-btn)] bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-semibold text-sm flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isAr ? 'حفظ التغييرات' : 'Enregistrer les modifications'}
      </button>

      {/* Danger zone */}
      <div className="mt-4 pt-4 border-t border-[var(--color-brand-border)]">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className="text-sm font-medium text-[var(--color-brand-error)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-error)] rounded"
        >
          {isAr ? 'تسجيل الخروج' : 'Se déconnecter'}
        </button>
      </div>
    </form>
  );
}
