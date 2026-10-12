import "dotenv/config";
import "server-only";
import { PrismaClient } from "@prisma/client";
import {
  correctAnswerBonus,
  getLevelProgress,
  levelForXp,
} from "../src/features/gamification/config";
import { awardXp, getStreak } from "../src/features/gamification/service";
import { evaluateAndUnlockBadges } from "../src/features/gamification/badges";
import { markMaterialComplete } from "../src/features/progress/service";
import { submitAttempt } from "../src/features/quiz/service";

const prisma = new PrismaClient();

type CheckResult = { name: string; pass: boolean; detail: string };
const results: CheckResult[] = [];

function record(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} | ${name} | ${detail}`);
}

async function main() {
  record("levelForXp(0) = 1", levelForXp(0) === 1, `got ${levelForXp(0)}`);
  record("levelForXp(99) = 1", levelForXp(99) === 1, `got ${levelForXp(99)}`);
  record("levelForXp(100) = 2", levelForXp(100) === 2, `got ${levelForXp(100)}`);
  record("levelForXp(299) = 2", levelForXp(299) === 2, `got ${levelForXp(299)}`);
  record("levelForXp(300) = 3", levelForXp(300) === 3, `got ${levelForXp(300)}`);
  record("levelForXp(600) = 4", levelForXp(600) === 4, `got ${levelForXp(600)}`);

  const midProgress = getLevelProgress(50);
  record(
    "getLevelProgress(50) = 50% toward level 2",
    midProgress.level === 1 && midProgress.percent === 50 &&
      midProgress.xpIntoLevel === 50 && midProgress.xpToNext === 100,
    JSON.stringify(midProgress)
  );

  record(
    "correctAnswerBonus caps at 10 XP",
    correctAnswerBonus(0) === 0 &&
      correctAnswerBonus(3) === 6 &&
      correctAnswerBonus(5) === 10 &&
      correctAnswerBonus(8) === 10,
    `0->${correctAnswerBonus(0)}, 3->${correctAnswerBonus(3)}, 5->${correctAnswerBonus(5)}, 8->${correctAnswerBonus(8)}`
  );

  const timestamp = Date.now();
  const user = await prisma.user.create({
    data: {
      username: `smoke_gam_${timestamp}`,
      passwordHash: "not-used",
      name: "Smoke Gam",
      classLevel: 3,
    },
  });

  try {
    const subject = await prisma.subject.findFirst();
    if (!subject) {
      record("setup: subject exists", false, "run db:seed first");
      return;
    }

    const award1 = await awardXp({
      userId: user.id,
      amount: 100,
      source: "quiz",
      reason: "Smoke: award 100 XP",
    });
    record(
      "awardXp(100) raises xp to 100 and level to 2",
      award1.xp === 100 && award1.level === 2 && award1.leveledUp,
      `xp=${award1.xp} level=${award1.level} leveledUp=${award1.leveledUp}`
    );

    const xpRow = await prisma.xPHistory.findFirst({
      where: { userId: user.id, amount: 100 },
    });
    record(
      "XPHistory row written by awardXp",
      xpRow !== null && xpRow.source === "quiz",
      xpRow ? `source=${xpRow.source} reason=${xpRow.reason}` : "missing"
    );

    const material = await prisma.curriculumMaterial.create({
      data: {
        subjectId: subject.id,
        classLevel: 99,
        topic: `smoke-temp-${timestamp}`,
        title: "Materi sementara smoke test",
        content: "Isi.",
        example: "Contoh.",
        summary: "Ringkasan.",
      },
    });

    const first = await markMaterialComplete(user.id, material.id);
    record(
      "first material completion awards 10 XP",
      first.ok && !first.alreadyCompleted && first.xpAwarded === 10,
      first.ok ? `xpAwarded=${first.xpAwarded} already=${first.alreadyCompleted}` : first.error
    );

    const second = await markMaterialComplete(user.id, material.id);
    record(
      "second material completion is a no-op",
      second.ok && second.alreadyCompleted && second.xpAwarded === 0,
      second.ok ? `already=${second.alreadyCompleted} xpAwarded=${second.xpAwarded}` : second.error
    );

    const afterMaterial = await prisma.user.findUnique({
      where: { id: user.id },
      select: { xp: true },
    });
    record(
      "total XP after material = 110",
      afterMaterial?.xp === 110,
      `xp=${afterMaterial?.xp}`
    );

    const questionCount = 5;
    const quiz = await prisma.quiz.create({
      data: {
        subjectId: subject.id,
        classLevel: 3,
        topic: "smoke kuis",
        difficulty: "mudah",
        createdBy: user.id,
      },
    });
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      questions.push(
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            order: i + 1,
            question: `Soal ${i + 1}`,
            options: JSON.stringify(["A", "B", "C", "D"]),
            correctIndex: 1,
            explanation: "Karena B.",
          },
        })
      );
    }
    const attempt = await prisma.quizAttempt.create({
      data: { quizId: quiz.id, userId: user.id, totalQuestions: questionCount },
    });

    const partialSelections: Record<string, number> = {};
    partialSelections[questions[0].id] = 1;
    const rejected = await submitAttempt(user.id, attempt.id, partialSelections);
    record(
      "submit with unanswered questions is rejected",
      !rejected.ok,
      rejected.ok ? "accepted (bad)" : rejected.error
    );

    const stillOpen = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
      select: { status: true },
    });
    record(
      "rejected submit leaves attempt in_progress",
      stillOpen?.status === "in_progress",
      `status=${stillOpen?.status}`
    );

    const fullSelections: Record<string, number> = {};
    for (const question of questions) {
      fullSelections[question.id] = 1;
    }
    const xpBefore = (
      await prisma.user.findUnique({ where: { id: user.id }, select: { xp: true } })
    )!.xp;
    const submitted = await submitAttempt(user.id, attempt.id, fullSelections);
    const xpAfter = (
      await prisma.user.findUnique({ where: { id: user.id }, select: { xp: true } })
    )!.xp;

    record(
      "perfect submission accepted",
      submitted.ok,
      submitted.ok ? "ok" : submitted.error
    );
    record(
      "quiz awards 20 XP + 10 XP bonus (5 correct, capped)",
      xpAfter - xpBefore === 30,
      `delta=${xpAfter - xpBefore}`
    );

    const finished = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
    });
    record(
      "attempt completed with score 100 and xpAwarded 30",
      finished?.status === "completed" &&
        finished.score === 100 &&
        finished.correctCount === 5 &&
        finished.xpAwarded === 30,
      `status=${finished?.status} score=${finished?.score} correct=${finished?.correctCount} xp=${finished?.xpAwarded}`
    );

    const answerRows = await prisma.quizAnswer.count({
      where: { attemptId: attempt.id },
    });
    record(
      "5 QuizAnswer rows persisted",
      answerRows === questionCount,
      `rows=${answerRows}`
    );

    const resubmit = await submitAttempt(user.id, attempt.id, fullSelections);
    record(
      "resubmitting a completed attempt is rejected",
      !resubmit.ok,
      resubmit.ok ? "accepted (bad)" : resubmit.error
    );

    const xpAfterResubmit = (
      await prisma.user.findUnique({ where: { id: user.id }, select: { xp: true } })
    )!.xp;
    record(
      "no double XP after resubmit attempt",
      xpAfterResubmit === xpAfter,
      `xp=${xpAfterResubmit}`
    );

    const now = Date.now();
    for (let day = 0; day < 3; day++) {
      await prisma.xPHistory.create({
        data: {
          userId: user.id,
          amount: 1,
          source: "quiz",
          reason: `Smoke streak hari ke-${day + 1}`,
          createdAt: new Date(now - day * 24 * 60 * 60 * 1000),
        },
      });
    }
    const streak = await getStreak(user.id);
    record(
      "getStreak counts 3 consecutive days",
      streak >= 3,
      `streak=${streak}`
    );

    const unlocked = await evaluateAndUnlockBadges(user.id);
    const unlockedIds = new Set(unlocked.map((badge) => badge.id));
    record(
      "streak_3 badge unlocked after 3-day streak",
      unlockedIds.has("streak_3"),
      Array.from(unlockedIds).join(",") || "none"
    );

    const owned = new Set(
      (
        await prisma.userBadge.findMany({
          where: { userId: user.id },
          select: { badgeId: true },
        })
      ).map((row) => row.badgeId)
    );
    for (const badgeId of [
      "first_quiz",
      "perfect_score",
      "lesson_done",
      "streak_3",
      "xp_100",
    ]) {
      record(
        `${badgeId} badge owned by user`,
        owned.has(badgeId),
        `owned=${Array.from(owned).join(",")}`
      );
    }

    const secondRun = await evaluateAndUnlockBadges(user.id);
    record(
      "badge unlock is idempotent on second run",
      secondRun.length === 0,
      `secondRun unlocked ${secondRun.length}`
    );
  } finally {
    await prisma.quizAnswer.deleteMany({
      where: { attempt: { userId: user.id } },
    });
    await prisma.quizAttempt.deleteMany({ where: { userId: user.id } });
    await prisma.quiz.deleteMany({ where: { createdBy: user.id } });
    await prisma.materialProgress.deleteMany({ where: { userId: user.id } });
    await prisma.xPHistory.deleteMany({ where: { userId: user.id } });
    await prisma.userBadge.deleteMany({ where: { userId: user.id } });
    await prisma.curriculumMaterial.deleteMany({
      where: { topic: `smoke-temp-${timestamp}` },
    });
    await prisma.user.delete({ where: { id: user.id } });
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
