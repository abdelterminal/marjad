import { getTranslations } from 'next-intl/server';
import { MessageCircle, Mail, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact — MARJAD',
  description: 'Contactez MARJAD — décoration intérieure artisanale marocaine.',
};

export default async function ContactPage() {
  const t = await getTranslations();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '212000000000';

  return (
    <main className="overflow-x-clip">

      {/* ── HEADER ───────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-[var(--color-brand-surface-alt)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-primary-light)]/50 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[var(--color-brand-primary)] text-[11px] font-mono tracking-[0.18em] uppercase mb-4">
            {t('contact.eyebrow')}
          </p>
          <h1 className="
            font-[var(--font-display)]
            text-[clamp(2rem,5vw,4rem)]
            font-bold text-[var(--color-brand-text)]
            leading-tight mb-4
          ">
            {t('contact.title')}
          </h1>
          <p className="text-[var(--color-brand-text-muted)] text-lg max-w-[520px] leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* ── CONTACT CARDS ────────────────────────────────────── */}
      <section className="py-14 lg:py-20 bg-[var(--color-brand-surface)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* WhatsApp — primary CTA */}
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group relative flex flex-col gap-4 p-6
                rounded-[var(--radius-xl)]
                bg-[var(--color-brand-text)]
                hover:bg-[#1F1F1F]
                text-white
                transition-colors duration-200
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[var(--color-brand-secondary)] focus-visible:ring-offset-2
              "
            >
              <div className="
                w-10 h-10 rounded-full
                bg-[#25D366]/20 text-[#25D366]
                flex items-center justify-center
              ">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-[var(--font-display)] text-lg font-semibold mb-1">
                  {t('contact.whatsappTitle')}
                </h2>
                <p className="text-white/55 text-sm leading-snug">
                  {t('contact.whatsappDesc')}
                </p>
              </div>
              <span className="
                mt-auto inline-flex items-center gap-1.5
                text-sm font-semibold text-[var(--color-brand-secondary)]
                group-hover:gap-2.5 transition-all duration-200
              ">
                {t('contact.whatsappCta')}
                <span className="rtl:rotate-180">→</span>
              </span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${t('contact.emailAddress')}`}
              className="
                group flex flex-col gap-4 p-6
                rounded-[var(--radius-xl)]
                bg-[var(--color-brand-surface-elevated)]
                border border-[var(--color-brand-border)]
                hover:border-[var(--color-brand-primary)]/30
                hover:shadow-[var(--shadow-md)]
                transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2
              "
            >
              <div className="
                w-10 h-10 rounded-full
                bg-[var(--color-brand-primary-light)]
                text-[var(--color-brand-primary)]
                flex items-center justify-center
              ">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-brand-text)] mb-1">
                  {t('contact.emailTitle')}
                </h2>
                <p className="text-[var(--color-brand-text-muted)] text-sm leading-snug mb-2">
                  {t('contact.emailDesc')}
                </p>
                <p className="text-sm font-medium text-[var(--color-brand-primary)]">
                  {t('contact.emailAddress')}
                </p>
              </div>
            </a>

            {/* Location */}
            <div className="
              flex flex-col gap-4 p-6
              rounded-[var(--radius-xl)]
              bg-[var(--color-brand-surface-elevated)]
              border border-[var(--color-brand-border)]
            ">
              <div className="
                w-10 h-10 rounded-full
                bg-[var(--color-brand-primary-light)]
                text-[var(--color-brand-primary)]
                flex items-center justify-center
              ">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-brand-text)] mb-1">
                  {t('contact.locationTitle')}
                </h2>
                <p className="text-[var(--color-brand-text-muted)] text-sm leading-snug">
                  {t('contact.locationDesc')}
                </p>
                <p className="mt-3 text-sm font-mono text-[var(--color-brand-text-subtle)]">
                  34°02&apos; N — Maroc 🇲🇦
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ─────────────────────────────────────── */}
      <section className="py-14 lg:py-20 bg-[var(--color-brand-surface-alt)]">
        <div className="max-w-[var(--container-content)] mx-auto px-4 sm:px-6 lg:px-8">
          <ContactForm
            title={t('contact.formTitle')}
            nameLabel={t('contact.formName')}
            emailLabel={t('contact.formEmail')}
            messageLabel={t('contact.formMessage')}
            note={t('contact.formNote')}
            submitLabel={t('contact.formSend')}
          />
        </div>
      </section>

    </main>
  );
}
