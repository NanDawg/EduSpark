import Link from "next/link";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { JourneySummary } from "@/features/adventure/service";

export function JourneyCard({ summary }: { summary: JourneySummary }) {
  if (summary.totalNodes === 0) {
    return null;
  }

  const allDone = summary.completedNodes === summary.totalNodes;
  const next = summary.next;

  return (
    <section
      aria-labelledby="journey-card-heading"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand-strong"
        >
          <Map className="size-5" />
        </span>
        <div className="flex flex-col">
          <h2
            id="journey-card-heading"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Petualangan Belajar
          </h2>
          <span className="text-xs text-muted-foreground">
            {allDone
              ? "Semua misi selesai. Kerja bagus!"
              : next
                ? `Langkah berikutnya: ${next.title}`
                : "Lanjutkan perjalananmu."}
          </span>
        </div>
      </div>

      <ProgressBar
        value={summary.percent}
        label="Progres perjalanan"
        valueText={`${summary.completedNodes} dari ${summary.totalNodes} simpul · ${summary.percent}%`}
      />

      <div>
        <Button asChild>
          <Link href={next ? `/adventure/${next.nodeId}` : "/adventure"}>
            {next ? "Lanjutkan misi" : "Buka peta"}
          </Link>
        </Button>
      </div>
    </section>
  );
}
