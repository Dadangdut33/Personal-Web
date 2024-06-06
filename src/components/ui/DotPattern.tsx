import { cn } from "@/lib/utils";
import { Box } from "@mantine/core";
import { useId } from "react";

interface DotPatternProps {
  width?: any;
  height?: any;
  x?: any;
  y?: any;
  cx?: any;
  cy?: any;
  cr?: any;
  className?: string;
  [key: string]: any;
}
export function Dots({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80", className)}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}

export default function DotPattern({ children, classname }: { children: React.ReactNode; classname?: string }) {
  return (
    <Box
      className={cn(
        `relative flex h-full w-full items-center justify-center overflow-hidden border-2 py-2 px-3 shadow-base border-black
        dark:bg-slate-900 dark:border-white bg-white`,
        classname
      )}
    >
      <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white">
        {children}
      </p>
      <Dots
        width={15}
        height={15}
        cx={1}
        cy={1}
        cr={1}
        className={cn("[mask-image:linear-gradient(to_bottom_right,white,transparent,black)] ")}
      />
    </Box>
  );
}
