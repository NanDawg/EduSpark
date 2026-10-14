"use client";

import { useActionState } from "react";
import {
  markMaterialCompleteAction,
  type MarkCompleteState,
} from "@/actions/progress";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export function CompleteMaterialButton({
  materialId,
  initiallyCompleted,
}: {
  materialId: string;
  initiallyCompleted: boolean;
}) {
  const [state, formAction, isPending] = useActionState<
    MarkCompleteState,
    FormData
  >(markMaterialCompleteAction, {
    completed: initiallyCompleted || undefined,
  });

  const completed = state.completed === true;

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction} className="flex flex-wrap gap-3" noValidate>
        <input type="hidden" name="materialId" value={materialId} />
        {completed ? (
          <p className="reward-pop inline-flex min-h-11 items-center gap-2 rounded-lg bg-growth/15 px-4 text-sm font-semibold text-growth-strong">
            Sudah selesai
            {state.xpAwarded ? ` +${state.xpAwarded} XP` : ""}
          </p>
        ) : (
          <Button type="submit" size="lg" variant="secondary" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Tandai selesai (+10 XP)"}
          </Button>
        )}
      </form>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {state.unlockedBadges && state.unlockedBadges.length > 0 && (
        <p className="reward-pop flex items-center gap-2 text-sm font-semibold text-growth-strong">
          <Trophy className="size-4 text-reward-strong" aria-hidden />
          Badge baru: {state.unlockedBadges.join(", ")}!
        </p>
      )}
    </div>
  );
}
