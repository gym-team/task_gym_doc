// components/coach/food-form.tsx
"use client";

import { useState, type FormEvent } from "react";
import type { FoodItemInput, FoodCategory } from "@/types/coachFood";

const CATEGORIES: FoodCategory[] = [
  "Protein",
  "Carb",
  "Fat",
  "Vegetable",
  "Fruit",
  "Dairy",
  "Other",
];

export interface FoodFormProps {
  initialValue?: FoodItemInput;
  isSubmitting?: boolean;
  onSubmit: (input: FoodItemInput) => void;
  onCancel: () => void;
}

const EMPTY_FOOD: FoodItemInput = {
  name: "",
  category: "Protein",
  caloriesPer100g: 0,
  proteinPer100g: 0,
  carbPer100g: 0,
  fatPer100g: 0,
  servingSizeG: 0,
  servingSizeName: "",
};

/**
 * Create/edit form for a FoodItem, used inline within /coach/foods
 * (modal — no extra route).
 */
export function FoodForm({
  initialValue,
  isSubmitting,
  onSubmit,
  onCancel,
}: FoodFormProps) {
  const [value, setValue] = useState<FoodItemInput>(initialValue ?? EMPTY_FOOD);

  function update<K extends keyof FoodItemInput>(key: K, val: FoodItemInput[K]) {
    setValue((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Food name
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
            Category
          </label>
          <select
            value={value.category}
            onChange={(e) => update("category", e.target.value as FoodCategory)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Kcal/100g
          </label>
          <input
            required
            type="number"
            min={0}
            value={value.caloriesPer100g}
            onChange={(e) => update("caloriesPer100g", Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Protein/100g
          </label>
          <input
            required
            type="number"
            min={0}
            value={value.proteinPer100g}
            onChange={(e) => update("proteinPer100g", Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Carb/100g
          </label>
          <input
            required
            type="number"
            min={0}
            value={value.carbPer100g}
            onChange={(e) => update("carbPer100g", Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Fat/100g
          </label>
          <input
            required
            type="number"
            min={0}
            value={value.fatPer100g}
            onChange={(e) => update("fatPer100g", Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Serving size (g)
          </label>
          <input
            required
            type="number"
            min={0}
            value={value.servingSizeG}
            onChange={(e) => update("servingSizeG", Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Serving size name
          </label>
          <input
            required
            placeholder="e.g. 1 handful (28g)"
            value={value.servingSizeName}
            onChange={(e) => update("servingSizeName", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none focus:border-brand-green/50"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="coach-btn-primary disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Save food"}
        </button>
        <button type="button" onClick={onCancel} className="coach-btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
