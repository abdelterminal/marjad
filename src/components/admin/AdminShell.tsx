'use client';

import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { AdminMobileNav } from './AdminMobileNav';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Mobile overlay — only needed below md where sidebar is off-screen */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <AdminSidebar open={open} onClose={() => setOpen(false)} />

      <main className="min-w-0 flex-1 md:pl-60">
        <AdminTopBar onMenuClick={() => setOpen(true)} />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl pb-20 md:pb-0">{children}</div>
        </div>
      </main>

      <AdminMobileNav />
    </div>
  );
}
