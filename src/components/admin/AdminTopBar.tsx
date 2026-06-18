import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function AdminTopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="text-sm text-gray-500">Panneau d'administration</div>
      <Link
        href="/fr"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        Voir le site
        <ExternalLink className="size-3.5" />
      </Link>
    </header>
  );
}
