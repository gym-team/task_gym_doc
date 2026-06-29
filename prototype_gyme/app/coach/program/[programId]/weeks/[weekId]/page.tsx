"use client";

// app/coach/programs/[programId]/page.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ExerciseCatalogItem = {
  id: number;
  name: string;
  primaryMuscles: string;
  videoUrl: string | null;
  fitnessLevel: string;
  isGlobal: boolean;
};

type PaginatedResponse<T> = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
};

// ✅ FIX 1: Updated SessionExercise to match the real API response shape
// The API returns sessionExerciseDto with videoUrl and no top-level id/orderInSection
type SessionExercise = {
  id?: number; // may be absent in GET /sessions/{id} response
  exerciseID: number;
  exerciseName: string;
  primaryMuscles?: string | null;
  sectionType: number | string;
  orderInSection?: number;
  sets: number;
  reps: string;
  restSeconds: number;
  tempo: string;
  rpeTarget: number | null;
  notes: string | null;
  videoUrl?: string | null;
};

type Session = {
  id: number;
  sessionTitle: string;
  weekDay: number | string;
  dayOrder: number;
  estimatedDuration: number;
  warmupNotes?: string | null;
  primerNotes?: string | null;
  cooldownNotes?: string | null;
  // ✅ FIX 1: API returns "sessionExerciseDto" not "exercises"
  exercises?: SessionExercise[];
  sessionExerciseDto?: SessionExercise[];
};

type ProgramWeek = {
  id: number;
  weekNumber: number;
  weekDescription: string;
  focusArea: string;
  progressionNote: string;
  nextWeekPreview: string;
  sessionCount: number;
  sessions: Session[];
};

type Program = {
  id: number;
  name: string;
  description: string;
  expectedOutcome: string;
  trackName: string;
  coachName: string;
  coachRating: number;
  durationOnWeeks: number;
  sessionsPerWeeks: number;
  sessionsDuration: number;
  trainingGoal: string;
  fitnessLevel: string;
  equipmentType: string;
  photoThumbnailUrl: string;
  isPublished: boolean;
  nextSteps: string;
  programWeekSummaryDto: ProgramWeek[];
};

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

const WEEK_DAYS = [
  { value: 0, label: "Saturday" },
  { value: 1, label: "Sunday" },
  { value: 2, label: "Monday" },
  { value: 3, label: "Tuesday" },
  { value: 4, label: "Wednesday" },
  { value: 5, label: "Thursday" },
  { value: 6, label: "Friday" },
];

const SECTION_TYPES = [
  { value: 0, label: "Warmup" },
  { value: 1, label: "Main" },
  { value: 2, label: "Accessory" },
  { value: 3, label: "Cooldown" },
  { value: 4, label: "Finisher" },
];

function labelOf(
  options: { value: number; label: string }[],
  v: number | string | null | undefined
) {
  if (v == null) return "";
  if (typeof v === "string") {
    const found = options.find(
      (o) => o.label.toLowerCase() === v.toLowerCase()
    );
    return found ? found.label : v;
  }
  return options.find((o) => o.value === v)?.label ?? String(v);
}

function enumValueFromLabel(
  options: { value: number; label: string }[],
  raw: number | string | null | undefined
): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && raw.trim()) {
    const found = options.find(
      (o) =>
        o.label.toLowerCase().replace(/\s/g, "") ===
        raw.toLowerCase().replace(/\s/g, "")
    );
    if (found) return found.value;
  }
  return options[0]?.value ?? 0;
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

async function safeFetch<T>(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
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
    throw new ApiError(
      "Can't reach the server. Check your connection and try again."
    );
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
    if (res.status === 401)
      message = "Session expired. Sign in again to continue.";
    throw new ApiError(message, res.status);
  }

  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

async function fetchProgram(
  programId: number,
  token: string
): Promise<Program> {
  return safeFetch<Program>(`${API_URL}/api/Program/${programId}`, token);
}

// ✅ FIX 1: New function — fetch a single session with its exercises
async function fetchSession(sessionId: number, token: string): Promise<Session> {
  return safeFetch<Session>(
    `${API_URL}/api/Program/sessions/${sessionId}`,
    token
  );
}

async function updateWeek(weekId: number, body: object, token: string) {
  return safeFetch(`${API_URL}/api/Program/weeks/${weekId}`, token, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function deleteWeek(weekId: number, token: string) {
  return safeFetch(`${API_URL}/api/Program/weeks/${weekId}`, token, {
    method: "DELETE",
  });
}

// ✅ FIX 2: New function — create session under a week
async function createSession(weekId: number, body: object, token: string) {
  return safeFetch(
    `${API_URL}/api/Program/weeks/${weekId}/sessions`,
    token,
    { method: "POST", body: JSON.stringify(body) }
  );
}

async function updateSession(sessionId: number, body: object, token: string) {
  return safeFetch(`${API_URL}/api/Program/sessions/${sessionId}`, token, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function deleteSession(sessionId: number, token: string) {
  return safeFetch(`${API_URL}/api/Program/sessions/${sessionId}`, token, {
    method: "DELETE",
  });
}

async function addExerciseToSession(
  sessionId: number,
  body: object,
  token: string
) {
  return safeFetch(
    `${API_URL}/api/Program/sessions/${sessionId}/exercises`,
    token,
    { method: "POST", body: JSON.stringify(body) }
  );
}

// ✅ FIX 3: Confirmed correct endpoint for update exercise
async function updateSessionExercise(
  sessionExerciseId: number,
  body: object,
  token: string
) {
  return safeFetch(
    `${API_URL}/api/Program/session-exercises/${sessionExerciseId}`,
    token,
    { method: "PUT", body: JSON.stringify(body) }
  );
}

// ✅ FIX 3: Confirmed correct endpoint for delete exercise
async function deleteSessionExercise(
  sessionExerciseId: number,
  token: string
) {
  return safeFetch(
    `${API_URL}/api/Program/session-exercises/${sessionExerciseId}`,
    token,
    { method: "DELETE" }
  );
}

async function fetchExerciseCatalog(
  token: string
): Promise<ExerciseCatalogItem[]> {
  const result = await safeFetch<PaginatedResponse<ExerciseCatalogItem>>(
    `${API_URL}/api/Exercise?pageIndex=1&pageSize=500`,
    token
  );
  return result.data ?? [];
}

// ─────────────────────────────────────────────
// Toast
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

function ToastStack({
  toasts,
  dismiss,
}: {
  toasts: ToastMsg[];
  dismiss: (id: number) => void;
}) {
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
// Shared UI
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-white/45">
        {label}
      </span>
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

function StatChip({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | string;
  unit?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-0.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
        {label}
      </span>
      <span className="text-sm font-extrabold text-[#84FF00]">
        {value}
        {unit ? (
          <span className="ml-0.5 text-[11px] font-semibold text-white/50">
            {unit}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/35">
      {children}
    </p>
  );
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative my-auto w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 shadow-2xl"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 opacity-60"
          style={{
            background:
              "radial-gradient(closest-side, rgba(132,255,0,0.10), transparent)",
          }}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  title,
  description,
  loading,
  error,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-xl font-black uppercase tracking-tight text-white">
        {title}
      </h2>
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
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─────────────────────────────────────────────
// Edit Week Modal
// ─────────────────────────────────────────────

function EditWeekModal({
  week,
  token,
  onClose,
  onSaved,
}: {
  week: ProgramWeek;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    weekDescription: week.weekDescription ?? "",
    focusArea: week.focusArea ?? "",
    progressionNote: week.progressionNote ?? "",
    nextWeekPreview: week.nextWeekPreview ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateWeek(week.id, { ...form }, token);
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
        Edit Week{" "}
        <span className="text-[#84FF00]">{week.weekNumber}</span>
      </h2>
      <div className="grid gap-4">
        <Field label="Week Description">
          <textarea
            rows={3}
            className={textareaCls}
            value={form.weekDescription}
            onChange={(e) =>
              setForm((s) => ({ ...s, weekDescription: e.target.value }))
            }
            placeholder="Short description…"
          />
        </Field>
        <Field label="Focus Area">
          <input
            className={inputCls}
            value={form.focusArea}
            onChange={(e) =>
              setForm((s) => ({ ...s, focusArea: e.target.value }))
            }
            placeholder="e.g. Strength & Hypertrophy"
          />
        </Field>
        <Field label="Progression Note">
          <textarea
            rows={3}
            className={textareaCls}
            value={form.progressionNote}
            onChange={(e) =>
              setForm((s) => ({ ...s, progressionNote: e.target.value }))
            }
            placeholder="How this week progresses…"
          />
        </Field>
        <Field label="Next Week Preview">
          <textarea
            rows={2}
            className={textareaCls}
            value={form.nextWeekPreview}
            onChange={(e) =>
              setForm((s) => ({ ...s, nextWeekPreview: e.target.value }))
            }
            placeholder="Preview of what's coming…"
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

// ─────────────────────────────────────────────
// ✅ FIX 2: Add Session Modal (NEW)
// ─────────────────────────────────────────────

function AddSessionModal({
  weekId,
  token,
  onClose,
  onSaved,
}: {
  weekId: number;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    sessionTitle: "",
    weekDay: 2, // Monday default
    dayOrder: 1,
    estimatedDuration: 60,
    warmupNotes: "",
    primerNotes: "",
    cooldownNotes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.sessionTitle.trim()) {
      setError("Session title is required.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await createSession(
        weekId,
        {
          sessionTitle: form.sessionTitle.trim(),
          weekDay: form.weekDay,
          dayOrder: Number(form.dayOrder) || 1,
          estimatedDuration: Number(form.estimatedDuration) || 60,
          warmupNotes: form.warmupNotes.trim(),
          primerNotes: form.primerNotes.trim(),
          cooldownNotes: form.cooldownNotes.trim(),
          // API requires createSessionExerciseDto — send empty array, exercises added later
          createSessionExerciseDto: [],
        },
        token
      );
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="mb-5 text-xl font-black uppercase tracking-tight text-white">
        Add Session
      </h2>
      <div className="grid gap-4">
        <Field label="Session Title">
          <input
            className={inputCls}
            value={form.sessionTitle}
            onChange={(e) =>
              setForm((s) => ({ ...s, sessionTitle: e.target.value }))
            }
            placeholder="e.g. Push Day — Chest, Shoulders & Triceps"
            autoFocus
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Week Day">
            <select
              className={selectCls}
              value={form.weekDay}
              onChange={(e) =>
                setForm((s) => ({ ...s, weekDay: Number(e.target.value) }))
              }
            >
              {WEEK_DAYS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Day Order">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.dayOrder}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  dayOrder: Number(e.target.value),
                }))
              }
            />
          </Field>
          <Field label="Duration (minutes)">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.estimatedDuration}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  estimatedDuration: Number(e.target.value),
                }))
              }
            />
          </Field>
        </div>
        <Field label="Warmup Notes">
          <textarea
            rows={2}
            className={textareaCls}
            value={form.warmupNotes}
            onChange={(e) =>
              setForm((s) => ({ ...s, warmupNotes: e.target.value }))
            }
            placeholder="Warmup instructions…"
          />
        </Field>
        <Field label="Primer Notes">
          <textarea
            rows={2}
            className={textareaCls}
            value={form.primerNotes}
            onChange={(e) =>
              setForm((s) => ({ ...s, primerNotes: e.target.value }))
            }
            placeholder="Activation / primer work…"
          />
        </Field>
        <Field label="Cooldown Notes">
          <textarea
            rows={2}
            className={textareaCls}
            value={form.cooldownNotes}
            onChange={(e) =>
              setForm((s) => ({ ...s, cooldownNotes: e.target.value }))
            }
            placeholder="Cooldown / stretching…"
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
          {saving ? "Creating…" : "Create Session"}
        </PrimaryButton>
      </div>
    </ModalOverlay>
  );
}

// ─────────────────────────────────────────────
// Edit Session Modal
// ─────────────────────────────────────────────

function EditSessionModal({
  session,
  token,
  onClose,
  onSaved,
}: {
  session: Session;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    sessionTitle: session.sessionTitle,
    weekDay: enumValueFromLabel(WEEK_DAYS, session.weekDay),
    dayOrder: String(session.dayOrder),
    estimatedDuration: String(session.estimatedDuration),
    warmupNotes: session.warmupNotes ?? "",
    primerNotes: session.primerNotes ?? "",
    cooldownNotes: session.cooldownNotes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateSession(
        session.id,
        {
          sessionTitle: form.sessionTitle.trim(),
          weekDay: form.weekDay,
          dayOrder: Number(form.dayOrder) || 0,
          estimatedDuration: Number(form.estimatedDuration) || 0,
          warmupNotes: form.warmupNotes.trim(),
          primerNotes: form.primerNotes.trim(),
          cooldownNotes: form.cooldownNotes.trim(),
        },
        token
      );
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="mb-5 text-xl font-black uppercase tracking-tight text-white">
        Edit Session
      </h2>
      <div className="grid gap-4">
        <Field label="Session Title">
          <input
            className={inputCls}
            value={form.sessionTitle}
            onChange={(e) =>
              setForm((s) => ({ ...s, sessionTitle: e.target.value }))
            }
            placeholder="Push Day — Chest, Shoulders & Triceps"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Week Day">
            <select
              className={selectCls}
              value={form.weekDay}
              onChange={(e) =>
                setForm((s) => ({ ...s, weekDay: Number(e.target.value) }))
              }
            >
              {WEEK_DAYS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Day Order">
            <input
              type="number"
              className={inputCls}
              value={form.dayOrder}
              onChange={(e) =>
                setForm((s) => ({ ...s, dayOrder: e.target.value }))
              }
            />
          </Field>
          <Field label="Duration (minutes)">
            <input
              type="number"
              className={inputCls}
              value={form.estimatedDuration}
              onChange={(e) =>
                setForm((s) => ({ ...s, estimatedDuration: e.target.value }))
              }
            />
          </Field>
        </div>
        <Field label="Warmup Notes">
          <textarea
            rows={2}
            className={textareaCls}
            value={form.warmupNotes}
            onChange={(e) =>
              setForm((s) => ({ ...s, warmupNotes: e.target.value }))
            }
            placeholder="Warmup instructions…"
          />
        </Field>
        <Field label="Primer Notes">
          <textarea
            rows={2}
            className={textareaCls}
            value={form.primerNotes}
            onChange={(e) =>
              setForm((s) => ({ ...s, primerNotes: e.target.value }))
            }
            placeholder="Activation / primer work…"
          />
        </Field>
        <Field label="Cooldown Notes">
          <textarea
            rows={2}
            className={textareaCls}
            value={form.cooldownNotes}
            onChange={(e) =>
              setForm((s) => ({ ...s, cooldownNotes: e.target.value }))
            }
            placeholder="Cooldown / stretching…"
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

// ─────────────────────────────────────────────
// Exercise Assignment Modal
// ─────────────────────────────────────────────

function ExerciseAssignmentModal({
  session,
  assignment,
  token,
  onClose,
  onSaved,
}: {
  session: Session;
  assignment?: SessionExercise | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [exercises, setExercises] = useState<ExerciseCatalogItem[]>([]);
  const [loadingEx, setLoadingEx] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    exerciseID: assignment ? String(assignment.exerciseID) : "",
    sectionType: assignment
      ? enumValueFromLabel(SECTION_TYPES, assignment.sectionType)
      : 1,
    orderInSection: assignment ? String(assignment.orderInSection ?? 0) : "0",
    sets: assignment ? String(assignment.sets) : "3",
    reps: assignment ? assignment.reps : "8-12",
    restSeconds: assignment ? String(assignment.restSeconds) : "90",
    tempo: assignment ? assignment.tempo : "",
    rpeTarget:
      assignment?.rpeTarget != null ? String(assignment.rpeTarget) : "",
    notes: assignment?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExercises = useCallback(async () => {
    try {
      setLoadingEx(true);
      setLoadError(null);
      const data = await fetchExerciseCatalog(token);
      setExercises(data);
      setForm((s) =>
        !s.exerciseID && data.length > 0
          ? { ...s, exerciseID: String(data[0].id) }
          : s
      );
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Failed to load exercises"
      );
    } finally {
      setLoadingEx(false);
    }
  }, [token]);

  useEffect(() => {
    void loadExercises();
  }, [loadExercises]);

  const filteredExercises = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((ex) => {
      const hay =
        `${ex.name} ${ex.primaryMuscles} ${ex.fitnessLevel}`.toLowerCase();
      return hay.includes(q);
    });
  }, [exercises, search]);

  const selectedExercise = exercises.find(
    (ex) => ex.id === Number(form.exerciseID)
  );

  const handleSave = async () => {
    if (!form.exerciseID) {
      setError("Choose an exercise before saving.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const payload = {
        exerciseID: Number(form.exerciseID),
        sectionType: form.sectionType,
        orderInSection: Number(form.orderInSection) || 0,
        sets: Number(form.sets) || 0,
        reps: form.reps.trim(),
        restSeconds: Number(form.restSeconds) || 0,
        tempo: form.tempo.trim(),
        rpeTarget:
          form.rpeTarget.trim() === "" ? null : Number(form.rpeTarget),
        notes: form.notes.trim(),
      };

      if (assignment) {
        // Use assignment.id if present, otherwise fall back to exerciseID
        const sessionExerciseId = assignment.id ?? assignment.exerciseID;
        await updateSessionExercise(sessionExerciseId, payload, token);
      } else {
        await addExerciseToSession(session.id, payload, token);
      }

      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save exercise");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="mb-5 text-xl font-black uppercase tracking-tight text-white">
        {assignment ? "Edit Exercise" : "Add Exercise"}{" "}
        <span className="text-[#84FF00]">— {session.sessionTitle}</span>
      </h2>

      <div className="grid gap-4">
        <Field label="Search Exercises">
          <input
            className={inputCls}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or muscle group…"
            autoFocus
          />
        </Field>

        {loadError ? (
          <ErrorBanner message={loadError} onRetry={loadExercises} />
        ) : (
          <Field label="Exercise">
            <select
              className={selectCls}
              value={form.exerciseID}
              onChange={(e) =>
                setForm((s) => ({ ...s, exerciseID: e.target.value }))
              }
              disabled={loadingEx}
            >
              <option value="">
                {loadingEx ? "Loading exercises…" : "Choose an exercise…"}
              </option>
              {filteredExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} — {ex.primaryMuscles}
                </option>
              ))}
            </select>
            {!loadingEx && filteredExercises.length === 0 && (
              <p className="text-xs text-white/40">
                No exercises match &quot;{search}&quot;.
              </p>
            )}
          </Field>
        )}

        {selectedExercise && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-white">{selectedExercise.name}</p>
                <p className="text-xs text-white/40">
                  {selectedExercise.primaryMuscles} ·{" "}
                  {selectedExercise.fitnessLevel}
                </p>
              </div>
              {selectedExercise.videoUrl && (
                <a
                  href={selectedExercise.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#84FF00] underline underline-offset-2"
                >
                  Watch Demo ↗
                </a>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section Type">
            <select
              className={selectCls}
              value={form.sectionType}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  sectionType: Number(e.target.value),
                }))
              }
            >
              {SECTION_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Order in Section">
            <input
              type="number"
              className={inputCls}
              value={form.orderInSection}
              onChange={(e) =>
                setForm((s) => ({ ...s, orderInSection: e.target.value }))
              }
            />
          </Field>
          <Field label="Sets">
            <input
              type="number"
              className={inputCls}
              value={form.sets}
              onChange={(e) =>
                setForm((s) => ({ ...s, sets: e.target.value }))
              }
            />
          </Field>
          <Field label="Reps">
            <input
              className={inputCls}
              value={form.reps}
              onChange={(e) =>
                setForm((s) => ({ ...s, reps: e.target.value }))
              }
              placeholder="e.g. 8-12 or 5"
            />
          </Field>
          <Field label="Rest (seconds)">
            <input
              type="number"
              className={inputCls}
              value={form.restSeconds}
              onChange={(e) =>
                setForm((s) => ({ ...s, restSeconds: e.target.value }))
              }
            />
          </Field>
          <Field label="Tempo">
            <input
              className={inputCls}
              value={form.tempo}
              onChange={(e) =>
                setForm((s) => ({ ...s, tempo: e.target.value }))
              }
              placeholder="e.g. 3-1-1-0"
            />
          </Field>
          <Field label="RPE Target">
            <input
              type="number"
              step="0.5"
              min="1"
              max="10"
              className={inputCls}
              value={form.rpeTarget}
              onChange={(e) =>
                setForm((s) => ({ ...s, rpeTarget: e.target.value }))
              }
              placeholder="Optional (1–10)"
            />
          </Field>
        </div>

        <Field label="Notes">
          <textarea
            rows={2}
            className={textareaCls}
            value={form.notes}
            onChange={(e) =>
              setForm((s) => ({ ...s, notes: e.target.value }))
            }
            placeholder="Coaching cues, modifications…"
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
        <PrimaryButton onClick={handleSave} disabled={saving || loadingEx}>
          {saving
            ? "Saving…"
            : assignment
            ? "Update Exercise"
            : "Add Exercise"}
        </PrimaryButton>
      </div>
    </ModalOverlay>
  );
}

// ─────────────────────────────────────────────
// Section colors
// ─────────────────────────────────────────────

const SECTION_COLORS: Record<string, string> = {
  Warmup: "bg-[#00D9FF]/10 text-[#00D9FF]",
  Main: "bg-[#84FF00]/10 text-[#84FF00]",
  Accessory: "bg-white/[0.06] text-white/65",
  Cooldown: "bg-[#00D9FF]/10 text-[#00D9FF]",
  Finisher: "bg-[#FF6B00]/10 text-[#FF6B00]",
  // ✅ FIX 1: API returns "Primer" and "MainWork" as string values
  Primer: "bg-[#00D9FF]/10 text-[#00D9FF]",
  MainWork: "bg-[#84FF00]/10 text-[#84FF00]",
};

const DAY_COLORS: Record<string, string> = {
  Saturday: "bg-[#84FF00]/10 text-[#84FF00]",
  Sunday: "bg-[#84FF00]/10 text-[#84FF00]",
  Monday: "bg-[#FF6B00]/10 text-[#FF6B00]",
  Tuesday: "bg-[#FF6B00]/10 text-[#FF6B00]",
  Wednesday: "bg-[#00D9FF]/10 text-[#00D9FF]",
  Thursday: "bg-white/[0.06] text-white/65",
  Friday: "bg-white/[0.06] text-white/65",
};

// ─────────────────────────────────────────────
// Exercise Row
// ─────────────────────────────────────────────

function ExerciseRow({
  item,
  onEdit,
  onDelete,
}: {
  item: SessionExercise;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const sectionLabel =
    typeof item.sectionType === "string"
      ? item.sectionType
      : labelOf(SECTION_TYPES, item.sectionType);

  const sectionColor =
    SECTION_COLORS[sectionLabel] ?? "bg-white/[0.06] text-white/55";

  return (
    <div className="group rounded-xl border border-white/[0.08] bg-black/20 p-3 transition hover:border-white/15">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">
              {item.exerciseName}
            </span>
            <Badge label={sectionLabel} color={sectionColor} />
            {item.primaryMuscles && (
              <span className="text-xs text-white/35">
                {item.primaryMuscles}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
            <span className="font-semibold text-white/70">
              {item.sets} × {item.reps}
            </span>
            {item.restSeconds > 0 && <span>Rest {item.restSeconds}s</span>}
            {item.tempo && <span>Tempo {item.tempo}</span>}
            {item.rpeTarget != null && (
              <span className="text-[#FF6B00]">RPE {item.rpeTarget}</span>
            )}
            {item.notes && (
              <span className="italic text-white/35">{item.notes}</span>
            )}
            {item.videoUrl && (
              <a
                href={item.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#84FF00] underline underline-offset-2"
              >
                Watch ↗
              </a>
            )}
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
// Session Row
// ─────────────────────────────────────────────

function SessionRow({
  session: initialSession,
  token,
  onRefresh,
  onError,
}: {
  session: Session;
  token: string;
  onRefresh: () => void;
  onError: (msg: string) => void;
}) {
  // ✅ FIX 1: Load full session (with exercises) via dedicated endpoint
  const [session, setSession] = useState<Session>(initialSession);
  const [loadingExercises, setLoadingExercises] = useState(false);

  const loadSessionExercises = useCallback(async () => {
    try {
      setLoadingExercises(true);
      const full = await fetchSession(initialSession.id, token);
      // Normalise: the API key is sessionExerciseDto, map it to exercises
      setSession({
        ...full,
        exercises: full.sessionExerciseDto ?? full.exercises ?? [],
      });
    } catch {
      // Silent — exercises just won't show, user can retry via refresh
    } finally {
      setLoadingExercises(false);
    }
  }, [initialSession.id, token]);

  useEffect(() => {
    void loadSessionExercises();
  }, [loadSessionExercises]);

  const exercises = session.exercises ?? [];

  const [editingSession, setEditingSession] = useState(false);
  const [deletingSession, setDeletingSession] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);
  const [editingExercise, setEditingExercise] =
    useState<SessionExercise | null>(null);
  const [deletingExercise, setDeletingExercise] =
    useState<SessionExercise | null>(null);
  const [busy, setBusy] = useState(false);

  const dayLabel = labelOf(WEEK_DAYS, session.weekDay);
  const dayColor = DAY_COLORS[dayLabel] ?? "bg-white/[0.06] text-white/55";

  const handleDeleteSession = async () => {
    try {
      setBusy(true);
      await deleteSession(session.id, token);
      setDeletingSession(false);
      onRefresh();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to delete session");
      setDeletingSession(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteExercise = async () => {
    if (!deletingExercise) return;
    const sessionExerciseId = deletingExercise.id ?? deletingExercise.exerciseID;
    try {
      setBusy(true);
      await deleteSessionExercise(sessionExerciseId, token);
      setDeletingExercise(null);
      await loadSessionExercises();
      onRefresh();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to remove exercise");
      setDeletingExercise(null);
    } finally {
      setBusy(false);
    }
  };

  const handleSaved = useCallback(async () => {
    await loadSessionExercises();
    onRefresh();
  }, [loadSessionExercises, onRefresh]);

  return (
    <>
      {editingSession && (
        <EditSessionModal
          session={session}
          token={token}
          onClose={() => setEditingSession(false)}
          onSaved={handleSaved}
        />
      )}
      {addingExercise && (
        <ExerciseAssignmentModal
          session={session}
          token={token}
          onClose={() => setAddingExercise(false)}
          onSaved={handleSaved}
        />
      )}
      {editingExercise && (
        <ExerciseAssignmentModal
          session={session}
          assignment={editingExercise}
          token={token}
          onClose={() => setEditingExercise(null)}
          onSaved={handleSaved}
        />
      )}
      {deletingExercise && (
        <DeleteConfirmModal
          title="Remove Exercise"
          description={`Remove "${deletingExercise.exerciseName}" from this session? This can't be undone.`}
          loading={busy}
          onClose={() => setDeletingExercise(null)}
          onConfirm={handleDeleteExercise}
        />
      )}
      {deletingSession && (
        <DeleteConfirmModal
          title="Delete Session"
          description={`Delete "${session.sessionTitle}" and all its exercises? This can't be undone.`}
          loading={busy}
          onClose={() => setDeletingSession(false)}
          onConfirm={handleDeleteSession}
        />
      )}

      <div className="rounded-[20px] border border-white/[0.10] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4 transition duration-300">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-white">
                {session.sessionTitle}
              </span>
              <Badge label={dayLabel} color={dayColor} />
              <span className="text-xs font-medium text-white/35">
                #{session.dayOrder}
              </span>
            </div>
            {session.estimatedDuration > 0 && (
              <p className="mt-1 text-xs text-white/40">
                ~{session.estimatedDuration} min
              </p>
            )}
            {(session.warmupNotes ||
              session.primerNotes ||
              session.cooldownNotes) && (
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-white/45">
                {session.warmupNotes && (
                  <span>
                    <span className="font-semibold text-white/60">
                      Warmup:
                    </span>{" "}
                    {session.warmupNotes}
                  </span>
                )}
                {session.primerNotes && (
                  <span>
                    <span className="font-semibold text-white/60">
                      Primer:
                    </span>{" "}
                    {session.primerNotes}
                  </span>
                )}
                {session.cooldownNotes && (
                  <span>
                    <span className="font-semibold text-white/60">
                      Cooldown:
                    </span>{" "}
                    {session.cooldownNotes}
                  </span>
                )}
              </div>
            )}
          </div>
          <StatChip
            label="Exercises"
            value={loadingExercises ? "…" : exercises.length}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <GhostButton onClick={() => setEditingSession(true)}>
            Edit Session
          </GhostButton>
          <DangerButton onClick={() => setDeletingSession(true)}>
            Delete Session
          </DangerButton>
          <button
            onClick={() => setAddingExercise(true)}
            className="h-9 rounded-lg border border-[#84FF00]/30 bg-[#84FF00]/10 px-3.5 text-xs font-bold text-[#84FF00] transition duration-200 hover:bg-[#84FF00]/20"
          >
            + Add Exercise
          </button>
        </div>

        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <div className="mb-2">
            <SectionLabel>
              Exercises · {loadingExercises ? "loading…" : `${exercises.length} item${exercises.length !== 1 ? "s" : ""}`}
            </SectionLabel>
          </div>

          {loadingExercises ? (
            <div className="grid gap-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          ) : exercises.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.10] bg-black/10 p-4 text-center text-sm text-white/35">
              No exercises added yet — use &quot;Add Exercise&quot; to build
              this session.
            </div>
          ) : (
            <div className="grid gap-2">
              {[...exercises]
                .sort(
                  (a, b) =>
                    (a.orderInSection ?? 0) - (b.orderInSection ?? 0) ||
                    (a.id ?? 0) - (b.id ?? 0)
                )
                .map((ex, idx) => (
                  <ExerciseRow
                    // ✅ FIX 1: use exerciseID + idx as fallback key since id may be absent
                    key={ex.id ?? `${ex.exerciseID}-${idx}`}
                    item={ex}
                    onEdit={() => setEditingExercise(ex)}
                    onDelete={() => setDeletingExercise(ex)}
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
// Week Card
// ─────────────────────────────────────────────

function WeekCard({
  week,
  token,
  onRefresh,
  onError,
  defaultExpanded,
}: {
  week: ProgramWeek;
  token: string;
  onRefresh: () => void;
  onError: (msg: string) => void;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // ✅ FIX 2: Add Session state
  const [addingSession, setAddingSession] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const sessionCount = week.sessions?.length ?? 0;

  const handleDelete = async () => {
    try {
      setBusy(true);
      setDeleteError(null);
      await deleteWeek(week.id, token);
      setDeleting(false);
      onRefresh();
    } catch (e) {
      setDeleteError(
        e instanceof Error ? e.message : "Failed to delete week"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {editing && (
        <EditWeekModal
          week={week}
          token={token}
          onClose={() => setEditing(false)}
          onSaved={onRefresh}
        />
      )}
      {deleting && (
        <DeleteConfirmModal
          title="Delete Week"
          description={`Delete Week ${week.weekNumber} and all its sessions? This can't be undone.`}
          loading={busy}
          error={deleteError}
          onClose={() => {
            setDeleting(false);
            setDeleteError(null);
          }}
          onConfirm={handleDelete}
        />
      )}
      {/* ✅ FIX 2: Add Session Modal */}
      {addingSession && (
        <AddSessionModal
          weekId={week.id}
          token={token}
          onClose={() => setAddingSession(false)}
          onSaved={() => {
            setExpanded(true);
            onRefresh();
          }}
        />
      )}

      <div className="overflow-hidden rounded-[24px] border border-white/[0.10] bg-gradient-to-b from-white/[0.05] to-white/[0.02] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(132,255,0,0.10)]">
        {/* Header */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
          aria-expanded={expanded}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold uppercase tracking-wide text-white">
              Week {week.weekNumber}
            </span>
            {week.focusArea && week.focusArea !== "string" && (
              <Badge
                label={week.focusArea}
                color="bg-[#84FF00]/10 text-[#84FF00]"
              />
            )}
            <span className="text-xs font-medium text-white/30">
              {sessionCount} session{sessionCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {sessionCount > 0 && (
              <div className="flex gap-1.5">
                {[...week.sessions]
                  .sort((a, b) => a.dayOrder - b.dayOrder)
                  .map((s) => {
                    const dayLabel = labelOf(WEEK_DAYS, s.weekDay);
                    return (
                      <span
                        key={s.id}
                        className="rounded-full border border-white/[0.10] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/55"
                      >
                        {dayLabel.slice(0, 3)}
                      </span>
                    );
                  })}
              </div>
            )}
            <span className="ml-1 text-xs font-bold text-white/40">
              {expanded ? "▲" : "▼"}
            </span>
          </div>
        </button>

        {/* Week meta */}
        {week.weekDescription !== "string" && week.weekDescription && (
          <div className="border-t border-white/[0.06] px-4 py-2.5 text-xs leading-relaxed text-white/50">
            {week.weekDescription}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-2.5">
          <GhostButton onClick={() => setEditing(true)}>Edit Week</GhostButton>
          <DangerButton onClick={() => setDeleting(true)}>
            Delete Week
          </DangerButton>
          {/* ✅ FIX 2: Add Session button */}
          <button
            onClick={() => setAddingSession(true)}
            className="h-9 rounded-lg border border-[#84FF00]/30 bg-[#84FF00]/10 px-3.5 text-xs font-bold text-[#84FF00] transition duration-200 hover:bg-[#84FF00]/20"
          >
            + Add Session
          </button>
        </div>

        {/* Notes pills */}
        {(week.progressionNote || week.nextWeekPreview) && (
          <div className="flex flex-wrap gap-4 border-t border-white/[0.06] px-4 py-3">
            {week.progressionNote && week.progressionNote !== "string" && (
              <div>
                <SectionLabel>Progression</SectionLabel>
                <p className="mt-0.5 max-w-sm text-xs text-white/55">
                  {week.progressionNote}
                </p>
              </div>
            )}
            {week.nextWeekPreview && week.nextWeekPreview !== "string" && (
              <div>
                <SectionLabel>Next Week</SectionLabel>
                <p className="mt-0.5 max-w-sm text-xs text-white/55">
                  {week.nextWeekPreview}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sessions */}
        {expanded && (
          <div className="border-t border-white/[0.06] bg-black/20 p-4">
            {sessionCount === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.10] p-6 text-center text-sm text-white/35">
                No sessions in this week yet.{" "}
                <button
                  onClick={() => setAddingSession(true)}
                  className="mt-2 block w-full text-[#84FF00] underline underline-offset-2 hover:no-underline"
                >
                  + Add the first session
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {[...week.sessions]
                  .sort((a, b) => a.dayOrder - b.dayOrder)
                  .map((session) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      token={token}
                      onRefresh={onRefresh}
                      onError={onError}
                    />
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
// Skeleton
// ─────────────────────────────────────────────

function Skeleton() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-52 animate-pulse rounded-[24px] border border-white/[0.08] bg-white/[0.03]" />
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

const TRAINING_GOAL_LABELS: Record<string, string> = {
  LoseFat: "Fat Loss",
  BuildMuscle: "Build Muscle",
  Strength: "Strength",
  Endurance: "Endurance",
  GeneralFitness: "General Fitness",
};

export default function ProgramDetailsPage() {
  const params = useParams<{ programId: string }>();
  const programId = useMemo(
    () =>
      Number(
        Array.isArray(params?.programId)
          ? params.programId[0]
          : params?.programId
      ),
    [params]
  );

  const [token, setToken] = useState<string | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, push, dismiss } = useToasts();

  useEffect(() => {
    const t =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      "";
    setToken(t);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProgram(programId, token);
      setProgram(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load program");
    } finally {
      setLoading(false);
    }
  }, [token, programId]);

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

  if (token === "") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
        <div className="max-w-md rounded-[24px] border border-[#FF6B00]/20 bg-white/[0.03] p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#FF6B00]">
            Session Required
          </p>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-tight">
            Sign In To Continue
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Your coach session has expired or wasn&apos;t found. Sign in again
            to view this program.
          </p>
        </div>
      </main>
    );
  }

  if (token === null || loading) return <Skeleton />;

  const sortedWeeks = program?.programWeekSummaryDto
    ? [...program.programWeekSummaryDto].sort(
        (a, b) => a.weekNumber - b.weekNumber
      )
    : [];

  const goalLabel =
    TRAINING_GOAL_LABELS[program?.trainingGoal ?? ""] ||
    program?.trainingGoal ||
    "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed -left-40 -top-40 h-[480px] w-[480px] rounded-full opacity-60 blur-[120px]"
        style={{ backgroundColor: "rgba(132,255,0,0.20)" }}
      />
      <div
        className="pointer-events-none fixed -bottom-40 -right-40 h-[480px] w-[480px] rounded-full opacity-60 blur-[120px]"
        style={{ backgroundColor: "rgba(132,255,0,0.12)" }}
      />

      <ToastStack toasts={toasts} dismiss={dismiss} />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Hero Card ── */}
        <div className="rounded-[24px] border border-white/[0.10] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel>Coach · Programs</SectionLabel>
              <h1 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
                {program?.name && program.name !== "string"
                  ? program.name
                  : `Program #${programId}`}
              </h1>

              {program && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {program.trackName && (
                    <Badge
                      label={program.trackName}
                      color="bg-[#84FF00]/10 text-[#84FF00]"
                    />
                  )}
                  {goalLabel && (
                    <Badge
                      label={goalLabel}
                      color="bg-[#FF6B00]/10 text-[#FF6B00]"
                    />
                  )}
                  {program.fitnessLevel && (
                    <Badge
                      label={program.fitnessLevel}
                      color="bg-white/[0.06] text-white/65"
                    />
                  )}
                  {program.equipmentType && (
                    <Badge
                      label={program.equipmentType}
                      color="bg-white/[0.06] text-white/55"
                    />
                  )}
                  {program.isPublished && (
                    <Badge
                      label="Published"
                      color="bg-[#84FF00]/15 text-[#84FF00]"
                    />
                  )}
                </div>
              )}

              {program?.description && program.description !== "string" && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
                  {program.description}
                </p>
              )}

              {program && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatChip label="Weeks" value={sortedWeeks.length} />
                  {program.sessionsPerWeeks > 0 && (
                    <StatChip
                      label="Sessions/Wk"
                      value={program.sessionsPerWeeks}
                    />
                  )}
                  {program.sessionsDuration > 0 && (
                    <StatChip
                      label="Avg Duration"
                      value={program.sessionsDuration}
                      unit="min"
                    />
                  )}
                  <StatChip label="Coach" value={program.coachName} />
                  {program.coachRating > 0 && (
                    <StatChip
                      label="Rating"
                      value={program.coachRating.toFixed(1)}
                    />
                  )}
                </div>
              )}

              {program?.expectedOutcome &&
                program.expectedOutcome !== "string" && (
                  <div className="mt-4">
                    <SectionLabel>Expected Outcome</SectionLabel>
                    <p className="mt-1 max-w-2xl text-sm text-white/60">
                      {program.expectedOutcome}
                    </p>
                  </div>
                )}
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/coach/programs"
                className="flex h-11 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.06] px-5 text-sm font-semibold text-white transition duration-200 hover:bg-white/[0.10]"
              >
                ← Back to Programs
              </Link>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mt-6">
            <ErrorBanner message={error} onRetry={load} />
          </div>
        )}

        {/* ── Weeks ── */}
        {!error && (
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold uppercase tracking-tight text-white">
                Program Weeks{" "}
                <span className="text-sm font-medium text-white/35">
                  ({sortedWeeks.length})
                </span>
              </h2>
            </div>

            {sortedWeeks.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/[0.10] bg-white/[0.02] p-14 text-center">
                <p className="text-sm font-semibold text-white/45">
                  No weeks in this program yet.
                </p>
                <p className="mt-1 text-xs text-white/30">
                  Add weeks from the program builder to start structuring this
                  program.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sortedWeeks.map((week, i) => (
                  <WeekCard
                    key={week.id}
                    week={week}
                    token={token}
                    onRefresh={handleRefresh}
                    onError={handleError}
                    defaultExpanded={sortedWeeks.length === 1 || i === 0}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Next Steps ── */}
        {program?.nextSteps && program.nextSteps !== "string" && (
          <div className="mt-10 rounded-[24px] border border-[#84FF00]/20 bg-[#84FF00]/[0.04] p-6">
            <SectionLabel>Next Steps</SectionLabel>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {program.nextSteps}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}