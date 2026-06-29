// components/coach/decision-modal.tsx
"use client";

import { useState } from "react";
import type {
  CoachCheckInDetails,
  CoachDecisionAction,
} from "@/types/coach-checkin";

export interface DecisionModalProps {
  details: CoachCheckInDetails;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (action: CoachDecisionAction, finalCalorieTarget?: number, coachNote?: string) => void;
}

const ACTIONS: { value: CoachDecisionAction; label: string; helper: string }[] = [
  {
    value: "Accept",
    label: "Accept system proposal",
    helper: "Apply the proposed calorie target as-is.",
  },
  {
    value: "Override",
    label: "Override with a custom target",
    helper: "Set your own calorie target for this trainee.",
  },
  {
    value: "HoldCurrent",
    label: "Hold current target",
    helper: "Make no change this week.",
  },
];

/**
 * Decision modal opened from review-panel. Submits a CoachCheckInDecision.
 * Rendered as an in-flow overlay (no extra route) per brief section 9.
 */
export function DecisionModal({
  details,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: DecisionModalProps) {
  const [action, setAction] = useState<CoachDecisionAction>("Accept");
  const [customTarget, setCustomTarget] = useState(
    String(details.systemProposalKcal)
  );
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  function handleSubmit() {
    const finalTarget =
      action === "Override" ? Number(customTarget) : undefined;
    onSubmit(action, finalTarget, note || undefined);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decision-modal-title"
    >
      <div className="coach-card w-full max-w-lg bg-bg-secondary p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="decision-modal-title" className="text-lg font-bold text-white">
            Decision for {details.traineeName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-white/50 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {ACTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`block cursor-pointer rounded-2xl border p-4 transition-colors ${
                action === opt.value
                  ? "border-brand-green/50 bg-brand-green/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <input
                type="radio"
                name="decision-action"
                value={opt.value}
                checked={action === opt.value}
                onChange={() => setAction(opt.value)}
                className="sr-only"
              />
              <span className="font-semibold text-white">{opt.label}</span>
              <span className="mt-1 block text-sm text-white/60">
                {opt.helper}
              </span>
            </label>
          ))}
        </div>

        {action === "Override" && (
          <div className="mt-5">
            <label
              htmlFor="custom-target"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50"
            >
              Final calorie target
            </label>
            <input
              id="custom-target"
              type="number"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
            />
          </div>
        )}

        <div className="mt-5">
          <label
            htmlFor="coach-note"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50"
          >
            Note to trainee (optional)
          </label>
          <textarea
            id="coach-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="coach-btn-primary disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Confirm decision"}
          </button>
          <button type="button" onClick={onClose} className="coach-btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
