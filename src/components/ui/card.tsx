import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
}

export function Card({ className, elevated, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] bg-carbon-2 p-4",
        elevated ? "shadow-elevated" : "shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}