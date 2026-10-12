import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
import { generateQuiz } from "../src/features/quiz/service";
import { filterInput } from "../src/features/ai/safety";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const prisma = new PrismaClient();

type CheckResult = { name: string; pass: boolean; detail: string };
const results: CheckResult[] = [];

function record(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} | ${name} | ${detail}`);
}

const decodeHtml = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");

function extractActionFields(html: string) {
  const ref = html.match(/name="(\$ACTION_REF_\d+)"\s*\/?>/);
  const body = html.match(/name="(\$ACTION_\d+:0)"\s+value="([^"]*)"/);
  const bound = html.match(/name="(\$ACTION_\d+:1)"\s+value="([^"]*)"/);
  const key = html.match(/name="(\$ACTION_KEY)"\s+value="([^"]*)"/);
  if (!ref || !body || !bound || !key) return null;
  return {
    refName: ref[1],
    bodyName: body[1],
    bodyValue: decodeHtml(body[2]),
    boundName: bound[1],
    boundValue: decodeHtml(bound[2]),
    keyName: key[1],
    keyValue: key[2],
  };
}

async function makeSessionCookie(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET!));
  return `eduspark_session=${token}`;
}

async function main() {
  const subject = await prisma.subject.findFirst({
    where: { slug: "matematika" },
  });
  if (!subject) {
    record("setup: subject", false, "run db:seed first");
    return;
  }

  const stamp = Date.now();
  const tempUser = await prisma.user.create({
    data: {
      username: `smoke_e2e_${stamp}`,
      passwordHash: "not-used",
      name: "Smoke E2E",
      classLevel: 3,
    },
  });
  const cookie = await makeSessionCookie(tempUser.id);

  try {
    const blockedVerdict = filterInput("cara bermain judi slot online");
    record(
      "safety: blocked topic rejected before Gemini",
      !blockedVerdict.ok,
      blockedVerdict.reason ?? ""
    );

    const blockedResult = await generateQuiz({
      userId: tempUser.id,
      subjectId: subject.id,
      classLevel: 3,
      topic: "cara bermain judi slot online",
      difficulty: "mudah",
      count: 3,
    });
    record(
      "generateQuiz rejects blocked topic",
      !blockedResult.ok,
      blockedResult.ok ? "generated (bad)" : blockedResult.error
    );
    const safetyRows = await prisma.safetyLog.count({
      where: { userId: tempUser.id, stage: "input" },
    });
    record("SafetyLog written for blocked quiz topic", safetyRows > 0, `rows=${safetyRows}`);

    if (!process.env.GEMINI_API_KEY) {
      record("Gemini generation skipped (no key)", true, "GEMINI_API_KEY missing");
      return;
    }

    const generated = await generateQuiz({
      userId: tempUser.id,
      subjectId: subject.id,
      classLevel: 3,
      topic: "penjumlahan dan pengurangan sampai 100",
      difficulty: "mudah",
      count: 3,
    });
    record(
      "generateQuiz creates attempt via real Gemini",
      generated.ok,
      generated.ok ? `attempt=${generated.attemptId}` : generated.error
    );
    if (!generated.ok) return;

    const aiLogs = await prisma.aIGenerationLog.findMany({
      where: { userId: tempUser.id, type: "quiz" },
      orderBy: { createdAt: "desc" },
    });
    record(
      "AIGenerationLog type=quiz written with success",
      aiLogs.length > 0 && aiLogs[0].status === "success",
      `status=${aiLogs[0]?.status} model=${aiLogs[0]?.model}`
    );

    const quiz = await prisma.quiz.findFirst({
      where: { createdBy: tempUser.id },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    record(
      "3 questions persisted with explanations",
      quiz !== null &&
        quiz.questions.length === 3 &&
        quiz.questions.every((q) => q.explanation.length > 0),
      `questions=${quiz?.questions.length ?? 0}`
    );

    const runnerRes = await fetch(`${BASE}/quiz/${generated.attemptId}`, {
      headers: { cookie },
    });
    const runnerHtml = (await runnerRes.text()).replace(/<!-- -->/g, "");
    record(
      "GET real attempt renders runner over HTTP",
      runnerRes.status === 200 && runnerHtml.includes("Soal 1 dari 3"),
      `status=${runnerRes.status}`
    );
    record(
      "Runner hides correct answers from HTML",
      !runnerHtml.includes('"correctIndex"') &&
        !runnerHtml.includes("jawaban benar"),
      "no leak markers"
    );

    const fields = extractActionFields(runnerHtml);
    if (!fields) {
      record("extract submit server-action fields", false, "missing $ACTION fields");
      return;
    }

    const xpBefore = (
      await prisma.user.findUnique({
        where: { id: tempUser.id },
        select: { xp: true },
      })
    )!.xp;

    const fd = new FormData();
    fd.set(fields.refName, "");
    fd.set(fields.bodyName, fields.bodyValue);
    fd.set(fields.boundName, fields.boundValue);
    fd.set(fields.keyName, fields.keyValue);
    fd.set("attemptId", generated.attemptId);
    const correctCount = quiz!.questions.filter(
      (q) => q.correctIndex >= 0
    ).length;
    for (const question of quiz!.questions) {
      fd.set(`q_${question.id}`, String(question.correctIndex));
    }

    const submitRes = await fetch(`${BASE}/quiz/${generated.attemptId}`, {
      method: "POST",
      redirect: "manual",
      headers: { cookie },
      body: fd,
    });
    record(
      "POST submitQuizAction returns redirect (success)",
      submitRes.status >= 300 && submitRes.status < 400,
      `status=${submitRes.status} location=${submitRes.headers.get("location")}`
    );

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: generated.attemptId },
    });
    record(
      "attempt completed with score 100 after HTTP submit",
      attempt?.status === "completed" && attempt.score === 100,
      `status=${attempt?.status} score=${attempt?.score}`
    );

    const expectedBonus = Math.min(correctCount * 2, 10);
    const expectedTotal = 20 + expectedBonus;
    const xpAfter = (
      await prisma.user.findUnique({
        where: { id: tempUser.id },
        select: { xp: true, level: true },
      })
    )!;
    record(
      `XP awarded over HTTP = 20 + ${expectedBonus} bonus`,
      xpAfter.xp - xpBefore === expectedTotal,
      `delta=${xpAfter.xp - xpBefore} expected=${expectedTotal} level=${xpAfter.level}`
    );

    const xpRows = await prisma.xPHistory.findMany({
      where: { userId: tempUser.id },
    });
    record(
      "XPHistory rows written for quiz + bonus",
      xpRows.some((r) => r.source === "quiz") &&
        xpRows.some((r) => r.source === "quiz_bonus"),
      `sources=${xpRows.map((r) => r.source).join(",")}`
    );

    const owned = (
      await prisma.userBadge.findMany({
        where: { userId: tempUser.id },
        select: { badgeId: true },
      })
    ).map((r) => r.badgeId);
    record(
      "first_quiz badge earned through HTTP flow",
      owned.includes("first_quiz"),
      `owned=${owned.join(",")}`
    );

    const resultRes = await fetch(`${BASE}/quiz/${generated.attemptId}`, {
      headers: { cookie },
    });
    const resultHtml = (await resultRes.text()).replace(/<!-- -->/g, "");
    record(
      "GET attempt after submit renders result over HTTP",
      resultRes.status === 200 &&
        resultHtml.includes("Hasil kuis") &&
        resultHtml.includes("Pembahasan"),
      `status=${resultRes.status}`
    );
  } finally {
    await prisma.quizAnswer.deleteMany({
      where: { attempt: { userId: tempUser.id } },
    });
    await prisma.quizAttempt.deleteMany({ where: { userId: tempUser.id } });
    await prisma.quiz.deleteMany({ where: { createdBy: tempUser.id } });
    await prisma.xPHistory.deleteMany({ where: { userId: tempUser.id } });
    await prisma.userBadge.deleteMany({ where: { userId: tempUser.id } });
    await prisma.aIGenerationLog.deleteMany({ where: { userId: tempUser.id } });
    await prisma.safetyLog.deleteMany({ where: { userId: tempUser.id } });
    await prisma.user.delete({ where: { id: tempUser.id } });
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
