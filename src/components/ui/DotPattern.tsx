import { cn } from '@/lib/utils';
import { Box } from '@mantine/core';

// Base: https://github.com/ekmas/neobrutalism-components/blob/main/src/components/app/ComponentWrapper.tsx
export default function DotPattern({ children, classname }: { children: React.ReactNode; classname?: string }) {
  return (
    <Box
      className={cn(
        `not-prose flex w-full items-center justify-center z-[15] relative border-2 mb-5 border-border dark:border-darkBorder bg-white dark:bg-slate-900 bg-[radial-gradient(#80808080_1px,transparent_1px)] px-10 py-10 shadow-light dark:shadow-dark [background-size:16px_16px] m750:px-5 m750:py-10`,
        classname
      )}
    >
      {children}
    </Box>
  );
}
