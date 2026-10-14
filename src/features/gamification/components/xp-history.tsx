import { Badge } from "@/components/ui/badge";

const formatDate = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
});

export type XpHistoryRow = {
  id: string;
  amount: number;
  reason: string;
  source: string;
  createdAt: Date;
};

export function XpHistory({ entries }: { entries: XpHistoryRow[] }) {
  return (
    <section aria-labelledby="xp-history-heading" className="flex flex-col gap-4">
      <h2
        id="xp-history-heading"
        className="font-heading text-xl font-semibold text-foreground"
      >
        Aktivitas XP terbaru
      </h2>
      {entries.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Belum ada aktivitas XP. Selesaikan materi atau kuis untuk mulai
          mengumpulkan XP.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {entry.reason}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate.format(entry.createdAt)}
                </span>
              </div>
              <Badge variant="reward" className="shrink-0">
                +{entry.amount} XP
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}