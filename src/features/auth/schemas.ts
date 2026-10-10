import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama tidak boleh kosong")
    .max(50, "Nama terlalu panjang"),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 huruf")
    .max(20, "Username maksimal 20 huruf")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh huruf, angka, dan garis bawah"
    ),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 huruf")
    .max(72, "Kata sandi terlalu panjang"),
  classLevel: z.coerce
    .number()
    .int()
    .min(1, "Pilih kelas 1 sampai 6")
    .max(6, "Pilih kelas 1 sampai 6"),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username tidak boleh kosong"),
  password: z.string().min(1, "Kata sandi tidak boleh kosong"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
