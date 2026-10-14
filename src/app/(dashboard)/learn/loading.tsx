import { Skeleton } from "@/components/ui/skeleton";

export default function LearnLoading() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10">
      <section aria-busy="true" className="flex flex-col gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </section>

      <section
        aria-busy="true"
        className="rounded-xl border border-border bg-card p-5 sm:p-6"
      >
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-4 h-16 w-full" />
        <Skeleton className="h-11 w-36" />
      </section>

      <section aria-busy="true" className="flex flex-col gap-3">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </section>
    </div>
  );
}
