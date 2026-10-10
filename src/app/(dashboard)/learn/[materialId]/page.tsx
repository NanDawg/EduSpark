import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/user";
import { getMaterialById } from "@/features/curriculum/service";

export const metadata: Metadata = {
  title: "Materi | EduSpark",
};

export const instant = false;

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { materialId } = await params;
  const material = await getMaterialById(materialId);
  if (!material) {
    notFound();
  }

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-brand-strong">
          {material.subject.name} · Kelas {material.classLevel}
        </p>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {material.title}
        </h1>
        {material.learningObjective && (
          <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm leading-relaxed text-foreground">
            <span className="font-semibold">Tujuan belajar: </span>
            {material.learningObjective}
          </p>
        )}
      </header>

      <section aria-labelledby="explanation-heading" className="flex flex-col gap-3">
        <h2
          id="explanation-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Penjelasan
        </h2>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="leading-relaxed whitespace-pre-wrap text-foreground">
            {material.content}
          </p>
        </div>
      </section>

      <section aria-labelledby="example-heading" className="flex flex-col gap-3">
        <h2
          id="example-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Contoh
        </h2>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="leading-relaxed whitespace-pre-wrap text-foreground">
            {material.example}
          </p>
        </div>
      </section>

      <section aria-labelledby="summary-heading" className="flex flex-col gap-3">
        <h2
          id="summary-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Ringkasan
        </h2>
        <div className="rounded-xl border border-border bg-ai-soft p-5">
          <p className="leading-relaxed whitespace-pre-wrap text-foreground">
            {material.summary}
          </p>
        </div>
      </section>

      <footer className="flex flex-wrap gap-3">
        <Link
          href="/learn"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Buat materi lain
        </Link>
        <Link
          href="/spark"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Tanya Spark tentang ini
        </Link>
      </footer>
    </article>
  );
}
