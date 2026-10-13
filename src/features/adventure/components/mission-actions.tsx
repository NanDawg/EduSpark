"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BookOpen, ClipboardCheck } from "lucide-react";
import {
  generateMaterialAction,
  type GenerateMaterialState,
} from "@/actions/curriculum";
import { generateQuizAction, type GenerateQuizState } from "@/actions/quiz";
import { Button } from "@/components/ui/button";

const MISSION_QUIZ_COUNT = 5;
const MISSION_QUIZ_DIFFICULTY = "sedang";

type MissionActionsProps = {
  subjectId: string;
  topic: string;
  objective: string | null;
  materialId: string | null;
  lessonDone: boolean;
};

export function MissionActions({
  subjectId,
  topic,
  objective,
  materialId,
  lessonDone,
}: MissionActionsProps) {
  const [materialState, materialFormAction, materialPending] = useActionState<
    GenerateMaterialState,
    FormData
  >(generateMaterialAction, {});
  const [quizState, quizFormAction, quizPending] = useActionState<
    GenerateQuizState,
    FormData
  >(generateQuizAction, {});

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {materialId ? (
          <Button asChild variant={lessonDone ? "outline" : "default"} size="lg">
            <Link href={`/learn/${materialId}`}>
              <BookOpen aria-hidden />
              {lessonDone ? "Baca ulang materi" : "Lanjutkan materi"}
            </Link>
          </Button>
        ) : (
          <form action={materialFormAction} noValidate>
            <input type="hidden" name="subjectId" value={subjectId} />
            <input type="hidden" name="topic" value={topic} />
            {objective && (
              <input type="hidden" name="learningObjective" value={objective} />
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={materialPending}
            >
              <BookOpen aria-hidden />
              {materialPending
                ? "Spark sedang menyiapkan materi..."
                : "Mulai belajar"}
            </Button>
          </form>
        )}
        {materialState.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {materialState.error}
          </p>
        )}
        {!lessonDone && (
          <p className="text-xs text-muted-foreground">
            Selesaikan materi ini lebih dulu, lalu kerjakan kuisnya.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <form action={quizFormAction} noValidate>
          <input type="hidden" name="subjectId" value={subjectId} />
          <input type="hidden" name="topic" value={topic} />
          <input type="hidden" name="difficulty" value={MISSION_QUIZ_DIFFICULTY} />
          <input type="hidden" name="count" value={MISSION_QUIZ_COUNT} />
          {materialId && (
            <input type="hidden" name="materialId" value={materialId} />
          )}
          <Button
            type="submit"
            size="lg"
            variant={lessonDone ? "default" : "outline"}
            className="w-full sm:w-auto"
            disabled={!lessonDone || quizPending}
          >
            <ClipboardCheck aria-hidden />
            {quizPending
              ? "Spark sedang membuat kuis..."
              : lessonDone
                ? "Kerjakan kuis misi"
                : "Kuis terkunci"}
          </Button>
        </form>
        {quizState.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {quizState.error}
          </p>
        )}
        {!lessonDone && (
          <p className="text-xs text-muted-foreground">
            Kuis terbuka setelah materi selesai dibaca.
          </p>
        )}
      </div>
    </div>
  );
}
