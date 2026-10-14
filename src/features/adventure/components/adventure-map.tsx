import Link from "next/link";
import {
  BookOpen,
  Calculator,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MapNode } from "@/features/adventure/components/map-node";
import type { AdventureNode, AdventurePath } from "@/features/adventure/service";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  matematika: Calculator,
  "bahasa-indonesia": BookOpen,
  ipas: FlaskConical,
};

function groupByChapter(nodes: AdventureNode[]) {
  const groups: { chapter: number; nodes: AdventureNode[] }[] = [];
  for (const node of nodes) {
    const last = groups[groups.length - 1];
    if (last && last.chapter === node.chapter) {
      last.nodes.push(node);
    } else {
      groups.push({ chapter: node.chapter, nodes: [node] });
    }
  }
  return groups;
}

function isDone(status: AdventureNode["status"]) {
  return status === "completed" || status === "mastered";
}

function PathCard({ path }: { path: AdventurePath }) {
  const Icon = SUBJECT_ICONS[path.subjectSlug] ?? BookOpen;
  const groups = groupByChapter(path.nodes);
  const missionNumbers = new Map(
    path.nodes.map((node, index) => [node.id, index + 1])
  );

  return (
    <section
      aria-labelledby={`path-${path.id}`}
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong"
            >
              <Icon className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col">
              <h2
                id={`path-${path.id}`}
                className="font-heading text-lg font-semibold break-words text-foreground"
              >
                {path.title}
              </h2>
              <span className="text-xs text-muted-foreground">
                {path.subjectName}
              </span>
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-brand-strong tabular-nums">
            {path.percent}%
          </span>
        </div>
        {path.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {path.description}
          </p>
        )}
        <ProgressBar
          value={path.percent}
          label="Progres jalur"
          valueText={`${path.completedCount} dari ${path.totalNodes} misi`}
        />
      </header>

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <section
            key={group.chapter}
            aria-labelledby={`path-${path.id}-chapter-${group.chapter}`}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              <h3
                id={`path-${path.id}-chapter-${group.chapter}`}
                className="font-heading text-sm font-semibold text-muted-foreground"
              >
                Bab {group.chapter}
              </h3>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>
            <ol className="flex flex-col items-center">
              {group.nodes.map((node, index) => {
                const hasNext = index < group.nodes.length - 1;
                return (
                  <MapNode
                    key={node.id}
                    id={node.id}
                    missionNumber={missionNumbers.get(node.id) ?? index + 1}
                    title={node.title}
                    status={node.status}
                    connector={
                      !hasNext
                        ? null
                        : isDone(node.status)
                          ? "traveled"
                          : "pending"
                    }
                  />
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </section>
  );
}

export function AdventureMap({ paths }: { paths: AdventurePath[] }) {
  if (paths.length === 0) {
    return (
      <section
        aria-labelledby="empty-heading"
        className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6"
      >
        <h2
          id="empty-heading"
          className="font-heading text-lg font-semibold text-foreground"
        >
          Belum ada jalur belajar
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Petualangan untuk kelasmu belum tersedia. Kamu tetap bisa belajar
          mandiri dengan membuat materi baru.
        </p>
        <Button asChild>
          <Link href="/learn">Buat materi belajar</Link>
        </Button>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {paths.map((path) => (
        <PathCard key={path.id} path={path} />
      ))}
    </div>
  );
}
