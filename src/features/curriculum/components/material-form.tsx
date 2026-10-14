"use client";

import { useActionState } from "react";
import {
  generateMaterialAction,
  type GenerateMaterialState,
} from "@/actions/curriculum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SubjectOption = {
  id: string;
  name: string;
  slug: string;
};

export function MaterialForm({
  subjects,
  defaultSubjectId,
}: {
  subjects: SubjectOption[];
  defaultSubjectId?: string;
}) {
  const [state, formAction, isPending] = useActionState<
    GenerateMaterialState,
    FormData
  >(generateMaterialAction, {});

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
        <Label htmlFor="subjectId">Mata Pelajaran</Label>
        <Select
          id="subjectId"
          name="subjectId"
          defaultValue={defaultSubjectId ?? subjects[0]?.id}
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="topic">Topik</Label>
        <Input
          id="topic"
          name="topic"
          type="text"
          placeholder="contoh: pecahan sederhana"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="learningObjective">
          Tujuan pembelajaran (opsional)
        </Label>
        <Textarea
          id="learningObjective"
          name="learningObjective"
          placeholder="apa yang ingin kamu kuasai dari topik ini?"
          rows={2}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Spark sedang menyiapkan materi..." : "Buat Materi"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Materi yang sama tidak dibuat ulang, jadi hemat dan konsisten.
      </p>
    </form>
  );
}
