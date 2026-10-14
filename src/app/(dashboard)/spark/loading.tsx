import { Skeleton } from "@/components/ui/skeleton";

export default function SparkLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6 md:py-10">
      <section aria-busy="true" className="flex flex-col gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </section>

      <section
        aria-busy="true"
        className="flex min-h-[28rem] flex-col gap-3 rounded-xl border border-border bg-card p-4"
      >
        <Skeleton className="h-20 w-2/3 self-start rounded-xl" />
        <Skeleton className="h-16 w-1/2 self-end rounded-xl" />
        <Skeleton className="h-20 w-3/5 self-start rounded-xl" />
      </section>

      <section aria-busy="true" className="flex flex-wrap gap-2">
        <Skeleton className="h-11 w-48 rounded-full" />
        <Skeleton className="h-11 w-52 rounded-full" />
      </section>

      <section
        aria-busy="true"
        className="flex items-center gap-2 rounded-xl border border-border bg-card p-3"
      >
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="size-11" />
      </section>
    </div>
  );
}
