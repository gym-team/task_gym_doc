// components/coach/queue-card.tsx
"use client";

import type { CoachCheckInQueueItem } from "@/types/coach-checkin";

const CONFIDENCE_COLOR: Record<string, string> = {
  Low: "text-brand-orange border-brand-orange/40 bg-brand-orange/10",
  Medium: "text-brand-cyan border-brand-cyan/40 bg-brand-cyan/10",
  High: "text-brand-green border-brand-green/40 bg-brand-green/10",
};

export interface QueueCardProps {
  item: CoachCheckInQueueItem;
  isSelected?: boolean;
  onSelect: (item: CoachCheckInQueueItem) => void;
}

/**
 * Single row/card in the coach review queue (left pane of /coach/checkins).
 * Reads CoachCheckInQueueItem fields exactly as returned by
 * GET /api/CheckIn/coach/queue — no renamed fields.
 */
export function QueueCard({ item, isSelected, onSelect }: QueueCardProps) {
  const confidenceClass =
    CONFIDENCE_COLOR[item.systemConfidence] ?? CONFIDENCE_COLOR.Medium;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`coach-card w-full text-left p-5 transition-colors ${
        isSelected ? "border-brand-green/50 bg-white/[0.06]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{item.traineeName}</p>
          <p className="mt-0.5 text-sm text-white/60">{item.planName}</p>
        </div>
        <span
          className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceClass}`}
        >
          {item.systemConfidence}
        </span>
      </div>

      <p className="mt-3 text-sm text-white/75">{item.priorityLabel}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
        <span>
          Week {item.weekNumber}/{item.totalWeeks}
        </span>
        <span>Adherence {item.adherencePercent}%</span>
        {item.weightDeltaKg !== null && (
          <span>
            {item.weightDeltaKg > 0 ? "+" : ""}
            {item.weightDeltaKg} kg
          </span>
        )}
        {item.proposedAdjustmentKcal !== 0 && (
          <span className="text-brand-orange">
            {item.proposedAdjustmentKcal > 0 ? "+" : ""}
            {item.proposedAdjustmentKcal} kcal proposed
          </span>
        )}
        {item.hasClientNote && (
          <span className="text-brand-cyan">
            Note{item.noteCategory ? ` · ${item.noteCategory}` : ""}
          </span>
        )}
      </div>
    </button>
  );
}
