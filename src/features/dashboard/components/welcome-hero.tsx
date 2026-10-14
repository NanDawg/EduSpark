import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SparkAvatar } from "@/components/brand/spark-avatar";
import { LevelCard } from "@/features/gamification/components/level-card";
import type { LevelProgress } from "@/features/gamification/config";

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export function WelcomeHero({
  user,
  levelProgress,
  streak,
}: {
  user: { name: string; username: string; classLevel: number; xp: number };
  levelProgress: LevelProgress;
  streak: number;
}) {
  const initial = user.name.trim().charAt(0).toUpperCase() || "S";

  return (
    <section
      aria-labelledby="welcome-heading"
      className="rounded-2xl border border-border bg-brand-soft p-5 sm:p-6"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-center">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 shrink-0 border-2 border-card">
              <AvatarFallback className="bg-card font-heading text-xl font-semibold text-brand-strong">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1
                id="welcome-heading"
                className="font-heading text-2xl font-semibold text-foreground sm:text-3xl"
              >
                {timeGreeting()}, {user.name}!
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                @{user.username} · Kelas {user.classLevel}
              </p>
            </div>
          </div>
          <p className="flex items-center gap-2 text-sm font-semibold text-ai-strong">
            <SparkAvatar size="xs" label="" />
            Ada yang sulit? Tanya Spark kapan saja.
          </p>
        </div>

        <LevelCard
          name={user.name}
          xp={user.xp}
          levelProgress={levelProgress}
          streak={streak}
        />
      </div>
    </section>
  );
}
