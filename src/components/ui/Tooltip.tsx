import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  label: React.ReactNode;
  className?: string;
};

export default function Tooltip({ children, label, className }: Props) {
  return (
    <div className={cn('group relative inline-block cursor-help text-center', className)}>
      {children}
      <div
        className="pointer-events-none absolute bottom-8 -left-7 z-10 rounded-base border-2 border-black bg-main dark:bg-darkBg px-3
          py-2 text-center text-xs opacity-0 transition-all group-hover:opacity-100 w-30"
      >
        {label}
      </div>
    </div>
  );
}
