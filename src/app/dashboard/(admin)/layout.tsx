import { isAdmin } from '@/lib/lucia/utils';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await isAdmin();
  return <>{children}</>;
}
