"use server";

import { getCurrentUser } from "@/features/auth/user";
import { askSpark } from "@/features/spark/service";

export type SparkFormState = {
  reply?: string;
  error?: string;
  blocked?: boolean;
  echo?: string;
};

export async function sendSparkMessageAction(
  _prevState: SparkFormState,
  formData: FormData
): Promise<SparkFormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  const question = String(formData.get("question") ?? "").trim();
  if (!question) {
    return { error: "Tulis pertanyaanmu dulu ya." };
  }

  const result = await askSpark({ userId: user.id, question });

  if (!result.ok && result.blocked) {
    return { reply: result.reply, blocked: true, echo: question };
  }

  if (!result.ok) {
    return { error: result.reply, echo: question };
  }

  return { reply: result.reply, echo: question };
}
