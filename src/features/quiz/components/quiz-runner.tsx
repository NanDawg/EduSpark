"use client";

import { useActionState, useState } from "react";
import {
  submitQuizAction,
  type SubmitQuizState,
} from "@/actions/quiz";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AnswerOption } from "@/features/quiz/components/answer-option";
import { DIFFICULTY_LABELS, type QuizDifficulty } from "@/features/quiz/schemas";

type RunnerQuestion = {
  id: string;
  order: number;
  question: string;
  options: string[];
};

export function QuizRunner({
  attemptId,
  subjectName,
  difficulty,
  questions,
}: {
  attemptId: string;
  subjectName: string;
  difficulty: string;
  questions: RunnerQuestion[];
}) {
  const [state, formAction, isPending] = useActionState<
    SubmitQuizState,
    FormData
  >(submitQuizAction, {});

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});

  const total = questions.length;
  const current = questions[currentIndex];
  const answeredCount = Object.keys(selections).length;
  const allAnswered = answeredCount === total;
  const difficultyLabel =
    DIFFICULTY_LABELS[difficulty as QuizDifficulty] ?? difficulty;

  if (!current || total === 0) {
    return null;
  }

  function select(questionId: string, optionIndex: number) {
    setSelections((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="attemptId" value={attemptId} />
      {questions.map((question) => (
        <input
          key={question.id}
          type="hidden"
          name={`q_${question.id}`}
          value={
            selections[question.id] !== undefined
              ? String(selections[question.id])
              : ""
          }
        />
      ))}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand-strong">
            {subjectName}
          </span>
          <span className="rounded-full bg-ai-soft px-2.5 py-0.5 text-xs font-bold text-ai-strong">
            {difficultyLabel}
          </span>
        </div>
        <ProgressBar
          value={currentIndex + 1}
          max={total}
          label="Soal"
          valueText={`Soal ${currentIndex + 1} dari ${total}`}
        />
      </div>

      <fieldset className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <legend className="px-1 font-heading text-lg font-semibold text-foreground">
          {current.question}
        </legend>
        <div className="flex flex-col gap-3">
          {current.options.map((option, optionIndex) => (
            <AnswerOption
              key={`${current.id}-${optionIndex}`}
              group={`view_${current.id}`}
              checked={selections[current.id] === optionIndex}
              onChange={() => select(current.id, optionIndex)}
              optionIndex={optionIndex}
              text={option}
            />
          ))}
        </div>
      </fieldset>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          disabled={currentIndex === 0 || isPending}
        >
          Sebelumnya
        </Button>

        <p className="text-sm text-muted-foreground">
          {answeredCount} dari {total} terjawab
        </p>

        {currentIndex < total - 1 ? (
          <Button
            type="button"
            onClick={() =>
              setCurrentIndex((index) => Math.min(total - 1, index + 1))
            }
            disabled={isPending}
          >
            Berikutnya
          </Button>
        ) : (
          <Button type="submit" size="lg" disabled={!allAnswered || isPending}>
            {isPending ? "Menyimpan..." : "Kumpulkan jawaban"}
          </Button>
        )}
      </div>

      {currentIndex === total - 1 && !allAnswered && (
        <p className="text-xs text-muted-foreground">
          Jawab semua soal untuk mengumpulkan kuis.
        </p>
      )}
    </form>
  );
}