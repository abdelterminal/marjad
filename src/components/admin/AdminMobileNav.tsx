'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Tag } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart, exact: false },
  { href: '/admin/products', label: 'Produits', icon: Package, exact: false },
  { href: '/admin/categories', label: 'Catégories', icon: Tag, exact: false },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white md:hidden"
      aria-label="Navigation mobile"
    >
      <div className="grid grid-cols-4">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex flex-col items-center gap-1 py-3 px-1 transition-colors',
                active ? 'text-gray-950' : 'text-gray-400',
              ].join(' ')}
            >
              <Icon className="size-5 shrink-0" />
              <span className="text-[9px] font-medium leading-tight text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
