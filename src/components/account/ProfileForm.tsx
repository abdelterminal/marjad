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

  const inputClass = 'form-input';
  const labelClass = 'form-label';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-panel flex flex-col gap-5 p-5 sm:p-6">
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
      <div className="form-field">
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
          className={[inputClass, errors.name ? 'form-input-error' : ''].join(' ')}
        />
        {errors.name && (
          <p role="alert" aria-live="polite" className="form-error">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email (read-only) */}
      <div className="form-field">
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
          className={inputClass}
        />
        <p className="form-help">
          {isAr ? 'لا يمكن تغيير البريد الإلكتروني' : "L'email ne peut pas être modifié."}
        </p>
      </div>

      {/* Phone */}
      <div className="form-field">
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
          className={[inputClass, errors.phone ? 'form-input-error' : ''].join(' ')}
        />
        {errors.phone && (
          <p role="alert" aria-live="polite" className="form-error">
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
        className="form-submit w-fit"
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
