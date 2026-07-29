import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  action?: React.ReactNode
  className?: string
}

export function Header({ title, action, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-[56px] bg-carbon flex items-center justify-between px-4",
        className,
      )}
    >
      <h1 className="text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-blanco-calido">
        {title}
      </h1>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  )
}