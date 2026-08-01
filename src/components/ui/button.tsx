import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold text-[15px] tracking-[0.02em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-escarlata disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-escarlata text-blanco-calido hover:bg-escarlata-2 active:bg-rojo-profundo",
        secondary:
          "bg-carbon-3 text-blanco-calido border border-white/10 hover:bg-carbon-2",
        ghost:
          "bg-transparent text-muted hover:text-blanco-calido hover:bg-carbon-3",
        icon: "h-11 w-11 rounded-full bg-carbon-3 text-blanco-calido hover:bg-carbon-2",
      },
      size: {
        default: "h-[52px] px-6 py-3.5",
        sm: "h-10 px-4 text-[13px]",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ type = "button", className, variant, size, ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}