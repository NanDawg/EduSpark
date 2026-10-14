import type { Metadata } from "next";
import { SubjectCard } from "@/features/dashboard/components/subject-card";
import { SparkCtaCard } from "@/features/dashboard/components/spark-cta-card";
import { WelcomeHero } from "@/features/dashboard/components/welcome-hero";
import { DailyGoalCard } from "@/features/dashboard/components/daily-goal-card";
import { getCurrentUser } from "@/features/auth/user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getLevelProgress } from "@/features/gamification/config";
import { getStreak, listXpHistory } from "@/features/gamification/service";
import { listBadgesWithStatus } from "@/features/gamification/badges";
import { BadgeGallery } from "@/features/gamification/components/badge-gallery";
import { XpHistory } from "@/features/gamification/components/xp-history";
import { getLearningProgress } from "@/features/progress/service";
import { ProgressSection } from "@/features/progress/components/progress-section";
import { getAdventureOverview } from "@/features/adventure/service";
import { JourneyCard } from "@/features/dashboard/components/journey-card";

export const metadata: Metadata = {
  title: "Beranda | EduSpark",
};

export const instant = false;

const subjectDescriptions: Record<string, string> = {
  "bahasa-indonesia": "Membaca, menulis, dan memahami cerita",
  matematika: "Berhitung, bilangan, dan pemecahan masalah",
  ipas: "Sains dan sosial di sekitar kita",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    subjects,
    badges,
    streak,
    xpHistory,
    learningProgress,
    adventure,
    lessonsToday,
    quizzesToday,
    xpToday,
  ] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    listBadgesWithStatus(user.id),
    getStreak(user.id),
    listXpHistory(user.id, 6),
    getLearningProgress(user.id),
    getAdventureOverview(user.id),
    prisma.materialProgress.count({
      where: { userId: user.id, completedAt: { gte: startOfDay } },
    }),
    prisma.quizAttempt.count({
      where: {
        userId: user.id,
        status: "completed",
        completedAt: { gte: startOfDay },
      },
    }),
    prisma.xPHistory.aggregate({
      where: { userId: user.id, createdAt: { gte: startOfDay } },
      _sum: { amount: true },
    }),
  ]);
  const levelProgress = getLevelProgress(user.xp);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10 xl:max-w-5xl">
      <WelcomeHero
        user={user}
        levelProgress={levelProgress}
        streak={streak}
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <JourneyCard summary={adventure.summary} />
        <DailyGoalCard
          lessonsToday={lessonsToday}
          quizzesToday={quizzesToday}
          xpToday={xpToday._sum.amount ?? 0}
        />
      </div>

      <ProgressSection progress={learningProgress} />

      <section aria-labelledby="subjects-heading" className="flex flex-col gap-4">
        <h2
          id="subjects-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Mau belajar apa?
        </h2>
        {subjects.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Mata pelajaran belum tersedia. Hubungi guru untuk mengisi daftar
            pelajaran.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                slug={subject.slug}
                name={subject.name}
                description={
                  subjectDescriptions[subject.slug] ?? "Materi pembelajaran"
                }
              />
            ))}
          </div>
        )}
      </section>

      <BadgeGallery badges={badges} />

      <XpHistory entries={xpHistory} />

      <SparkCtaCard />
    </div>
  );
}
