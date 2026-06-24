'use client';

import { User, Phone, Mail, ChevronDown, MessageCircle } from 'lucide-react';

interface ContactFormProps {
  title: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  subjectLabel: string;
  subjects: string[];
  messageLabel: string;
  submitLabel: string;
  whatsappHref: string;
  locale: string;
}

const inputBase =
  'form-input pe-10 ps-3.5';

export function ContactForm({
  title,
  nameLabel,
  phoneLabel,
  emailLabel,
  subjectLabel,
  subjects,
  messageLabel,
  submitLabel,
  whatsappHref,
  locale,
}: ContactFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const isAr = locale === 'ar';
    const lines = [
      isAr ? 'مرحباً مرجاد، أود التواصل معكم.' : 'Bonjour MARJAD, je souhaite vous contacter.',
      '',
      `${nameLabel}: ${String(data.get('name') ?? '').trim()}`,
      `${phoneLabel}: ${String(data.get('phone') ?? '').trim() || '-'}`,
      `${emailLabel}: ${String(data.get('email') ?? '').trim()}`,
      `${subjectLabel}: ${String(data.get('subject') ?? '').trim()}`,
      `${messageLabel}: ${String(data.get('message') ?? '').trim()}`,
    ];
    const target = new URL(whatsappHref);
    target.searchParams.set('text', lines.join('\n'));
    window.open(target.toString(), '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <h2
        className="mb-5 text-[1.2rem] font-normal"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brand-text)' }}
      >
        {title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Nom */}
        <div className="form-field">
          <label className="form-label">
            {nameLabel}
          </label>
          <div className="relative">
            <input name="name" type="text" autoComplete="name" required className={inputBase} />
            <User
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand-text-subtle)]"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Téléphone */}
        <div className="form-field">
          <label className="form-label">
            {phoneLabel}
          </label>
          <div className="relative">
            <input name="phone" type="tel" autoComplete="tel" dir="ltr" className={inputBase} />
            <Phone
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand-text-subtle)]"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-field">
          <label className="form-label">
            {emailLabel}
          </label>
          <div className="relative">
            <input name="email" type="email" autoComplete="email" required dir="ltr" className={inputBase} />
            <Mail
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand-text-subtle)]"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Sujet */}
        <div className="form-field">
          <label className="form-label">
            {subjectLabel}
          </label>
          <div className="relative">
            <select
              name="subject"
              required
              defaultValue=""
              className={`${inputBase} appearance-none cursor-pointer`}
            >
              <option value="" disabled />
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand-text-subtle)]"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Message */}
        <div className="form-field">
          <label className="form-label">
            {messageLabel}
          </label>
          <textarea
            name="message"
            rows={4}
            required
            className="form-textarea min-h-[100px] resize-y"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="form-submit w-full py-3.5"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
          {submitLabel}
        </button>
      </form>
    </>
  );
}
