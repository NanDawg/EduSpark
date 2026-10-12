import {
  BookOpen,
  ClipboardCheck,
  Flame,
  Lock,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import type { BadgeWithEarned } from "@/features/gamification/badges";

const ICONS: Record<string, LucideIcon> = {
  "clipboard-check": ClipboardCheck,
  star: Star,
  flame: Flame,
  "book-open": BookOpen,
  trophy: Trophy,
};

export function BadgeGallery({ badges }: { badges: BadgeWithEarned[] }) {
  const earnedCount = badges.filter((badge) => badge.earnedAt !== null).length;

  return (
    <section aria-labelledby="badges-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="badges-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Badge
        </h2>
        <p className="text-sm text-muted-foreground">
          {earnedCount} dari {badges.length} terbuka
        </p>
      </div>
      {badges.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Belum ada badge. Selesaikan materi dan kuis untuk mulai mengumpulkan.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((badge) => {
            const earned = badge.earnedAt !== null;
            const Icon = earned ? ICONS[badge.icon] ?? Star : Lock;
            return (
              <li
                key={badge.id}
                title={badge.description}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 text-center",
                  earned
                    ? "border-reward bg-reward/15"
                    : "border-border bg-card opacity-70"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    earned
                      ? "bg-reward text-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {badge.name}
                </span>
                <span className="text-xs leading-snug text-muted-foreground">
                  {badge.description}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}