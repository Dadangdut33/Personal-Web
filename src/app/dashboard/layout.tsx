import LayoutDashboard from '@/layouts/Dashboard';
import { checkAuth } from '@/lib/lucia/utils';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await checkAuth();

  return <LayoutDashboard user={user!}>{children}</LayoutDashboard>;
}
