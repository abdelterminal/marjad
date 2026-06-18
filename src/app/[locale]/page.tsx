import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home.hero');

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center">{t('title')}</h1>
      <p className="mt-4 text-lg text-center text-gray-600">{t('subtitle')}</p>
      <a
        href="#"
        className="mt-8 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
      >
        {t('cta')}
      </a>
    </main>
  );
}
