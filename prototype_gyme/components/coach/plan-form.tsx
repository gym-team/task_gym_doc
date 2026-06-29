// components/coach/plan-form.tsx
"use client";

import { useState, type FormEvent } from "react";
import type {
  CoachNutritionPlanInput,
  TrainingGoal,
  FitnessLevel,
  EquipmentType,
} from "@/types/coachNutrition-plan";

const TRAINING_GOALS: TrainingGoal[] = [
  "LoseFat",
  "BuildMuscle",
  "Maintain",
  "Recomposition",
  "ImprovePerformance",
];
const FITNESS_LEVELS: FitnessLevel[] = ["Beginner", "Intermediate", "Advanced"];
const EQUIPMENT_TYPES: EquipmentType[] = [
  "FullGym",
  "HomeBasic",
  "Bodyweight",
  "Dumbbells",
  "Minimal",
];

export interface PlanFormProps {
  initialValue?: CoachNutritionPlanInput;
  isSubmitting?: boolean;
  onSubmit: (input: CoachNutritionPlanInput) => void;
  onCancel: () => void;
}

const EMPTY_PLAN: CoachNutritionPlanInput = {
  name: "",
  description: "",
  expectedOutcome: "",
  trainingGoal: "LoseFat",
  fitnessLevel: "Beginner",
  equipmentType: "FullGym",
  durationOnWeeks: 8,
  photoThumbnailUrl: null,
};

/**
 * Create/edit form for a CoachNutritionPlan, used inline within
 * /coach/plans (modal or drawer) — never its own route.
 */
export function PlanForm({
  initialValue,
  isSubmitting,
  onSubmit,
  onCancel,
}: PlanFormProps) {
  const [value, setValue] = useState<CoachNutritionPlanInput>(
    initialValue ?? EMPTY_PLAN
  );

  function update<K extends keyof CoachNutritionPlanInput>(
    key: K,
    val: CoachNutritionPlanInput[K]
  ) {
    setValue((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
          Plan name
        </label>
        <input
          required
          value={value.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
          Description
        </label>
        <textarea
          required
          rows={3}
          value={value.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
          Expected outcome
        </label>
        <textarea
          required
          rows={3}
          value={value.expectedOutcome}
          onChange={(e) => update("expectedOutcome", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Training goal
          </label>
          <select
            value={value.trainingGoal}
            onChange={(e) => update("trainingGoal", e.target.value as TrainingGoal)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          >
            {TRAINING_GOALS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Fitness level
          </label>
          <select
            value={value.fitnessLevel}
            onChange={(e) => update("fitnessLevel", e.target.value as FitnessLevel)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          >
            {FITNESS_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Equipment
          </label>
          <select
            value={value.equipmentType}
            onChange={(e) => update("equipmentType", e.target.value as EquipmentType)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          >
            {EQUIPMENT_TYPES.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
          Duration (weeks)
        </label>
        <input
          required
          type="number"
          min={1}
          value={value.durationOnWeeks}
          onChange={(e) => update("durationOnWeeks", Number(e.target.value))}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50 sm:w-40"
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="coach-btn-primary disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Save plan"}
        </button>
        <button type="button" onClick={onCancel} className="coach-btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
