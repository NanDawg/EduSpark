import "server-only";
import { prisma } from "@/lib/prisma";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { checkEducationalScope, filterInput, filterOutput } from "@/features/ai/safety";
import { logAIGeneration, logSafety } from "@/features/ai/log";
import { buildSparkSystemPrompt } from "@/features/spark/prompts";

const HISTORY_LIMIT = 10;
const CONTEXT_MATERIAL_LIMIT = 4;

export type AskSparkInput = {
  userId: string;
  question: string;
};

export type AskSparkResult =
  | { ok: true; reply: string }
  | { ok: false; reply: string; blocked: boolean };

async function buildCurriculumContext(classLevel: number): Promise<string> {
  const materials = await prisma.curriculumMaterial.findMany({
    where: { classLevel },
    orderBy: { createdAt: "desc" },
    take: CONTEXT_MATERIAL_LIMIT,
    include: { subject: true },
  });

  if (materials.length === 0) {
    return "";
  }

  return materials
    .map(
      (m) =>
        `- ${m.subject.name} | ${m.title}: ${m.summary}`
    )
    .join("\n");
}

function refusalMessage(): string {
  return "Maaf, aku hanya bisa membantu pelajaran sekolah seperti Bahasa Indonesia, Matematika, dan IPAS. Mau tanya pelajaran apa?";
}

export async function askSpark(
  input: AskSparkInput
): Promise<AskSparkResult> {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) {
    return {
      ok: false,
      reply: "Akun tidak ditemukan. Silakan masuk lagi.",
      blocked: true,
    };
  }

  const inputVerdict = filterInput(input.question);
  if (!inputVerdict.ok) {
    await logSafety({
      userId: user.id,
      stage: "input",
      content: input.question,
      reason: inputVerdict.reason ?? "input tidak aman",
    });
    await prisma.sparkChat.createMany({
      data: [
        { userId: user.id, role: "user", content: input.question, blocked: true },
        { userId: user.id, role: "assistant", content: refusalMessage(), blocked: true },
      ],
    });
    return { ok: false, reply: refusalMessage(), blocked: true };
  }

  const scopeVerdict = await checkEducationalScope(input.question, user.id);
  if (!scopeVerdict.ok) {
    if (scopeVerdict.outage) {
      return {
        ok: false,
        reply: "Spark sedang mengalami gangguan. Coba lagi beberapa saat lagi ya.",
        blocked: false,
      };
    }
    await prisma.sparkChat.createMany({
      data: [
        { userId: user.id, role: "user", content: input.question, blocked: true },
        { userId: user.id, role: "assistant", content: refusalMessage(), blocked: true },
      ],
    });
    return { ok: false, reply: refusalMessage(), blocked: true };
  }

  const openai = getOpenAIClient();
  const startedAt = Date.now();

  const [history, curriculumContext] = await Promise.all([
    prisma.sparkChat.findMany({
      where: { userId: user.id, blocked: false },
      orderBy: { createdAt: "desc" },
      take: HISTORY_LIMIT,
    }),
    buildCurriculumContext(user.classLevel),
  ]);

  const systemPrompt = buildSparkSystemPrompt({
    name: user.name,
    classLevel: user.classLevel,
  });

  const historyMessages = history.reverse().map(
    (chat): ChatCompletionMessageParam =>
      chat.role === "assistant"
        ? { role: "assistant", content: chat.content }
        : { role: "user", content: chat.content }
  );

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...historyMessages,
    { role: "user", content: input.question },
  ];

  const contextBlock = curriculumContext
    ? `Ringkasan materi kelas ${user.classLevel}:\n${curriculumContext}\n\n`
    : "";

  try {
    await prisma.sparkChat.create({
      data: { userId: user.id, role: "user", content: input.question },
    });

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages,
      temperature: 0.7,
      max_completion_tokens: 1024,
    });

    let reply = (response.choices[0]?.message.content ?? "").trim();

    if (!reply) {
      reply = "Aku belum bisa menjawab itu. Coba tanya dengan cara lain ya.";
    }

    const outputVerdict = filterOutput(reply);
    if (!outputVerdict.ok) {
      await logSafety({
        userId: user.id,
        stage: "output",
        content: reply,
        reason: outputVerdict.reason ?? "output tidak aman",
      });
      reply = refusalMessage();
      await logAIGeneration({
        userId: user.id,
        type: "spark",
        prompt: contextBlock + input.question,
        response: reply,
        status: "blocked",
        durationMs: Date.now() - startedAt,
      });
      await prisma.sparkChat.create({
        data: { userId: user.id, role: "assistant", content: reply, blocked: true },
      });
      return { ok: false, reply, blocked: true };
    }

    await logAIGeneration({
      userId: user.id,
      type: "spark",
      prompt: contextBlock + input.question,
      response: reply,
      status: "success",
      durationMs: Date.now() - startedAt,
    });

    await prisma.sparkChat.create({
      data: { userId: user.id, role: "assistant", content: reply },
    });

    return { ok: true, reply };
  } catch (error) {
    console.error("Spark gagal menjawab", error);
    await logAIGeneration({
      userId: user.id,
      type: "spark",
      prompt: contextBlock + input.question,
      status: "failed",
      durationMs: Date.now() - startedAt,
    });
    return {
      ok: false,
      reply:
        "Spark sedang mengalami gangguan. Coba lagi beberapa saat lagi ya.",
      blocked: false,
    };
  }
}

export async function getChatHistory(userId: string, limit = 50) {
  return prisma.sparkChat.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
