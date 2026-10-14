import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AnimatedNumber } from "@/components/animated-number";
import { cn } from "cn";
import { DIFFICULTY_LABELS, type QuizDifficulty } from "@/features/quiz/schemas";
import type { UnlockedBadge } from "@/features/gamification/badges";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

type ResultAnswer = {
  questionId: string;
  order: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedIndex: number;
  isCorrect: boolean;
};

export function QuizResult({
  quizTopic,
  subjectName,
  difficulty,
  totalQuestions,
  correctCount,
  score,
  xpAwarded,
  answers,
  unlockedBadges,
}: {
  quizTopic: string;
  subjectName: string;
  difficulty: string;
  totalQuestions: number;
  correctCount: number | null;
  score: number | null;
  xpAwarded: number;
  answers: ResultAnswer[];
  unlockedBadges: UnlockedBadge[];
}) {
  const difficultyLabel =
    DIFFICULTY_LABELS[difficulty as QuizDifficulty] ?? difficulty;

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-label="Hasil kuis"
        className="reward-rise flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-brand-strong">
              {subjectName} · {difficultyLabel}
            </p>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {quizTopic}
            </h2>
          </div>
          <Badge variant="reward" className="reward-pop text-sm">
            +{xpAwarded} XP
          </Badge>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="font-heading text-4xl font-semibold text-foreground">
            <AnimatedNumber value={score ?? 0} duration={900} />
          </span>
          <span className="text-sm text-muted-foreground">
            nilai · {correctCount ?? 0} benar dari {totalQuestions} soal
          </span>
        </div>

        <ProgressBar
          value={score ?? 0}
          max={100}
          label="Nilai kuis"
          valueText={`${score ?? 0} / 100`}
        />

        {unlockedBadges.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-brand-strong">
              Badge baru terbuka!
            </p>
            <ul className="flex flex-wrap gap-3">
              {unlockedBadges.map((badge) => (
                <li key={badge.id} className="flex flex-col gap-0.5">
                  <Badge variant="reward" className="reward-pop">
                    {badge.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {badge.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section
        aria-labelledby="review-heading"
        className="flex flex-col gap-4"
      >
        <h2
          id="review-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Pembahasan
        </h2>
        <ol className="flex flex-col gap-4">
          {answers.map((answer, index) => (
            <li
              key={answer.questionId}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-foreground">
                  {index + 1}. {answer.question}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold",
                    answer.isCorrect
                      ? "bg-growth/15 text-growth-strong"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {answer.isCorrect ? "Benar" : "Salah"}
                </span>
              </div>

              <ul className="flex flex-col gap-1.5">
                {answer.options.map((option, optionIndex) => {
                  const isCorrectIndex = optionIndex === answer.correctIndex;
                  const isSelected = optionIndex === answer.selectedIndex;
                  return (
                    <li
                      key={optionIndex}
                      className={cn(
                        "flex items-start gap-2 text-sm",
                        isCorrectIndex
                          ? "font-semibold text-foreground"
                          : isSelected
                            ? "text-muted-foreground line-through"
                            : "text-muted-foreground"
                      )}
                    >
                      <span aria-hidden className="font-bold">
                        {OPTION_LABELS[optionIndex]}.
                      </span>
                      <span>{option}</span>
                      {isCorrectIndex && (
                        <span className="font-semibold text-growth-strong">
                          (jawaban benar)
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              <p className="rounded-lg bg-ai-soft p-3 text-sm leading-relaxed text-foreground">
                <span className="font-semibold">Pembahasan: </span>
                {answer.explanation}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/quiz">Buat kuis lain</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard">Lihat progresku</Link>
        </Button>
      </div>
    </div>
  );
}