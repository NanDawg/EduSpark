import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, Lock, Play, Star } from "lucide-react";
import { cn } from "cn";
import { getCurrentUser } from "@/features/auth/user";
import { prisma } from "@/lib/prisma";
import {
  getAdventureNode,
  type NodeDetail,
} from "@/features/adventure/service";
import { NODE_STATUS_META } from "@/features/adventure/components/map-node";
import { MissionActions } from "@/features/adventure/components/mission-actions";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Misi Belajar | EduSpark",
};

export const instant = false;

function StatusBanner({
  node,
}: {
  node: NodeDetail;
}) {
  if (node.status === "locked") {
    return (
      <section
        aria-label="Status misi"
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted border border-border"
          >
            <Lock className="size-5 text-muted-foreground" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              Misi terkunci
            </span>
            <span className="text-sm text-muted-foreground">
              {node.previousNode
                ? `Selesaikan dulu: ${node.previousNode.title}`
                : "Selesaikan misi sebelumnya."}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {node.previousNode && (
            <Button asChild variant="outline">
              <Link href={`/adventure/${node.previousNode.id}`}>
                Misi sebelumnya
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/adventure">Ke peta</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (node.status === "completed" || node.status === "mastered") {
    const mastered = node.status === "mastered";
    return (
      <section
        aria-label="Status misi"
        className="reward-rise flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              mastered ? "bg-reward" : "bg-growth"
            )}
          >
            {mastered ? (
              <Star className="size-5 text-brand-ink" />
            ) : (
              <Check className="size-5 text-brand-ink" />
            )}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {mastered ? "Misi dikuasai!" : "Misi selesai!"}
            </span>
            <span className="text-sm text-muted-foreground">
              {node.bestScore !== null
                ? `Nilai kuis terbaik: ${node.bestScore}`
                : "Materi dan kuis sudah diselesaikan."}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {node.nextNode ? (
            <Button asChild>
              <Link href={`/adventure/${node.nextNode.id}`}>
                Lanjut: {node.nextNode.title}
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/adventure">Kembali ke peta</Link>
            </Button>
          )}
        </div>
      </section>
    );
  }

  if (node.status === "current") {
    return (
      <section
        aria-label="Status misi"
        className="flex flex-col gap-3 rounded-xl border-2 border-brand bg-brand-soft p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand"
          >
            <Play className="size-5 text-brand-ink" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              Misi sedang berjalan
            </span>
            <span className="text-sm text-muted-foreground">
              {node.lessonDone
                ? "Materi sudah selesai. Tinggal kerjakan kuis."
                : "Mulai dari membaca materi, lalu kerjakan kuis."}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href="#action-heading">
              {node.lessonDone ? "Kerjakan kuis" : "Mulai misi"}
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/adventure">Ke peta</Link>
          </Button>
        </div>
      </section>
    );
  }

  return null;
}

function StepRow({
  done,
  label,
  value,
}: {
  done: boolean;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
      <span
        aria-hidden
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full",
          done ? "bg-growth" : "bg-muted border border-border"
        )}
      >
        {done ? (
          <Check className="size-3.5 text-brand-ink" />
        ) : (
          <span className="size-1.5 rounded-full bg-muted-foreground" />
        )}
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="ml-auto text-sm text-muted-foreground">{value}</span>
    </li>
  );
}

export default async function MissionPage({
  params,
}: {
  params: Promise<{ nodeId: string }>;
}) {
  const { nodeId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const node = await getAdventureNode(user.id, nodeId);
  if (!node) {
    notFound();
  }

  const material = await prisma.curriculumMaterial.findUnique({
    where: {
      subjectId_classLevel_topic: {
        subjectId: node.subjectId,
        classLevel: node.classLevel,
        topic: node.topic,
      },
    },
    select: { id: true },
  });

  const meta = NODE_STATUS_META[node.status];
  const StatusIcon = meta.icon;
  const locked = node.status === "locked";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 md:py-10">
      <Link
        href="/adventure"
        className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded text-sm font-semibold text-brand-strong transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none md:min-h-0"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Kembali ke peta
      </Link>

      <section aria-labelledby="mission-heading" className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {node.pathTitle} · Bab {node.chapter} · Misi {node.order + 1}
        </p>
        <h1
          id="mission-heading"
          className="font-heading text-3xl font-semibold break-words text-foreground"
        >
          {node.title}
        </h1>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "flex size-9 items-center justify-center rounded-full",
              meta.circle
            )}
          >
            <StatusIcon className={cn("size-4.5", meta.iconColor)} />
          </span>
          <span className={cn("text-sm font-semibold", meta.statusColor)}>
            {meta.label}
          </span>
        </div>
      </section>

      <StatusBanner node={node} />

      {node.objective && (
        <section
          aria-labelledby="objective-heading"
          className="rounded-xl border border-border bg-card p-5"
        >
          <h2
            id="objective-heading"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Tujuan pembelajaran
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {node.objective}
          </p>
        </section>
      )}

      <section
        aria-labelledby="steps-heading"
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
      >
        <h2
          id="steps-heading"
          className="font-heading text-lg font-semibold text-foreground"
        >
          Langkah misi
        </h2>
        <ul className="flex flex-col gap-2">
          <StepRow
            done={node.lessonDone}
            label="Baca materi"
            value={node.lessonDone ? "Selesai" : "Belum selesai"}
          />
          <StepRow
            done={node.bestScore !== null}
            label="Kerjakan kuis"
            value={
              node.bestScore !== null
                ? `Nilai terbaik: ${node.bestScore}`
                : node.lessonDone
                  ? "Belum dikerjakan"
                  : "Menunggu materi"
            }
          />
        </ul>
        <ProgressBar
          value={node.pathPercent}
          label="Progres jalur"
          valueText={`${node.pathCompletedCount} dari ${node.pathTotalNodes} misi · ${node.pathPercent}%`}
        />
      </section>

      {!locked && (
        <section
          aria-labelledby="action-heading"
          className="scroll-mt-24 rounded-xl border border-border bg-card p-5 md:scroll-mt-0"
        >
          <h2
            id="action-heading"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Aksi misi
          </h2>
          <div className="mt-3">
            <MissionActions
              subjectId={node.subjectId}
              topic={node.topic}
              objective={node.objective}
              materialId={material?.id ?? null}
              lessonDone={node.lessonDone}
            />
          </div>
        </section>
      )}
    </div>
  );
}
