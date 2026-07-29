import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "coral" | "escarlata" | "dim"
  className?: string
}

export function Badge({ children, variant = "coral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[8px] px-2 py-0.5 text-[12px] font-medium leading-[1.3]",
        variant === "coral" && "bg-coral/15 text-coral",
        variant === "escarlata" && "bg-escarlata/15 text-escarlata",
        variant === "dim" && "bg-carbon-3 text-dim",
        className,
      )}
    >
      {children}
    </span>
  )
}