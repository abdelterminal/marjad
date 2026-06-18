import { requireAdmin } from '@/lib/auth-guards';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // redirects to / if not admin
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto pl-60">
        <AdminTopBar />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
