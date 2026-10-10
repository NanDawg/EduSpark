import type { Metadata } from "next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SubjectCard } from "@/features/dashboard/components/subject-card";
import { SparkCtaCard } from "@/features/dashboard/components/spark-cta-card";
import { getCurrentUser } from "@/features/auth/user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Beranda | EduSpark",
};

export const instant = false;

const subjectDescriptions: Record<string, string> = {
  "bahasa-indonesia": "Membaca, menulis, dan memahami cerita",
  matematika: "Berhitung, bilangan, dan pemecahan masalah",
  ipas: "Sains dan sosial di sekitar kita",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  const initial = user.name.trim().charAt(0).toUpperCase() || "S";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10">
      <section aria-labelledby="greeting-heading" className="flex flex-col gap-1">
        <h1
          id="greeting-heading"
          className="font-heading text-3xl font-semibold text-foreground"
        >
          Halo, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Siap belajar hari ini? Pilih pelajaran atau tanya Spark.
        </p>
      </section>

      <section
        aria-label="Profil dan progres"
        className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
      >
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <Avatar className="size-14 border-2 border-brand-soft">
            <AvatarFallback className="bg-brand-soft font-heading text-xl font-semibold text-brand-strong">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <p className="truncate font-heading text-lg font-semibold text-foreground">
              {user.name}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              @{user.username}
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-strong">
              Kelas {user.classLevel}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-semibold text-foreground">
                Level {user.level}
              </span>
              <span className="rounded-full bg-reward px-2.5 py-0.5 text-xs font-bold text-foreground">
                {user.xp} XP
              </span>
            </div>
          </div>
          <ProgressBar
            value={user.xp}
            max={100}
            label="Menuju level berikutnya"
            valueText={`${user.xp} / 100 XP`}
          />
          <p className="text-xs text-muted-foreground">
            Cara mengumpulkan XP akan hadir di pembaruan berikutnya.
          </p>
        </div>
      </section>

      <section aria-labelledby="subjects-heading" className="flex flex-col gap-4">
        <h2
          id="subjects-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Mau belajar apa?
        </h2>
        {subjects.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Mata pelajaran belum tersedia. Hubungi guru untuk mengisi daftar
            pelajaran.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                slug={subject.slug}
                name={subject.name}
                description={
                  subjectDescriptions[subject.slug] ?? "Materi pembelajaran"
                }
              />
            ))}
          </div>
        )}
      </section>

      <SparkCtaCard />
    </div>
  );
}
