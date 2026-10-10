export function buildMaterialSystemPrompt() {
  return `Kamu adalah pembuat materi pelajaran untuk siswa SD kelas 1-6 di Indonesia yang mengikuti Kurikulum Merdeka.
Tulisanmu ramah, jelas, dan sesuai usia anak.
Selalu balas dengan JSON valid berisi field:
"title" (judul materi yang menarik),
"learningObjective" (tujuan pembelajaran, 1-2 kalimat),
"explanation" (penjelasan bertahap dengan bahasa sederhana, boleh pakai paragraf pendek),
"example" (contoh soal atau contoh nyata yang mudah dipahami),
"summary" (ringkasan 2-3 kalimat).
Jangan tambahkan teks apa pun di luar JSON.`;
}

export function buildMaterialUserPrompt(input: {
  subjectName: string;
  classLevel: number;
  topic: string;
  learningObjective?: string;
}) {
  const lines = [
    `Mata pelajaran: ${input.subjectName}`,
    `Kelas: ${input.classLevel}`,
    `Topik: ${input.topic}`,
  ];
  if (input.learningObjective) {
    lines.push(`Tujuan pembelajaran dari guru: ${input.learningObjective}`);
  }
  return lines.join("\n");
}
