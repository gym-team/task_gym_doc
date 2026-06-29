// components/coach/week-form.tsx
"use client";

import { useState, type FormEvent } from "react";
import type { NutritionWeekInput } from "@/types/coachNutrition-week";

export interface WeekFormProps {
  initialValue?: NutritionWeekInput;
  isSubmitting?: boolean;
  onSubmit: (input: NutritionWeekInput) => void;
  onCancel: () => void;
}

const EMPTY_WEEK: NutritionWeekInput = {
  weekNumber: 1,
  targetCalories: 2500,
  proteinG: 160,
  carbG: 250,
  fatG: 70,
  notes: "",
};

/**
 * Add/edit form for a single NutritionWeek, used inline within the
 * plan editing flow on /coach/plans (accordion or drawer, no extra route).
 */
export function WeekForm({
  initialValue,
  isSubmitting,
  onSubmit,
  onCancel,
}: WeekFormProps) {
  const [value, setValue] = useState<NutritionWeekInput>(
    initialValue ?? EMPTY_WEEK
  );

  function update<K extends keyof NutritionWeekInput>(
    key: K,
    val: NutritionWeekInput[K]
  ) {
    setValue((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Week number
          </label>
          <input
            required
            type="number"
            min={1}
            value={value.weekNumber}
            onChange={(e) => update("weekNumber", Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Target calories
          </label>
          <input
            required
            type="number"
            min={0}
            value={value.targetCalories}
            onChange={(e) => update("targetCalories", Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Protein (g)
          </label>
          <input
            required
            type="number"
            min={0}
            value={value.proteinG}
            onChange={(e) => update("proteinG", Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Carbs (g)
          </label>
          <input
            required
            type="number"
            min={0}
            value={value.carbG}
            onChange={(e) => update("carbG", Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Fat (g)
          </label>
          <input
            required
            type="number"
            min={0}
            value={value.fatG}
            onChange={(e) => update("fatG", Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
          Notes (optional)
        </label>
        <textarea
          rows={2}
          value={value.notes ?? ""}
          onChange={(e) => update("notes", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="coach-btn-primary disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Save week"}
        </button>
        <button type="button" onClick={onCancel} className="coach-btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
