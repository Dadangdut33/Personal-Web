import Home from '@/components/app/Home';
import PublicLayout from '@/layouts/Public';

export const metadata = {
  title: 'Hello :D - Dadangdut33',
};

export default function Page() {
  return (
    <PublicLayout>
      <Home />
    </PublicLayout>
  );
}
