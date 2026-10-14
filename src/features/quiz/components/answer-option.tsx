import { cn } from "cn";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

export function AnswerOption({
  group,
  optionIndex,
  text,
  checked,
  onChange,
}: {
  group: string;
  optionIndex: number;
  text: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all active:scale-[0.99]",
        "focus-within:ring-3 focus-within:ring-ring/50",
        checked
          ? "border-brand bg-brand-soft text-foreground shadow-sm"
          : "border-border bg-card text-foreground hover:bg-muted"
      )}
    >
      <input
        type="radio"
        name={group}
        value={optionIndex}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg font-heading text-sm font-semibold",
          checked ? "bg-brand text-brand-ink" : "bg-muted text-muted-foreground"
        )}
      >
        {OPTION_LABELS[optionIndex]}
      </span>
      <span className="leading-snug">{text}</span>
    </label>
  );
}