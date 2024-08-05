import { Link } from '@/components/Router';
import { Title } from '@mantine/core';

export const Logo = () => {
  return (
    <Link href="/dashboard" style={{ textDecoration: 'none', height: '36px' }} className="ms-auto me-auto">
      <Title order={2}>Admin Panel</Title>
    </Link>
  );
};
