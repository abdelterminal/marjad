'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Package, ShoppingCart, Tag, X } from 'lucide-react';
import { adminSignOut } from '@/app/admin/actions';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart, exact: false },
  { href: '/admin/products', label: 'Produits', icon: Package, exact: false },
  { href: '/admin/categories', label: 'Catégories', icon: Tag, exact: false },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-gray-950',
        'transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-[18px]">
        <div>
          <p className="font-['Playfair_Display',Georgia,serif] text-[1.1rem] font-bold tracking-[0.18em] text-white">
            MARJAD
          </p>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-white/30">
            Administration
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/35 hover:bg-white/8 hover:text-white transition-colors lg:hidden"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Navigation admin">
        <ul className="space-y-0.5 px-3">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={[
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)]'
                      : 'text-white/50 hover:bg-white/6 hover:text-white',
                  ].join(' ')}
                >
                  <Icon
                    className={[
                      'h-4 w-4 shrink-0',
                      active ? 'text-[var(--color-brand-primary)]' : 'text-white/40',
                    ].join(' ')}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="border-t border-white/8 px-4 py-4">
        <form action={adminSignOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-white/35 hover:bg-white/6 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
