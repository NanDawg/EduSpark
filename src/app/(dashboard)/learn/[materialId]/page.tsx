import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/user";
import { getMaterialById } from "@/features/curriculum/service";
import { isMaterialCompleted } from "@/features/progress/service";
import { CompleteMaterialButton } from "@/features/progress/components/complete-button";
import { Button } from "@/components/ui/button";

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

  const completed = await isMaterialCompleted(user.id, material.id);

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-brand-strong">
          {material.subject.name} · Kelas {material.classLevel}
        </p>
        <h1 className="font-heading text-3xl font-semibold break-words text-foreground">
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
          <p className="leading-relaxed whitespace-pre-wrap break-words text-foreground">
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
          <p className="leading-relaxed whitespace-pre-wrap break-words text-foreground">
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
          <p className="leading-relaxed whitespace-pre-wrap break-words text-foreground">
            {material.summary}
          </p>
        </div>
      </section>

      <footer className="flex flex-col gap-4">
        <CompleteMaterialButton
          materialId={material.id}
          initiallyCompleted={completed}
        />
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/learn">Buat materi lain</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link
              href={`/spark?q=${encodeURIComponent(
                `Tolong jelaskan lagi materi ${material.title}`
              )}`}
            >
              Tanya Spark tentang ini
            </Link>
          </Button>
        </div>
      </footer>
    </article>
  );
}
