import Link from "next/link";
import { Check, Lock, Play, Star, type LucideIcon } from "lucide-react";
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
    circle: "bg-reward",
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

  return (
    <li className="flex w-full flex-col items-center">
      <Link
        href={`/adventure/${id}`}
        aria-label={`Misi ${missionNumber}: ${title}, ${meta.label}`}
        className="group flex w-full flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition-colors hover:bg-brand-soft/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span
          aria-hidden
          className={cn(
            "flex size-14 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105",
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
        <span
          aria-hidden
          className={cn(
            "-mt-1 mb-1 h-6 w-1 rounded-full",
            connector === "traveled" ? "bg-growth" : "bg-border"
          )}
        />
      )}
    </li>
  );
}
