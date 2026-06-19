import { requireAdmin } from '@/lib/auth-guards';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto pl-60">
        <AdminTopBar />
        <div className="p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
