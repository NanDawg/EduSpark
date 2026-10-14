import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { SparkAvatar } from "@/components/brand/spark-avatar";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-4 text-center">
      <LogoMark aria-hidden className="size-12" />
      <SparkAvatar size="lg" />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Halaman tidak ditemukan
        </h1>
        <p className="text-sm text-muted-foreground">
          Halaman yang kamu cari tidak ada atau sudah dipindah.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" asChild>
          <Link href="/">Ke beranda</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/login">Masuk</Link>
        </Button>
      </div>
    </div>
  );
}
