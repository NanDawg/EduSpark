import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function SparkCtaCard() {
  return (
    <section
      aria-labelledby="spark-cta-heading"
      className="flex flex-col gap-3 rounded-xl border border-border bg-ai-soft p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ai font-heading text-lg font-semibold text-brand-ink"
        >
          S
        </span>
        <div className="flex flex-col gap-1">
          <h2
            id="spark-cta-heading"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Belajar bareng Spark
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Spark siap menjawab pertanyaanmu kapan saja, dari pelajaran apa
            pun di kelas kamu.
          </p>
        </div>
      </div>
      <Link
        href="/spark"
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-ai px-4 text-sm font-semibold text-brand-ink transition-colors hover:bg-ai/80"
      >
        <MessageCircle className="size-4" aria-hidden />
        Tanya Spark
      </Link>
    </section>
  );
}
