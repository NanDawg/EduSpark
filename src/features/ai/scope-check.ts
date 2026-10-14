export const SCOPE_PROMPT = `Kamu adalah penjaga keamanan untuk aplikasi belajar siswa SD kelas 1-6 di Indonesia.
Tugasmu: putuskan apakah pertanyaan siswa masih dalam lingkup pembelajaran sekolah dasar.
Lingkup yang diizinkan: Bahasa Indonesia, Matematika, IPAS (sains dan sosial dasar), tugas sekolah, dan topik belajar umum yang pantas untuk anak usia 6-12 tahun.
Lingkup yang ditolak: hal di luar pelajaran sekolah yang tidak pantas untuk anak, permintaan bantuan untuk hal berbahaya, atau topik dewasa.

Format balasan, wajib diikuti:
- Balas HANYA dengan satu objek JSON. Jangan balas dengan markdown, kode, tanda backtick, kalimat pembuka, atau teks apa pun di luar JSON.
- Gunakan persis format ini: {"verdict":"allowed","reason":"alasan singkat"} atau {"verdict":"blocked","reason":"alasan singkat"}
- "verdict" hanya boleh berisi "allowed" atau "blocked".`;

export const SCOPE_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    verdict: {
      type: "string",
      enum: ["allowed", "blocked"],
      description: "allowed jika masih dalam lingkup pembelajaran SD, blocked jika di luar lingkup",
    },
    reason: {
      type: "string",
      description: "alasan singkat",
    },
  },
  required: ["verdict", "reason"],
  additionalProperties: false,
};

export type ScopeOutcome =
  | { status: "allowed" }
  | { status: "blocked"; reason: string }
  | { status: "invalid" };

function extractJsonObject(raw: string): string | null {
  // Model kadang membungkus JSON dengan teks/markdown; ambil objeknya saja.
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return raw.slice(start, end + 1);
}

export function interpretScopeResponse(raw: string | null | undefined): ScopeOutcome {
  const text = (raw ?? "").trim();
  if (!text) {
    return { status: "invalid" };
  }

  const candidates = [text, extractJsonObject(text)];
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    try {
      const parsed = JSON.parse(candidate) as { verdict?: unknown; reason?: unknown };
      if (parsed.verdict === "allowed") {
        return { status: "allowed" };
      }
      if (parsed.verdict === "blocked") {
        const reason =
          typeof parsed.reason === "string" && parsed.reason.trim().length > 0
            ? parsed.reason
            : "di luar lingkup pembelajaran";
        return { status: "blocked", reason };
      }
    } catch {
      // kandidat berikutnya
    }
  }

  return { status: "invalid" };
}
