"use client";

import Link from "next/link";
import { SparkAvatar } from "@/components/brand/spark-avatar";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <SparkAvatar size="lg" />
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Ada yang tidak beres
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Halaman ini gagal dimuat. Coba muat ulang, atau kembali ke beranda.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={reset}>
          Coba lagi
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/dashboard">Ke beranda</Link>
        </Button>
      </div>
    </div>
  );
}
