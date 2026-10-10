import "server-only";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { logSafety } from "@/features/ai/log";

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

const SCOPE_PROMPT = `Kamu adalah penjaga keamanan untuk aplikasi belajar siswa SD kelas 1-6 di Indonesia.
Tugasmu: putuskan apakah pertanyaan siswa masih dalam lingkup pembelajaran sekolah dasar.
Lingkup yang diizinkan: Bahasa Indonesia, Matematika, IPAS (sains dan sosial dasar), tugas sekolah, dan topik belajar umum yang pantas untuk anak usia 6-12 tahun.
Lingkup yang ditolak: hal di luar pelajaran sekolah yang tidak pantas untuk anak, permintaan bantuan untuk hal berbahaya, atau topik dewasa.
Balas HANYA dengan JSON valid: {"verdict":"allowed"|"blocked","reason":"alasan singkat"}`;

export async function checkEducationalScope(
  question: string,
  userId?: string | null
): Promise<SafetyVerdict> {
  try {
    const gemini = getGeminiClient();
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Pertanyaan siswa:\n${question}`,
      config: {
        systemInstruction: SCOPE_PROMPT,
        temperature: 0,
        maxOutputTokens: 100,
        responseMimeType: "application/json",
      },
    });

    const raw = response.text ?? "";
    const parsed = JSON.parse(raw) as { verdict?: string; reason?: string };
    const allowed = parsed.verdict === "allowed";

    if (!allowed) {
      await logSafety({
        userId,
        stage: "scope",
        content: question,
        reason: parsed.reason ?? "di luar lingkup pembelajaran",
      });
    }

    return allowed
      ? { ok: true }
      : { ok: false, reason: parsed.reason ?? "di luar lingkup pembelajaran" };
  } catch (error) {
    console.error("Scope check gagal", error);
    return {
      ok: false,
      outage: true,
      reason: "Pemeriksaan keamanan sedang bermasalah",
    };
  }
}
