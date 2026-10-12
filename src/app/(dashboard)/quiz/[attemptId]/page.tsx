import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/user";
import {
  getAttemptForRunner,
  getAttemptResult,
} from "@/features/quiz/service";
import { QuizRunner } from "@/features/quiz/components/quiz-runner";
import { QuizResult } from "@/features/quiz/components/quiz-result";
import type { UnlockedBadge } from "@/features/gamification/badges";
import { prisma } from "@/lib/prisma";
export const metadata: Metadata = {
  title: "Kuis | EduSpark",
};

export const instant = false;

export default async function QuizAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { attemptId } = await params;
  const runner = await getAttemptForRunner(attemptId, user.id);
  if (!runner) {
    notFound();
  }

  if (runner.status !== "completed") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
        <header className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            {runner.topic}
          </h1>
          <p className="text-sm text-muted-foreground">
            Jawab semua soal, lalu kumpulkan untuk mendapat nilai dan XP.
          </p>
        </header>
        <QuizRunner
          attemptId={runner.attemptId}
          subjectName={runner.subjectName}
          difficulty={runner.difficulty}
          questions={runner.questions}
        />
      </div>
    );
  }

  const result = await getAttemptResult(attemptId, user.id);
  if (!result) {
    notFound();
  }

  let unlockedBadges: UnlockedBadge[] = [];
  if (result.completedAt) {
    const rows = await prisma.userBadge.findMany({
      where: {
        userId: user.id,
        earnedAt: { gte: result.completedAt },
      },
      include: { badge: true },
    });
    unlockedBadges = rows.map((row) => ({
      id: row.badge.id,
      name: row.badge.name,
      description: row.badge.description,
      icon: row.badge.icon,
    }));
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Hasil kuis
        </h1>
        <p className="text-sm text-muted-foreground">
          Kerja bagus! Lihat pembahasan setiap soal di bawah.
        </p>
      </header>
      <QuizResult
        quizTopic={result.quizTopic}
        subjectName={result.subjectName}
        difficulty={result.difficulty}
        totalQuestions={result.totalQuestions}
        correctCount={result.correctCount}
        score={result.score}
        xpAwarded={result.xpAwarded}
        answers={result.answers}
        unlockedBadges={unlockedBadges}
      />
    </div>
  );
}