import "server-only";
import OpenAI from "openai";

export const AI_MODEL = process.env.EDUSPARK_AI_MODEL || "deepseek-v4-1-flash";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY belum diatur di file .env");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://kenari.id/v1",
      timeout: 30_000,
      maxRetries: 2,
    });
  }

  return client;
}
