import { BookOpen, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";

const LESSON_GOAL = 2;
const QUIZ_GOAL = 1;

export function DailyGoalCard({
  lessonsToday,
  quizzesToday,
  xpToday,
}: {
  lessonsToday: number;
  quizzesToday: number;
  xpToday: number;
}) {
  const allDone = lessonsToday >= LESSON_GOAL && quizzesToday >= QUIZ_GOAL;

  return (
    <section
      aria-labelledby="daily-goal-heading"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-lg bg-growth/15 text-growth-strong"
        >
          <ClipboardCheck className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2
            id="daily-goal-heading"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Target belajar hari ini
          </h2>
          <span className="text-xs text-muted-foreground">
            {allDone
              ? "Target hari ini tercapai. Kerja bagus!"
              : "Selesaikan target harianmu."}
          </span>
        </div>
        <Badge variant="reward" className="shrink-0">
          +{xpToday} XP
        </Badge>
      </div>

      <ProgressBar
        value={Math.min(lessonsToday, LESSON_GOAL)}
        max={LESSON_GOAL}
        label="Materi"
        valueText={`${lessonsToday} dari ${LESSON_GOAL} selesai`}
      />
      <ProgressBar
        value={Math.min(quizzesToday, QUIZ_GOAL)}
        max={QUIZ_GOAL}
        label="Kuis"
        valueText={`${quizzesToday} dari ${QUIZ_GOAL} selesai`}
      />

      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <BookOpen className="size-4 text-brand-strong" aria-hidden />
        {lessonsToday} materi dan {quizzesToday} kuis hari ini
      </span>
    </section>
  );
}
