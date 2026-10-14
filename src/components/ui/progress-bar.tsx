"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cn } from "cn"

type ProgressBarProps = {
  value: number
  max?: number
  label?: string
  valueText: string
  className?: string
}

function ProgressBar({
  value,
  max = 100,
  label,
  valueText,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  const labelId = React.useId()

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {(label || valueText) && (
        <div className="flex items-baseline justify-between gap-2 text-sm">
          {label && (
            <span id={labelId} className="font-semibold text-foreground">
              {label}
            </span>
          )}
          <span className="tabular-nums text-muted-foreground">{valueText}</span>
        </div>
      )}
      <ProgressPrimitive.Root
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted"
        value={value}
        max={max}
        aria-valuetext={valueText}
        aria-labelledby={label ? labelId : undefined}
      >
        <ProgressPrimitive.Indicator
          className="size-full flex-1 rounded-full bg-growth transition-transform duration-500"
          style={{ transform: `translateX(-${100 - percent}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}

export { ProgressBar }
