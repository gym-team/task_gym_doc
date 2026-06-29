"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type NutritionPlanSummary = {
  id: number;
  name: string;
  description: string;
  durationOnWeeks: number;
  isPublished: boolean;
};


type FoodOption = {
  id: number;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
  servingSizeG: number;
  servingSizeName: string;
  isGlobal: boolean;
};

type PaginatedFoodResponse = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: FoodOption[];
};

type FoodItemForm = {
  foodItemID: string;
  amountGrams: string;
  isOptional: boolean;
  swapGroupID: string;
};

type MealForm = {
  name: string;
  timingType: string;
  mealOrder: string;
  timeFromTrainingMinutes: string;
  targetCalories: string;
  targetProteinG: string;
  targetCarbG: string;
  targetFatG: string;
  notes: string;
  foodItems: FoodItemForm[];
};

type DayProtocolForm = {
  dayProtocolType: string;
  weekDay: string;
  dayOrder: string;
  linkedWorkoutSessionID: string;
  totalCaloriesTarget: string;
  proteinTargetG: string;
  carbTargetG: string;
  fatTargetG: string;
  protocolNotes: string;
  meals: MealForm[];
};

type WeekFormState = {
  weekNumber: string;
  weekProtocolType: string;
  calorieModifier: string;
  weekDescription: string;
  focusNote: string;
  progressionNote: string;
  nextWeekPreview: string;
  dayProtocols: DayProtocolForm[];
};

type CreateNutritionWeekPayload = {
  weekNumber: number;
  weekProtocolType: number;
  calorieModifier: number;
  weekDescription: string;
  focusNote: string;
  progressionNote: string;
  nextWeekPreview: string;
  dayProtocols: Array<{
    dayProtocolType: number;
    weekDay: number;
    dayOrder: number;
    linkedWorkoutSessionID: number | null;
    totalCaloriesTarget: number;
    proteinTargetG: number;
    carbTargetG: number;
    fatTargetG: number;
    protocolNotes: string;
    meals: Array<{
      name: string;
      timingType: number;
      mealOrder: number;
      timeFromTrainingMinutes: number;
      targetCalories: number;
      targetProteinG: number;
      targetCarbG: number;
      targetFatG: number;
      notes: string;
      foodItems: Array<{
        foodItemID: number;
        amountGrams: number;
        isOptional: boolean;
        swapGroupID: number | null;
      }>;
    }>;
  }>;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://fitzone-16.runasp.net";

const WEEK_PROTOCOL_TYPES = [
  { value: 0, label: "Standard" },
  { value: 1, label: "High Volume" },
  { value: 2, label: "Deload" },
  { value: 3, label: "Refeed" },
  { value: 4, label: "Peak" },
];

const DAY_PROTOCOL_TYPES = [
  { value: 0, label: "Training Day" },
  { value: 1, label: "Rest Day" },
  { value: 2, label: "High Day" },
  { value: 3, label: "Deload Day" },
];

const MEAL_TIMING_TYPES = [
  { value: 0, label: "Breakfast" },
  { value: 1, label: "Pre Workout" },
  { value: 2, label: "Post Workout" },
  { value: 3, label: "Lunch" },
  { value: 4, label: "Snack" },
  { value: 5, label: "Dinner" },
  { value: 6, label: "Before Bed" },
];

const WEEK_DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function uniqueFoodsById(foods: FoodOption[]) {
  const map = new Map<number, FoodOption>();
  for (const food of foods) map.set(food.id, food);
  return Array.from(map.values());
}

function foodLabel(food: FoodOption) {
  return `${food.name} — ${food.category} — ${food.caloriesPer100g} kcal / 100g • P ${food.proteinPer100g} • C ${food.carbPer100g} • F ${food.fatPer100g}`;
}

function emptyFoodItem(defaultFoodId = ""): FoodItemForm {
  return {
    foodItemID: defaultFoodId,
    amountGrams: "100",
    isOptional: false,
    swapGroupID: "",
  };
}

function emptyMeal(defaultFoodId = ""): MealForm {
  return {
    name: "Meal 1",
    timingType: "0",
    mealOrder: "1",
    timeFromTrainingMinutes: "0",
    targetCalories: "0",
    targetProteinG: "0",
    targetCarbG: "0",
    targetFatG: "0",
    notes: "",
    foodItems: [emptyFoodItem(defaultFoodId)],
  };
}

function emptyDayProtocol(dayOrder = 1, defaultFoodId = ""): DayProtocolForm {
  return {
    dayProtocolType: "0",
    weekDay: "0",
    dayOrder: String(dayOrder),
    linkedWorkoutSessionID: "",
    totalCaloriesTarget: "0",
    proteinTargetG: "0",
    carbTargetG: "0",
    fatTargetG: "0",
    protocolNotes: "",
    meals: [emptyMeal(defaultFoodId)],
  };
}

function emptyWeekForm(defaultFoodId = ""): WeekFormState {
  return {
    weekNumber: "1",
    weekProtocolType: "0",
    calorieModifier: "0.5",
    weekDescription: "",
    focusNote: "",
    progressionNote: "",
    nextWeekPreview: "",
    dayProtocols: [emptyDayProtocol(1, defaultFoodId)],
  };
}

async function fetchCoachPlans(token: string) {
  const res = await fetch(`${API_URL}/api/nutritionplan/coach`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return (await res.json()) as NutritionPlanSummary[];
}


async function fetchAllFoods(token: string) {
  const pageSize = 100;
  let pageIndex = 1;
  let totalCount = Number.POSITIVE_INFINITY;
  const allFoods: FoodOption[] = [];

  while (allFoods.length < totalCount) {
    const url = new URL(`${API_URL}/api/fooditem`);
    url.searchParams.set("pageIndex", String(pageIndex));
    url.searchParams.set("pageSize", String(pageSize));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with status ${res.status}`);
    }

    const json = (await res.json()) as PaginatedFoodResponse;
    totalCount = json.totalCount ?? 0;
    allFoods.push(...(json.data || []));

    if (!json.data || json.data.length === 0) break;
    pageIndex += 1;
    if (pageIndex > 20) break;
  }

  return uniqueFoodsById(allFoods);
}

async function createWeek(
  planId: number,
  payload: CreateNutritionWeekPayload,
  token: string
) {
  const res = await fetch(`${API_URL}/api/nutritionplan/${planId}/weeks`, {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || json.details || text || `Request failed with status ${res.status}`);
    } catch (parseErr) {
      if (parseErr instanceof Error && parseErr.message !== text) throw parseErr;
      throw new Error(text || `Request failed with status ${res.status}`);
    }
  }

  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-white/60">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/80">
        {label} {required ? <span className="text-cyan-300">*</span> : null}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  helper,
  step = "1",
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  step?: string;
  min?: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60"
      />
      {helper ? <span className="text-xs text-white/45">{helper}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: number; label: string }>;
  helper?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none focus:border-cyan-400/60"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helper ? <span className="text-xs text-white/45">{helper}</span> : null}
    </label>
  );
}


function FoodSelect({
  label,
  value,
  onChange,
  foods,
  loading,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  foods: FoodOption[];
  loading: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none focus:border-cyan-400/60"
      >
        <option value="">Choose food</option>
        {foods.map((food) => (
          <option key={food.id} value={food.id}>
            {foodLabel(food)}
          </option>
        ))}
      </select>
      <span className="text-xs text-white/45">
        {loading ? "Loading foods..." : "Choose one food item from the library."}
      </span>
    </label>
  );
}

export default function CoachPlanWeeksPage() {
  const router = useRouter();
  const params = useParams<{ planId: string }>();

  const planId = useMemo(() => {
    const raw = params?.planId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return Number(value);
  }, [params]);

  const [token, setToken] = useState("");
  const [plan, setPlan] = useState<NutritionPlanSummary | null>(null);
  const [foods, setFoods] = useState<FoodOption[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [foodQuery, setFoodQuery] = useState("");
  const [form, setForm] = useState<WeekFormState>(emptyWeekForm());

  useEffect(() => {
    const t =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      "";
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        setLoadingPlan(true);
        setError(null);

        const data = await fetchCoachPlans(token);
        const found = data.find((p) => p.id === planId) || null;
        setPlan(found);

        if (!found) {
          throw new Error(`Plan with ID ${planId} was not found.`);
        }

        setForm(emptyWeekForm());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plan");
      } finally {
        setLoadingPlan(false);
      }
    };

    load();
  }, [token, planId]);


  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        setLoadingFoods(true);
        const data = await fetchAllFoods(token);
        setFoods(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load foods");
      } finally {
        setLoadingFoods(false);
      }
    };

    load();
  }, [token]);

  const filteredFoods = useMemo(() => {
    const q = foodQuery.trim().toLowerCase();
    if (!q) return foods;

    return foods.filter((food) => {
      const haystack = [
        food.name,
        food.category,
        food.servingSizeName,
        String(food.id),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [foods, foodQuery]);

  const payload = useMemo<CreateNutritionWeekPayload>(() => {
    return {
      weekNumber: toNumber(form.weekNumber),
      weekProtocolType: toNumber(form.weekProtocolType),
      calorieModifier: Number(form.calorieModifier || 0),
      weekDescription: form.weekDescription.trim(),
      focusNote: form.focusNote.trim(),
      progressionNote: form.progressionNote.trim(),
      nextWeekPreview: form.nextWeekPreview.trim(),
      dayProtocols: form.dayProtocols.map((day) => ({
        dayProtocolType: toNumber(day.dayProtocolType),
        weekDay: toNumber(day.weekDay),
        dayOrder: toNumber(day.dayOrder),
        linkedWorkoutSessionID: toNullableNumber(day.linkedWorkoutSessionID),
        totalCaloriesTarget: toNumber(day.totalCaloriesTarget),
        proteinTargetG: toNumber(day.proteinTargetG),
        carbTargetG: toNumber(day.carbTargetG),
        fatTargetG: toNumber(day.fatTargetG),
        protocolNotes: day.protocolNotes.trim(),
        meals: day.meals.map((meal) => ({
          name: meal.name.trim(),
          timingType: toNumber(meal.timingType),
          mealOrder: toNumber(meal.mealOrder),
          timeFromTrainingMinutes: toNumber(meal.timeFromTrainingMinutes),
          targetCalories: toNumber(meal.targetCalories),
          targetProteinG: toNumber(meal.targetProteinG),
          targetCarbG: toNumber(meal.targetCarbG),
          targetFatG: toNumber(meal.targetFatG),
          notes: meal.notes.trim(),
          foodItems: meal.foodItems.map((item) => ({
            foodItemID: toNumber(item.foodItemID),
            amountGrams: toNumber(item.amountGrams),
            isOptional: item.isOptional,
            swapGroupID: toNullableNumber(item.swapGroupID),
          })),
        })),
      })),
    };
  }, [form]);

  const updateDay = (
    index: number,
    updater: (day: DayProtocolForm) => DayProtocolForm
  ) => {
    setForm((prev) => ({
      ...prev,
      dayProtocols: prev.dayProtocols.map((day, i) =>
        i === index ? updater(day) : day
      ),
    }));
  };

  const updateMeal = (
    dayIndex: number,
    mealIndex: number,
    updater: (meal: MealForm) => MealForm
  ) => {
    setForm((prev) => ({
      ...prev,
      dayProtocols: prev.dayProtocols.map((day, i) =>
        i !== dayIndex
          ? day
          : {
              ...day,
              meals: day.meals.map((meal, j) =>
                j === mealIndex ? updater(meal) : meal
              ),
            }
      ),
    }));
  };

  const updateFoodItem = (
    dayIndex: number,
    mealIndex: number,
    itemIndex: number,
    updater: (item: FoodItemForm) => FoodItemForm
  ) => {
    setForm((prev) => ({
      ...prev,
      dayProtocols: prev.dayProtocols.map((day, i) =>
        i !== dayIndex
          ? day
          : {
              ...day,
              meals: day.meals.map((meal, j) =>
                j !== mealIndex
                  ? meal
                  : {
                      ...meal,
                      foodItems: meal.foodItems.map((item, k) =>
                        k === itemIndex ? updater(item) : item
                      ),
                    }
              ),
            }
      ),
    }));
  };

  const addDay = () => {
    setForm((prev) => ({
      ...prev,
      dayProtocols: [
        ...prev.dayProtocols,
        emptyDayProtocol(prev.dayProtocols.length + 1, foods[0]?.id ? String(foods[0].id) : ""),
      ],
    }));
  };

  const addMeal = (dayIndex: number) => {
    updateDay(dayIndex, (day) => ({
      ...day,
      meals: [...day.meals, emptyMeal(foods[0]?.id ? String(foods[0].id) : "")],
    }));
  };

  const addFoodItem = (dayIndex: number, mealIndex: number) => {
    updateMeal(dayIndex, mealIndex, (meal) => ({
      ...meal,
      foodItems: [
        ...meal.foodItems,
        emptyFoodItem(foods[0]?.id ? String(foods[0].id) : ""),
      ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      if (!token) {
        throw new Error("No auth token found. Please log in again.");
      }

      if (!plan) {
        throw new Error("Plan is not loaded.");
      }

      if (payload.dayProtocols.length === 0) {
        throw new Error("At least one day protocol is required.");
      }

      for (const day of form.dayProtocols) {
        for (const meal of day.meals) {
          for (const item of meal.foodItems) {
            if (!item.foodItemID.trim()) {
              throw new Error("Select a food for every food item.");
            }
          }
        }
      }

      const result = await createWeek(plan.id, payload, token);
      setSuccess(
        `Week created successfully${result?.id ? ` (ID: ${result.id})` : ""}.`
      );
      router.push(`/coach/plans/${planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create week");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPlan) {
    return (
      <PageShell>
        <div className="h-40 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
              Coach Nutrition Plans
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Build week graph
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
              Add a complete week in one transaction: week metadata, day protocols,
              meals, and food items. Week numbering starts at 1.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/coach/plans/${planId}`}
              className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Back to plan
            </Link>
            <button
              type="button"
              onClick={() =>
                setForm(emptyWeekForm(foods[0]?.id ? String(foods[0].id) : ""))
              }
              className="rounded-xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Reset form
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        <Panel
          title="Food library"
          subtitle="Choose food items from your own library and the global seeded foods."
        >
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <input
              value={foodQuery}
              onChange={(e) => setFoodQuery(e.target.value)}
              placeholder="Search foods by name, category, or serving..."
              className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60"
            />
            <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white/70">
              {loadingFoods
                ? "Loading foods..."
                : `${filteredFoods.length} / ${foods.length} foods`}
            </div>
          </div>
        </Panel>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-6">
          <Panel
            title="Week metadata"
            subtitle="These values go directly into CreateNutritionWeekDto."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <NumberField
                label="Week number"
                value={form.weekNumber}
                onChange={(v) => setForm((s) => ({ ...s, weekNumber: v }))}
                helper="Starts from 1."
                min={1}
              />
              <SelectField
                label="Week protocol type"
                value={form.weekProtocolType}
                onChange={(v) => setForm((s) => ({ ...s, weekProtocolType: v }))}
                options={WEEK_PROTOCOL_TYPES}
              />
              <NumberField
                label="Calorie modifier"
                value={form.calorieModifier}
                onChange={(v) => setForm((s) => ({ ...s, calorieModifier: v }))}
                step="0.01"
                helper="Example: 0.5"
              />
            </div>

            <div className="mt-4 grid gap-4">
              <TextAreaField
                label="Week description"
                value={form.weekDescription}
                onChange={(v) => setForm((s) => ({ ...s, weekDescription: v }))}
                placeholder="Short description for the week..."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TextAreaField
                  label="Focus note"
                  value={form.focusNote}
                  onChange={(v) => setForm((s) => ({ ...s, focusNote: v }))}
                  placeholder="What is the main focus this week?"
                />
                <TextAreaField
                  label="Progression note"
                  value={form.progressionNote}
                  onChange={(v) => setForm((s) => ({ ...s, progressionNote: v }))}
                  placeholder="How does this week progress?"
                />
              </div>
              <TextAreaField
                label="Next week preview"
                value={form.nextWeekPreview}
                onChange={(v) => setForm((s) => ({ ...s, nextWeekPreview: v }))}
                placeholder="Preview of next week's direction..."
              />
            </div>
          </Panel>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Day protocols</h2>
              <p className="mt-1 text-sm text-white/60">
                Each day contains meals, and each meal contains food items.
              </p>
            </div>

            <button
              type="button"
              onClick={addDay}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              + Add day
            </button>
          </div>

          <div className="grid gap-5">
            {form.dayProtocols.map((day, dayIndex) => (
              <Panel
                key={dayIndex}
                title={`Day protocol ${dayIndex + 1}`}
                subtitle="A full day protocol with targets and meals."
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SelectField
                      label="Day protocol type"
                      value={day.dayProtocolType}
                      onChange={(v) =>
                        updateDay(dayIndex, (d) => ({ ...d, dayProtocolType: v }))
                      }
                      options={DAY_PROTOCOL_TYPES}
                    />
                    <SelectField
                      label="Week day"
                      value={day.weekDay}
                      onChange={(v) =>
                        updateDay(dayIndex, (d) => ({ ...d, weekDay: v }))
                      }
                      options={WEEK_DAYS}
                      helper="Numeric enum value is sent."
                    />
                    <NumberField
                      label="Day order"
                      value={day.dayOrder}
                      onChange={(v) =>
                        updateDay(dayIndex, (d) => ({ ...d, dayOrder: v }))
                      }
                      min={1}
                    />
                    <NumberField
                      label="Linked workout session ID"
                      value={day.linkedWorkoutSessionID}
                      onChange={(v) =>
                        updateDay(dayIndex, (d) => ({
                          ...d,
                          linkedWorkoutSessionID: v,
                        }))
                      }
                      helper="Leave empty to send null."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        dayProtocols: prev.dayProtocols.filter((_, i) => i !== dayIndex),
                      }))
                    }
                    className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/25"
                  >
                    Remove day
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <NumberField
                    label="Total calories target"
                    value={day.totalCaloriesTarget}
                    onChange={(v) =>
                      updateDay(dayIndex, (d) => ({ ...d, totalCaloriesTarget: v }))
                    }
                  />
                  <NumberField
                    label="Protein target g"
                    value={day.proteinTargetG}
                    onChange={(v) =>
                      updateDay(dayIndex, (d) => ({ ...d, proteinTargetG: v }))
                    }
                  />
                  <NumberField
                    label="Carb target g"
                    value={day.carbTargetG}
                    onChange={(v) =>
                      updateDay(dayIndex, (d) => ({ ...d, carbTargetG: v }))
                    }
                  />
                  <NumberField
                    label="Fat target g"
                    value={day.fatTargetG}
                    onChange={(v) =>
                      updateDay(dayIndex, (d) => ({ ...d, fatTargetG: v }))
                    }
                  />
                </div>

                <div className="mt-4">
                  <TextAreaField
                    label="Protocol notes"
                    value={day.protocolNotes}
                    onChange={(v) =>
                      updateDay(dayIndex, (d) => ({ ...d, protocolNotes: v }))
                    }
                    placeholder="Notes for this day..."
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-white">Meals</h4>
                    <p className="mt-1 text-sm text-white/60">
                      Add one or more meals inside this day.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => addMeal(dayIndex)}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    + Add meal
                  </button>
                </div>

                <div className="mt-4 grid gap-4">
                  {day.meals.map((meal, mealIndex) => (
                    <div
                      key={mealIndex}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <TextField
                            label="Meal name"
                            value={meal.name}
                            onChange={(v) =>
                              updateMeal(dayIndex, mealIndex, (m) => ({ ...m, name: v }))
                            }
                            placeholder="Breakfast"
                            required
                          />
                          <SelectField
                            label="Timing type"
                            value={meal.timingType}
                            onChange={(v) =>
                              updateMeal(dayIndex, mealIndex, (m) => ({
                                ...m,
                                timingType: v,
                              }))
                            }
                            options={MEAL_TIMING_TYPES}
                          />
                          <NumberField
                            label="Meal order"
                            value={meal.mealOrder}
                            onChange={(v) =>
                              updateMeal(dayIndex, mealIndex, (m) => ({
                                ...m,
                                mealOrder: v,
                              }))
                            }
                            min={1}
                          />
                          <NumberField
                            label="Time from training minutes"
                            value={meal.timeFromTrainingMinutes}
                            onChange={(v) =>
                              updateMeal(dayIndex, mealIndex, (m) => ({
                                ...m,
                                timeFromTrainingMinutes: v,
                              }))
                            }
                            helper="Negative for pre-workout, positive for post-workout."
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateDay(dayIndex, (d) => ({
                              ...d,
                              meals: d.meals.filter((_, i) => i !== mealIndex),
                            }))
                          }
                          className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/25"
                        >
                          Remove meal
                        </button>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <NumberField
                          label="Target calories"
                          value={meal.targetCalories}
                          onChange={(v) =>
                            updateMeal(dayIndex, mealIndex, (m) => ({
                              ...m,
                              targetCalories: v,
                            }))
                          }
                        />
                        <NumberField
                          label="Target protein g"
                          value={meal.targetProteinG}
                          onChange={(v) =>
                            updateMeal(dayIndex, mealIndex, (m) => ({
                              ...m,
                              targetProteinG: v,
                            }))
                          }
                        />
                        <NumberField
                          label="Target carb g"
                          value={meal.targetCarbG}
                          onChange={(v) =>
                            updateMeal(dayIndex, mealIndex, (m) => ({
                              ...m,
                              targetCarbG: v,
                            }))
                          }
                        />
                        <NumberField
                          label="Target fat g"
                          value={meal.targetFatG}
                          onChange={(v) =>
                            updateMeal(dayIndex, mealIndex, (m) => ({
                              ...m,
                              targetFatG: v,
                            }))
                          }
                        />
                      </div>

                      <div className="mt-4">
                        <TextAreaField
                          label="Meal notes"
                          value={meal.notes}
                          onChange={(v) =>
                            updateMeal(dayIndex, mealIndex, (m) => ({ ...m, notes: v }))
                          }
                          placeholder="Meal notes..."
                        />
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-semibold text-white">
                            Food items
                          </h5>
                          <p className="mt-1 text-xs text-white/55">
                            Food item selection comes from your food library.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => addFoodItem(dayIndex, mealIndex)}
                          className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                        >
                          + Add food item
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {meal.foodItems.map((item, itemIndex) => {
                          const selectedFood = foods.find(
                            (f) => String(f.id) === item.foodItemID
                          );

                          return (
                            <div
                              key={itemIndex}
                              className="rounded-xl border border-white/10 bg-white/5 p-4"
                            >
                              <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr_0.8fr_0.8fr_auto]">
                                <FoodSelect
                                  label="Food"
                                  value={item.foodItemID}
                                  onChange={(v) =>
                                    updateFoodItem(dayIndex, mealIndex, itemIndex, (it) => ({
                                      ...it,
                                      foodItemID: v,
                                    }))
                                  }
                                  foods={filteredFoods}
                                  loading={loadingFoods}
                                />

                                <NumberField
                                  label="Amount grams"
                                  value={item.amountGrams}
                                  onChange={(v) =>
                                    updateFoodItem(dayIndex, mealIndex, itemIndex, (it) => ({
                                      ...it,
                                      amountGrams: v,
                                    }))
                                  }
                                />

                                <NumberField
                                  label="Swap group ID"
                                  value={item.swapGroupID}
                                  onChange={(v) =>
                                    updateFoodItem(dayIndex, mealIndex, itemIndex, (it) => ({
                                      ...it,
                                      swapGroupID: v,
                                    }))
                                  }
                                  helper="Leave empty for null."
                                />

                                <label className="flex items-end">
                                  <span className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                                    <input
                                      type="checkbox"
                                      checked={item.isOptional}
                                      onChange={(e) =>
                                        updateFoodItem(
                                          dayIndex,
                                          mealIndex,
                                          itemIndex,
                                          (it) => ({
                                            ...it,
                                            isOptional: e.target.checked,
                                          })
                                        )
                                      }
                                      className="h-4 w-4 accent-cyan-400"
                                    />
                                    <span className="text-sm font-medium text-white/80">
                                      Optional
                                    </span>
                                  </span>
                                </label>

                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateMeal(dayIndex, mealIndex, (m) => ({
                                        ...m,
                                        foodItems: m.foodItems.filter(
                                          (_, i) => i !== itemIndex
                                        ),
                                      }))
                                    }
                                    className="h-12 rounded-xl border border-red-500/30 bg-red-500/15 px-4 text-xs font-medium text-red-100 transition hover:bg-red-500/25"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>

                              {selectedFood ? (
                                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
                                  <div className="font-medium text-white">
                                    {selectedFood.name}
                                  </div>
                                  <div className="mt-1">
                                    {selectedFood.category} •{" "}
                                    {selectedFood.caloriesPer100g} kcal / 100g •{" "}
                                    {selectedFood.servingSizeName}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            ))}
          </div>

          <Panel
            title="Payload preview"
            subtitle="Useful for debugging the exact JSON sent to the backend."
          >
            <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/75">
{JSON.stringify({ dto: payload }, null, 2)}
            </pre>
          </Panel>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/coach/plans/${planId}`}
              className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating week..." : "Save week"}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}