import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/user";
import {
  getAdventureOverview,
  type AdventureOverview,
} from "@/features/adventure/service";
import { AdventureMap } from "@/features/adventure/components/adventure-map";
import { JourneySummary } from "@/features/adventure/components/journey-summary";

export const metadata: Metadata = {
  title: "Petualangan | EduSpark",
};

export const instant = false;

export default async function AdventurePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let overview: AdventureOverview | null = null;
  try {
    overview = await getAdventureOverview(user.id);
  } catch {
    overview = null;
  }

  if (!overview) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10">
        <section
          aria-labelledby="error-heading"
          className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6"
        >
          <h1
            id="error-heading"
            className="font-heading text-2xl font-semibold text-foreground"
          >
            Peta gagal dimuat
          </h1>
          <p className="text-sm text-muted-foreground">
            Terjadi gangguan saat memuat jalur belajarmu. Coba muat ulang
            halaman ini.
          </p>
          <Button asChild>
            <Link href="/adventure">Coba lagi</Link>
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10">
      <section aria-labelledby="adventure-heading" className="flex flex-col gap-1">
        <h1
          id="adventure-heading"
          className="font-heading text-3xl font-semibold text-foreground"
        >
          Petualangan Belajar
        </h1>
        <p className="text-muted-foreground">
          Ikuti jalur belajarmu langkah demi langkah. Kelas {user.classLevel} ·
          selesaikan misi untuk membuka yang berikutnya.
        </p>
      </section>

      {overview.summary.totalNodes > 0 && (
        <JourneySummary summary={overview.summary} />
      )}

      <AdventureMap paths={overview.paths} />
    </div>
  );
}
