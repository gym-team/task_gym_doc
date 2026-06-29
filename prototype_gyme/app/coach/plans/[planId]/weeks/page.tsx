"use client";
// app/coach/plans/[planId]/weeks/new/page.tsx

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Enum constants
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://fitzone-16.runasp.net";

function toInt(v: string) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

function toFloat(v: string) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function toNullableInt(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

function uniqueFoods(arr: FoodOption[]) {
  const m = new Map<number, FoodOption>();
  for (const f of arr) m.set(f.id, f);
  return [...m.values()];
}

/** Parse API error response and return human-readable message */
function parseApiError(text: string, status: number): string {
  if (!text) return `HTTP ${status}`;
  try {
    const json = JSON.parse(text);
    if (Array.isArray(json.errors) && json.errors.length > 0) {
      return json.errors.join("\n");
    }
    return json.message || json.details || json.title || text;
  } catch {
    return text;
  }
}

// ─────────────────────────────────────────────
// Default form factories
// ─────────────────────────────────────────────

function emptyFoodItem(): FoodItemForm {
  return { foodItemID: "", amountGrams: "100", isOptional: false, swapGroupID: "" };
}

function emptyMeal(order = 1): MealForm {
  return {
    name: `Meal ${order}`,
    timingType: "0",
    mealOrder: String(order),
    timeFromTrainingMinutes: "0",
    targetCalories: "0",
    targetProteinG: "0",
    targetCarbG: "0",
    targetFatG: "0",
    notes: "",
    foodItems: [emptyFoodItem()],
  };
}

function emptyDay(order = 1): DayProtocolForm {
  return {
    dayProtocolType: "0",
    weekDay: String(order - 1),
    dayOrder: String(order),
    totalCaloriesTarget: "0",
    proteinTargetG: "0",
    carbTargetG: "0",
    fatTargetG: "0",
    protocolNotes: "",
    meals: [emptyMeal(1)],
  };
}

function emptyWeek(): WeekFormState {
  return {
    weekNumber: "1",
    weekProtocolType: "0",
    calorieModifier: "0.5",
    weekDescription: "",
    focusNote: "",
    progressionNote: "",
    nextWeekPreview: "",
    dayProtocols: [emptyDay(1)],
  };
}

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────

async function fetchCoachPlans(token: string) {
  const res = await fetch(`${API_URL}/api/nutritionplan/coach`, {
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return (await res.json()) as NutritionPlanSummary[];
}

async function fetchAllFoods(token: string) {
  const pageSize = 100;
  let page = 1;
  let total = Infinity;
  const all: FoodOption[] = [];
  while (all.length < total) {
    const url = new URL(`${API_URL}/api/fooditem`);
    url.searchParams.set("pageIndex", String(page));
    url.searchParams.set("pageSize", String(pageSize));
    const res = await fetch(url.toString(), {
      headers: { accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    const json = (await res.json()) as PaginatedFoodResponse;
    total = json.totalCount ?? 0;
    all.push(...(json.data ?? []));
    if (!json.data?.length) break;
    page += 1;
    if (page > 20) break;
  }
  return uniqueFoods(all);
}

async function createWeek(planId: number, body: object, token: string) {
  const res = await fetch(`${API_URL}/api/nutritionplan/${planId}/weeks`, {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(parseApiError(text, res.status));
  }

  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────
// Atmosphere — Hero glow / grid / scan line
// (FitZone Design System §Hero Effects)
// ─────────────────────────────────────────────

function HeroAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
      {/* Black overlay over background */}
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.70)]" />

      {/* Neon gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(132,255,0,0.14), rgba(0,0,0,0.18), #050505)",
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full"
        style={{ background: "rgba(132,255,0,0.20)", filter: "blur(120px)" }}
      />
      <div
        className="absolute -bottom-32 -right-16 h-[420px] w-[420px] rounded-full"
        style={{ background: "rgba(132,255,0,0.12)", filter: "blur(130px)" }}
      />

      {/* Animated grid */}
      <div
        className="absolute inset-0 [animation:grid-drift_18s_linear_infinite]"
        style={{
          opacity: 0.05,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      {/* Scan line */}
      <div className="absolute inset-x-0 top-0 h-px w-full [animation:scan-line_6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#84FF00]/70 to-transparent" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Reusable form components — FitZone tokens
// ─────────────────────────────────────────────

function Field({
  label,
  children,
  required,
  accent = "lime",
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  accent?: "lime" | "cyan" | "orange";
}) {
  const accentColor =
    accent === "cyan" ? "text-[#00D9FF]" : accent === "orange" ? "text-[#FF6B00]" : "text-[#84FF00]";
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-white/55">
        {label}
        {required && <span className={`ml-1 ${accentColor}`}>*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#84FF00]/60 focus:shadow-[0_0_0_3px_rgba(132,255,0,0.12)]";
const selectCls =
  "h-11 rounded-xl border border-white/10 bg-[#0a0a0a] px-3 text-sm text-white outline-none transition focus:border-[#84FF00]/60 focus:shadow-[0_0_0_3px_rgba(132,255,0,0.12)]";
const textareaCls =
  "rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#84FF00]/60 focus:shadow-[0_0_0_3px_rgba(132,255,0,0.12)]";

function TF({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
    />
  );
}

function NF({
  value,
  onChange,
  step,
  helper,
}: {
  value: string;
  onChange: (v: string) => void;
  step?: string;
  helper?: string;
}) {
  return (
    <>
      <input
        type="number"
        step={step ?? "1"}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {helper && <span className="text-xs text-white/40">{helper}</span>}
    </>
  );
}

function SF({
  value,
  onChange,
  options,
  helper,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: number; label: string }[];
  helper?: string;
}) {
  return (
    <>
      <select className={selectCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {helper && <span className="text-xs text-white/40">{helper}</span>}
    </>
  );
}

function TA({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      rows={3}
      className={textareaCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

// Error display — orange accent per "Warnings" spec
function ErrorBox({ message }: { message: string }) {
  const lines = message.split("\n").filter(Boolean);
  return (
    <div
      className="rounded-2xl border p-4 text-sm text-orange-100 [animation:fade-up_400ms_ease-out]"
      style={{
        borderColor: "rgba(255,107,0,0.30)",
        background:
          "linear-gradient(to bottom, rgba(255,107,0,0.12), rgba(255,107,0,0.04))",
      }}
    >
      <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        Couldn&apos;t save the week
      </div>
      {lines.length > 1 ? (
        <ul className="list-disc space-y-1 pl-4">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}

// Food dropdown with inline search
function FoodSelect({
  value,
  onChange,
  foods,
}: {
  value: string;
  onChange: (v: string) => void;
  foods: FoodOption[];
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((f) =>
      [f.name, f.category, f.servingSizeName, String(f.id)].join(" ").toLowerCase().includes(q)
    );
  }, [foods, query]);

  const selected = foods.find((f) => String(f.id) === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${selectCls} flex w-full items-center justify-between`}
      >
        <span className={selected ? "text-white" : "text-white/30"}>
          {selected ? `${selected.name} (${selected.category})` : "— Select food —"}
        </span>
        <svg className="h-4 w-4 text-[#84FF00]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60">
          <div className="p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search food…"
              className="h-9 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#84FF00]/60"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            <li>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-white/40 hover:bg-white/5"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                  setQuery("");
                }}
              >
                — Select food —
              </button>
            </li>
            {filtered.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-white/5 ${
                    String(f.id) === value ? "bg-[#84FF00]/10 text-[#84FF00]" : "text-white"
                  }`}
                  onClick={() => {
                    onChange(String(f.id));
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="font-medium">{f.name}</span>
                  <span className="ml-2 text-white/40">
                    {f.category} · {f.caloriesPer100g}kcal/100g
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-center text-sm text-white/30">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// Statistics chip — used in hero (FitZone §Statistics Components)
function StatChip({ value, label, accent = "lime" }: { value: string; label: string; accent?: "lime" | "cyan" | "orange" }) {
  const color = accent === "cyan" ? "#00D9FF" : accent === "orange" ? "#FF6B00" : "#84FF00";
  return (
    <div
      className="rounded-2xl border px-5 py-3 backdrop-blur-sm"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)" }}
    >
      <div className="text-2xl font-black tracking-tight" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-white/70">{label}</div>
    </div>
  );
}

// Section header (FitZone heading style: uppercase, 900 weight, white + lime highlight)
function SectionHeader({
  eyebrow,
  title,
  highlight,
  subtitle,
  accent = "lime",
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  accent?: "lime" | "cyan" | "orange";
}) {
  const color = accent === "cyan" ? "#00D9FF" : accent === "orange" ? "#FF6B00" : "#84FF00";
  return (
    <div className="[animation:fade-up_500ms_ease-out]">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color }}>
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
        {title} {highlight && <span style={{ color }}>{highlight}</span>}
      </h2>
      {subtitle && <p className="mt-1.5 text-sm text-white/75">{subtitle}</p>}
    </div>
  );
}

// Glass card wrapper (FitZone §Cards Style)
function GlassCard({
  children,
  className = "",
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <section
      className={`rounded-[24px] border p-5 [animation:fade-up_500ms_ease-out] ${
        hover ? "transition duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(132,255,0,0.25)]" : ""
      } ${className}`}
      style={{
        borderColor: "rgba(255,255,255,0.10)",
        background: "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
      }}
    >
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function CreateWeekPage() {
  const router = useRouter();
  const params = useParams<{ planId: string }>();
  const planId = useMemo(
    () => Number(Array.isArray(params?.planId) ? params.planId[0] : params?.planId),
    [params]
  );

  const [token, setToken] = useState("");
  const [plan, setPlan] = useState<NutritionPlanSummary | null>(null);
  const [foods, setFoods] = useState<FoodOption[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<WeekFormState>(emptyWeek());

  useEffect(() => {
    const t = localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchCoachPlans(token)
      .then((data) => {
        const found = data.find((p) => p.id === planId) ?? null;
        setPlan(found);
        if (!found) setError(`Plan #${planId} not found.`);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingPlan(false));
  }, [token, planId]);

  useEffect(() => {
    if (!token) return;
    fetchAllFoods(token)
      .then(setFoods)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingFoods(false));
  }, [token]);

  // ── Build payload ──────────────────────────
  const payload = useMemo(
    () => ({
      weekNumber: toInt(form.weekNumber),
      weekProtocolType: toInt(form.weekProtocolType),
      calorieModifier: toFloat(form.calorieModifier),
      weekDescription: form.weekDescription.trim(),
      focusNote: form.focusNote.trim(),
      progressionNote: form.progressionNote.trim(),
      nextWeekPreview: form.nextWeekPreview.trim(),
      dayProtocols: form.dayProtocols.map((day) => ({
        dayProtocolType: toInt(day.dayProtocolType),
        weekDay: toInt(day.weekDay),
        dayOrder: toInt(day.dayOrder),
        linkedWorkoutSessionID: null, // always null
        totalCaloriesTarget: toFloat(day.totalCaloriesTarget),
        proteinTargetG: toFloat(day.proteinTargetG),
        carbTargetG: toFloat(day.carbTargetG),
        fatTargetG: toFloat(day.fatTargetG),
        protocolNotes: day.protocolNotes.trim(),
        meals: day.meals.map((meal) => ({
          name: meal.name.trim(),
          timingType: toInt(meal.timingType),
          mealOrder: toInt(meal.mealOrder),
          timeFromTrainingMinutes: toInt(meal.timeFromTrainingMinutes),
          targetCalories: toFloat(meal.targetCalories),
          targetProteinG: toFloat(meal.targetProteinG),
          targetCarbG: toFloat(meal.targetCarbG),
          targetFatG: toFloat(meal.targetFatG),
          notes: meal.notes.trim(),
          foodItems: meal.foodItems.map((item) => ({
            foodItemID: toInt(item.foodItemID),
            amountGrams: toFloat(item.amountGrams),
            isOptional: item.isOptional,
            swapGroupID: toNullableInt(item.swapGroupID),
          })),
        })),
      })),
    }),
    [form]
  );

  // ── Form updaters ──────────────────────────

  const updateDay = (i: number, fn: (d: DayProtocolForm) => DayProtocolForm) =>
    setForm((s) => ({ ...s, dayProtocols: s.dayProtocols.map((d, idx) => (idx === i ? fn(d) : d)) }));

  const updateMeal = (di: number, mi: number, fn: (m: MealForm) => MealForm) =>
    updateDay(di, (d) => ({ ...d, meals: d.meals.map((m, idx) => (idx === mi ? fn(m) : m)) }));

  const updateFood = (di: number, mi: number, fi: number, fn: (f: FoodItemForm) => FoodItemForm) =>
    updateMeal(di, mi, (m) => ({ ...m, foodItems: m.foodItems.map((f, idx) => (idx === fi ? fn(f) : f)) }));

  const addDay = () =>
    setForm((s) => ({ ...s, dayProtocols: [...s.dayProtocols, emptyDay(s.dayProtocols.length + 1)] }));

  const removeDay = (i: number) =>
    setForm((s) => ({ ...s, dayProtocols: s.dayProtocols.filter((_, idx) => idx !== i) }));

  const addMeal = (di: number) =>
    updateDay(di, (d) => ({ ...d, meals: [...d.meals, emptyMeal(d.meals.length + 1)] }));

  const removeMeal = (di: number, mi: number) =>
    updateDay(di, (d) => ({ ...d, meals: d.meals.filter((_, i) => i !== mi) }));

  const addFood = (di: number, mi: number) =>
    updateMeal(di, mi, (m) => ({ ...m, foodItems: [...m.foodItems, emptyFoodItem()] }));

  const removeFood = (di: number, mi: number, fi: number) =>
    updateMeal(di, mi, (m) => ({ ...m, foodItems: m.foodItems.filter((_, i) => i !== fi) }));

  // ── Submit ─────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      if (!token) throw new Error("No auth token. Please log in.");
      if (!plan) throw new Error("Plan not loaded.");
      if (!payload.dayProtocols.length) throw new Error("Add at least one day protocol.");
      for (const day of form.dayProtocols)
        for (const meal of day.meals)
          for (const item of meal.foodItems)
            if (!item.foodItemID.trim()) throw new Error("Select a food for every food item.");

      const result = await createWeek(plan.id, payload, token);
      setSuccess(`Week created successfully${result?.id ? ` (ID: ${result.id})` : ""}.`);
      router.push(`/coach/plans/${planId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create week");
    } finally {
      setSubmitting(false);
    }
  };

  const totalMeals = form.dayProtocols.reduce((acc, d) => acc + d.meals.length, 0);
  const totalFoodItems = form.dayProtocols.reduce(
    (acc, d) => acc + d.meals.reduce((a, m) => a + m.foodItems.length, 0),
    0
  );

  if (loadingPlan) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="h-48 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Ambient brand gradient backdrop — lime / cyan / orange glows over the dark base */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(132,255,0,0.10) 0%, rgba(5,5,5,0) 28%, rgba(5,5,5,0) 55%, rgba(0,217,255,0.07) 78%, rgba(255,107,0,0.08) 100%)",
          }}
        />
        <div
          className="absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full"
          style={{ background: "rgba(132,255,0,0.10)", filter: "blur(160px)" }}
        />
        <div
          className="absolute right-0 top-1/3 h-[500px] w-[500px] translate-x-1/3 rounded-full"
          style={{ background: "rgba(0,217,255,0.08)", filter: "blur(160px)" }}
        />
        <div
          className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/4 rounded-full"
          style={{ background: "rgba(255,107,0,0.07)", filter: "blur(160px)" }}
        />
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes grid-drift { from { background-position: 0 0; } to { background-position: 42px 42px; } }
        @keyframes scan-line { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
      `}</style>

      <div className="relative z-0 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Hero ── */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0A] p-8 sm:p-10">
          <HeroAtmosphere />
          <div className="relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="[animation:fade-up_500ms_ease-out]">
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em]"
                  style={{ borderColor: "rgba(0,217,255,0.35)", color: "#00D9FF", background: "rgba(0,217,255,0.08)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00D9FF]" />
                  Coach · Nutrition Plans
                </span>
                <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-5xl">
                  Add <span className="text-[#84FF00]">Week</span>
                </h1>
                <p className="mt-3 max-w-xl text-sm text-white/75 sm:text-base">
                  {plan?.name ?? `Plan #${planId}`} — build a complete week with day protocols, meals, and food
                  items.
                </p>
              </div>
              <div className="flex gap-3 [animation:fade-up_600ms_ease-out]">
                <Link
                  href={`/coach/plans/${planId}`}
                  className="flex h-11 items-center rounded-xl border px-5 text-sm font-semibold text-[#84FF00] transition hover:bg-[#84FF00] hover:text-black"
                  style={{ borderColor: "#84FF00" }}
                >
                  ← Back
                </Link>
                <button
                  type="button"
                  onClick={() => setForm(emptyWeek())}
                  className="flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Stat chips */}
            <div className="mt-8 flex flex-wrap gap-4 [animation:fade-up_700ms_ease-out]">
              <StatChip value={String(form.dayProtocols.length)} label="Day Protocols" accent="lime" />
              <StatChip value={String(totalMeals)} label="Meals Planned" accent="cyan" />
              <StatChip value={String(totalFoodItems)} label="Food Items" accent="orange" />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6">
          {error && <ErrorBox message={error} />}
          {success && (
            <div
              className="rounded-2xl border p-4 text-sm text-[#d4ffb0] [animation:fade-up_400ms_ease-out]"
              style={{
                borderColor: "rgba(132,255,0,0.30)",
                background: "linear-gradient(to bottom, rgba(132,255,0,0.12), rgba(132,255,0,0.03))",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* ── Week Metadata ── */}
            <GlassCard>
              <SectionHeader eyebrow="Step 01" title="Week" highlight="Metadata" accent="lime" />

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Field label="Week Number" required>
                  <NF value={form.weekNumber} onChange={(v) => setForm((s) => ({ ...s, weekNumber: v }))} helper="Starts from 1" />
                </Field>
                <Field label="Protocol Type">
                  <SF
                    value={form.weekProtocolType}
                    onChange={(v) => setForm((s) => ({ ...s, weekProtocolType: v }))}
                    options={WEEK_PROTOCOL_TYPES}
                  />
                </Field>
                <Field label="Calorie Modifier">
                  <NF
                    value={form.calorieModifier}
                    onChange={(v) => setForm((s) => ({ ...s, calorieModifier: v }))}
                    step="0.01"
                    helper="e.g. 0.5"
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-4">
                <Field label="Week Description">
                  <TA
                    value={form.weekDescription}
                    onChange={(v) => setForm((s) => ({ ...s, weekDescription: v }))}
                    placeholder="Short description…"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Focus Note">
                    <TA value={form.focusNote} onChange={(v) => setForm((s) => ({ ...s, focusNote: v }))} placeholder="Main focus this week…" />
                  </Field>
                  <Field label="Progression Note">
                    <TA
                      value={form.progressionNote}
                      onChange={(v) => setForm((s) => ({ ...s, progressionNote: v }))}
                      placeholder="How does this week progress…"
                    />
                  </Field>
                </div>
                <Field label="Next Week Preview">
                  <TA
                    value={form.nextWeekPreview}
                    onChange={(v) => setForm((s) => ({ ...s, nextWeekPreview: v }))}
                    placeholder="Preview of next week…"
                  />
                </Field>
              </div>
            </GlassCard>

            {/* ── Day Protocols ── */}
            <div className="flex items-center justify-between [animation:fade-up_500ms_ease-out]">
              <SectionHeader eyebrow="Step 02" title="Day" highlight="Protocols" subtitle="Each day → meals → food items." accent="cyan" />
              <button
                type="button"
                onClick={addDay}
                className="h-11 shrink-0 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
              >
                + Add Day
              </button>
            </div>

            {form.dayProtocols.map((day, di) => (
              <GlassCard key={di} hover>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-black uppercase tracking-tight text-white">
                    Day <span className="text-[#84FF00]">{di + 1}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeDay(di)}
                    className="rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition hover:bg-[#FF6B00] hover:text-black"
                    style={{ borderColor: "#FF6B00", color: "#FF6B00" }}
                  >
                    Remove Day
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Protocol Type">
                    <SF value={day.dayProtocolType} onChange={(v) => updateDay(di, (d) => ({ ...d, dayProtocolType: v }))} options={DAY_PROTOCOL_TYPES} />
                  </Field>
                  <Field label="Week Day">
                    <SF value={day.weekDay} onChange={(v) => updateDay(di, (d) => ({ ...d, weekDay: v }))} options={WEEK_DAYS} />
                  </Field>
                  <Field label="Day Order">
                    <NF value={day.dayOrder} onChange={(v) => updateDay(di, (d) => ({ ...d, dayOrder: v }))} />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Total Calories (kcal)">
                    <NF value={day.totalCaloriesTarget} onChange={(v) => updateDay(di, (d) => ({ ...d, totalCaloriesTarget: v }))} />
                  </Field>
                  <Field label="Protein (g)">
                    <NF value={day.proteinTargetG} onChange={(v) => updateDay(di, (d) => ({ ...d, proteinTargetG: v }))} />
                  </Field>
                  <Field label="Carbs (g)">
                    <NF value={day.carbTargetG} onChange={(v) => updateDay(di, (d) => ({ ...d, carbTargetG: v }))} />
                  </Field>
                  <Field label="Fat (g)">
                    <NF value={day.fatTargetG} onChange={(v) => updateDay(di, (d) => ({ ...d, fatTargetG: v }))} />
                  </Field>
                </div>

                <div className="mt-4">
                  <Field label="Protocol Notes">
                    <TA value={day.protocolNotes} onChange={(v) => updateDay(di, (d) => ({ ...d, protocolNotes: v }))} placeholder="Notes for this day…" />
                  </Field>
                </div>

                {/* ── Meals ── */}
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00D9FF]">Meals</h4>
                  <button
                    type="button"
                    onClick={() => addMeal(di)}
                    className="rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition hover:bg-[#00D9FF] hover:text-black"
                    style={{ borderColor: "#00D9FF", color: "#00D9FF" }}
                  >
                    + Add Meal
                  </button>
                </div>

                <div className="mt-3 grid gap-4">
                  {day.meals.map((meal, mi) => (
                    <div
                      key={mi}
                      className="rounded-2xl border p-4"
                      style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.25)" }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-bold uppercase tracking-wide text-white/80">Meal {mi + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeMeal(di, mi)}
                          className="rounded-lg border px-3 py-1 text-xs font-medium transition hover:bg-[#FF6B00] hover:text-black"
                          style={{ borderColor: "rgba(255,107,0,0.4)", color: "#FF6B00" }}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="Meal Name" required>
                          <TF value={meal.name} onChange={(v) => updateMeal(di, mi, (m) => ({ ...m, name: v }))} placeholder="Breakfast" required />
                        </Field>
                        <Field label="Timing Type">
                          <SF value={meal.timingType} onChange={(v) => updateMeal(di, mi, (m) => ({ ...m, timingType: v }))} options={MEAL_TIMING_TYPES} />
                        </Field>
                        <Field label="Meal Order">
                          <NF value={meal.mealOrder} onChange={(v) => updateMeal(di, mi, (m) => ({ ...m, mealOrder: v }))} />
                        </Field>
                        <Field label="Time From Training (min)">
                          <NF
                            value={meal.timeFromTrainingMinutes}
                            onChange={(v) => updateMeal(di, mi, (m) => ({ ...m, timeFromTrainingMinutes: v }))}
                            helper="Negative = pre, positive = post"
                          />
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="Target Calories">
                          <NF value={meal.targetCalories} onChange={(v) => updateMeal(di, mi, (m) => ({ ...m, targetCalories: v }))} />
                        </Field>
                        <Field label="Protein (g)">
                          <NF value={meal.targetProteinG} onChange={(v) => updateMeal(di, mi, (m) => ({ ...m, targetProteinG: v }))} />
                        </Field>
                        <Field label="Carbs (g)">
                          <NF value={meal.targetCarbG} onChange={(v) => updateMeal(di, mi, (m) => ({ ...m, targetCarbG: v }))} />
                        </Field>
                        <Field label="Fat (g)">
                          <NF value={meal.targetFatG} onChange={(v) => updateMeal(di, mi, (m) => ({ ...m, targetFatG: v }))} />
                        </Field>
                      </div>

                      <div className="mt-4">
                        <Field label="Meal Notes">
                          <TA value={meal.notes} onChange={(v) => updateMeal(di, mi, (m) => ({ ...m, notes: v }))} placeholder="Notes…" />
                        </Field>
                      </div>

                      {/* ── Food Items ── */}
                      <div className="mt-5 flex items-center justify-between">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                          Food Items
                          {loadingFoods && <span className="ml-2 text-white/30">(Loading foods…)</span>}
                        </h5>
                        <button
                          type="button"
                          onClick={() => addFood(di, mi)}
                          className="rounded-lg border px-3 py-1 text-xs font-bold transition hover:bg-[#FF6B00] hover:text-black"
                          style={{ borderColor: "rgba(255,107,0,0.4)", color: "#FF6B00" }}
                        >
                          + Add Food
                        </button>
                      </div>

                      <div className="mt-3 grid gap-3">
                        {meal.foodItems.map((item, fi) => {
                          const selected = foods.find((f) => String(f.id) === item.foodItemID);
                          return (
                            <div
                              key={fi}
                              className="rounded-xl border p-3"
                              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                            >
                              <div className="grid gap-3 sm:grid-cols-[1fr_100px_100px_auto_auto]">
                                <Field label="Food">
                                  <FoodSelect
                                    value={item.foodItemID}
                                    onChange={(v) => updateFood(di, mi, fi, (it) => ({ ...it, foodItemID: v }))}
                                    foods={foods}
                                  />
                                </Field>

                                <Field label="Amount (g)">
                                  <input
                                    type="number"
                                    className={inputCls}
                                    value={item.amountGrams}
                                    onChange={(e) => updateFood(di, mi, fi, (it) => ({ ...it, amountGrams: e.target.value }))}
                                  />
                                </Field>

                                <Field label="Swap Group ID">
                                  <input
                                    type="number"
                                    className={inputCls}
                                    value={item.swapGroupID}
                                    onChange={(e) => updateFood(di, mi, fi, (it) => ({ ...it, swapGroupID: e.target.value }))}
                                    placeholder="null"
                                  />
                                </Field>

                                <Field label="Optional">
                                  <div className="flex h-11 items-center">
                                    <input
                                      type="checkbox"
                                      checked={item.isOptional}
                                      onChange={(e) => updateFood(di, mi, fi, (it) => ({ ...it, isOptional: e.target.checked }))}
                                      className="h-4 w-4 accent-[#84FF00]"
                                    />
                                  </div>
                                </Field>

                                <Field label=" ">
                                  <button
                                    type="button"
                                    onClick={() => removeFood(di, mi, fi)}
                                    className="h-11 rounded-xl border px-3 text-xs font-medium transition hover:bg-[#FF6B00] hover:text-black"
                                    style={{ borderColor: "rgba(255,107,0,0.4)", color: "#FF6B00" }}
                                  >
                                    ✕
                                  </button>
                                </Field>
                              </div>

                              {selected && (
                                <div
                                  className="mt-2 rounded-lg border px-3 py-2 text-xs text-white/65"
                                  style={{ borderColor: "rgba(132,255,0,0.18)", background: "rgba(132,255,0,0.05)" }}
                                >
                                  <span className="font-semibold text-[#84FF00]">{selected.name}</span>
                                  {" · "}
                                  {selected.category}
                                  {" · "}
                                  {selected.caloriesPer100g} kcal · P{selected.proteinPer100g} C{selected.carbPer100g} F
                                  {selected.fatPer100g} per 100g
                                  {" · "}
                                  {selected.servingSizeName}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}

            {/* Actions */}
            <div className="flex justify-end gap-3 [animation:fade-up_500ms_ease-out]">
              <Link
                href={`/coach/plans/${planId}`}
                className="flex h-12 items-center rounded-xl border px-6 text-sm font-semibold text-[#84FF00] transition hover:bg-[#84FF00] hover:text-black"
                style={{ borderColor: "#84FF00" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 items-center rounded-xl bg-white px-7 text-sm font-bold text-black transition hover:bg-[#84FF00] disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Save Week"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}