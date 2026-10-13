import "server-only";
import { prisma } from "@/lib/prisma";
import { getLevelProgress, levelForXp, type LevelProgress } from "@/features/gamification/config";

export type AwardXpInput = {
  userId: string;
  amount: number;
  source: "material" | "quiz" | "quiz_bonus" | "adventure";
  reason: string;
  refId?: string;
};

export type AwardXpResult = {
  xp: number;
  level: number;
  leveledUp: boolean;
};

export async function awardXp(input: AwardXpInput): Promise<AwardXpResult> {
  if (input.amount <= 0) {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { xp: true, level: true },
    });
    if (!user) {
      throw new Error("Pengguna tidak ditemukan");
    }
    return { xp: user.xp, level: user.level, leveledUp: false };
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: input.userId },
      select: { xp: true, level: true },
    });
    if (!user) {
      throw new Error("Pengguna tidak ditemukan");
    }

    const nextXp = user.xp + input.amount;
    const nextLevel = levelForXp(nextXp);

    await tx.user.update({
      where: { id: input.userId },
      data: { xp: nextXp, level: nextLevel },
    });

    await tx.xPHistory.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        source: input.source,
        reason: input.reason,
        refId: input.refId ?? null,
      },
    });

    return {
      xp: nextXp,
      level: nextLevel,
      leveledUp: nextLevel > user.level,
    };
  });
}

export async function getLevelProgressForUser(
  userId: string
): Promise<LevelProgress | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true },
  });
  if (!user) {
    return null;
  }
  return getLevelProgress(user.xp);
}

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getStreak(userId: string): Promise<number> {
  const rows = await prisma.xPHistory.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const days = Array.from(new Set(rows.map((row) => utcDayKey(row.createdAt))));
  if (days.length === 0) {
    return 0;
  }

  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const latest = days[0];
  if (latest !== utcDayKey(today) && latest !== utcDayKey(yesterday)) {
    return 0;
  }

  let streak = 1;
  let cursor = Date.parse(latest);
  for (let i = 1; i < days.length; i++) {
    const next = Date.parse(days[i]);
    if (cursor - next === 24 * 60 * 60 * 1000) {
      streak += 1;
      cursor = next;
    } else {
      break;
    }
  }
  return streak;
}

export type XpHistoryEntry = {
  id: string;
  amount: number;
  source: string;
  reason: string;
  createdAt: Date;
};

export async function listXpHistory(
  userId: string,
  limit = 8
): Promise<XpHistoryEntry[]> {
  return prisma.xPHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, amount: true, source: true, reason: true, createdAt: true },
  });
}
