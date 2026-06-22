'use client';

import Link from 'next/link';
import { ExternalLink, Menu } from 'lucide-react';

interface Props {
  onMenuClick: () => void;
}

export function AdminTopBar({ onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Hamburger — hidden on desktop */}
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <Link
        href="/fr"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
      >
        <span className="hidden sm:inline">Voir le site</span>
        <ExternalLink className="h-3 w-3" />
      </Link>
    </header>
  );
}
