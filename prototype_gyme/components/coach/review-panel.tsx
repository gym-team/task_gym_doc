// components/coach/review-panel.tsx
"use client";

import type { CoachCheckInDetails } from "@/types/coach-checkin";

export interface ReviewPanelProps {
  details: CoachCheckInDetails | null;
  isLoading?: boolean;
  onOpenDecision: () => void;
  onManualUnlock: () => void;
}

function VitalStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="coach-stat">
      <div className="coach-stat__value text-xl">{value}</div>
      <div className="coach-stat__label">{label}</div>
    </div>
  );
}

/**
 * Right-hand review pane of /coach/checkins. Renders the full
 * GET /api/CheckIn/coach/{id} response — CoachCheckInDetails — exactly
 * as returned, including weightHistory.
 */
export function ReviewPanel({
  details,
  isLoading,
  onOpenDecision,
  onManualUnlock,
}: ReviewPanelProps) {
  if (isLoading) {
    return (
      <div className="coach-card flex h-full min-h-[420px] items-center justify-center p-8">
        <p className="text-sm text-white/50">Loading review…</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="coach-card flex h-full min-h-[420px] flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-semibold text-white">No check-in selected</p>
        <p className="mt-2 max-w-xs text-sm text-white/60">
          Pick someone from the queue to see their full weekly review here.
        </p>
      </div>
    );
  }

  return (
    <div className="coach-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{details.traineeName}</h2>
          <p className="mt-1 text-sm text-white/60">
            Week {details.weekNumber} · Adherence {details.adherencePercent}%
          </p>
        </div>
        <span className="rounded-full border border-brand-green/40 bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
          {details.systemConfidence} confidence
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <VitalStat label="Avg weight" value={`${details.averageWeight} kg`} />
        <VitalStat
          label="Weight delta"
          value={`${details.weightDeltaKg > 0 ? "+" : ""}${details.weightDeltaKg} kg`}
        />
        <VitalStat label="Energy" value={`${details.energyLevel}/5`} />
        <VitalStat label="Sleep" value={`${details.sleepQuality}/5`} />
      </div>

      <div className="mt-6 text-sm text-white/60">
        Expected weekly change: {details.expectedMin}–{details.expectedMax} kg
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
          {details.noteCategory} note
        </p>
        <p className="mt-2 text-sm text-white/80">{details.clientNote}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-cyan/20 bg-brand-cyan/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-cyan">
          System proposal · {details.systemProposalKcal} kcal
        </p>
        <p className="mt-2 text-sm text-white/80">
          {details.systemProposalReasoning}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
          If no action is taken
        </p>
        <p className="mt-2 text-sm text-white/80">
          {details.projectedOutcomeIfNoAction}
        </p>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
          Weight history
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="text-white/50">
                <th className="py-2 pr-4 font-medium">Week</th>
                <th className="py-2 pr-4 font-medium">Avg weight</th>
                <th className="py-2 font-medium">Calories applied</th>
              </tr>
            </thead>
            <tbody>
              {details.weightHistory.map((point) => (
                <tr key={point.weekNumber} className="border-t border-white/10">
                  <td className="py-2 pr-4 text-white/80">{point.weekNumber}</td>
                  <td className="py-2 pr-4 text-white/80">{point.averageWeight} kg</td>
                  <td className="py-2 text-brand-green">{point.caloriesApplied} kcal</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={onOpenDecision} className="coach-btn-primary">
          Make decision
        </button>
        <button type="button" onClick={onManualUnlock} className="coach-btn-secondary">
          Manual unlock
        </button>
      </div>
    </div>
  );
}
