import type { QuizDifficulty } from "@/features/quiz/schemas";

export function buildQuizSystemPrompt(): string {
  return [
    "Kamu adalah pembuat soal kuis untuk siswa sekolah dasar di Indonesia.",
    "Buat soal pilihan ganda yang jelas, adil, dan sesuai usia siswa.",
    "Aturan:",
    "- Setiap soal punya tepat 4 pilihan jawaban dan hanya 1 jawaban benar.",
    "- Keempat pilihan jawaban harus berbeda-beda.",
    "- Bahasa sederhana dan ramah, mudah dipahami anak kelas 1 sampai 6.",
    "- Sertakan pembahasan singkat yang membantu siswa memahami jawaban benar.",
    "- Balas HANYA dengan JSON berupa array objek.",
    "- Setiap objek punya field: question (string), options (array tepat 4 string), correctIndex (angka 0-3), explanation (string).",
  ].join("\n");
}

export function buildQuizUserPrompt(input: {
  subjectName: string;
  classLevel: number;
  topic: string;
  difficulty: QuizDifficulty;
  count: number;
}): string {
  return [
    `Mata pelajaran: ${input.subjectName}`,
    `Kelas: ${input.classLevel}`,
    `Topik: ${input.topic}`,
    `Tingkat kesulitan: ${input.difficulty}`,
    `Jumlah soal: ${input.count}`,
    "Buat soal kuis berdasarkan data di atas.",
  ].join("\n");
}
