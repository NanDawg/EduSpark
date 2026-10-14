import { Skeleton } from "@/components/ui/skeleton";

export default function MaterialLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10">
      <section aria-busy="true" className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-12 w-full" />
      </section>

      <section aria-busy="true" className="flex flex-col gap-3">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </section>

      <section aria-busy="true" className="flex flex-col gap-3">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </section>

      <section aria-busy="true" className="flex flex-col gap-3">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </section>

      <section aria-busy="true" className="flex flex-wrap gap-3">
        <Skeleton className="h-11 w-44" />
        <Skeleton className="h-11 w-52" />
      </section>
    </div>
  );
}
