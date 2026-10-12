import { BookOpen, ClipboardCheck, Star, Trophy } from "lucide-react";
import type { LearningProgress } from "@/features/progress/service";

export function ProgressSection({
  progress,
}: {
  progress: LearningProgress;
}) {
  const items = [
    {
      icon: BookOpen,
      label: "Materi selesai",
      value: String(progress.completedMaterials),
    },
    {
      icon: ClipboardCheck,
      label: "Kuis selesai",
      value: String(progress.quizzesTaken),
    },
    {
      icon: Star,
      label: "Rata-rata nilai",
      value: progress.averageScore === null ? "-" : `${progress.averageScore}`,
    },
    {
      icon: Trophy,
      label: "Badge terkumpul",
      value: String(progress.badgesEarned),
    },
  ];

  return (
    <section
      aria-labelledby="progress-heading"
      className="flex flex-col gap-4"
    >
      <h2
        id="progress-heading"
        className="font-heading text-xl font-semibold text-foreground"
      >
        Progres belajar
      </h2>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
          >
            <item.icon className="size-4.5 text-brand-strong" aria-hidden />
            <span className="font-heading text-2xl font-semibold text-foreground">
              {item.value}
            </span>
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}