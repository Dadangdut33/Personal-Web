import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

// Base: https://neobrutalism-components.vercel.app/react/components/Badge
export default function Badge({ className, text }: { className?: ClassValue; text: string }) {
  return (
    <div className={cn("w-min rounded-base border-2 border-black bg-main px-3 py-1.5 text-sm font-base", className)}>
      {text}
    </div>
  );
}
