'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tag, ShoppingCart, LogOut } from 'lucide-react';
import { adminSignOut } from '@/app/admin/actions';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Produits', icon: Package, exact: false },
  { href: '/admin/categories', label: 'Catégories', icon: Tag, exact: false },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-60 flex flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center px-6 py-5 border-b border-gray-700">
        <span className="text-lg font-bold tracking-wide">MARJAD Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: sign out */}
      <div className="border-t border-gray-700 px-4 py-4">
        <form action={adminSignOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="size-4 shrink-0" />
            Déconnexion
          </button>
        </form>
      </div>
    </div>
  );
}
