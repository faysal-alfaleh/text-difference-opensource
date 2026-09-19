import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-7 shrink-0", className)}>
      <rect x="2" y="3" width="17" height="4" rx="2" className="fill-muted-foreground/50" />
      <rect x="2" y="10" width="12" height="4" rx="2" className="fill-removed" />
      <rect x="2" y="17" width="20" height="4" rx="2" className="fill-added" />
    </svg>
  )
}
