import "server-only";
import { prisma } from "@/lib/prisma";
import { getStreak } from "@/features/gamification/service";
import { STREAK_BADGE_DAYS, XP_BADGE_TARGET } from "@/features/gamification/config";
import { hasCompletedPath } from "@/features/adventure/service";

export type UnlockedBadge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

async function getEligibleBadgeIds(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true },
  });
  if (!user) {
    return [];
  }

  const [completedQuizzes, perfectQuizzes, completedMaterials, streak, pathDone] =
    await Promise.all([
      prisma.quizAttempt.count({
        where: { userId, status: "completed" },
      }),
      prisma.quizAttempt.count({
        where: { userId, status: "completed", score: 100 },
      }),
      prisma.materialProgress.count({ where: { userId } }),
      getStreak(userId),
      hasCompletedPath(userId),
    ]);

  const eligible: string[] = [];
  if (completedQuizzes >= 1) eligible.push("first_quiz");
  if (perfectQuizzes >= 1) eligible.push("perfect_score");
  if (streak >= STREAK_BADGE_DAYS) eligible.push("streak_3");
  if (completedMaterials >= 1) eligible.push("lesson_done");
  if (user.xp >= XP_BADGE_TARGET) eligible.push("xp_100");
  if (pathDone) eligible.push("path_complete");
  return eligible;
}

export async function evaluateAndUnlockBadges(
  userId: string
): Promise<UnlockedBadge[]> {
  const eligible = await getEligibleBadgeIds(userId);
  if (eligible.length === 0) {
    return [];
  }

  const existing = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  });
  const owned = new Set(existing.map((row) => row.badgeId));
  const missing = eligible.filter((id) => !owned.has(id));
  if (missing.length === 0) {
    return [];
  }

  const unlocked: UnlockedBadge[] = [];
  for (const badgeId of missing) {
    try {
      await prisma.userBadge.create({ data: { userId, badgeId } });
      const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
      if (badge) {
        unlocked.push({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
        });
      }
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "P2002") {
        console.error("Gagal membuka badge", badgeId, error);
      }
    }
  }
  return unlocked;
}

export type BadgeWithEarned = UnlockedBadge & { earnedAt: Date | null };

export async function listBadgesWithStatus(
  userId: string
): Promise<BadgeWithEarned[]> {
  const [definitions, earned] = await Promise.all([
    prisma.badge.findMany({ orderBy: { name: "asc" } }),
    prisma.userBadge.findMany({ where: { userId } }),
  ]);
  const earnedMap = new Map(earned.map((row) => [row.badgeId, row.earnedAt]));
  return definitions.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    earnedAt: earnedMap.get(badge.id) ?? null,
  }));
}
