import "server-only";
import { prisma } from "@/lib/prisma";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { filterInput } from "@/features/ai/safety";
import { logAIGeneration, logSafety } from "@/features/ai/log";
import {
  buildMaterialSystemPrompt,
  buildMaterialUserPrompt,
} from "@/features/curriculum/prompts";
import {
  materialOutputSchema,
  type MaterialOutput,
} from "@/features/curriculum/schemas";

export type GetOrCreateMaterialInput = {
  userId: string;
  subjectId: string;
  classLevel: number;
  topic: string;
  learningObjective?: string;
};

export type GetOrCreateMaterialResult =
  | { ok: true; materialId: string; fromCache: boolean }
  | { ok: false; error: string };

async function generateMaterial(
  input: GetOrCreateMaterialInput,
  subjectName: string
): Promise<MaterialOutput> {
  const openai = getOpenAIClient();
  const userPrompt = buildMaterialUserPrompt({
    subjectName,
    classLevel: input.classLevel,
    topic: input.topic,
    learningObjective: input.learningObjective,
  });

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const startedAt = Date.now();
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: buildMaterialSystemPrompt() },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message.content ?? "";
      const parsed = materialOutputSchema.safeParse(JSON.parse(raw));

      if (!parsed.success) {
        lastError = new Error("Format materi dari AI tidak valid");
        await logAIGeneration({
          userId: input.userId,
          type: "curriculum",
          prompt: userPrompt,
          response: raw,
          status: "failed",
          durationMs: Date.now() - startedAt,
        });
        continue;
      }

      await logAIGeneration({
        userId: input.userId,
        type: "curriculum",
        prompt: userPrompt,
        response: raw,
        status: "success",
        durationMs: Date.now() - startedAt,
      });

      return parsed.data;
    } catch (error) {
      lastError = error;
      await logAIGeneration({
        userId: input.userId,
        type: "curriculum",
        prompt: userPrompt,
        status: "failed",
        durationMs: Date.now() - startedAt,
      });
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Generasi materi gagal");
}

export async function getOrCreateMaterial(
  input: GetOrCreateMaterialInput
): Promise<GetOrCreateMaterialResult> {
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

  const cached = await prisma.curriculumMaterial.findUnique({
    where: {
      subjectId_classLevel_topic: {
        subjectId: input.subjectId,
        classLevel: input.classLevel,
        topic: input.topic.trim(),
      },
    },
  });

  if (cached) {
    return { ok: true, materialId: cached.id, fromCache: true };
  }

  try {
    const material = await generateMaterial(input, subject.name);

    const created = await prisma.curriculumMaterial.create({
      data: {
        subjectId: input.subjectId,
        classLevel: input.classLevel,
        topic: input.topic.trim(),
        learningObjective: input.learningObjective?.trim() || null,
        title: material.title,
        content: material.explanation,
        example: material.example,
        summary: material.summary,
      },
    });

    return { ok: true, materialId: created.id, fromCache: false };
  } catch (error) {
    console.error("Generasi materi gagal", error);
    return {
      ok: false,
      error:
        "Materi belum bisa dibuat. Periksa koneksi atau kunci API OpenAI, lalu coba lagi.",
    };
  }
}

export async function getMaterialById(id: string) {
  return prisma.curriculumMaterial.findUnique({
    where: { id },
    include: { subject: true },
  });
}

export async function listRecentMaterials(limit = 8) {
  return prisma.curriculumMaterial.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { subject: true },
  });
}
