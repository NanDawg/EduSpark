import { Skeleton } from "@/components/ui/skeleton";

export default function MissionLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
      <section aria-busy="true" className="flex flex-col gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-5 w-32" />
      </section>

      <section
        aria-busy="true"
        className="rounded-xl border border-border bg-card p-5"
      >
        <Skeleton className="mb-3 h-5 w-44" />
        <Skeleton className="h-4 w-full max-w-md" />
      </section>

      <section
        aria-busy="true"
        className="rounded-xl border border-border bg-card p-5"
      >
        <Skeleton className="mb-4 h-5 w-36" />
        <Skeleton className="mb-2 h-11 w-full" />
        <Skeleton className="mb-4 h-11 w-full" />
        <Skeleton className="h-2.5 w-full" />
      </section>

      <section
        aria-busy="true"
        className="rounded-xl border border-border bg-card p-5"
      >
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton className="h-11 w-full" />
      </section>
    </div>
  );
}
