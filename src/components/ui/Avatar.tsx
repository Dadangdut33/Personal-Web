import { cn } from '@/lib/utils';
import { ClassValue } from 'clsx';

// Base: https://neobrutalism-components.vercel.app/react/components/Avatar
export default function Avatar({ className, imageUrl }: { className?: ClassValue; imageUrl: string }) {
  return (
    <div
      style={{
        backgroundImage: `url(${imageUrl})`,
      }}
      className={cn(
        'h-16 w-16 rounded-full border-2 border-border dark:border-darkBorder bg-cover bg-center',
        className
      )}
    ></div>
  );
}
