import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/user";
import { prisma } from "@/lib/prisma";
import { listRecentMaterials } from "@/features/curriculum/service";
import { QuizForm } from "@/features/quiz/components/quiz-form";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Kuis | EduSpark",
};

export const instant = false;

const formatDate = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
});

export default async function QuizPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [subjects, materials, attempts] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    listRecentMaterials(20),
    prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      take: 6,
      include: { quiz: { include: { subject: true } } },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10">
      <section aria-labelledby="quiz-heading" className="flex flex-col gap-1">
        <h1
          id="quiz-heading"
          className="font-heading text-3xl font-semibold text-foreground"
        >
          Kuis
        </h1>
        <p className="text-muted-foreground">
          Uji pemahamanmu dan kumpulkan XP dari setiap kuis.
        </p>
      </section>

      <section
        aria-labelledby="quiz-form-heading"
        className="rounded-xl border border-border bg-card p-5"
      >
        <h2
          id="quiz-form-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Buat kuis baru
        </h2>
        <div className="mt-4">
          <QuizForm
            subjects={subjects.map((subject) => ({
              id: subject.id,
              name: subject.name,
            }))}
            materials={materials.map((material) => ({
              id: material.id,
              subjectId: material.subjectId,
              topic: material.topic,
              title: material.title,
            }))}
            defaultSubjectId={subjects[0]?.id}
          />
        </div>
      </section>

      <section aria-labelledby="history-heading" className="flex flex-col gap-4">
        <h2
          id="history-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Riwayat kuis
        </h2>
        {attempts.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Belum ada kuis. Buat kuis pertamamu di atas!
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {attempts.map((attempt) => (
              <li key={attempt.id}>
                <Link
                  href={`/quiz/${attempt.id}`}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold text-foreground">
                      {attempt.quiz.topic}
                    </span>
                    <span className="truncate text-sm text-muted-foreground">
                      {attempt.quiz.subject.name} ·{" "}
                      {formatDate.format(attempt.startedAt)}
                    </span>
                  </div>
                  <Badge
                    variant={
                      attempt.status === "completed" ? "reward" : "growth"
                    }
                    className="shrink-0"
                  >
                    {attempt.status === "completed"
                      ? `${attempt.score ?? 0} nilai`
                      : "Lanjutkan"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
