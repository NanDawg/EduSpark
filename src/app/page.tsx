import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { SparkAvatar } from "@/components/brand/spark-avatar";
import { Button } from "@/components/ui/button";
import { Check, Lock, Play, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "EduSpark | Belajar jadi petualangan untuk siswa SD",
  description:
    "EduSpark mengubah materi dan kuis menjadi petualangan belajar berbasis XP, badge, dan level, ditemani asisten Spark.",
};

export const instant = false;

const heroNodes = [
  { label: "Selesai", icon: Check, state: "bg-growth text-brand-ink" },
  { label: "Selesai", icon: Check, state: "bg-growth text-brand-ink" },
  { label: "Sekarang", icon: Play, state: "bg-brand text-brand-ink ring-2 ring-brand-strong ring-offset-2" },
  { label: "Terkunci", icon: Lock, state: "bg-muted text-muted-foreground" },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            aria-label="EduSpark beranda"
            className="flex items-center gap-2 rounded-lg"
          >
            <LogoMark aria-hidden className="size-8" />
            <span className="font-heading text-xl font-semibold text-foreground max-sm:hidden">
              EduSpark
            </span>
          </Link>
          <nav aria-label="Navigasi utama" className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Daftar</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section
          aria-labelledby="hero-heading"
          className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-16"
        >
          <div className="flex flex-col gap-5">
            <h1
              id="hero-heading"
              className="font-heading text-4xl leading-tight font-semibold text-foreground sm:text-5xl"
            >
              Belajar jadi petualangan untuk siswa SD.
            </h1>
            <p className="max-w-prose text-base text-muted-foreground sm:text-lg">
              EduSpark mengubah materi dan kuis menjadi perjalanan belajar
              berbasis XP, badge, dan level. Siswa kelas 1 sampai 6 selalu tahu
              langkah berikutnya, dan Spark siap membantu setiap saat.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/register">Buat akun gratis</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sudah punya akun? Masuk</Link>
              </Button>
            </div>
          </div>

          <div
            aria-hidden
            className="relative flex items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <SparkAvatar size="xl" label="Spark" />
              <ol className="flex flex-col items-center">
                {heroNodes.map((node, index) => {
                  const Icon = node.icon;
                  return (
                    <li key={index} className="flex flex-col items-center">
                      {index > 0 && (
                        <span
                          className={`h-5 w-1 rounded-full ${
                            index <= 2 ? "bg-growth" : "bg-border"
                          }`}
                        />
                      )}
                      <span
                        className={`flex size-11 items-center justify-center rounded-full ${node.state}`}
                      >
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <span className="mt-1 text-xs font-semibold text-muted-foreground">
                        {node.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-reward px-2.5 py-1 text-xs font-bold text-brand-ink">
              <Star aria-hidden className="size-3.5" />
              +10 XP
            </span>
          </div>
        </section>

        <section
          aria-labelledby="features-heading"
          className="border-t border-border bg-card"
        >
          <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <h2
              id="features-heading"
              className="font-heading text-2xl font-semibold text-foreground sm:text-3xl"
            >
              Apa yang ada di dalamnya
            </h2>
            <div className="mt-8 grid gap-4">
              <div className="grid gap-6 rounded-2xl border border-border bg-background p-6 md:grid-cols-[1.2fr_1fr] md:items-center">
                <div className="flex flex-col gap-3">
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    Petualangan Belajar
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Peta perjalanan per mata pelajaran dengan status misi yang
                    jelas: terkunci, sedang dikerjakan, selesai, dan mahir.
                    Siswa tahu persis di mana posisinya dan misi apa yang
                    harus dikerjakan berikutnya.
                  </p>
                </div>
                <ol className="flex flex-wrap items-center justify-center gap-3">
                  {heroNodes.map((node, index) => {
                    const Icon = node.icon;
                    return (
                      <li key={index} className="flex flex-col items-center gap-1">
                        <span
                          className={`flex size-10 items-center justify-center rounded-full ${node.state}`}
                        >
                          <Icon aria-hidden className="size-4" />
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-6">
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    Kuis, XP, dan badge
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Tiap kuis yang selesai menambah XP, membuka badge, dan
                    menaikkan level. Progres tampil angka, bukan hanya warna.
                  </p>
                </div>
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-ai-soft p-6">
                  <div className="flex items-center gap-3">
                    <SparkAvatar size="sm" label="" />
                    <h3 className="font-heading text-xl font-semibold text-foreground">
                      Spark
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Teman belajar yang sabar. Tanyakan materi yang sulit, minta
                    penjelasan ulang, atau bahas hasil kuis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="cta-heading"
          className="bg-brand"
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <h2
                id="cta-heading"
                className="font-heading text-2xl font-semibold text-brand-ink sm:text-3xl"
              >
                Siap mulai petualangan belajar?
              </h2>
              <p className="text-sm text-brand-ink/80 sm:text-base">
                Buat akun, pilih kelas, dan mulai dari misi pertama.
              </p>
            </div>
            <Button size="lg" variant="secondary" asChild className="shrink-0">
              <Link href="/register">Daftar sekarang</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6">
          <span className="flex items-center gap-2">
            <LogoMark aria-hidden className="size-6" />
            <span className="text-sm text-muted-foreground">
              EduSpark, teman belajar siswa SD.
            </span>
          </span>
          <nav aria-label="Navigasi footer" className="flex items-center gap-4 text-sm">
            <Link
              href="/login"
              className="font-semibold text-brand-strong underline-offset-4 hover:underline"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="font-semibold text-brand-strong underline-offset-4 hover:underline"
            >
              Daftar
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
