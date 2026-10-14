import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AnimatedNumber } from "@/components/animated-number";
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
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-heading text-lg font-semibold text-foreground">
          Level {levelProgress.level}
        </span>
        <Badge variant="reward">
          <AnimatedNumber value={xp} /> XP
        </Badge>
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
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <Flame className="size-4 text-reward-strong" aria-hidden />
        {streak} hari berturut-turut
      </span>
    </section>
  );
}
