import { z } from "zod";

export const QUIZ_DIFFICULTIES = ["mudah", "sedang", "sulit"] as const;
export type QuizDifficulty = (typeof QUIZ_DIFFICULTIES)[number];

export const QUIZ_QUESTION_COUNTS = [3, 5, 10] as const;

export const DIFFICULTY_LABELS: Record<QuizDifficulty, string> = {
  mudah: "Mudah",
  sedang: "Sedang",
  sulit: "Sulit",
};

const quizQuestionSchema = z
  .object({
    question: z.string().min(1),
    options: z.array(z.string().min(1)).length(4),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().min(1),
  })
  .superRefine((question, ctx) => {
    const normalized = question.options.map((option) =>
      option.trim().toLowerCase()
    );
    if (new Set(normalized).size !== 4) {
      ctx.addIssue({
        code: "custom",
        message: "Pilihan jawaban harus berbeda-beda",
      });
    }
  });

export const quizOutputSchema = z.array(quizQuestionSchema).min(1).max(10);

export type QuizOutput = z.infer<typeof quizOutputSchema>;
