import "dotenv/config";
import "server-only";
import { PrismaClient } from "@prisma/client";
import {
  ADVENTURE_CONFIG,
} from "../src/features/gamification/config";
import {
  awardPathCompletionBonuses,
  getAdventureNode,
  getAdventureOverview,
  hasCompletedPath,
} from "../src/features/adventure/service";
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

async function completeNode(
  userId: string,
  subjectId: string,
  classLevel: number,
  topic: string,
  scorePercent: number
) {
  const existingMaterial = await prisma.curriculumMaterial.findUnique({
    where: { subjectId_classLevel_topic: { subjectId, classLevel, topic } },
  });
  const material =
    existingMaterial ??
    (await prisma.curriculumMaterial.create({
      data: {
        subjectId,
        classLevel,
        topic,
        title: `Smoke materi: ${topic}`,
        content: "Isi materi.",
        example: "Contoh.",
        summary: "Ringkasan.",
      },
    }));

  const marked = await markMaterialComplete(userId, material.id);
  if (!marked.ok) {
    throw new Error(`markMaterialComplete gagal: ${marked.error}`);
  }

  const questionCount = 4;
  const correctCount = Math.round((questionCount * scorePercent) / 100);
  const quiz = await prisma.quiz.create({
    data: {
      subjectId,
      classLevel,
      topic,
      difficulty: "sedang",
      createdBy: userId,
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
          correctIndex: 0,
          explanation: "Karena A.",
        },
      })
    );
  }
  const attempt = await prisma.quizAttempt.create({
    data: { quizId: quiz.id, userId, totalQuestions: questionCount },
  });
  const selections: Record<string, number> = {};
  questions.forEach((question, index) => {
    selections[question.id] = index < correctCount ? 0 : 1;
  });
  const submitted = await submitAttempt(userId, attempt.id, selections);
  if (!submitted.ok) {
    throw new Error(`submitAttempt gagal: ${submitted.error}`);
  }
  return quiz.id;
}

async function main() {
  const seededPaths = await prisma.learningPath.count();
  const seededNodes = await prisma.lessonNode.count();
  const pathBadge = await prisma.badge.findUnique({
    where: { id: "path_complete" },
  });
  record("seed: 3 learning paths exist", seededPaths >= 3, `count=${seededPaths}`);
  record("seed: 21 lesson nodes exist", seededNodes >= 21, `count=${seededNodes}`);
  record("seed: path_complete badge exists", pathBadge !== null, pathBadge?.name ?? "missing");

  const subject = await prisma.subject.findUnique({
    where: { slug: "matematika" },
  });
  if (!subject) {
    record("setup: subject matematika exists", false, "run db:seed first");
    return;
  }

  const timestamp = Date.now();
  const user = await prisma.user.create({
    data: {
      username: `smoke_adv_${timestamp}`,
      passwordHash: "not-used",
      name: "Smoke Adv",
      classLevel: 3,
    },
  });
  const materialIdsCreated: string[] = [];

  try {
    const path = await prisma.learningPath.create({
      data: {
        subjectId: subject.id,
        classLevel: 3,
        title: "Jalur Smoke",
        description: "Jalur sementara untuk smoke test.",
        order: 1,
        nodes: {
          create: [
            {
              order: 0,
              chapter: 1,
              title: "Simpul Pertama",
              objective: "Tujuan satu.",
              topic: `smoke-adv-a-${timestamp}`,
            },
            {
              order: 1,
              chapter: 2,
              title: "Simpul Kedua",
              objective: "Tujuan dua.",
              topic: `smoke-adv-b-${timestamp}`,
            },
            {
              order: 2,
              chapter: 2,
              title: "Simpul Ketiga",
              objective: "Tujuan tiga.",
              topic: `smoke-adv-c-${timestamp}`,
            },
          ],
        },
      },
      include: { nodes: { orderBy: { order: "asc" } } },
    });
    const [node0, node1, node2] = path.nodes;

    const initial = await getAdventureOverview(user.id);
    const initialPath = initial.paths.find((p) => p.id === path.id);
    record(
      "fresh user: node 0 is current, nodes 1-2 locked",
      initialPath?.nodes[0]?.status === "current" &&
        initialPath?.nodes[1]?.status === "locked" &&
        initialPath?.nodes[2]?.status === "locked",
      initialPath ? initialPath.nodes.map((n) => n.status).join(",") : "path missing"
    );
    record(
      "fresh user: journey percent is 0",
      initial.summary.percent === 0 && initial.summary.next !== null,
      `percent=${initial.summary.percent} next=${initial.summary.next?.nodeId ?? "null"}`
    );

    const detail0 = await getAdventureNode(user.id, node0.id);
    const detail1 = await getAdventureNode(user.id, node1.id);
    record(
      "node detail: node 0 isFirstNode with no previous",
      detail0 !== null && detail0.isFirstNode && detail0.previousNode === null,
      `isFirst=${detail0?.isFirstNode} prev=${detail0?.previousNode?.title ?? "null"}`
    );
    record(
      "node detail: node 1 locked with node 0 as previous",
      detail1 !== null &&
        detail1.status === "locked" &&
        detail1.previousNode?.id === node0.id,
      `status=${detail1?.status} prev=${detail1?.previousNode?.title ?? "null"}`
    );

    const otherClassUser = await prisma.user.create({
      data: {
        username: `smoke_adv_lvl_${timestamp}`,
        passwordHash: "not-used",
        name: "Smoke Adv Lvl 5",
        classLevel: 5,
      },
    });
    const crossLevel = await getAdventureNode(otherClassUser.id, node0.id);
    record(
      "node detail: inaccessible from another class level",
      crossLevel === null,
      crossLevel ? "returned detail (bad)" : "null"
    );
    await prisma.user.delete({ where: { id: otherClassUser.id } });

    const material0 = await prisma.curriculumMaterial.findUnique({
      where: {
        subjectId_classLevel_topic: {
          subjectId: subject.id,
          classLevel: 3,
          topic: node0.topic,
        },
      },
    });
    const created0 = await prisma.curriculumMaterial.upsert({
      where: {
        subjectId_classLevel_topic: {
          subjectId: subject.id,
          classLevel: 3,
          topic: node0.topic,
        },
      },
      update: {},
      create: {
        subjectId: subject.id,
        classLevel: 3,
        topic: node0.topic,
        title: `Smoke materi: ${node0.topic}`,
        content: "Isi.",
        example: "Contoh.",
        summary: "Ringkasan.",
      },
    });
    if (!material0) materialIdsCreated.push(created0.id);
    await markMaterialComplete(user.id, created0.id);

    const afterLesson = await getAdventureOverview(user.id);
    const pathAfterLesson = afterLesson.paths.find((p) => p.id === path.id);
    record(
      "material alone: node 0 still current (quiz missing), node 1 locked",
      pathAfterLesson?.nodes[0]?.status === "current" &&
        pathAfterLesson?.nodes[0]?.lessonDone === true &&
        pathAfterLesson?.nodes[1]?.status === "locked",
      pathAfterLesson ? pathAfterLesson.nodes.map((n) => n.status).join(",") : "path missing"
    );

    await completeNode(user.id, subject.id, 3, node0.topic, 100);

    const afterQuiz0 = await getAdventureOverview(user.id);
    const pathAfterQuiz0 = afterQuiz0.paths.find((p) => p.id === path.id);
    record(
      "quiz on node 0 with score 100: node 0 mastered, node 1 unlocked as current",
      pathAfterQuiz0?.nodes[0]?.status === "mastered" &&
        pathAfterQuiz0?.nodes[1]?.status === "current",
      pathAfterQuiz0 ? pathAfterQuiz0.nodes.map((n) => n.status).join(",") : "path missing"
    );
    record(
      "journey percent after 1 of 3 nodes = 33",
      pathAfterQuiz0?.percent === 33,
      `percent=${pathAfterQuiz0?.percent}`
    );
    record(
      "next recommended lesson points at node 1",
      afterQuiz0.summary.next?.nodeId === node1.id,
      `next=${afterQuiz0.summary.next?.nodeId ?? "null"}`
    );

    await completeNode(user.id, subject.id, 3, node1.topic, 50);
    const afterNode1 = await getAdventureOverview(user.id);
    const pathAfterNode1 = afterNode1.paths.find((p) => p.id === path.id);
    record(
      "quiz on node 1 with score 50: completed but not mastered",
      pathAfterNode1?.nodes[1]?.status === "completed" &&
        pathAfterNode1?.nodes[1]?.bestScore === 50,
      `status=${pathAfterNode1?.nodes[1]?.status} score=${pathAfterNode1?.nodes[1]?.bestScore}`
    );

    record(
      "path not yet complete: no adventure XP, badge not eligible",
      (await hasCompletedPath(user.id)) === false,
      "hasCompletedPath=false"
    );

    const xpBeforeFinal = await prisma.user.findUnique({
      where: { id: user.id },
      select: { xp: true },
    });
    await completeNode(user.id, subject.id, 3, node2.topic, 100);

    const finalOverview = await getAdventureOverview(user.id);
    const finalPath = finalOverview.paths.find((p) => p.id === path.id);
    record(
      "all nodes done: every node completed/mastered, path percent 100",
      finalPath?.percent === 100 &&
        finalPath.nodes.every(
          (n) => n.status === "completed" || n.status === "mastered"
        ),
      `percent=${finalPath?.percent} statuses=${finalPath?.nodes.map((n) => n.status).join(",")}`
    );
    record(
      "path complete: hasCompletedPath true",
      (await hasCompletedPath(user.id)) === true,
      "hasCompletedPath=true"
    );

    const adventureXp = await prisma.xPHistory.findMany({
      where: { userId: user.id, source: "adventure" },
    });
    record(
      "path-completion bonus awarded exactly once (30 XP, refId=path)",
      adventureXp.length === 1 &&
        adventureXp[0].amount === ADVENTURE_CONFIG.pathCompleteXp &&
        adventureXp[0].refId === path.id,
      adventureXp
        .map((row) => `${row.amount}xp ref=${row.refId}`)
        .join(",") || "none"
    );

    const bonusSecondRun = await awardPathCompletionBonuses(user.id);
    record(
      "second bonus run is a no-op",
      bonusSecondRun === 0,
      `awarded=${bonusSecondRun}`
    );

    const ownedBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: { userId: user.id, badgeId: "path_complete" },
      },
    });
    record(
      "path_complete badge unlocked after full path",
      ownedBadge !== null,
      ownedBadge ? "owned" : "not owned"
    );
    const secondBadgeRun = await evaluateAndUnlockBadges(user.id);
    record(
      "badge unlock remains idempotent",
      secondBadgeRun.length === 0,
      `secondRun unlocked ${secondBadgeRun.length}`
    );

    const xpAfterFinal = await prisma.user.findUnique({
      where: { id: user.id },
      select: { xp: true },
    });
    record(
      "user XP increased (materials + quizzes + path bonus)",
      (xpAfterFinal?.xp ?? 0) > (xpBeforeFinal?.xp ?? 0),
      `before=${xpBeforeFinal?.xp} after=${xpAfterFinal?.xp}`
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
    if (materialIdsCreated.length > 0) {
      await prisma.curriculumMaterial.deleteMany({
        where: { id: { in: materialIdsCreated } },
      });
    }
    await prisma.learningPath.deleteMany({
      where: { title: "Jalur Smoke", classLevel: 3 },
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
