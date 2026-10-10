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

  console.log("Seed selesai: 3 mata pelajaran + akun demo siswa1/password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
