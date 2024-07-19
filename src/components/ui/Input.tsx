import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

type Props = {
  className?: ClassValue;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
  withShadow?: boolean;
};

// Base: https://neobrutalism-components.vercel.app/react/components/Input
export default function Input({ className, value, setValue, placeholder, withShadow }: Props) {
  if (withShadow) {
    <div className="flex w-min items-center rounded-base border-2 border-black font-base shadow-base">
      <input
        className="w-full max-w-[30ch] min-w-[14ch] md:min-w-[30ch] rounded-base p-[10px] outline-none"
        type="text"
        name="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        aria-label={placeholder}
      />
    </div>;
  }

  return (
    <input
      className={cn(
        "rounded-base border-2 border-black p-[10px] font-base ring-offset-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 focus-visible:ring-offset-2 outline-none transition-all",
        className
      )}
      type="text"
      name="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      aria-label={placeholder}
    />
  );
}
