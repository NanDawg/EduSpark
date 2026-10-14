import * as React from "react"
import { cn } from "cn"

/**
 * EduSpark mark: a sprout-spark monogram.
 * Rounded brand-blue tile, negative-space "E" (learning) whose open top
 * grows into a leaf (growth) tipped by a yellow spark (energy/curiosity).
 * Strokes are kept >= 4.4/32 units so the mark stays legible at 16px.
 */
function LogoMark({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="EduSpark"
      className={cn("size-8 shrink-0", className)}
      {...props}
    >
      <rect width="32" height="32" rx="9" fill="#4BA3FF" />
      <rect x="9" y="12.4" width="4.6" height="12.4" rx="2.3" fill="#FFFFFF" />
      <rect x="12.8" y="15.4" width="7.6" height="4.4" rx="2.2" fill="#FFFFFF" />
      <rect x="12.8" y="20" width="6" height="4.4" rx="2.2" fill="#FFFFFF" />
      <ellipse
        cx="16.9"
        cy="10.9"
        rx="4.4"
        ry="2.5"
        transform="rotate(-40 16.9 10.9)"
        fill="#FFFFFF"
      />
      <circle cx="24.4" cy="6.6" r="2.4" fill="#FFD84D" />
    </svg>
  )
}

type LogoLockupProps = React.ComponentProps<"span"> & {
  markClassName?: string
  markless?: boolean
}

function LogoLockup({ className, markClassName, ...props }: LogoLockupProps) {
  return (
    <span
      data-slot="logo-lockup"
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <LogoMark aria-hidden className={cn("size-8", markClassName)} />
      <span className="font-heading text-xl font-semibold tracking-normal text-foreground">
        EduSpark
      </span>
    </span>
  )
}

export { LogoMark, LogoLockup }
