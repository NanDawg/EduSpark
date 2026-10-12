"use server";

import { z } from "zod";
import { getCurrentUser } from "@/features/auth/user";
import { markMaterialComplete } from "@/features/progress/service";

const completeSchema = z.object({
  materialId: z.string().min(1, "Materi tidak ditemukan"),
});

export type MarkCompleteState = {
  error?: string;
  completed?: boolean;
  alreadyCompleted?: boolean;
  xpAwarded?: number;
  unlockedBadges?: string[];
};

export async function markMaterialCompleteAction(
  _prevState: MarkCompleteState,
  formData: FormData
): Promise<MarkCompleteState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  const parsed = completeSchema.safeParse({
    materialId: formData.get("materialId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await markMaterialComplete(user.id, parsed.data.materialId);
  if (!result.ok) {
    return { error: result.error };
  }

  return {
    completed: true,
    alreadyCompleted: result.alreadyCompleted,
    xpAwarded: result.xpAwarded,
    unlockedBadges: result.unlockedBadges.map((badge) => badge.name),
  };
}
