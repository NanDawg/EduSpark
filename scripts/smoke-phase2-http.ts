import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

const prisma = new PrismaClient();

type CheckResult = { name: string; pass: boolean; detail: string };
const results: CheckResult[] = [];

function record(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} | ${name} | ${detail}`);
}

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET missing");
  return new TextEncoder().encode(secret);
}

async function makeSessionCookie(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getSecret());
  return `eduspark_session=${token}`;
}

async function main() {
  const siswa = await prisma.user.findUnique({
    where: { username: "siswa1" },
  });
  if (!siswa) {
    record("setup: siswa1 exists", false, "run db:seed first");
    return;
  }
  const cookie = await makeSessionCookie(siswa.id);

  const quizNoAuth = await fetch(`${BASE}/quiz`, { redirect: "manual" });
  record(
    "GET /quiz without session redirects to /login",
    quizNoAuth.status >= 300 &&
      quizNoAuth.status < 400 &&
      (quizNoAuth.headers.get("location") ?? "").includes("/login"),
    `status=${quizNoAuth.status} location=${quizNoAuth.headers.get("location")}`
  );

  const quizPage = await fetch(`${BASE}/quiz`, { headers: { cookie } });
  const quizHtml = (await quizPage.text()).replace(/<!-- -->/g, "");
  record(
    "GET /quiz renders create form",
    quizPage.status === 200 && quizHtml.includes("Buat kuis baru"),
    `status=${quizPage.status}`
  );
  record(
    "GET /quiz shows history heading",
    quizHtml.includes("Riwayat kuis"),
    "heading present"
  );

  const dash = await fetch(`${BASE}/dashboard`, { headers: { cookie } });
  const dashHtml = (await dash.text()).replace(/<!-- -->/g, "");
  record(
    "GET /dashboard renders Level card",
    dashHtml.includes("Level ") && dashHtml.includes("Menuju Level") ||
      dashHtml.includes("level tertinggi"),
    "level card present"
  );
  record(
    "GET /dashboard renders badge gallery",
    dashHtml.includes("Badge") && dashHtml.includes("terbuka"),
    "badge gallery present"
  );
  record(
    "GET /dashboard renders progress section",
    dashHtml.includes("Progres belajar") && dashHtml.includes("Materi selesai"),
    "progress section present"
  );
  record(
    "GET /dashboard renders XP history",
    dashHtml.includes("Aktivitas XP terbaru"),
    "xp history present"
  );
  record(
    "GET /dashboard shows quiz nav item",
    dashHtml.includes("/quiz") && dashHtml.includes("Kuis"),
    "nav contains Kuis"
  );

  const unknownAttempt = await fetch(`${BASE}/quiz/does-not-exist`, {
    headers: { cookie },
  });
  const unknownHtml = await unknownAttempt.text();
  record(
    "GET /quiz/unknown id renders not-found shell, no quiz content",
    unknownHtml.includes("__next_error__") &&
      !unknownHtml.includes("terjawab") &&
      !unknownHtml.includes("Hasil kuis"),
    `status=${unknownAttempt.status} shell=${unknownHtml.includes("__next_error__")}`
  );

  const subject = await prisma.subject.findFirst({
    where: { slug: "matematika" },
  });
  if (!subject) {
    record("setup: matematika subject", false, "run db:seed first");
    return;
  }

  const stamp = Date.now();
  const quiz = await prisma.quiz.create({
    data: {
      subjectId: subject.id,
      classLevel: 3,
      topic: `smoke-http-${stamp}`,
      difficulty: "mudah",
      createdBy: siswa.id,
    },
  });

  const openAttempt = await prisma.quizAttempt.create({
    data: { quizId: quiz.id, userId: siswa.id, totalQuestions: 2 },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: quiz.id,
        order: 1,
        question: "Berapa hasil 1 + 1?",
        options: JSON.stringify(["1", "2", "3", "4"]),
        correctIndex: 1,
        explanation: "Satu ditambah satu sama dengan dua.",
      },
      {
        quizId: quiz.id,
        order: 2,
        question: "Angka manakah yang lebih besar?",
        options: JSON.stringify(["5", "8", "3", "1"]),
        correctIndex: 1,
        explanation: "Delapan lebih besar dari yang lain.",
      },
    ],
  });

  try {
    const runnerRes = await fetch(`${BASE}/quiz/${openAttempt.id}`, {
      headers: { cookie },
    });
    const runnerHtml = (await runnerRes.text()).replace(/<!-- -->/g, "");
    record(
      "GET in-progress attempt renders runner",
      runnerRes.status === 200 &&
        runnerHtml.includes("Soal 1 dari 2") &&
        runnerHtml.includes("terjawab") &&
        runnerHtml.includes("Berikutnya"),
      `status=${runnerRes.status}`
    );
    record(
      "Runner does not leak correct answers",
      !runnerHtml.includes("jawaban benar") &&
        !runnerHtml.includes("correctIndex") &&
        !runnerHtml.includes("Pembahasan: "),
      "no leak markers found"
    );

    const completedAttempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: siswa.id,
        status: "completed",
        totalQuestions: 2,
        score: 100,
        correctCount: 2,
        xpAwarded: 24,
        completedAt: new Date(),
      },
    });
    const completedQuestions = await prisma.quizQuestion.findMany({
      where: { quizId: quiz.id },
      orderBy: { order: "asc" },
    });
    await prisma.quizAnswer.createMany({
      data: completedQuestions.map((question) => ({
        attemptId: completedAttempt.id,
        questionId: question.id,
        selectedIndex: question.correctIndex,
        isCorrect: true,
      })),
    });

    const resultRes = await fetch(`${BASE}/quiz/${completedAttempt.id}`, {
      headers: { cookie },
    });
    const resultHtml = (await resultRes.text()).replace(/<!-- -->/g, "");
    record(
      "GET completed attempt renders result",
      resultRes.status === 200 &&
        resultHtml.includes("Hasil kuis") &&
        resultHtml.includes("100") &&
        resultHtml.includes("+24 XP"),
      `status=${resultRes.status}`
    );
    record(
      "Result shows explanations",
      resultHtml.includes("Pembahasan") &&
        resultHtml.includes("Satu ditambah satu sama dengan dua."),
      "explanation text present"
    );

    const historyRes = await fetch(`${BASE}/quiz`, { headers: { cookie } });
    const historyHtml = (await historyRes.text()).replace(/<!-- -->/g, "");
    record(
      "GET /quiz history lists attempts",
      historyHtml.includes(`smoke-http-${stamp}`),
      "fixture topic listed"
    );
    record(
      "History shows in-progress attempt as Lanjutkan",
      historyHtml.includes("Lanjutkan"),
      "in-progress label present"
    );

    const learnList = await prisma.curriculumMaterial.findFirst({
      where: { subjectId: subject.id },
    });
    const materialId = learnList?.id ?? (
      await prisma.curriculumMaterial.create({
        data: {
          subjectId: subject.id,
          classLevel: 3,
          topic: `smoke-http-materi-${stamp}`,
          title: "Materi sementara smoke http",
          content: "Isi.",
          example: "Contoh.",
          summary: "Ringkasan.",
        },
      })
    ).id;

    const materialRes = await fetch(`${BASE}/learn/${materialId}`, {
      headers: { cookie },
    });
    const materialHtml = (await materialRes.text()).replace(/<!-- -->/g, "");
    record(
      "GET material page shows complete button",
      materialRes.status === 200 &&
        (materialHtml.includes("Tandai selesai") ||
          materialHtml.includes("Sudah selesai")),
      `status=${materialRes.status}`
    );
  } finally {
    await prisma.quizAnswer.deleteMany({
      where: { attempt: { quizId: quiz.id } },
    });
    await prisma.quizAttempt.deleteMany({ where: { quizId: quiz.id } });
    await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
    await prisma.quiz.delete({ where: { id: quiz.id } });
    await prisma.curriculumMaterial.deleteMany({
      where: { topic: `smoke-http-materi-${stamp}` },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    const failed = results.filter((r) => !r.pass);
    console.log(
      `\n${results.length - failed.length}/${results.length} checks passed`
    );
    if (failed.length > 0) process.exitCode = 1;
  });
