import { Skeleton } from "@/components/ui/skeleton";

export default function AdventureLoading() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10">
      <section aria-busy="true" className="flex flex-col gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </section>

      <section aria-busy="true" className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <Skeleton className="mb-2 h-2.5 w-full" />
        <Skeleton className="h-8 w-56" />
      </section>

      <section aria-busy="true" className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="size-14 rounded-full" />
        </div>
      </section>
    </div>
  );
}
