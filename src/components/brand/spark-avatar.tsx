import * as React from "react"
import { cn } from "cn"

/**
 * Spark: EduSpark's learning companion.
 * A geometric spark creature: two overlapping sparks (brand blue behind,
 * Spark cyan in front) with a calm, minimal face. Flat vector so it reads
 * premium at every size instead of cartoonish.
 */

const SPARK_SIZES = {
  xs: "size-5",
  sm: "size-7",
  md: "size-10",
  lg: "size-14",
  xl: "size-20",
} as const

type SparkAvatarProps = React.ComponentProps<"svg"> & {
  size?: keyof typeof SPARK_SIZES
  /** Label for the avatar when it identifies Spark (omit when decorative). */
  label?: string
  /** Gentle bob while Spark is thinking (stopped by prefers-reduced-motion). */
  thinking?: boolean
}

function SparkAvatar({
  size = "md",
  label = "Spark",
  thinking = false,
  className,
  ...props
}: SparkAvatarProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label={label}
      className={cn(
        "shrink-0",
        SPARK_SIZES[size],
        thinking && "spark-thinking",
        className
      )}
      {...props}
    >
      <path
        d="M0 -13 Q 13 0 0 13 Q -13 0 0 -13 Z"
        transform="translate(7.5 7.5) scale(0.55)"
        fill="#4BA3FF"
        stroke="#4BA3FF"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M0 -13 Q 13 0 0 13 Q -13 0 0 -13 Z"
        transform="translate(16.8 16.8) scale(0.94)"
        fill="#22D3EE"
        stroke="#22D3EE"
        strokeWidth="5.2"
        strokeLinejoin="round"
      />
      <circle cx="13.9" cy="15.9" r="1.6" fill="#0B2B4D" />
      <circle cx="19.6" cy="15.9" r="1.6" fill="#0B2B4D" />
      <path
        d="M14.1 19.6 Q16.75 21.7 19.4 19.6"
        fill="none"
        stroke="#0B2B4D"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export { SparkAvatar }
