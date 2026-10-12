export const XP_REWARDS = {
  materialComplete: 10,
  quizComplete: 20,
  perCorrectAnswer: 2,
  maxCorrectAnswerBonus: 10,
} as const;

export const LEVEL_THRESHOLDS = [0, 100, 300, 600] as const;

export const STREAK_BADGE_DAYS = 3;
export const XP_BADGE_TARGET = 100;

export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
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

export function correctAnswerBonus(correctCount: number): number {
  return Math.min(
    correctCount * XP_REWARDS.perCorrectAnswer,
    XP_REWARDS.maxCorrectAnswerBonus
  );
}

export function levelForXp(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    }
  }
  return level;
}

export type LevelProgress = {
  level: number;
  xpIntoLevel: number;
  xpToNext: number;
  percent: number;
};

export function getLevelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const nextThreshold = LEVEL_THRESHOLDS[level];
  if (nextThreshold === undefined) {
    return { level, xpIntoLevel: 0, xpToNext: 0, percent: 100 };
  }
  const prevThreshold = LEVEL_THRESHOLDS[level - 1];
  const xpIntoLevel = xp - prevThreshold;
  const xpToNext = nextThreshold - prevThreshold;
  return {
    level,
    xpIntoLevel,
    xpToNext,
    percent: Math.min(100, Math.round((xpIntoLevel / xpToNext) * 100)),
  };
}
