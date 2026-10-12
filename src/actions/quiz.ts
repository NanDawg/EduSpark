"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/features/auth/user";
import { generateQuiz, submitAttempt } from "@/features/quiz/service";
import { QUIZ_DIFFICULTIES, QUIZ_QUESTION_COUNTS } from "@/features/quiz/schemas";

const generateSchema = z.object({
  subjectId: z.string().min(1, "Pilih mata pelajaran"),
  materialId: z.string().optional(),
  topic: z
    .string()
    .trim()
    .min(3, "Topik minimal 3 huruf")
    .max(120, "Topik terlalu panjang"),
  difficulty: z.enum(QUIZ_DIFFICULTIES, {
    message: "Tingkat kesulitan tidak valid",
  }),
  count: z.coerce
    .number()
    .int()
    .refine(
      (value) => (QUIZ_QUESTION_COUNTS as readonly number[]).includes(value),
      { message: "Jumlah soal tidak valid" }
    ),
});

export type GenerateQuizState = {
  error?: string;
  pending?: boolean;
};

export async function generateQuizAction(
  _prevState: GenerateQuizState,
  formData: FormData
): Promise<GenerateQuizState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  const materialRaw = formData.get("materialId");
  const parsed = generateSchema.safeParse({
    subjectId: formData.get("subjectId"),
    materialId:
      typeof materialRaw === "string" && materialRaw.length > 0
        ? materialRaw
        : undefined,
    topic: formData.get("topic"),
    difficulty: formData.get("difficulty"),
    count: formData.get("count"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await generateQuiz({
    userId: user.id,
    subjectId: parsed.data.subjectId,
    materialId: parsed.data.materialId,
    classLevel: user.classLevel,
    topic: parsed.data.topic,
    difficulty: parsed.data.difficulty,
    count: parsed.data.count,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  redirect(`/quiz/${result.attemptId}`);
}

const submitSchema = z.object({
  attemptId: z.string().min(1, "Kuis tidak ditemukan"),
  selections: z.record(z.string(), z.coerce.number().int()),
});

export type SubmitQuizState = {
  error?: string;
};

export async function submitQuizAction(
  _prevState: SubmitQuizState,
  formData: FormData
): Promise<SubmitQuizState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  const rawSelections: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("q_") && typeof value === "string" && value !== "") {
      rawSelections[key.slice(2)] = value;
    }
  }

  const parsed = submitSchema.safeParse({
    attemptId: formData.get("attemptId"),
    selections: rawSelections,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await submitAttempt(
    user.id,
    parsed.data.attemptId,
    parsed.data.selections
  );

  if (!result.ok) {
    return { error: result.error };
  }

  redirect(`/quiz/${parsed.data.attemptId}`);
}