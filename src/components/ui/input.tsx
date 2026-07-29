import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={id} className="text-[13px] font-medium text-muted">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full rounded-[14px] bg-carbon-3 px-4 py-3.5 text-[15px] text-blanco-calido placeholder-dim outline-none transition-colors",
            "border border-transparent focus:border-escarlata",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)
Input.displayName = "Input"

export { Input }