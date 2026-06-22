'use client';

import { useState } from 'react';
import { User, Phone, Mail, ChevronDown, Send, CheckCircle2, Loader2 } from 'lucide-react';

interface ContactFormProps {
  title: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  subjectLabel: string;
  subjects: string[];
  messageLabel: string;
  submitLabel: string;
  successMsg: string;
}

const inputBase =
  'w-full rounded-lg border border-gray-200 bg-white py-2.5 pe-10 ps-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all hover:border-gray-300 focus:border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/8';

export function ContactForm({
  title,
  nameLabel,
  phoneLabel,
  emailLabel,
  subjectLabel,
  subjects,
  messageLabel,
  submitLabel,
  successMsg,
}: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle2
          className="h-12 w-12"
          style={{ color: 'var(--color-brand-primary)' }}
          strokeWidth={1.4}
        />
        <p className="text-[15px] font-medium" style={{ color: 'var(--color-brand-text)' }}>
          {successMsg}
        </p>
      </div>
    );
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
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold" style={{ color: 'var(--color-brand-text)' }}>
            {nameLabel}
          </label>
          <div className="relative">
            <input name="name" type="text" autoComplete="name" required className={inputBase} />
            <User
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Téléphone */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold" style={{ color: 'var(--color-brand-text)' }}>
            {phoneLabel}
          </label>
          <div className="relative">
            <input name="phone" type="tel" autoComplete="tel" className={inputBase} />
            <Phone
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold" style={{ color: 'var(--color-brand-text)' }}>
            {emailLabel}
          </label>
          <div className="relative">
            <input name="email" type="email" autoComplete="email" required className={inputBase} />
            <Mail
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Sujet */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold" style={{ color: 'var(--color-brand-text)' }}>
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
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold" style={{ color: 'var(--color-brand-text)' }}>
            {messageLabel}
          </label>
          <textarea
            name="message"
            rows={4}
            required
            className={`${inputBase} pe-3.5 min-h-[100px] resize-y`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            background: 'var(--color-brand-primary)',
            '--tw-ring-color': 'var(--color-brand-primary)',
          } as React.CSSProperties}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" strokeWidth={1.8} />
          )}
          {submitLabel}
        </button>
      </form>
    </>
  );
}
