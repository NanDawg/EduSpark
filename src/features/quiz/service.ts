import "server-only";
import { prisma } from "@/lib/prisma";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { filterInput, filterOutput } from "@/features/ai/safety";
import { logAIGeneration, logSafety } from "@/features/ai/log";
import {
  buildQuizSystemPrompt,
  buildQuizUserPrompt,
} from "@/features/quiz/prompts";
import {
  quizOutputSchema,
  QUIZ_DIFFICULTIES,
  QUIZ_QUESTION_COUNTS,
  type QuizDifficulty,
  type QuizOutput,
} from "@/features/quiz/schemas";
import {
  XP_REWARDS,
  correctAnswerBonus,
} from "@/features/gamification/config";
import { awardXp } from "@/features/gamification/service";

import { evaluateAndUnlockBadges } from "@/features/gamification/badges";
import { awardPathCompletionBonuses } from "@/features/adventure/service";
export type GenerateQuizInput = {
  userId: string;
  subjectId: string;
  materialId?: string;
  classLevel: number;
  topic: string;
  difficulty: QuizDifficulty;
  count: number;
};

export type GenerateQuizResult =
  | { ok: true; attemptId: string }
  | { ok: false; error: string };

function isAllowedDifficulty(value: string): value is QuizDifficulty {
  return (QUIZ_DIFFICULTIES as readonly string[]).includes(value);
}

function isAllowedCount(value: number): boolean {
  return (QUIZ_QUESTION_COUNTS as readonly number[]).includes(value);
}

async function generateQuizQuestions(
  input: GenerateQuizInput,
  subjectName: string
): Promise<QuizOutput> {
  const gemini = getGeminiClient();
  const prompt = buildQuizUserPrompt({
    subjectName,
    classLevel: input.classLevel,
    topic: input.topic,
    difficulty: input.difficulty,
    count: input.count,
  });

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const startedAt = Date.now();
    try {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: buildQuizSystemPrompt(),
          temperature: 0.6,
          responseMimeType: "application/json",
        },
      });

      const raw = response.text ?? "";
      const parsed = quizOutputSchema.safeParse(JSON.parse(raw));

      if (!parsed.success) {
        lastError = new Error("Format soal dari AI tidak valid");
        await logAIGeneration({
          userId: input.userId,
          type: "quiz",
          prompt,
          response: raw,
          status: "failed",
          durationMs: Date.now() - startedAt,
        });
        continue;
      }

      const usable = parsed.data.slice(0, input.count);
      const outputVerdict = filterOutput(
        usable.map((question) => question.question).join("\n")
      );
      if (!outputVerdict.ok) {
        await logSafety({
          userId: input.userId,
          stage: "output",
          content: usable.map((question) => question.question).join("\n"),
          reason: outputVerdict.reason ?? "output tidak aman",
        });
        lastError = new Error("Soal tidak lolos filter keamanan");
        await logAIGeneration({
          userId: input.userId,
          type: "quiz",
          prompt,
          response: raw,
          status: "blocked",
          durationMs: Date.now() - startedAt,
        });
        continue;
      }

      await logAIGeneration({
        userId: input.userId,
        type: "quiz",
        prompt,
        response: raw,
        status: "success",
        durationMs: Date.now() - startedAt,
      });

      return usable;
    } catch (error) {
      lastError = error;
      await logAIGeneration({
        userId: input.userId,
        type: "quiz",
        prompt,
        status: "failed",
        durationMs: Date.now() - startedAt,
      });
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Generasi kuis gagal");
}

export async function generateQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizResult> {
  if (!isAllowedDifficulty(input.difficulty)) {
    return { ok: false, error: "Tingkat kesulitan tidak valid." };
  }
  if (!isAllowedCount(input.count)) {
    return { ok: false, error: "Jumlah soal tidak valid." };
  }

  const topicVerdict = filterInput(input.topic);
  if (!topicVerdict.ok) {
    await logSafety({
      userId: input.userId,
      stage: "input",
      content: input.topic,
      reason: topicVerdict.reason ?? "input tidak aman",
    });
    return {
      ok: false,
      error: "Topik tidak bisa dipakai. Coba topik pelajaran lain.",
    };
  }

  const subject = await prisma.subject.findUnique({
    where: { id: input.subjectId },
  });
  if (!subject) {
    return { ok: false, error: "Mata pelajaran tidak ditemukan." };
  }

  if (input.materialId) {
    const material = await prisma.curriculumMaterial.findUnique({
      where: { id: input.materialId },
      select: { id: true },
    });
    if (!material) {
      return { ok: false, error: "Materi tidak ditemukan." };
    }
  }

  try {
    const questions = await generateQuizQuestions(input, subject.name);

    const created = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          subjectId: input.subjectId,
          materialId: input.materialId ?? null,
          classLevel: input.classLevel,
          topic: input.topic.trim(),
          difficulty: input.difficulty,
          createdBy: input.userId,
        },
      });

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await tx.quizQuestion.create({
          data: {
            quizId: quiz.id,
            order: i + 1,
            question: question.question,
            options: JSON.stringify(question.options),
            correctIndex: question.correctIndex,
            explanation: question.explanation,
          },
        });
      }

      const attempt = await tx.quizAttempt.create({
        data: {
          quizId: quiz.id,
          userId: input.userId,
          totalQuestions: questions.length,
        },
      });

      return { attemptId: attempt.id };
    });

    return { ok: true, attemptId: created.attemptId };
  } catch (error) {
    console.error("Generasi kuis gagal", error);
    return {
      ok: false,
      error:
        "Kuis belum bisa dibuat. Periksa koneksi atau kunci API Gemini, lalu coba lagi.",
    };
  }
}

export type RunnerQuestion = {
  id: string;
  order: number;
  question: string;
  options: string[];
};

export type AttemptForRunner = {
  attemptId: string;
  status: string;
  totalQuestions: number;
  topic: string;
  difficulty: string;
  subjectName: string;
  questions: RunnerQuestion[];
};

function parseOptions(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function getAttemptForRunner(
  attemptId: string,
  userId: string
): Promise<AttemptForRunner | null> {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          subject: true,
          questions: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!attempt || attempt.userId !== userId) {
    return null;
  }

  return {
    attemptId: attempt.id,
    status: attempt.status,
    totalQuestions: attempt.totalQuestions,
    topic: attempt.quiz.topic,
    difficulty: attempt.quiz.difficulty,
    subjectName: attempt.quiz.subject.name,
    questions: attempt.quiz.questions.map((question) => ({
      id: question.id,
      order: question.order,
      question: question.question,
      options: parseOptions(question.options),
    })),
  };
}

export type Selections = Record<string, number>;

export type SubmitAttemptResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitAttempt(
  userId: string,
  attemptId: string,
  selections: Selections
): Promise<SubmitAttemptResult> {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { include: { questions: true } } },
  });

  if (!attempt || attempt.userId !== userId) {
    return { ok: false, error: "Kuis tidak ditemukan." };
  }
  if (attempt.status === "completed") {
    return { ok: false, error: "Kuis ini sudah dikumpulkan." };
  }

  const questions = attempt.quiz.questions;
  if (questions.length !== attempt.totalQuestions) {
    return { ok: false, error: "Soal kuis belum lengkap." };
  }

  for (const question of questions) {
    const selected = selections[question.id];
    if (
      typeof selected !== "number" ||
      !Number.isInteger(selected) ||
      selected < 0 ||
      selected > 3
    ) {
      return {
        ok: false,
        error: "Semua soal harus dijawab sebelum dikumpulkan.",
      };
    }
  }

  const correctCount = questions.filter(
    (question) => selections[question.id] === question.correctIndex
  ).length;
  const score = Math.round((correctCount / questions.length) * 100);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          status: "completed",
          score,
          correctCount,
          completedAt: new Date(),
        },
      });
      for (const question of questions) {
        const selectedIndex = selections[question.id];
        await tx.quizAnswer.create({
          data: {
            attemptId,
            questionId: question.id,
            selectedIndex,
            isCorrect: selectedIndex === question.correctIndex,
          },
        });
      }
    });

    const totalXp =
      XP_REWARDS.quizComplete + correctAnswerBonus(correctCount);

    await awardXp({
      userId,
      amount: XP_REWARDS.quizComplete,
      source: "quiz",
      reason: `Kuis selesai: ${attempt.quiz.topic}`,
      refId: attemptId,
    });
    const bonus = correctAnswerBonus(correctCount);
    if (bonus > 0) {
      await awardXp({
        userId,
        amount: bonus,
        source: "quiz_bonus",
        reason: `Bonus ${correctCount} jawaban benar`,
        refId: attemptId,
      });
    }

    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { xpAwarded: totalXp },
    });

    await awardPathCompletionBonuses(userId);
    await evaluateAndUnlockBadges(userId);
    return { ok: true };
  } catch (error) {
    console.error("Gagal menyelesaikan kuis", error);
    return {
      ok: false,
      error: "Hasil belum bisa disimpan. Coba kumpulkan lagi.",
    };
  }
}

export type ResultAnswer = {
  questionId: string;
  order: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedIndex: number;
  isCorrect: boolean;
};

export type AttemptResult = {
  attemptId: string;
  quizTopic: string;
  subjectName: string;
  difficulty: string;
  status: "in_progress" | "completed";
  totalQuestions: number;
  correctCount: number | null;
  score: number | null;
  xpAwarded: number;
  completedAt: Date | null;
  answers: ResultAnswer[];
};

export async function getAttemptResult(
  attemptId: string,
  userId: string
): Promise<AttemptResult | null> {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      quiz: {
        include: {
          subject: true,
          questions: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!attempt || attempt.userId !== userId) {
    return null;
  }

  const answerMap = new Map(
    attempt.answers.map((answer) => [answer.questionId, answer])
  );

  return {
    attemptId: attempt.id,
    quizTopic: attempt.quiz.topic,
    subjectName: attempt.quiz.subject.name,
    difficulty: attempt.quiz.difficulty,
    status: attempt.status === "completed" ? "completed" : "in_progress",
    totalQuestions: attempt.totalQuestions,
    correctCount: attempt.correctCount,
    score: attempt.score,
    xpAwarded: attempt.xpAwarded,
    completedAt: attempt.completedAt,
    answers: attempt.quiz.questions.map((question) => {
      const answer = answerMap.get(question.id);
      return {
        questionId: question.id,
        order: question.order,
        question: question.question,
        options: parseOptions(question.options),
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        selectedIndex: answer?.selectedIndex ?? -1,
        isCorrect: answer?.isCorrect ?? false,
      };
    }),
  };
}
