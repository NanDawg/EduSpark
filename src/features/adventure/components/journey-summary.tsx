import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { JourneySummary } from "@/features/adventure/service";

export function JourneySummary({ summary }: { summary: JourneySummary }) {
  const allDone =
    summary.totalNodes > 0 && summary.completedNodes === summary.totalNodes;

  return (
    <section
      aria-labelledby="journey-heading"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="journey-heading"
          className="font-heading text-xl font-semibold text-foreground"
        >
          Perjalanan Belajar
        </h2>
        <p className="text-sm text-muted-foreground">
          {summary.totalNodes === 0
            ? "Jalur belajarmu akan muncul di sini."
            : allDone
              ? "Semua misi selesai. Kerja bagus!"
              : "Selesaikan misi untuk membuka misi berikutnya."}
        </p>
      </div>

      <ProgressBar
        value={summary.percent}
        label="Progres kelasmu"
        valueText={`${summary.completedNodes} dari ${summary.totalNodes} misi · ${summary.percent}%`}
      />

      {summary.next ? (
        <div>
          <Button asChild>
            <Link href={`/adventure/${summary.next.nodeId}`}>
              Lanjutkan: {summary.next.title}
            </Link>
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            {summary.next.subjectName} · {summary.next.pathTitle}
          </p>
        </div>
      ) : (
        allDone && (
          <div>
            <Button asChild>
              <Link href="/learn">Belajar lagi: buat materi baru</Link>
            </Button>
          </div>
        )
      )}
    </section>
  );
}
