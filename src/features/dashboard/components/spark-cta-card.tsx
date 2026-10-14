import Link from "next/link";
import { SparkAvatar } from "@/components/brand/spark-avatar";
import { Button } from "@/components/ui/button";

const quickQuestions = [
  "Ajarkan aku pecahan",
  "Bantu aku memahami IPA",
];

export function SparkCtaCard() {
  return (
    <section
      aria-labelledby="spark-cta-heading"
      className="flex flex-col gap-4 rounded-xl border border-border bg-ai-soft p-5 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <SparkAvatar size="lg" className="mt-0.5" />
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
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <Button asChild className="bg-ai text-brand-ink hover:bg-ai/80">
          <Link href="/spark">Tanya Spark</Link>
        </Button>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {quickQuestions.map((question) => (
            <Link
              key={question}
              href={`/spark?q=${encodeURIComponent(question)}`}
              className="inline-flex min-h-11 items-center rounded-full border border-ai/50 bg-card px-3 text-xs font-semibold text-ai-strong transition-colors hover:bg-card/70 md:min-h-9"
            >
              {question}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
