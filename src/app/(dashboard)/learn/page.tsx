import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/features/auth/user";
import { prisma } from "@/lib/prisma";
import { listRecentMaterials } from "@/features/curriculum/service";
import { MaterialForm } from "@/features/curriculum/components/material-form";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Belajar | EduSpark",
};

export const instant = false;

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { subject } = await searchParams;
  const [subjects, recent] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    listRecentMaterials(6),
  ]);

  const defaultSubjectId = subjects.find((s) => s.slug === subject)?.id;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10">
      <section aria-labelledby="learn-heading" className="flex flex-col gap-1">
        <h1
          id="learn-heading"
          className="font-heading text-3xl font-semibold text-foreground"
        >
          Buat materi belajar
        </h1>
        <p className="text-muted-foreground">
          Pilih pelajaran dan topik. Spark akan menyiapkan materi sesuai
          kelasmu (Kelas {user.classLevel}).
        </p>
      </section>

      <section
        aria-label="Formulir materi"
        className="rounded-xl border border-border bg-card p-5 sm:p-6"
      >
        <MaterialForm
          subjects={subjects}
          defaultSubjectId={defaultSubjectId}
        />
      </section>

      <section
        aria-labelledby="recent-heading"
        className="flex flex-col gap-4"
      >
        <h2
          id="recent-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Materi terbaru
        </h2>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Belum ada materi. Materi pertamamu akan muncul di sini setelah
            dibuat.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((material) => (
              <li key={material.id}>
                <Link
                  href={`/learn/${material.id}`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-brand hover:bg-brand-soft/50"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {material.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {material.subject.name} · Kelas {material.classLevel}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-brand-strong">
                    Baca
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
