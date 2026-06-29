// components/coach/constraints-form.tsx
"use client";

import { useState, type FormEvent } from "react";
import type { NutritionConstraintInput } from "@/types/constraints";

export interface ConstraintsFormProps {
  initialValue: NutritionConstraintInput;
  isSubmitting?: boolean;
  onSubmit: (input: NutritionConstraintInput) => void;
  onCancel: () => void;
}

function NumberField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
        {label}
      </label>
      <input
        type="number"
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
      />
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-white/80">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-[#84FF00]"
      />
    </label>
  );
}

/**
 * Edit form for NutritionConstraint, used inline within /coach/foods
 * ("manage constraints for an enrollment", brief section 9).
 * Field names mirror GET /api/nutritionconstraint/{id} exactly.
 */
export function ConstraintsForm({
  initialValue,
  isSubmitting,
  onSubmit,
  onCancel,
}: ConstraintsFormProps) {
  const [value, setValue] = useState<NutritionConstraintInput>(initialValue);

  function update<K extends keyof NutritionConstraintInput>(
    key: K,
    val: NutritionConstraintInput[K]
  ) {
    setValue((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-green">
          Weight & change targets
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            label="Weight averaging days"
            value={value.weightAveragingDays}
            onChange={(v) => update("weightAveragingDays", v)}
          />
          <NumberField
            label="Expected weekly change min (kg)"
            step={0.1}
            value={value.expectedWeeklyChangeMin}
            onChange={(v) => update("expectedWeeklyChangeMin", v)}
          />
          <NumberField
            label="Expected weekly change max (kg)"
            step={0.1}
            value={value.expectedWeeklyChangeMax}
            onChange={(v) => update("expectedWeeklyChangeMax", v)}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Deviation trigger (kg)"
            step={0.01}
            value={value.deviationTriggerKg}
            onChange={(v) => update("deviationTriggerKg", v)}
          />
          <NumberField
            label="Adherence threshold (%)"
            value={value.adherenceThresholdPercent}
            onChange={(v) => update("adherenceThresholdPercent", v)}
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-orange">
          Macro & calorie floors
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Protein floor (g)"
            value={value.proteinFloorG}
            onChange={(v) => update("proteinFloorG", v)}
          />
          <NumberField
            label="Fat floor (g)"
            value={value.fatFloorG}
            onChange={(v) => update("fatFloorG", v)}
          />
          <NumberField
            label="Calorie floor"
            value={value.calorieFloor}
            onChange={(v) => update("calorieFloor", v)}
          />
          <NumberField
            label="Calorie ceiling"
            value={value.calorieCeiling}
            onChange={(v) => update("calorieCeiling", v)}
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-cyan">
          Adjustment limits
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            label="Max single adjustment (kcal)"
            value={value.maxSingleAdjustmentKcal}
            onChange={(v) => update("maxSingleAdjustmentKcal", v)}
          />
          <NumberField
            label="Max cumulative drift (kcal)"
            value={value.maxCumulativeDriftKcal}
            onChange={(v) => update("maxCumulativeDriftKcal", v)}
          />
          <NumberField
            label="Preferred adjustment vector"
            value={value.preferredAdjustmentVector}
            onChange={(v) => update("preferredAdjustmentVector", v)}
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">
          Behavior rules
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ToggleField
            label="Require consecutive weeks deviation"
            checked={value.requireConsecutiveWeeksDeviation}
            onChange={(v) => update("requireConsecutiveWeeksDeviation", v)}
          />
          <ToggleField
            label="Apply training week noise correction"
            checked={value.applyTrainingWeekNoiseCorrection}
            onChange={(v) => update("applyTrainingWeekNoiseCorrection", v)}
          />
          <ToggleField
            label="Energy level escalation rule"
            checked={value.energyLevelEscalationRule}
            onChange={(v) => update("energyLevelEscalationRule", v)}
          />
          <ToggleField
            label="Preserve lean mass over rate"
            checked={value.preserveLeanMassOverRate}
            onChange={(v) => update("preserveLeanMassOverRate", v)}
          />
          <ToggleField
            label="Enable baseline recalibration review"
            checked={value.enableBaselineRecalibrationReview}
            onChange={(v) => update("enableBaselineRecalibrationReview", v)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="coach-btn-primary disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Save constraints"}
        </button>
        <button type="button" onClick={onCancel} className="coach-btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
