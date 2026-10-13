import "server-only";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { logAIGeneration, logSafety } from "@/features/ai/log";
import { SCOPE_GENERATION_CONFIG, SCOPE_PROMPT, interpretScopeResponse } from "@/features/ai/scope-check";

const MAX_INPUT_LENGTH = 2000;

const BLOCKLIST_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\b(seks|sex|pornografi|porno|porn|bugil|telanjang)/i, reason: "konten seksual" },
  { pattern: /\b(bunuh diri|suicide|self[- ]?harm)/i, reason: "bahaya pada diri sendiri" },
  { pattern: /\b(narkoba|obat terlarang|drug dealing)/i, reason: "obat terlarang" },
  { pattern: /\b(judi|gambling|slot online|togel)/i, reason: "perjudian" },
  { pattern: /\b(bom bunuh diri|terror|teror|senjata api)/i, reason: "kekerasan atau teror" },
];

export type SafetyVerdict = {
  ok: boolean;
  reason?: string;
  outage?: boolean;
};

export function filterInput(text: string): SafetyVerdict {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: "Pesan kosong" };
  }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { ok: false, reason: "Pesan terlalu panjang" };
  }
  for (const { pattern, reason } of BLOCKLIST_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { ok: false, reason };
    }
  }
  return { ok: true };
}

export function filterOutput(text: string): SafetyVerdict {
  if (!text || text.trim().length === 0) {
    return { ok: false, reason: "Jawaban kosong dari AI" };
  }
  for (const { pattern, reason } of BLOCKLIST_PATTERNS) {
    if (pattern.test(text)) {
      return { ok: false, reason };
    }
  }
  return { ok: true };
}

export async function checkEducationalScope(
  question: string,
  userId?: string | null
): Promise<SafetyVerdict> {
  const startedAt = Date.now();
  try {
    const gemini = getGeminiClient();
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Pertanyaan siswa:\n${question}`,
      config: {
        systemInstruction: SCOPE_PROMPT,
        ...SCOPE_GENERATION_CONFIG,
      },
    });

    const raw = response.text ?? "";
    const outcome = interpretScopeResponse(raw);

    if (outcome.status === "invalid") {
      console.error("Scope check mengembalikan respons tidak valid", raw.slice(0, 500));
      await logAIGeneration({
        userId,
        type: "scope-check",
        prompt: question,
        response: raw,
        status: "failed",
        durationMs: Date.now() - startedAt,
      });
      return {
        ok: false,
        outage: true,
        reason: "Pemeriksaan keamanan sedang bermasalah",
      };
    }

    if (outcome.status === "blocked") {
      await logSafety({
        userId,
        stage: "scope",
        content: question,
        reason: outcome.reason,
      });
      return { ok: false, reason: outcome.reason };
    }

    return { ok: true };
  } catch (error) {
    console.error("Scope check gagal", error);
    await logAIGeneration({
      userId,
      type: "scope-check",
      prompt: question,
      status: "failed",
      durationMs: Date.now() - startedAt,
    });
    return {
      ok: false,
      outage: true,
      reason: "Pemeriksaan keamanan sedang bermasalah",
    };
  }
}
