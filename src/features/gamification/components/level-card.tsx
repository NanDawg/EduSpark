import { ProgressBar } from "@/components/ui/progress-bar";
import { Flame } from "lucide-react";
import type { LevelProgress } from "@/features/gamification/config";

export function LevelCard({
  name,
  xp,
  levelProgress,
  streak,
}: {
  name: string;
  xp: number;
  levelProgress: LevelProgress;
  streak: number;
}) {
  const maxLevel = levelProgress.xpToNext === 0;

  return (
    <section
      aria-label="Level dan XP"
      className="flex flex-col justify-center gap-4 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-lg font-semibold text-foreground">
            Level {levelProgress.level}
          </span>
          <span className="rounded-full bg-reward px-2.5 py-0.5 text-xs font-bold text-foreground">
            {xp} XP
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Flame className="size-4 text-reward" aria-hidden />
          {streak} hari berturut-turut
        </span>
      </div>
      {maxLevel ? (
        <p className="text-sm font-medium text-foreground">
          Kamu sudah mencapai level tertinggi saat ini. Hebat, {name}!
        </p>
      ) : (
        <ProgressBar
          value={levelProgress.xpIntoLevel}
          max={levelProgress.xpToNext}
          label={`Menuju Level ${levelProgress.level + 1}`}
          valueText={`${levelProgress.xpIntoLevel} / ${levelProgress.xpToNext} XP`}
        />
      )}
    </section>
  );
}