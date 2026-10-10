import Link from "next/link";
import { BookOpen } from "lucide-react";

type SubjectCardProps = {
  slug: string;
  name: string;
  description: string;
};

export function SubjectCard({ slug, name, description }: SubjectCardProps) {
  return (
    <Link
      href={`/learn?subject=${slug}`}
      className="group flex min-h-28 flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand hover:bg-brand-soft/50"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
          <BookOpen className="size-4" aria-hidden />
        </span>
        <h3 className="font-heading text-base font-semibold text-foreground">
          {name}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <span className="mt-auto text-sm font-semibold text-brand-strong">
        Belajar sekarang
      </span>
    </Link>
  );
}
