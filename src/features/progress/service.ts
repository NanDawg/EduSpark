import "server-only";
import { prisma } from "@/lib/prisma";
import { awardXp, getStreak } from "@/features/gamification/service";
import {
  evaluateAndUnlockBadges,
  type UnlockedBadge,
} from "@/features/gamification/badges";
import { XP_REWARDS } from "@/features/gamification/config";

export type MarkCompleteResult =
  | {
      ok: true;
      alreadyCompleted: boolean;
      xpAwarded: number;
      unlockedBadges: UnlockedBadge[];
    }
  | { ok: false; error: string };

export async function markMaterialComplete(
  userId: string,
  materialId: string
): Promise<MarkCompleteResult> {
  const material = await prisma.curriculumMaterial.findUnique({
    where: { id: materialId },
    select: { id: true, title: true },
  });
  if (!material) {
    return { ok: false, error: "Materi tidak ditemukan." };
  }

  const existing = await prisma.materialProgress.findUnique({
    where: { userId_materialId: { userId, materialId } },
  });
  if (existing) {
    return { ok: true, alreadyCompleted: true, xpAwarded: 0, unlockedBadges: [] };
  }

  try {
    await prisma.materialProgress.create({ data: { userId, materialId } });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") {
      return {
        ok: true,
        alreadyCompleted: true,
        xpAwarded: 0,
        unlockedBadges: [],
      };
    }
    throw error;
  }

  await awardXp({
    userId,
    amount: XP_REWARDS.materialComplete,
    source: "material",
    reason: `Materi selesai: ${material.title}`,
    refId: materialId,
  });

  const unlockedBadges = await evaluateAndUnlockBadges(userId);
  return {
    ok: true,
    alreadyCompleted: false,
    xpAwarded: XP_REWARDS.materialComplete,
    unlockedBadges,
  };
}

export async function isMaterialCompleted(
  userId: string,
  materialId: string
): Promise<boolean> {
  const row = await prisma.materialProgress.findUnique({
    where: { userId_materialId: { userId, materialId } },
    select: { id: true },
  });
  return row !== null;
}

export type LearningProgress = {
  completedMaterials: number;
  quizzesTaken: number;
  averageScore: number | null;
  totalXp: number;
  badgesEarned: number;
  streak: number;
};

export async function getLearningProgress(
  userId: string
): Promise<LearningProgress> {
  const [user, completedMaterials, completedAttempts, badgesEarned, streak] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true },
      }),
      prisma.materialProgress.count({ where: { userId } }),
      prisma.quizAttempt.aggregate({
        where: { userId, status: "completed" },
        _avg: { score: true },
        _count: { id: true },
      }),
      prisma.userBadge.count({ where: { userId } }),
      getStreak(userId),
    ]);

  const average = completedAttempts._avg.score;
  return {
    completedMaterials,
    quizzesTaken: completedAttempts._count.id,
    averageScore: average === null ? null : Math.round(average),
    totalXp: user?.xp ?? 0,
    badgesEarned,
    streak,
  };
}
