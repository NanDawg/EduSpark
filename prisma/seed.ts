import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const subjects = [
    { name: "Bahasa Indonesia", slug: "bahasa-indonesia" },
    { name: "Matematika", slug: "matematika" },
    { name: "IPAS", slug: "ipas" },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: {},
      create: subject,
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { username: "siswa1" },
    update: {},
    create: {
      username: "siswa1",
      passwordHash,
      name: "Budi",
      classLevel: 3,
    },
  });

  const badges = [
    {
      id: "first_quiz",
      name: "Langkah Pertama",
      description: "Selesaikan kuis pertamamu.",
      icon: "clipboard-check",
    },
    {
      id: "perfect_score",
      name: "Nilai Sempurna",
      description: "Dapatkan nilai 100 pada satu kuis.",
      icon: "star",
    },
    {
      id: "streak_3",
      name: "Rajin Belajar",
      description: "Dapatkan XP 3 hari berturut-turut.",
      icon: "flame",
    },
    {
      id: "lesson_done",
      name: "Bintang Pembaca",
      description: "Tandai materi pertamamu selesai.",
      icon: "book-open",
    },
    {
      id: "xp_100",
      name: "Pemburu XP",
      description: "Kumpulkan total 100 XP.",
      icon: "trophy",
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { id: badge.id },
      update: {},
      create: badge,
    });
  }

  console.log(
    "Seed selesai: 3 mata pelajaran + akun demo siswa1/password123 + 5 badge"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
