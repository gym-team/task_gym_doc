"use client";

// app/coach/plans/[planId]/weeks/[weekId]/page.tsx

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type FoodCatalogItem = {
  id: number;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
  servingSizeG: number | null;
  servingSizeName: string | null;
  isGlobal: boolean;
};

type FoodItemAssignment = {
  id: number;
  foodItemID: number;
  foodName: string;
  category?: string | null;
  amountGrams: number;
  isOptional: boolean;
  swapGroupID: number | null;
  macroCalories?: number | null;
  macroProteinG?: number | null;
  macroCarbG?: number | null;
  macroFatG?: number | null;
};

type Meal = {
  id: number;
  name: string;
  timingType: number | string;
  mealOrder: number;
  timeFromTrainingMinutes: number | null;
  targetCalories: number;
  targetProteinG: number;
  targetCarbG: number;
  targetFatG: number;
  notes: string | null;
  foodItems?: FoodItemAssignment[];
  foodAssignments?: FoodItemAssignment[];
};

type DayProtocol = {
  id: number;
  dayProtocolType: number | string;
  weekDay: number | string;
  dayOrder: number;
  linkedWorkoutSessionID: number | null;
  totalCaloriesTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  protocolNotes: string | null;
  meals: Meal[];
};

type WeekDetail = {
  id: number;
  nutritionPlanID: number;
  weekNumber: number;
  weekProtocolType: number | string;
  calorieModifier: number;
  weekDescription: string | null;
  focusNote: string | null;
  progressionNote: string | null;
  nextWeekPreview: string | null;
  dayProtocols: DayProtocol[];
};

type PaginatedResponse<T> = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
};

// ─────────────────────────────────────────────
// Enums
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
  { value: 0, label: "Saturday" },
  { value: 1, label: "Sunday" },
  { value: 2, label: "Monday" },
  { value: 3, label: "Tuesday" },
  { value: 4, label: "Wednesday" },
  { value: 5, label: "Thursday" },
  { value: 6, label: "Friday" },
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "").replace(/_/g, "");
}

function enumValueFromLabel(options: { value: number; label: string }[], raw: number | string | null | undefined) {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && raw.trim()) {
    const found = options.find((o) => normalizeText(o.label) === normalizeText(raw));
    if (found) return found.value;
  }
  return options[0]?.value ?? 0;
}

function labelOf(options: { value: number; label: string }[], v: number | string | null | undefined) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return options.find((o) => o.value === v)?.label ?? String(v);
}

function formatMinutes(value: number | null) {
  if (value == null) return "";
  if (value === 0) return "0 min";
  return `${value > 0 ? "+" : ""}${value} min`;
}

function getMealFoods(meal: Meal) {
  return meal.foodItems ?? meal.foodAssignments ?? [];
}

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://fitzone-16.runasp.net";

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function safeFetch<T>(url: string, token: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.");
  }

  const text = await res.text();

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    if (text) {
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json.errors) && json.errors.length > 0) {
          message = json.errors.join("\n");
        } else {
          message = json.message || json.details || json.title || text;
        }
      } catch {
        message = text;
      }
    }
    if (res.status === 401) message = "Session expired. Sign in again to continue.";
    throw new ApiError(message, res.status);
  }

  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

async function fetchWeekDetail(weekId: number, token: string): Promise<WeekDetail> {
  return safeFetch<WeekDetail>(`${API_URL}/api/NutritionPlan/weeks/${weekId}`, token);
}

async function updateWeek(weekId: number, body: object, token: string) {
  return safeFetch(`${API_URL}/api/NutritionPlan/weeks/${weekId}`, token, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function deleteWeekProtocol(protocolId: number, token: string) {
  return safeFetch(`${API_URL}/api/NutritionPlan/protocols/${protocolId}`, token, {
    method: "DELETE",
  });
}

async function updateDayProtocol(protocolId: number, body: object, token: string) {
  return safeFetch(`${API_URL}/api/NutritionPlan/protocols/${protocolId}`, token, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function updateMeal(mealId: number, body: object, token: string) {
  return safeFetch(`${API_URL}/api/NutritionPlan/meals/${mealId}`, token, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function deleteMeal(mealId: number, token: string) {
  return safeFetch(`${API_URL}/api/NutritionPlan/meals/${mealId}`, token, {
    method: "DELETE",
  });
}

async function addFoodToMeal(mealId: number, body: object, token: string) {
  return safeFetch(`${API_URL}/api/NutritionPlan/meals/${mealId}/foods`, token, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function updateFoodAssignment(foodAssignmentId: number, body: object, token: string) {
  return safeFetch(`${API_URL}/api/NutritionPlan/foodassignments/${foodAssignmentId}`, token, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function deleteFoodAssignment(foodAssignmentId: number, token: string) {
  return safeFetch(`${API_URL}/api/NutritionPlan/foodassignments/${foodAssignmentId}`, token, {
    method: "DELETE",
  });
}

async function fetchFoodCatalog(token: string): Promise<FoodCatalogItem[]> {
  const result = await safeFetch<PaginatedResponse<FoodCatalogItem>>(
    `${API_URL}/api/FoodItem?pageIndex=1&pageSize=500`,
    token
  );
  return result.data ?? [];
}

// ─────────────────────────────────────────────
// Toast (lightweight, in-memory feedback)
// ─────────────────────────────────────────────

type ToastKind = "success" | "error";
type ToastMsg = { id: number; kind: ToastKind; text: string };

let toastSeq = 0;

function useToasts() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const push = useCallback((kind: ToastKind, text: string) => {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, kind, text }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return { toasts, push, dismiss };
}

function ToastStack({ toasts, dismiss }: { toasts: ToastMsg[]; dismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-md transition ${
            t.kind === "success"
              ? "border-[#84FF00]/30 bg-[#84FF00]/10 text-[#84FF00]"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <span className="flex-1">{t.text}</span>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
            className="text-current/60 hover:text-current"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared UI (FitZone design system)
// ─────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${color}`}
    >
      {label}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-white/45">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "h-11 rounded-xl border border-white/10 bg-black/40 px-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#84FF00]/60 focus:ring-2 focus:ring-[#84FF00]/15";
const textareaCls =
  "rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#84FF00]/60 focus:ring-2 focus:ring-[#84FF00]/15";
const selectCls =
  "h-11 rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 text-sm text-white outline-none transition focus:border-[#84FF00]/60 focus:ring-2 focus:ring-[#84FF00]/15";

function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-black transition duration-200 hover:bg-[#84FF00] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-11 rounded-xl border border-[#84FF00] bg-transparent px-5 text-sm font-semibold text-[#84FF00] transition duration-200 hover:bg-[#84FF00] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-xs font-semibold text-white/65 transition duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function DangerButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-9 rounded-lg border border-[#FF6B00]/30 bg-[#FF6B00]/[0.08] px-3.5 text-xs font-semibold text-[#FF6B00] transition duration-200 hover:border-[#FF6B00]/50 hover:bg-[#FF6B00]/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Glass statistic chip — calories / protein / carbs / fat. Reused everywhere macros appear. */
function MacroStat({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">{label}</span>
      <span className="text-sm font-extrabold text-[#84FF00]">
        {value}
        {unit ? <span className="ml-0.5 text-[11px] font-semibold text-white/50">{unit}</span> : null}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/35">{children}</p>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#FF6B00]/25 bg-[#FF6B00]/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#FF6B00]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="h-9 shrink-0 rounded-lg border border-[#FF6B00]/40 bg-[#FF6B00]/10 px-4 text-xs font-bold uppercase tracking-wide text-[#FF6B00] transition hover:bg-[#FF6B00]/20"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 shadow-2xl"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        {/* subtle top glow consistent with hero pattern */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 opacity-60"
          style={{ background: "radial-gradient(closest-side, rgba(132,255,0,0.10), transparent)" }}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  title,
  description,
  confirmLabel = "Delete",
  loading,
  error,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-xl font-black uppercase tracking-tight text-white">{title}</h2>
      <p className="mt-2 text-sm text-white/55">{description}</p>
      {error && (
        <div className="mt-4 rounded-xl border border-[#FF6B00]/25 bg-[#FF6B00]/10 p-3 text-sm text-[#FF6B00]">
          {error}
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="h-9 rounded-lg bg-[#FF6B00] px-4 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-[#ff7d1f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─────────────────────────────────────────────
// Modals
// ─────────────────────────────────────────────

function EditWeekModal({
  week,
  token,
  onClose,
  onSaved,
}: {
  week: WeekDetail;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const protocolVal = enumValueFromLabel(WEEK_PROTOCOL_TYPES, week.weekProtocolType);

  const [form, setForm] = useState({
    weekProtocolType: protocolVal,
    calorieModifier: String(week.calorieModifier),
    weekDescription: week.weekDescription ?? "",
    focusNote: week.focusNote ?? "",
    progressionNote: week.progressionNote ?? "",
    nextWeekPreview: week.nextWeekPreview ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateWeek(
        week.id,
        {
          weekProtocolType: form.weekProtocolType,
          calorieModifier: Number(form.calorieModifier) || 0,
          weekDescription: form.weekDescription.trim(),
          focusNote: form.focusNote.trim(),
          progressionNote: form.progressionNote.trim(),
          nextWeekPreview: form.nextWeekPreview.trim(),
        },
        token
      );
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save week");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="mb-5 text-xl font-black uppercase tracking-tight text-white">
        Edit Week {week.weekNumber}
      </h2>
      <div className="grid gap-4">
        <Field label="Protocol Type">
          <select
            className={selectCls}
            value={form.weekProtocolType}
            onChange={(e) =>
              setForm((s) => ({ ...s, weekProtocolType: Number(e.target.value) }))
            }
          >
            {WEEK_PROTOCOL_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Calorie Modifier">
          <input
            type="number"
            step="0.01"
            className={inputCls}
            value={form.calorieModifier}
            onChange={(e) => setForm((s) => ({ ...s, calorieModifier: e.target.value }))}
          />
        </Field>
        <Field label="Week Description">
          <textarea
            rows={3}
            className={textareaCls}
            value={form.weekDescription}
            onChange={(e) => setForm((s) => ({ ...s, weekDescription: e.target.value }))}
            placeholder="Short description…"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Focus Note">
            <textarea
              rows={3}
              className={textareaCls}
              value={form.focusNote}
              onChange={(e) => setForm((s) => ({ ...s, focusNote: e.target.value }))}
              placeholder="Main focus this week…"
            />
          </Field>
          <Field label="Progression Note">
            <textarea
              rows={3}
              className={textareaCls}
              value={form.progressionNote}
              onChange={(e) => setForm((s) => ({ ...s, progressionNote: e.target.value }))}
              placeholder="How this week progresses…"
            />
          </Field>
        </div>
        <Field label="Next Week Preview">
          <textarea
            rows={3}
            className={textareaCls}
            value={form.nextWeekPreview}
            onChange={(e) => setForm((s) => ({ ...s, nextWeekPreview: e.target.value }))}
            placeholder="Preview of next week…"
          />
        </Field>
      </div>
      {error && (
        <div className="mt-4 rounded-xl border border-[#FF6B00]/25 bg-[#FF6B00]/10 p-3 text-sm text-[#FF6B00]">
          {error}
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </PrimaryButton>
      </div>
    </ModalOverlay>
  );
}

function EditDayModal({
  day,
  token,
  onClose,
  onSaved,
}: {
  day: DayProtocol;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    dayProtocolType: enumValueFromLabel(DAY_PROTOCOL_TYPES, day.dayProtocolType),
    totalCaloriesTarget: String(day.totalCaloriesTarget),
    proteinTargetG: String(day.proteinTargetG),
    carbTargetG: String(day.carbTargetG),
    fatTargetG: String(day.fatTargetG),
    protocolNotes: day.protocolNotes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateDayProtocol(
        day.id,
        {
          dayProtocolType: form.dayProtocolType,
          totalCaloriesTarget: Number(form.totalCaloriesTarget) || 0,
          proteinTargetG: Number(form.proteinTargetG) || 0,
          carbTargetG: Number(form.carbTargetG) || 0,
          fatTargetG: Number(form.fatTargetG) || 0,
          protocolNotes: form.protocolNotes.trim(),
        },
        token
      );
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save day protocol");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="mb-5 text-xl font-black uppercase tracking-tight text-white">
        Edit {labelOf(WEEK_DAYS, day.weekDay)}{" "}
        <span className="text-[#84FF00]">— {labelOf(DAY_PROTOCOL_TYPES, day.dayProtocolType)}</span>
      </h2>
      <div className="grid gap-4">
        <Field label="Day Protocol Type">
          <select
            className={selectCls}
            value={form.dayProtocolType}
            onChange={(e) =>
              setForm((s) => ({ ...s, dayProtocolType: Number(e.target.value) }))
            }
          >
            {DAY_PROTOCOL_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Total Calories (kcal)">
            <input
              type="number"
              className={inputCls}
              value={form.totalCaloriesTarget}
              onChange={(e) => setForm((s) => ({ ...s, totalCaloriesTarget: e.target.value }))}
            />
          </Field>
          <Field label="Protein (g)">
            <input
              type="number"
              className={inputCls}
              value={form.proteinTargetG}
              onChange={(e) => setForm((s) => ({ ...s, proteinTargetG: e.target.value }))}
            />
          </Field>
          <Field label="Carbs (g)">
            <input
              type="number"
              className={inputCls}
              value={form.carbTargetG}
              onChange={(e) => setForm((s) => ({ ...s, carbTargetG: e.target.value }))}
            />
          </Field>
          <Field label="Fat (g)">
            <input
              type="number"
              className={inputCls}
              value={form.fatTargetG}
              onChange={(e) => setForm((s) => ({ ...s, fatTargetG: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Protocol Notes">
          <textarea
            rows={3}
            className={textareaCls}
            value={form.protocolNotes}
            onChange={(e) => setForm((s) => ({ ...s, protocolNotes: e.target.value }))}
            placeholder="Notes for this day…"
          />
        </Field>
      </div>
      {error && (
        <div className="mt-4 rounded-xl border border-[#FF6B00]/25 bg-[#FF6B00]/10 p-3 text-sm text-[#FF6B00]">
          {error}
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </PrimaryButton>
      </div>
    </ModalOverlay>
  );
}

function MealModal({
  meal,
  token,
  onClose,
  onSaved,
}: {
  meal: Meal;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: meal.name,
    timingType: enumValueFromLabel(MEAL_TIMING_TYPES, meal.timingType),
    mealOrder: String(meal.mealOrder),
    timeFromTrainingMinutes: meal.timeFromTrainingMinutes == null ? "" : String(meal.timeFromTrainingMinutes),
    targetCalories: String(meal.targetCalories),
    targetProteinG: String(meal.targetProteinG),
    targetCarbG: String(meal.targetCarbG),
    targetFatG: String(meal.targetFatG),
    notes: meal.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateMeal(
        meal.id,
        {
          name: form.name.trim(),
          timingType: form.timingType,
          mealOrder: Number(form.mealOrder) || 0,
          timeFromTrainingMinutes:
            form.timeFromTrainingMinutes.trim() === ""
              ? null
              : Number(form.timeFromTrainingMinutes),
          targetCalories: Number(form.targetCalories) || 0,
          targetProteinG: Number(form.targetProteinG) || 0,
          targetCarbG: Number(form.targetCarbG) || 0,
          targetFatG: Number(form.targetFatG) || 0,
          notes: form.notes.trim(),
        },
        token
      );
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save meal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="mb-5 text-xl font-black uppercase tracking-tight text-white">Edit Meal</h2>
      <div className="grid gap-4">
        <Field label="Meal Name">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="Breakfast"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Timing Type">
            <select
              className={selectCls}
              value={form.timingType}
              onChange={(e) => setForm((s) => ({ ...s, timingType: Number(e.target.value) }))}
            >
              {MEAL_TIMING_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Meal Order">
            <input
              type="number"
              className={inputCls}
              value={form.mealOrder}
              onChange={(e) => setForm((s) => ({ ...s, mealOrder: e.target.value }))}
            />
          </Field>
          <Field label="Time From Training (minutes)">
            <input
              type="number"
              className={inputCls}
              value={form.timeFromTrainingMinutes}
              onChange={(e) =>
                setForm((s) => ({ ...s, timeFromTrainingMinutes: e.target.value }))
              }
              placeholder="Leave empty, or e.g. -90 / 60"
            />
          </Field>
          <Field label="Target Calories">
            <input
              type="number"
              className={inputCls}
              value={form.targetCalories}
              onChange={(e) => setForm((s) => ({ ...s, targetCalories: e.target.value }))}
            />
          </Field>
          <Field label="Target Protein (g)">
            <input
              type="number"
              className={inputCls}
              value={form.targetProteinG}
              onChange={(e) => setForm((s) => ({ ...s, targetProteinG: e.target.value }))}
            />
          </Field>
          <Field label="Target Carbs (g)">
            <input
              type="number"
              className={inputCls}
              value={form.targetCarbG}
              onChange={(e) => setForm((s) => ({ ...s, targetCarbG: e.target.value }))}
            />
          </Field>
          <Field label="Target Fat (g)">
            <input
              type="number"
              className={inputCls}
              value={form.targetFatG}
              onChange={(e) => setForm((s) => ({ ...s, targetFatG: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            rows={3}
            className={textareaCls}
            value={form.notes}
            onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
            placeholder="Meal notes…"
          />
        </Field>
      </div>
      {error && (
        <div className="mt-4 rounded-xl border border-[#FF6B00]/25 bg-[#FF6B00]/10 p-3 text-sm text-[#FF6B00]">
          {error}
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </PrimaryButton>
      </div>
    </ModalOverlay>
  );
}

function FoodAssignmentModal({
  meal,
  assignment,
  token,
  onClose,
  onSaved,
}: {
  meal: Meal;
  assignment?: FoodItemAssignment | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [foods, setFoods] = useState<FoodCatalogItem[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    foodItemID: assignment ? String(assignment.foodItemID) : "",
    amountGrams: assignment ? String(assignment.amountGrams) : "100",
    isOptional: assignment ? assignment.isOptional : false,
    swapGroupID: assignment?.swapGroupID == null ? "" : String(assignment.swapGroupID),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFoods = useCallback(async () => {
    try {
      setLoadingFoods(true);
      setLoadError(null);
      const data = await fetchFoodCatalog(token);
      setFoods(data);
      setForm((s) => (!s.foodItemID && data.length > 0 ? { ...s, foodItemID: String(data[0].id) } : s));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load food catalog");
    } finally {
      setLoadingFoods(false);
    }
  }, [token]);

  useEffect(() => {
    void loadFoods();
  }, [loadFoods]);

  const filteredFoods = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((food) => {
      const hay = `${food.name} ${food.category} ${food.servingSizeName ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [foods, search]);

  const selectedFood = foods.find((food) => food.id === Number(form.foodItemID));

  const handleSave = async () => {
    if (!form.foodItemID) {
      setError("Choose a food item before saving.");
      return;
    }
    if (!form.amountGrams || Number(form.amountGrams) <= 0) {
      setError("Enter an amount greater than 0g.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        foodItemID: Number(form.foodItemID),
        amountGrams: Number(form.amountGrams),
        isOptional: form.isOptional,
        swapGroupID: form.swapGroupID.trim() === "" ? null : Number(form.swapGroupID),
      };

      if (assignment) {
        await updateFoodAssignment(assignment.id, payload, token);
      } else {
        await addFoodToMeal(meal.id, payload, token);
      }

      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save food item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="mb-5 text-xl font-black uppercase tracking-tight text-white">
        {assignment ? "Edit Food" : "Add Food"} <span className="text-[#84FF00]">— {meal.name}</span>
      </h2>

      <div className="grid gap-4">
        <Field label="Search Foods">
          <input
            className={inputCls}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, category, serving…"
            autoFocus
          />
        </Field>

        {loadError ? (
          <ErrorBanner message={loadError} onRetry={loadFoods} />
        ) : (
          <Field label="Food Item">
            <select
              className={selectCls}
              value={form.foodItemID}
              onChange={(e) => setForm((s) => ({ ...s, foodItemID: e.target.value }))}
              disabled={loadingFoods}
            >
              <option value="">{loadingFoods ? "Loading catalog…" : "Choose a food…"}</option>
              {filteredFoods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name} ({food.category})
                </option>
              ))}
            </select>
            {!loadingFoods && filteredFoods.length === 0 && (
              <p className="text-xs text-white/40">No foods match “{search}”.</p>
            )}
          </Field>
        )}

        {selectedFood && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-white">{selectedFood.name}</p>
                <p className="text-xs text-white/40">
                  {selectedFood.category}
                  {selectedFood.servingSizeName ? ` · ${selectedFood.servingSizeName}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <MacroStat label="Cal/100g" value={selectedFood.caloriesPer100g} />
                <MacroStat label="Protein" value={selectedFood.proteinPer100g} unit="g" />
                <MacroStat label="Carbs" value={selectedFood.carbPer100g} unit="g" />
                <MacroStat label="Fat" value={selectedFood.fatPer100g} unit="g" />
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount (grams)">
            <input
              type="number"
              className={inputCls}
              value={form.amountGrams}
              onChange={(e) => setForm((s) => ({ ...s, amountGrams: e.target.value }))}
            />
          </Field>
          <Field label="Swap Group ID">
            <input
              type="number"
              className={inputCls}
              value={form.swapGroupID}
              onChange={(e) => setForm((s) => ({ ...s, swapGroupID: e.target.value }))}
              placeholder="Optional"
            />
          </Field>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-white/65">
          <input
            type="checkbox"
            checked={form.isOptional}
            onChange={(e) => setForm((s) => ({ ...s, isOptional: e.target.checked }))}
            className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#84FF00] accent-[#84FF00]"
          />
          Optional food (client may skip or swap)
        </label>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-[#FF6B00]/25 bg-[#FF6B00]/10 p-3 text-sm text-[#FF6B00]">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={handleSave} disabled={saving || loadingFoods}>
          {saving ? "Saving…" : assignment ? "Update Food" : "Add Food"}
        </PrimaryButton>
      </div>
    </ModalOverlay>
  );
}

// ─────────────────────────────────────────────
// Food row
// ─────────────────────────────────────────────

function FoodAssignmentRow({
  item,
  onEdit,
  onDelete,
}: {
  item: FoodItemAssignment;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group rounded-xl border border-white/[0.08] bg-black/20 p-3 transition hover:border-white/15">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">{item.foodName}</span>
            {item.category && <Badge label={item.category} color="bg-white/[0.06] text-white/55" />}
            {item.isOptional && <Badge label="Optional" color="bg-white/[0.06] text-white/45" />}
            {item.swapGroupID != null && (
              <Badge label={`Swap ${item.swapGroupID}`} color="bg-[#00D9FF]/10 text-[#00D9FF]" />
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
            <span className="font-semibold text-white/60">{item.amountGrams}g</span>
            {typeof item.macroCalories === "number" && <span>🔥 {item.macroCalories} kcal</span>}
            {typeof item.macroProteinG === "number" && <span>P {item.macroProteinG}g</span>}
            {typeof item.macroCarbG === "number" && <span>C {item.macroCarbG}g</span>}
            {typeof item.macroFatG === "number" && <span>F {item.macroFatG}g</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-90 transition group-hover:opacity-100">
          <GhostButton onClick={onEdit}>Edit</GhostButton>
          <DangerButton onClick={onDelete}>Remove</DangerButton>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Meal row
// ─────────────────────────────────────────────

const MEAL_TYPE_COLORS: Record<string, string> = {
  Breakfast: "bg-white/[0.06] text-white/65",
  "Pre Workout": "bg-[#FF6B00]/10 text-[#FF6B00]",
  "Post Workout": "bg-[#84FF00]/10 text-[#84FF00]",
  Lunch: "bg-[#00D9FF]/10 text-[#00D9FF]",
  Snack: "bg-white/[0.06] text-white/65",
  Dinner: "bg-[#FF6B00]/10 text-[#FF6B00]",
  "Before Bed": "bg-white/[0.06] text-white/55",
};

function MealRow({
  meal,
  token,
  onRefresh,
  onError,
}: {
  meal: Meal;
  token: string;
  onRefresh: () => void;
  onError: (msg: string) => void;
}) {
  const foods = getMealFoods(meal);
  const [editingMeal, setEditingMeal] = useState(false);
  const [deletingMeal, setDeletingMeal] = useState(false);
  const [addingFood, setAddingFood] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItemAssignment | null>(null);
  const [deletingFood, setDeletingFood] = useState<FoodItemAssignment | null>(null);
  const [busy, setBusy] = useState(false);

  const mealTimingLabel = labelOf(MEAL_TIMING_TYPES, meal.timingType);
  const mealTimingColor = MEAL_TYPE_COLORS[mealTimingLabel] ?? "bg-white/[0.06] text-white/55";

  const handleDeleteMeal = async () => {
    try {
      setBusy(true);
      await deleteMeal(meal.id, token);
      setDeletingMeal(false);
      onRefresh();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to delete meal");
      setDeletingMeal(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteFood = async () => {
    if (!deletingFood) return;
    try {
      setBusy(true);
      await deleteFoodAssignment(deletingFood.id, token);
      setDeletingFood(null);
      onRefresh();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to remove food");
      setDeletingFood(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {editingMeal && (
        <MealModal meal={meal} token={token} onClose={() => setEditingMeal(false)} onSaved={onRefresh} />
      )}

      {addingFood && (
        <FoodAssignmentModal meal={meal} token={token} onClose={() => setAddingFood(false)} onSaved={onRefresh} />
      )}

      {editingFood && (
        <FoodAssignmentModal
          meal={meal}
          assignment={editingFood}
          token={token}
          onClose={() => setEditingFood(null)}
          onSaved={onRefresh}
        />
      )}

      {deletingFood && (
        <DeleteConfirmModal
          title="Remove Food"
          description={`Remove ${deletingFood.foodName} from ${meal.name}? This can't be undone.`}
          loading={busy}
          onClose={() => setDeletingFood(null)}
          onConfirm={handleDeleteFood}
        />
      )}

      {deletingMeal && (
        <DeleteConfirmModal
          title="Delete Meal"
          description={`Delete ${meal.name} and every food item inside it? This can't be undone.`}
          loading={busy}
          onClose={() => setDeletingMeal(false)}
          onConfirm={handleDeleteMeal}
        />
      )}

      <div className="rounded-[20px] border border-white/[0.10] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4 transition duration-300">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-white">{meal.name}</span>
              <Badge label={mealTimingLabel} color={mealTimingColor} />
              <span className="text-xs font-medium text-white/35">#{meal.mealOrder}</span>
              {meal.timeFromTrainingMinutes != null && meal.timeFromTrainingMinutes !== 0 && (
                <span className="text-xs font-medium text-white/35">
                  {formatMinutes(meal.timeFromTrainingMinutes)}
                </span>
              )}
            </div>

            {meal.notes && <p className="mt-2 max-w-4xl text-sm text-white/50">{meal.notes}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <MacroStat label="Cal" value={meal.targetCalories} />
            <MacroStat label="Protein" value={meal.targetProteinG} unit="g" />
            <MacroStat label="Carbs" value={meal.targetCarbG} unit="g" />
            <MacroStat label="Fat" value={meal.targetFatG} unit="g" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <GhostButton onClick={() => setEditingMeal(true)}>Edit Meal</GhostButton>
          <DangerButton onClick={() => setDeletingMeal(true)}>Delete Meal</DangerButton>
          <button
            onClick={() => setAddingFood(true)}
            className="h-9 rounded-lg border border-[#84FF00]/30 bg-[#84FF00]/10 px-3.5 text-xs font-bold text-[#84FF00] transition duration-200 hover:bg-[#84FF00]/20"
          >
            + Add Food
          </button>
        </div>

        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <div className="mb-2 flex items-center justify-between">
            <SectionLabel>Foods · {foods.length} item{foods.length !== 1 ? "s" : ""}</SectionLabel>
          </div>

          {foods.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.10] bg-black/10 p-4 text-center text-sm text-white/35">
              No foods added yet — use “Add Food” to build this meal.
            </div>
          ) : (
            <div className="grid gap-2">
              {[...foods]
                .sort((a, b) => a.id - b.id)
                .map((item) => (
                  <FoodAssignmentRow
                    key={item.id}
                    item={item}
                    onEdit={() => setEditingFood(item)}
                    onDelete={() => setDeletingFood(item)}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Day card
// ─────────────────────────────────────────────

const DAY_TYPE_COLORS: Record<string, string> = {
  "Training Day": "bg-[#84FF00]/10 text-[#84FF00]",
  "Rest Day": "bg-white/[0.06] text-white/55",
  "High Day": "bg-[#FF6B00]/10 text-[#FF6B00]",
  "Deload Day": "bg-[#00D9FF]/10 text-[#00D9FF]",
};

function DayCard({
  day,
  token,
  onRefresh,
  onError,
  defaultExpanded,
}: {
  day: DayProtocol;
  token: string;
  onRefresh: () => void;
  onError: (msg: string) => void;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);

  const dayLabel = labelOf(WEEK_DAYS, day.weekDay);
  const protocolLabel = labelOf(DAY_PROTOCOL_TYPES, day.dayProtocolType);
  const protocolColor = DAY_TYPE_COLORS[protocolLabel] ?? "bg-white/[0.06] text-white/55";
  const mealCount = day.meals?.length ?? 0;

  const handleDelete = async () => {
    try {
      setBusy(true);
      await deleteWeekProtocol(day.id, token);
      setDeleting(false);
      onRefresh();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to delete day protocol");
      setDeleting(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {editing && (
        <EditDayModal day={day} token={token} onClose={() => setEditing(false)} onSaved={onRefresh} />
      )}

      {deleting && (
        <DeleteConfirmModal
          title="Delete Day Protocol"
          description={`Delete ${dayLabel} and every meal inside it? This can't be undone.`}
          loading={busy}
          onClose={() => setDeleting(false)}
          onConfirm={handleDelete}
        />
      )}

      <div className="overflow-hidden rounded-[24px] border border-white/[0.10] bg-gradient-to-b from-white/[0.05] to-white/[0.02] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(132,255,0,0.10)]">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
          aria-expanded={expanded}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold uppercase tracking-wide text-white">{dayLabel}</span>
            <Badge label={protocolLabel} color={protocolColor} />
            <span className="text-xs font-medium text-white/30">Day #{day.dayOrder}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <MacroStat label="Cal" value={day.totalCaloriesTarget} unit="kcal" />
            <MacroStat label="Protein" value={day.proteinTargetG} unit="g" />
            <MacroStat label="Carbs" value={day.carbTargetG} unit="g" />
            <MacroStat label="Fat" value={day.fatTargetG} unit="g" />
            <span className="ml-1 text-xs font-bold text-white/40">
              {mealCount} meal{mealCount !== 1 ? "s" : ""} {expanded ? "▲" : "▼"}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-2.5">
          <GhostButton onClick={() => setEditing(true)}>Edit Day</GhostButton>
          <DangerButton onClick={() => setDeleting(true)}>Delete Day</DangerButton>
        </div>

        {day.protocolNotes && (
          <div className="border-t border-white/[0.06] px-4 py-2.5 text-xs text-white/45">
            {day.protocolNotes}
          </div>
        )}

        {expanded && (
          <div className="border-t border-white/[0.06] bg-black/20 p-4">
            {mealCount === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.10] p-6 text-center text-sm text-white/35">
                No meals planned for this day yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {[...day.meals]
                  .sort((a, b) => a.mealOrder - b.mealOrder)
                  .map((meal) => (
                    <MealRow key={meal.id} meal={meal} token={token} onRefresh={onRefresh} onError={onError} />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Loading skeleton (matches FitZone dark/glass theme)
// ─────────────────────────────────────────────

function Skeleton() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-44 animate-pulse rounded-[24px] border border-white/[0.08] bg-white/[0.03]" />
        <div className="mt-10 grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-[24px] border border-white/[0.08] bg-white/[0.03]"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

const WEEK_PROTOCOL_COLORS: Record<string, string> = {
  Standard: "bg-white/[0.06] text-white/65",
  "High Volume": "bg-[#FF6B00]/10 text-[#FF6B00]",
  Deload: "bg-[#00D9FF]/10 text-[#00D9FF]",
  Refeed: "bg-[#84FF00]/10 text-[#84FF00]",
  Peak: "bg-[#84FF00]/15 text-[#84FF00]",
};

export default function WeekDetailsPage() {
  const params = useParams<{ planId: string; weekId: string }>();
  const planId = useMemo(
    () => Number(Array.isArray(params?.planId) ? params.planId[0] : params?.planId),
    [params]
  );
  const weekId = useMemo(
    () => Number(Array.isArray(params?.weekId) ? params.weekId[0] : params?.weekId),
    [params]
  );

  const [token, setToken] = useState<string | null>(null);
  const [week, setWeek] = useState<WeekDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingWeek, setEditingWeek] = useState(false);
  const { toasts, push, dismiss } = useToasts();

  useEffect(() => {
    const t = localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
    setToken(t);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeekDetail(weekId, token);
      setWeek(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load week");
    } finally {
      setLoading(false);
    }
  }, [token, weekId]);

  useEffect(() => {
    if (token !== null) void load();
  }, [load, token]);

  const handleRefresh = useCallback(() => {
    push("success", "Saved");
    void load();
  }, [load, push]);

  const handleError = useCallback(
    (msg: string) => {
      push("error", msg);
    },
    [push]
  );

  // Token resolved but missing — show a clear, actionable state instead of an infinite spinner.
  if (token === "") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
        <div className="max-w-md rounded-[24px] border border-[#FF6B00]/20 bg-white/[0.03] p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#FF6B00]">Session Required</p>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-tight">Sign In To Continue</h1>
          <p className="mt-2 text-sm text-white/50">
            Your coach session has expired or wasn't found. Sign in again to view this week's nutrition plan.
          </p>
        </div>
      </main>
    );
  }

  if (token === null || loading) {
    return <Skeleton />;
  }

  const protocolLabel = week
    ? typeof week.weekProtocolType === "string"
      ? week.weekProtocolType
      : labelOf(WEEK_PROTOCOL_TYPES, week.weekProtocolType)
    : "";

  const protocolColor = WEEK_PROTOCOL_COLORS[protocolLabel] ?? "bg-white/[0.06] text-white/55";
  const sortedDays = week?.dayProtocols ? [...week.dayProtocols].sort((a, b) => a.dayOrder - b.dayOrder) : [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Ambient glow orbs — consistent with hero pattern across the app */}
      <div
        className="pointer-events-none fixed -left-40 -top-40 h-[480px] w-[480px] rounded-full opacity-60 blur-[120px]"
        style={{ backgroundColor: "rgba(132,255,0,0.20)" }}
      />
      <div
        className="pointer-events-none fixed -bottom-40 -right-40 h-[480px] w-[480px] rounded-full opacity-60 blur-[120px]"
        style={{ backgroundColor: "rgba(132,255,0,0.12)" }}
      />

      <ToastStack toasts={toasts} dismiss={dismiss} />

      {editingWeek && week && (
        <EditWeekModal week={week} token={token} onClose={() => setEditingWeek(false)} onSaved={handleRefresh} />
      )}

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-white/[0.10] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel>Coach · Nutrition Plans · Plan #{planId}</SectionLabel>
              <h1 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
                Week <span className="text-[#84FF00]">{week?.weekNumber ?? weekId}</span>
              </h1>

              {week && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge label={protocolLabel} color={protocolColor} />
                  <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/55">
                    Modifier ×{week.calorieModifier}
                  </span>
                  <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/55">
                    {sortedDays.length} day{sortedDays.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {week?.weekDescription && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">{week.weekDescription}</p>
              )}

              {week && (week.focusNote || week.progressionNote || week.nextWeekPreview) && (
                <div className="mt-5 flex flex-wrap gap-6">
                  {week.focusNote && (
                    <div>
                      <SectionLabel>Focus</SectionLabel>
                      <p className="mt-1 max-w-xs text-sm text-white/60">{week.focusNote}</p>
                    </div>
                  )}
                  {week.progressionNote && (
                    <div>
                      <SectionLabel>Progression</SectionLabel>
                      <p className="mt-1 max-w-xs text-sm text-white/60">{week.progressionNote}</p>
                    </div>
                  )}
                  {week.nextWeekPreview && (
                    <div>
                      <SectionLabel>Next Week</SectionLabel>
                      <p className="mt-1 max-w-xs text-sm text-white/60">{week.nextWeekPreview}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link
                href={`/coach/plans/${planId}`}
                className="flex h-11 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.06] px-5 text-sm font-semibold text-white transition duration-200 hover:bg-white/[0.10]"
              >
                ← Back to Plan
              </Link>
              {week && <SecondaryButton onClick={() => setEditingWeek(true)}>Edit Week</SecondaryButton>}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6">
            <ErrorBanner message={error} onRetry={load} />
          </div>
        )}

        {!error && (
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold uppercase tracking-tight text-white">
                Day Protocols <span className="text-sm font-medium text-white/35">({sortedDays.length})</span>
              </h2>
            </div>

            {sortedDays.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/[0.10] bg-white/[0.02] p-14 text-center">
                <p className="text-sm font-semibold text-white/45">
                  No day protocols in this week yet.
                </p>
                <p className="mt-1 text-xs text-white/30">
                  Add training and rest days from the plan builder to start structuring this week.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sortedDays.map((day, i) => (
                  <DayCard
                    key={day.id}
                    day={day}
                    token={token}
                    onRefresh={handleRefresh}
                    onError={handleError}
                    defaultExpanded={sortedDays.length === 1 || i === 0}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}