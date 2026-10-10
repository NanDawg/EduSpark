import "server-only";
import { prisma } from "@/lib/prisma";

export type AIGenerationType = "curriculum" | "spark" | "scope-check";
export type AIGenerationStatus = "success" | "failed" | "blocked";

export async function logAIGeneration(entry: {
  userId?: string | null;
  type: AIGenerationType;
  prompt: string;
  response?: string | null;
  status: AIGenerationStatus;
  durationMs?: number;
}) {
  try {
    await prisma.aIGenerationLog.create({
      data: {
        userId: entry.userId ?? null,
        type: entry.type,
        prompt: entry.prompt.slice(0, 8000),
        response: entry.response?.slice(0, 8000) ?? null,
        model: "gemini",
        status: entry.status,
        durationMs: entry.durationMs ?? null,
      },
    });
  } catch (error) {
    console.error("Gagal menulis AIGenerationLog", error);
  }
}

export type SafetyStage = "input" | "scope" | "output";

export async function logSafety(entry: {
  userId?: string | null;
  stage: SafetyStage;
  content: string;
  reason: string;
}) {
  try {
    await prisma.safetyLog.create({
      data: {
        userId: entry.userId ?? null,
        stage: entry.stage,
        content: entry.content.slice(0, 4000),
        reason: entry.reason,
      },
    });
  } catch (error) {
    console.error("Gagal menulis SafetyLog", error);
  }
}
