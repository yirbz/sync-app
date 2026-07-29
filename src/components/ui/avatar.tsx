import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: number
  className?: string
  active?: boolean
}

export function Avatar({
  src,
  alt = "",
  name,
  size = 48,
  className,
  active,
}: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <div className="relative inline-flex shrink-0">
      {src ? (
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          className={cn("rounded-full object-cover border border-carbon-2", className)}
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-escarlata/20 flex items-center justify-center text-[15px] font-semibold text-escarlata border border-carbon-2",
            className,
          )}
          style={{ width: size, height: size }}
        >
          {initials}
        </div>
      )}
      {active && (
        <span className="absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full bg-coral ring-2 ring-carbon" />
      )}
    </div>
  )
}