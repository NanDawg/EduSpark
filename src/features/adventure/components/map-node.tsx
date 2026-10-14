import Link from "next/link";
import { Check, ChevronDown, Lock, Play, Star, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import type { NodeStatus } from "@/features/adventure/service";

type NodeStatusMeta = {
  label: string;
  icon: LucideIcon;
  circle: string;
  iconColor: string;
  titleColor: string;
  statusColor: string;
};

export const NODE_STATUS_META: Record<NodeStatus, NodeStatusMeta> = {
  locked: {
    label: "Terkunci",
    icon: Lock,
    circle: "bg-muted border border-border",
    iconColor: "text-muted-foreground",
    titleColor: "text-muted-foreground",
    statusColor: "text-muted-foreground",
  },
  current: {
    label: "Sekarang",
    icon: Play,
    circle: "bg-brand ring-2 ring-brand-strong ring-offset-2 ring-offset-background",
    iconColor: "text-brand-ink",
    titleColor: "text-brand-strong",
    statusColor: "text-brand-strong",
  },
  completed: {
    label: "Selesai",
    icon: Check,
    circle: "bg-growth",
    iconColor: "text-brand-ink",
    titleColor: "text-foreground",
    statusColor: "text-muted-foreground",
  },
  mastered: {
    label: "Mahir",
    icon: Star,
    circle: "bg-reward ring-2 ring-reward-strong/50",
    iconColor: "text-brand-ink",
    titleColor: "text-foreground",
    statusColor: "text-muted-foreground",
  },
};

type MapNodeProps = {
  id: string;
  missionNumber: number;
  title: string;
  status: NodeStatus;
  connector: "traveled" | "pending" | null;
};

export function MapNode({
  id,
  missionNumber,
  title,
  status,
  connector,
}: MapNodeProps) {
  const meta = NODE_STATUS_META[status];
  const Icon = meta.icon;
  const locked = status === "locked";

  return (
    <li className="flex w-full flex-col items-center">
      <Link
        href={`/adventure/${id}`}
        aria-label={`Misi ${missionNumber}: ${title}, ${meta.label}`}
        aria-current={status === "current" ? "step" : undefined}
        className={cn(
          "group flex w-full flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
          locked
            ? "hover:bg-muted/60"
            : "hover:bg-brand-soft/60 active:scale-[0.98]"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex size-14 items-center justify-center rounded-full transition-transform duration-200",
            !locked && "group-hover:scale-105",
            meta.circle,
            status === "current" && "animate-in zoom-in-95 duration-300"
          )}
        >
          <Icon className={cn("size-6", meta.iconColor)} />
        </span>
        <span
          className={cn(
            "text-center text-sm font-semibold leading-tight",
            meta.titleColor
          )}
        >
          {title}
        </span>
        <span className={cn("text-xs font-semibold", meta.statusColor)}>
          {meta.label}
        </span>
      </Link>
      {connector && (
        <span aria-hidden className="-mt-1 mb-1 flex flex-col items-center">
          <span
            className={cn(
              "h-4 w-1 rounded-full",
              connector === "traveled" ? "bg-growth" : "bg-border"
            )}
          />
          <ChevronDown
            className={cn(
              "-mt-0.5 size-3.5",
              connector === "traveled" ? "text-growth-strong" : "text-border"
            )}
          />
        </span>
      )}
    </li>
  );
}
