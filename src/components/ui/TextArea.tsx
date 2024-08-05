import { cn } from '@/lib/utils';
import { ClassValue } from 'clsx';

type Props = {
  className?: ClassValue;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
};

// Base: https://www.neobrutalism.dev/react/components/textarea
export default function Textarea({ className, value, setValue, placeholder }: Props) {
  return (
    <textarea
      className={cn(
        'h-[150px] w-[400px] bg-white dark:bg-darkBg resize-none rounded-base border-2 border-border dark:border-darkBorder p-[10px] font-base ring-offset-white dark:ring-offset-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border dark:focus-visible:ring-darkBorder focus-visible:ring-offset-2 outline-none',
        className
      )}
      name="textarea"
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
    ></textarea>
  );
}
