"use client";

import { useActionState, useMemo, useState } from "react";
import {
  generateQuizAction,
  type GenerateQuizState,
} from "@/actions/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DIFFICULTY_LABELS,
  QUIZ_DIFFICULTIES,
  QUIZ_QUESTION_COUNTS,
} from "@/features/quiz/schemas";

type SubjectOption = {
  id: string;
  name: string;
};

type MaterialOption = {
  id: string;
  subjectId: string;
  topic: string;
  title: string;
};

export function QuizForm({
  subjects,
  materials,
  defaultSubjectId,
}: {
  subjects: SubjectOption[];
  materials: MaterialOption[];
  defaultSubjectId?: string;
}) {
  const [state, formAction, isPending] = useActionState<
    GenerateQuizState,
    FormData
  >(generateQuizAction, {});

  const [subjectId, setSubjectId] = useState(
    defaultSubjectId ?? subjects[0]?.id ?? ""
  );
  const [materialId, setMaterialId] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<string>("mudah");
  const [count, setCount] = useState<string>("5");

  const subjectMaterials = useMemo(
    () => materials.filter((material) => material.subjectId === subjectId),
    [materials, subjectId]
  );

  if (subjects.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Mata pelajaran belum tersedia. Hubungi guru untuk mengisi daftar
        pelajaran.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="quiz-subject">Mata Pelajaran</Label>
        <select
          id="quiz-subject"
          name="subjectId"
          value={subjectId}
          onChange={(event) => {
            setSubjectId(event.target.value);
            setMaterialId("");
          }}
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="quiz-material">Materi (opsional)</Label>
        <select
          id="quiz-material"
          value={materialId}
          onChange={(event) => {
            const nextId = event.target.value;
            setMaterialId(nextId);
            const material = materials.find((item) => item.id === nextId);
            if (material) {
              setTopic(material.topic);
            }
          }}
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Pilih topik sendiri</option>
          {subjectMaterials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.title}
            </option>
          ))}
        </select>
        {subjectMaterials.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Belum ada materi untuk mata pelajaran ini. Ketik topikmu sendiri.
          </p>
        )}
      </div>

      <input type="hidden" name="materialId" value={materialId} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="quiz-topic">Topik</Label>
        <Input
          id="quiz-topic"
          name="topic"
          type="text"
          placeholder="contoh: pecahan sederhana"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="quiz-difficulty">Tingkat Kesulitan</Label>
          <select
            id="quiz-difficulty"
            name="difficulty"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {QUIZ_DIFFICULTIES.map((value) => (
              <option key={value} value={value}>
                {DIFFICULTY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="quiz-count">Jumlah Soal</Label>
          <select
            id="quiz-count"
            name="count"
            value={count}
            onChange={(event) => setCount(event.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {QUIZ_QUESTION_COUNTS.map((value) => (
              <option key={value} value={value}>
                {value} soal
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Spark sedang menyiapkan soal..." : "Buat Kuis"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Jawaban benar memberi bonus XP. Kumpulkan semua soal untuk mendapatkan
        XP kuis.
      </p>
    </form>
  );
}
