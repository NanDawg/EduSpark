import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Daftar | EduSpark",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Buat akun baru
        </h1>
        <p className="text-sm text-muted-foreground">
          Isi data di bawah untuk mulai belajar.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
