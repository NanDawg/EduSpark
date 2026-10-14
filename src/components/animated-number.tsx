"use client";

import * as React from "react";
import { cn } from "cn";

/**
 * Counts up to the real value on mount and on change.
 * Presentational only: the value itself always comes from the server.
 * Respects prefers-reduced-motion (shows the final value immediately).
 */
export function AnimatedNumber({
  value,
  duration = 700,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = React.useState(0);
  const prevRef = React.useRef(0);

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = prevRef.current;
    const to = value;

    if (reduce || from === to) {
      prevRef.current = to;
      setDisplay(to);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={cn("tabular-nums", className)}>{display}</span>;
}
