import { Eye, EyeOff } from 'lucide-react'
// or any icons you prefer
import * as React from 'react'
import { cn } from '~/lib/utils'

interface InputProps extends React.ComponentProps<'input'> {
  error?: React.ReactNode
  label?: string
  labelId?: string
  labelClassName?: string
}

function Input({ className, type, error, labelId, label, labelClassName, ...props }: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  const isPassword = type === 'password'
  const actualType = isPassword && showPassword ? 'text' : type

  const comp = (
    <div className="space-y-1">
      <div className="relative">
        <input
          type={actualType}
          id={labelId}
          data-slot="input"
          className={cn(
            'flex h-10 w-full rounded-base border-2 border-border bg-secondary-background selection:bg-main selection:text-main-foreground px-3 py-2 pr-10 text-sm font-base text-foreground file:border-0 file:bg-transparent file:text-sm file:font-heading placeholder:text-foreground/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 flex items-center text-foreground/70 hover:text-foreground"
            tabIndex={-1} // prevent stealing focus
          >
            {showPassword ? (
              <EyeOff size={18} aria-label="Hide password" />
            ) : (
              <Eye size={18} aria-label="Show password" />
            )}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )

  if (label) {
    return (
      <div className="grid gap-3">
        <label
          htmlFor={labelId}
          className={cn(
            'text-sm font-heading leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            labelClassName
          )}
        >
          {label}
          {props.required && <span className="text-destructive">*</span>}
        </label>
        {comp}
      </div>
    )
  }

  return comp
}

export { Input }
