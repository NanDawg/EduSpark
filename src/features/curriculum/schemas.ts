import { z } from "zod";

export const materialOutputSchema = z.object({
  title: z.string().min(1),
  learningObjective: z.string().min(1),
  explanation: z.string().min(1),
  example: z.string().min(1),
  summary: z.string().min(1),
});

export type MaterialOutput = z.infer<typeof materialOutputSchema>;
