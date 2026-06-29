"use client";
// app/coach/programs/[programId]/weeks/new/page.tsx

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ProgramSummary = {
  id: number;
  name: string;
  description?: string;
  durationOnWeeks: number;
  isPublished?: boolean;
};

type ExerciseOption = {
  id: number;
  name: string;
  primaryMuscles: string;
  videoUrl?: string | null;
  fitnessLevel: string;
  isGlobal: boolean;
};

type PaginatedExerciseResponse = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: ExerciseOption[];
};

type SessionExerciseForm = {
  exerciseID: string;
  sectionType: string;
  orderInSection: string;
  sets: string;
  reps: string;
  restSeconds: string;
  tempo: string;
  rpeTarget: string;
  notes: string;
};

type WorkoutSessionForm = {
  sessionTitle: string;
  weekDay: string;
  dayOrder: string;
  estimatedDuration: string;
  warmupNotes: string;
  primerNotes: string;
  cooldownNotes: string;
  exercises: SessionExerciseForm[];
};

type WeekFormState = {
  weekNumber: string;
  weekDescription: string;
  focusArea: string;
  progressionNote: string;
  nextWeekPreview: string;
  sessions: WorkoutSessionForm[];
};

// ─────────────────────────────────────────────
// Enum constants (mapped from FitZone.Core.Enums)
// ─────────────────────────────────────────────

const SECTION_TYPES = [
  { value: 0, label: "Warmup" },
  { value: 1, label: "Primer" },
  { value: 2, label: "Main Work" },
  { value: 3, label: "Cooldown" },
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

function uniqueExercises(arr: ExerciseOption[]) {
  const m = new Map<number, ExerciseOption>();
  for (const e of arr) m.set(e.id, e);
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

function emptySessionExercise(order = 1): SessionExerciseForm {
  return {
    exerciseID: "",
    sectionType: "2",
    orderInSection: String(order),
    sets: "3",
    reps: "10-12",
    restSeconds: "60",
    tempo: "2-0-2",
    rpeTarget: "7",
    notes: "",
  };
}

function emptySession(order = 1): WorkoutSessionForm {
  return {
    sessionTitle: `Session ${order}`,
    weekDay: String(order - 1),
    dayOrder: String(order),
    estimatedDuration: "60",
    warmupNotes: "",
    primerNotes: "",
    cooldownNotes: "",
    exercises: [emptySessionExercise(1)],
  };
}

function emptyWeek(): WeekFormState {
  return {
    weekNumber: "1",
    weekDescription: "",
    focusArea: "",
    progressionNote: "",
    nextWeekPreview: "",
    sessions: [emptySession(1)],
  };
}

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────

async function fetchProgram(programId: number, token: string) {
  const res = await fetch(`${API_URL}/api/Program/${programId}`, {
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return (await res.json()) as ProgramSummary;
}

async function fetchAllExercises(token: string) {
  const pageSize = 100;
  let page = 1;
  let total = Infinity;
  const all: ExerciseOption[] = [];
  while (all.length < total) {
    const url = new URL(`${API_URL}/api/Exercise`);
    url.searchParams.set("pageIndex", String(page));
    url.searchParams.set("pageSize", String(pageSize));
    const res = await fetch(url.toString(), {
      headers: { accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    const json = (await res.json()) as PaginatedExerciseResponse;
    total = json.totalCount ?? 0;
    all.push(...(json.data ?? []));
    if (!json.data?.length) break;
    page += 1;
    if (page > 20) break;
  }
  return uniqueExercises(all);
}

async function createWeek(programId: number, body: object, token: string) {
  const res = await fetch(`${API_URL}/api/Program/${programId}/weeks`, {
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
// ─────────────────────────────────────────────

function HeroAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.70)]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(132,255,0,0.14), rgba(0,0,0,0.18), #050505)",
        }}
      />
      <div
        className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full"
        style={{ background: "rgba(132,255,0,0.20)", filter: "blur(120px)" }}
      />
      <div
        className="absolute -bottom-32 -right-16 h-[420px] w-[420px] rounded-full"
        style={{ background: "rgba(132,255,0,0.12)", filter: "blur(130px)" }}
      />
      <div
        className="absolute inset-0 [animation:grid-drift_18s_linear_infinite]"
        style={{
          opacity: 0.05,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px w-full [animation:scan-line_6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#84FF00]/70 to-transparent" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Reusable form components
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

// Error display — orange accent
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

// Exercise dropdown with inline search
function ExerciseSelect({
  value,
  onChange,
  exercises,
}: {
  value: string;
  onChange: (v: string) => void;
  exercises: ExerciseOption[];
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((ex) =>
      [ex.name, ex.primaryMuscles, ex.fitnessLevel, String(ex.id)].join(" ").toLowerCase().includes(q)
    );
  }, [exercises, query]);

  const selected = exercises.find((ex) => String(ex.id) === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${selectCls} flex w-full items-center justify-between`}
      >
        <span className={selected ? "text-white" : "text-white/30"}>
          {selected ? `${selected.name} (${selected.fitnessLevel})` : "— Select exercise —"}
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
              placeholder="Search exercise…"
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
                — Select exercise —
              </button>
            </li>
            {filtered.map((ex) => (
              <li key={ex.id}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-white/5 ${
                    String(ex.id) === value ? "bg-[#84FF00]/10 text-[#84FF00]" : "text-white"
                  }`}
                  onClick={() => {
                    onChange(String(ex.id));
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="font-medium">{ex.name}</span>
                  <span className="ml-2 text-white/40">
                    {ex.primaryMuscles} · {ex.fitnessLevel}
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

// Statistics chip
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

// Section header
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

// Glass card wrapper
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

export default function CreateProgramWeekPage() {
  const router = useRouter();
  const params = useParams<{ programId: string }>();
  const programId = useMemo(
    () => Number(Array.isArray(params?.programId) ? params.programId[0] : params?.programId),
    [params]
  );

  const [token, setToken] = useState("");
  const [program, setProgram] = useState<ProgramSummary | null>(null);
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<WeekFormState>(emptyWeek());

  useEffect(() => {
    const t = localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token || !programId) return;
    fetchProgram(programId, token)
      .then((data) => setProgram(data))
      .catch((e) => setError(e instanceof Error ? e.message : `Program #${programId} not found.`))
      .finally(() => setLoadingProgram(false));
  }, [token, programId]);

  useEffect(() => {
    if (!token) return;
    fetchAllExercises(token)
      .then(setExercises)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load exercises"))
      .finally(() => setLoadingExercises(false));
  }, [token]);

  // ── Build payload ──────────────────────────
  const payload = useMemo(
    () => ({
      weekNumber: toInt(form.weekNumber),
      weekDescription: form.weekDescription.trim(),
      focusArea: form.focusArea.trim(),
      progressionNote: form.progressionNote.trim(),
      nextWeekPreview: form.nextWeekPreview.trim(),
      createWorkoutSessionDto: form.sessions.map((session) => ({
        sessionTitle: session.sessionTitle.trim(),
        weekDay: toInt(session.weekDay),
        dayOrder: toInt(session.dayOrder),
        estimatedDuration: toInt(session.estimatedDuration),
        warmupNotes: session.warmupNotes.trim(),
        primerNotes: session.primerNotes.trim(),
        cooldownNotes: session.cooldownNotes.trim(),
        createSessionExerciseDto: session.exercises.map((ex) => ({
          exerciseID: toInt(ex.exerciseID),
          sectionType: toInt(ex.sectionType),
          orderInSection: toInt(ex.orderInSection),
          sets: toInt(ex.sets),
          reps: ex.reps.trim(),
          restSeconds: toInt(ex.restSeconds),
          tempo: ex.tempo.trim(),
          rpeTarget: toInt(ex.rpeTarget),
          notes: ex.notes.trim(),
        })),
      })),
    }),
    [form]
  );

  // ── Form updaters ──────────────────────────

  const updateSession = (i: number, fn: (s: WorkoutSessionForm) => WorkoutSessionForm) =>
    setForm((s) => ({ ...s, sessions: s.sessions.map((sess, idx) => (idx === i ? fn(sess) : sess)) }));

  const updateExercise = (si: number, ei: number, fn: (e: SessionExerciseForm) => SessionExerciseForm) =>
    updateSession(si, (sess) => ({
      ...sess,
      exercises: sess.exercises.map((ex, idx) => (idx === ei ? fn(ex) : ex)),
    }));

  const addSession = () =>
    setForm((s) => ({ ...s, sessions: [...s.sessions, emptySession(s.sessions.length + 1)] }));

  const removeSession = (i: number) =>
    setForm((s) => ({ ...s, sessions: s.sessions.filter((_, idx) => idx !== i) }));

  const addExercise = (si: number) =>
    updateSession(si, (sess) => ({
      ...sess,
      exercises: [...sess.exercises, emptySessionExercise(sess.exercises.length + 1)],
    }));

  const removeExercise = (si: number, ei: number) =>
    updateSession(si, (sess) => ({ ...sess, exercises: sess.exercises.filter((_, idx) => idx !== ei) }));

  // ── Submit ─────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      if (!token) throw new Error("No auth token. Please log in.");
      if (!program) throw new Error("Program not loaded.");
      if (!payload.createWorkoutSessionDto.length) throw new Error("Add at least one session.");
      for (const session of form.sessions) {
        if (!session.sessionTitle.trim()) throw new Error("Every session needs a title.");
        for (const ex of session.exercises)
          if (!ex.exerciseID.trim()) throw new Error("Select an exercise for every exercise row.");
      }

      const result = await createWeek(program.id, payload, token);
      setSuccess(`Week created successfully${result?.id ? ` (ID: ${result.id})` : ""}.`);
      router.push(`/coach/programs/${programId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create week");
    } finally {
      setSubmitting(false);
    }
  };

  const totalExercises = form.sessions.reduce((acc, s) => acc + s.exercises.length, 0);
  const totalDuration = form.sessions.reduce((acc, s) => acc + toInt(s.estimatedDuration), 0);

  if (loadingProgram) {
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
      {/* Ambient brand gradient backdrop */}
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
                  Coach · Training Programs
                </span>
                <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-5xl">
                  Add <span className="text-[#84FF00]">Week</span>
                </h1>
                <p className="mt-3 max-w-xl text-sm text-white/75 sm:text-base">
                  {program?.name ?? `Program #${programId}`} — build a complete training week with sessions
                  and exercises.
                </p>
              </div>
              <div className="flex gap-3 [animation:fade-up_600ms_ease-out]">
                <Link
                  href={`/coach/programs/${programId}`}
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
              <StatChip value={String(form.sessions.length)} label="Sessions" accent="lime" />
              <StatChip value={String(totalExercises)} label="Exercises Planned" accent="cyan" />
              <StatChip value={`${totalDuration} min`} label="Total Duration" accent="orange" />
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

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Week Number" required>
                  <NF value={form.weekNumber} onChange={(v) => setForm((s) => ({ ...s, weekNumber: v }))} helper="Starts from 1" />
                </Field>
                <Field label="Focus Area">
                  <TF
                    value={form.focusArea}
                    onChange={(v) => setForm((s) => ({ ...s, focusArea: v }))}
                    placeholder="Full Body Adaptation"
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-4">
                <Field label="Week Description">
                  <TA
                    value={form.weekDescription}
                    onChange={(v) => setForm((s) => ({ ...s, weekDescription: v }))}
                    placeholder="Short description of the week…"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Progression Note">
                    <TA
                      value={form.progressionNote}
                      onChange={(v) => setForm((s) => ({ ...s, progressionNote: v }))}
                      placeholder="How does this week progress…"
                    />
                  </Field>
                  <Field label="Next Week Preview">
                    <TA
                      value={form.nextWeekPreview}
                      onChange={(v) => setForm((s) => ({ ...s, nextWeekPreview: v }))}
                      placeholder="Preview of next week…"
                    />
                  </Field>
                </div>
              </div>
            </GlassCard>

            {/* ── Sessions ── */}
            <div className="flex items-center justify-between [animation:fade-up_500ms_ease-out]">
              <SectionHeader
                eyebrow="Step 02"
                title="Workout"
                highlight="Sessions"
                subtitle="Each session → exercises with sets, reps, and tempo."
                accent="cyan"
              />
              <button
                type="button"
                onClick={addSession}
                className="h-11 shrink-0 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
              >
                + Add Session
              </button>
            </div>

            {form.sessions.map((session, si) => (
              <GlassCard key={si} hover>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-black uppercase tracking-tight text-white">
                    Session <span className="text-[#84FF00]">{si + 1}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeSession(si)}
                    className="rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition hover:bg-[#FF6B00] hover:text-black"
                    style={{ borderColor: "#FF6B00", color: "#FF6B00" }}
                  >
                    Remove Session
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Session Title" required>
                    <TF
                      value={session.sessionTitle}
                      onChange={(v) => updateSession(si, (s) => ({ ...s, sessionTitle: v }))}
                      placeholder="Upper Body Strength"
                      required
                    />
                  </Field>
                  <Field label="Week Day">
                    <SF value={session.weekDay} onChange={(v) => updateSession(si, (s) => ({ ...s, weekDay: v }))} options={WEEK_DAYS} />
                  </Field>
                  <Field label="Day Order">
                    <NF value={session.dayOrder} onChange={(v) => updateSession(si, (s) => ({ ...s, dayOrder: v }))} />
                  </Field>
                  <Field label="Estimated Duration (min)">
                    <NF
                      value={session.estimatedDuration}
                      onChange={(v) => updateSession(si, (s) => ({ ...s, estimatedDuration: v }))}
                    />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Field label="Warmup Notes">
                    <TA
                      value={session.warmupNotes}
                      onChange={(v) => updateSession(si, (s) => ({ ...s, warmupNotes: v }))}
                      placeholder="5-10 minutes light cardio…"
                    />
                  </Field>
                  <Field label="Primer Notes">
                    <TA
                      value={session.primerNotes}
                      onChange={(v) => updateSession(si, (s) => ({ ...s, primerNotes: v }))}
                      placeholder="Activation work…"
                    />
                  </Field>
                  <Field label="Cooldown Notes">
                    <TA
                      value={session.cooldownNotes}
                      onChange={(v) => updateSession(si, (s) => ({ ...s, cooldownNotes: v }))}
                      placeholder="Stretching, breathing…"
                    />
                  </Field>
                </div>

                {/* ── Exercises ── */}
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00D9FF]">
                    Exercises
                    {loadingExercises && <span className="ml-2 text-white/30">(Loading exercises…)</span>}
                  </h4>
                  <button
                    type="button"
                    onClick={() => addExercise(si)}
                    className="rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition hover:bg-[#00D9FF] hover:text-black"
                    style={{ borderColor: "#00D9FF", color: "#00D9FF" }}
                  >
                    + Add Exercise
                  </button>
                </div>

                <div className="mt-3 grid gap-4">
                  {session.exercises.map((ex, ei) => {
                    const selected = exercises.find((opt) => String(opt.id) === ex.exerciseID);
                    return (
                      <div
                        key={ei}
                        className="rounded-2xl border p-4"
                        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.25)" }}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-bold uppercase tracking-wide text-white/80">
                            Exercise {ei + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExercise(si, ei)}
                            className="rounded-lg border px-3 py-1 text-xs font-medium transition hover:bg-[#FF6B00] hover:text-black"
                            style={{ borderColor: "rgba(255,107,0,0.4)", color: "#FF6B00" }}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <Field label="Exercise" required>
                            <ExerciseSelect
                              value={ex.exerciseID}
                              onChange={(v) => updateExercise(si, ei, (item) => ({ ...item, exerciseID: v }))}
                              exercises={exercises}
                            />
                          </Field>
                          <Field label="Section Type">
                            <SF
                              value={ex.sectionType}
                              onChange={(v) => updateExercise(si, ei, (item) => ({ ...item, sectionType: v }))}
                              options={SECTION_TYPES}
                            />
                          </Field>
                          <Field label="Order In Section">
                            <NF
                              value={ex.orderInSection}
                              onChange={(v) => updateExercise(si, ei, (item) => ({ ...item, orderInSection: v }))}
                            />
                          </Field>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                          <Field label="Sets">
                            <NF value={ex.sets} onChange={(v) => updateExercise(si, ei, (item) => ({ ...item, sets: v }))} />
                          </Field>
                          <Field label="Reps">
                            <TF
                              value={ex.reps}
                              onChange={(v) => updateExercise(si, ei, (item) => ({ ...item, reps: v }))}
                              placeholder="8-10"
                            />
                          </Field>
                          <Field label="Rest (sec)">
                            <NF
                              value={ex.restSeconds}
                              onChange={(v) => updateExercise(si, ei, (item) => ({ ...item, restSeconds: v }))}
                            />
                          </Field>
                          <Field label="Tempo">
                            <TF
                              value={ex.tempo}
                              onChange={(v) => updateExercise(si, ei, (item) => ({ ...item, tempo: v }))}
                              placeholder="2-0-2"
                            />
                          </Field>
                          <Field label="RPE Target">
                            <NF
                              value={ex.rpeTarget}
                              onChange={(v) => updateExercise(si, ei, (item) => ({ ...item, rpeTarget: v }))}
                              helper="1–10"
                            />
                          </Field>
                        </div>

                        <div className="mt-4">
                          <Field label="Notes">
                            <TA
                              value={ex.notes}
                              onChange={(v) => updateExercise(si, ei, (item) => ({ ...item, notes: v }))}
                              placeholder="Maintain full range of motion…"
                            />
                          </Field>
                        </div>

                        {selected && (
                          <div
                            className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs text-white/65"
                            style={{ borderColor: "rgba(132,255,0,0.18)", background: "rgba(132,255,0,0.05)" }}
                          >
                            <span className="font-semibold text-[#84FF00]">{selected.name}</span>
                            <span>·</span>
                            <span>{selected.primaryMuscles}</span>
                            <span>·</span>
                            <span>{selected.fitnessLevel}</span>
                            {selected.videoUrl && (
                              <>
                                <span>·</span>
                                <a
                                  href={selected.videoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#00D9FF] underline-offset-2 hover:underline"
                                >
                                  Watch demo
                                </a>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            ))}

            {/* Actions */}
            <div className="flex justify-end gap-3 [animation:fade-up_500ms_ease-out]">
              <Link
                href={`/coach/programs/${programId}`}
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