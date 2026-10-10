"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/features/auth/user";
import { getOrCreateMaterial } from "@/features/curriculum/service";

const generateSchema = z.object({
  subjectId: z.string().min(1, "Pilih mata pelajaran"),
  topic: z
    .string()
    .trim()
    .min(3, "Topik minimal 3 huruf")
    .max(120, "Topik terlalu panjang"),
  learningObjective: z
    .string()
    .trim()
    .max(300, "Tujuan pembelajaran terlalu panjang")
    .optional(),
});

export type GenerateMaterialState = {
  error?: string;
  pending?: boolean;
};

export async function generateMaterialAction(
  _prevState: GenerateMaterialState,
  formData: FormData
): Promise<GenerateMaterialState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  const objectiveRaw = formData.get("learningObjective");
  const parsed = generateSchema.safeParse({
    subjectId: formData.get("subjectId"),
    topic: formData.get("topic"),
    learningObjective:
      typeof objectiveRaw === "string" && objectiveRaw.trim().length > 0
        ? objectiveRaw
        : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await getOrCreateMaterial({
    userId: user.id,
    subjectId: parsed.data.subjectId,
    classLevel: user.classLevel,
    topic: parsed.data.topic,
    learningObjective: parsed.data.learningObjective,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  redirect(`/learn/${result.materialId}`);
}
