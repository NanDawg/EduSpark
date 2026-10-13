import "server-only";
import { prisma } from "@/lib/prisma";
import { ADVENTURE_CONFIG } from "@/features/gamification/config";
import { awardXp } from "@/features/gamification/service";

export type NodeStatus = "locked" | "current" | "completed" | "mastered";

export type AdventureNode = {
  id: string;
  order: number;
  chapter: number;
  title: string;
  objective: string | null;
  topic: string;
  status: NodeStatus;
  lessonDone: boolean;
  bestScore: number | null;
};

export type AdventurePath = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  nodes: AdventureNode[];
  completedCount: number;
  totalNodes: number;
  percent: number;
};

export type NextLesson = {
  nodeId: string;
  title: string;
  pathId: string;
  pathTitle: string;
  subjectName: string;
};

export type JourneySummary = {
  completedNodes: number;
  totalNodes: number;
  percent: number;
  next: NextLesson | null;
};

export type AdventureOverview = {
  paths: AdventurePath[];
  summary: JourneySummary;
};

export type NodeDetail = AdventureNode & {
  pathId: string;
  pathTitle: string;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  classLevel: number;
  isFirstNode: boolean;
  previousNode: { id: string; title: string; status: NodeStatus } | null;
  nextNode: { id: string; title: string } | null;
  pathCompletedCount: number;
  pathTotalNodes: number;
  pathPercent: number;
};

type ProgressSets = {
  lessonKeys: Set<string>;
  scores: Map<string, number>;
};

function progressKey(subjectId: string, topic: string): string {
  return `${subjectId}|${topic}`;
}

async function loadProgressSets(
  userId: string,
  classLevel: number,
  subjectIds: string[]
): Promise<ProgressSets> {
  const [materials, attempts] = await Promise.all([
    prisma.materialProgress.findMany({
      where: {
        userId,
        material: { classLevel, subjectId: { in: subjectIds } },
      },
      select: { material: { select: { subjectId: true, topic: true } } },
    }),
    prisma.quizAttempt.findMany({
      where: {
        userId,
        status: "completed",
        quiz: { classLevel, subjectId: { in: subjectIds } },
      },
      select: {
        score: true,
        quiz: { select: { subjectId: true, topic: true } },
      },
    }),
  ]);

  const lessonKeys = new Set(
    materials.map((row) => progressKey(row.material.subjectId, row.material.topic))
  );
  const scores = new Map<string, number>();
  for (const attempt of attempts) {
    const key = progressKey(attempt.quiz.subjectId, attempt.quiz.topic);
    const score = attempt.score ?? 0;
    const current = scores.get(key) ?? 0;
    if (score > current) {
      scores.set(key, score);
    }
  }
  return { lessonKeys, scores };
}

function deriveNodes(
  subjectId: string,
  nodes: { id: string; order: number; chapter: number; title: string; objective: string | null; topic: string }[],
  sets: ProgressSets
): AdventureNode[] {
  let currentOpen = true;
  return nodes.map((node) => {
    const key = progressKey(subjectId, node.topic);
    const lessonDone = sets.lessonKeys.has(key);
    const bestScore = sets.scores.get(key) ?? null;
    const completed = lessonDone && bestScore !== null;

    let status: NodeStatus;
    if (completed) {
      status =
        bestScore !== null && bestScore >= ADVENTURE_CONFIG.masterScore
          ? "mastered"
          : "completed";
    } else if (currentOpen) {
      status = "current";
      currentOpen = false;
    } else {
      status = "locked";
    }

    return {
      id: node.id,
      order: node.order,
      chapter: node.chapter,
      title: node.title,
      objective: node.objective,
      topic: node.topic,
      status,
      lessonDone,
      bestScore,
    };
  });
}

function summarizePath(
  path: {
    id: string;
    title: string;
    description: string | null;
    order: number;
    subject: { id: string; name: string; slug: string };
  },
  nodes: AdventureNode[]
): AdventurePath {
  const completedCount = nodes.filter(
    (node) => node.status === "completed" || node.status === "mastered"
  ).length;
  return {
    id: path.id,
    title: path.title,
    description: path.description,
    order: path.order,
    subjectId: path.subject.id,
    subjectName: path.subject.name,
    subjectSlug: path.subject.slug,
    nodes,
    completedCount,
    totalNodes: nodes.length,
    percent:
      nodes.length === 0 ? 0 : Math.round((completedCount / nodes.length) * 100),
  };
}

export async function getAdventureOverview(
  userId: string
): Promise<AdventureOverview> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { classLevel: true },
  });
  if (!user) {
    return {
      paths: [],
      summary: { completedNodes: 0, totalNodes: 0, percent: 0, next: null },
    };
  }

  const paths = await prisma.learningPath.findMany({
    where: { classLevel: user.classLevel },
    include: {
      subject: { select: { id: true, name: true, slug: true } },
      nodes: { orderBy: { order: "asc" } },
    },
    orderBy: { order: "asc" },
  });

  const sets = await loadProgressSets(
    userId,
    user.classLevel,
    paths.map((path) => path.subject.id)
  );

  const pathViews = paths.map((path) =>
    summarizePath(
      path,
      deriveNodes(
        path.subject.id,
        path.nodes.map((node) => ({
          id: node.id,
          order: node.order,
          chapter: node.chapter,
          title: node.title,
          objective: node.objective,
          topic: node.topic,
        })),
        sets
      )
    )
  );

  const completedNodes = pathViews.reduce((sum, path) => sum + path.completedCount, 0);
  const totalNodes = pathViews.reduce((sum, path) => sum + path.totalNodes, 0);

  const ranked = [...pathViews].sort(
    (a, b) => b.percent - a.percent || a.order - b.order
  );
  let next: NextLesson | null = null;
  for (const path of ranked) {
    const node = path.nodes.find((candidate) => candidate.status === "current");
    if (node) {
      next = {
        nodeId: node.id,
        title: node.title,
        pathId: path.id,
        pathTitle: path.title,
        subjectName: path.subjectName,
      };
      break;
    }
  }

  return {
    paths: pathViews,
    summary: {
      completedNodes,
      totalNodes,
      percent: totalNodes === 0 ? 0 : Math.round((completedNodes / totalNodes) * 100),
      next,
    },
  };
}

export async function getAdventureNode(
  userId: string,
  nodeId: string
): Promise<NodeDetail | null> {
  const [user, node] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { classLevel: true },
    }),
    prisma.lessonNode.findUnique({
      where: { id: nodeId },
      include: {
        path: {
          include: { subject: { select: { id: true, name: true, slug: true } } },
        },
      },
    }),
  ]);
  if (!user || !node || node.path.classLevel !== user.classLevel) {
    return null;
  }

  const [siblingNodes, sets] = await Promise.all([
    prisma.lessonNode.findMany({
      where: { pathId: node.pathId },
      orderBy: { order: "asc" },
    }),
    loadProgressSets(userId, node.path.classLevel, [node.path.subject.id]),
  ]);

  const derived = deriveNodes(
    node.path.subject.id,
    siblingNodes.map((sibling) => ({
      id: sibling.id,
      order: sibling.order,
      chapter: sibling.chapter,
      title: sibling.title,
      objective: sibling.objective,
      topic: sibling.topic,
    })),
    sets
  );
  const view = derived.find((candidate) => candidate.id === node.id);
  if (!view) {
    return null;
  }

  const completedCount = derived.filter(
    (candidate) => candidate.status === "completed" || candidate.status === "mastered"
  ).length;
  const index = derived.findIndex((candidate) => candidate.id === node.id);
  const previous = index > 0 ? derived[index - 1] : null;
  const next = index >= 0 && index < derived.length - 1 ? derived[index + 1] : null;

  return {
    ...view,
    pathId: node.pathId,
    pathTitle: node.path.title,
    subjectId: node.path.subject.id,
    subjectName: node.path.subject.name,
    subjectSlug: node.path.subject.slug,
    classLevel: node.path.classLevel,
    isFirstNode: index === 0,
    previousNode: previous
      ? { id: previous.id, title: previous.title, status: previous.status }
      : null,
    nextNode: next ? { id: next.id, title: next.title } : null,
    pathCompletedCount: completedCount,
    pathTotalNodes: derived.length,
    pathPercent:
      derived.length === 0
        ? 0
        : Math.round((completedCount / derived.length) * 100),
  };
}

async function getCompletedPathIds(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { classLevel: true },
  });
  if (!user) {
    return [];
  }

  const paths = await prisma.learningPath.findMany({
    where: { classLevel: user.classLevel },
    include: {
      subject: { select: { id: true } },
      nodes: { orderBy: { order: "asc" }, select: { topic: true } },
    },
    orderBy: { order: "asc" },
  });
  if (paths.length === 0) {
    return [];
  }

  const sets = await loadProgressSets(
    userId,
    user.classLevel,
    paths.map((path) => path.subject.id)
  );

  return paths
    .filter(
      (path) =>
        path.nodes.length > 0 &&
        path.nodes.every((node) => {
          const key = progressKey(path.subject.id, node.topic);
          return sets.lessonKeys.has(key) && sets.scores.has(key);
        })
    )
    .map((path) => path.id);
}

export async function hasCompletedPath(userId: string): Promise<boolean> {
  const completed = await getCompletedPathIds(userId);
  return completed.length > 0;
}

export async function awardPathCompletionBonuses(userId: string): Promise<number> {
  const completedPathIds = await getCompletedPathIds(userId);
  if (completedPathIds.length === 0) {
    return 0;
  }

  const history = await prisma.xPHistory.findMany({
    where: { userId, source: "adventure" },
    select: { refId: true },
  });
  const alreadyAwarded = new Set(history.map((row) => row.refId));

  let total = 0;
  for (const pathId of completedPathIds) {
    if (alreadyAwarded.has(pathId)) {
      continue;
    }
    const path = await prisma.learningPath.findUnique({
      where: { id: pathId },
      select: { title: true },
    });
    await awardXp({
      userId,
      amount: ADVENTURE_CONFIG.pathCompleteXp,
      source: "adventure",
      reason: `Jalur selesai: ${path?.title ?? pathId}`,
      refId: pathId,
    });
    total += ADVENTURE_CONFIG.pathCompleteXp;
  }
  return total;
}
