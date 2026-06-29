"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Dumbbell,
  Edit3,
  Search,
  Sparkles,
  Trash2,
  Layers3,
  Target,
  Video,
  ChevronRight,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";

type ExerciseListItem = {
  id: number;
  name: string;
  description?: string;
  primaryMuscles: string;
  secondaryMuscles?: string;
  equipmentNeeded?: string;
  fitnessLevel: string | number;
  videoUrl: string;
  instructions?: string;
  commonMistakes?: string;
  isGlobal?: boolean;
};

type PagedResponse<T> = {
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  data?: T[];
  Data?: T[];
};

type ExerciseForm = {
  name: string;
  description: string;
  primaryMuscles: string;
  secondaryMuscles: string;
  equipmentNeeded: string;
  fitnessLevel: string;
  videoUrl: string;
  instructions: string;
  commonMistakes: string;
};

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type ScopeFilter = "all" | "global" | "coach-owned";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fitzone-16.runasp.net";

const ENDPOINTS = {
  globalList: `${API_URL}/api/Exercise/admin/global`,
  coachOwnedList: `${API_URL}/api/Exercise/admin/coach-owned`,
  create: `${API_URL}/api/Exercise/admin`,
  update: (id: number) => `${API_URL}/api/Exercise/admin/${id}`,
  remove: (id: number) => `${API_URL}/api/Exercise/admin/${id}`,
};

const FITNESS_LEVELS = [
  { label: "Beginner", value: "0" },
  { label: "Intermediate", value: "1" },
  { label: "Advanced", value: "2" },
] as const;

const EQUIPMENT_TYPES = [
  { label: "Full Gym", value: "FullGym" },
  { label: "Dumbbells", value: "Dumbbells" },
  { label: "Home", value: "Home" },
  { label: "Bodyweight", value: "Bodyweight" },
  { label: "Bands", value: "Bands" },
] as const;

const emptyForm: ExerciseForm = {
  name: "",
  description: "",
  primaryMuscles: "",
  secondaryMuscles: "",
  equipmentNeeded: "FullGym",
  fitnessLevel: "0",
  videoUrl: "",
  instructions: "",
  commonMistakes: "",
};

function getToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      Accept: "application/json, text/plain, */*",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const errData = await parseResponse<any>(res);
      message =
        errData?.message ||
        errData?.details ||
        errData?.title ||
        errData?.error ||
        (Array.isArray(errData?.errors) ? errData.errors.join(" | ") : message);
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return await parseResponse<T>(res);
}

function toText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeFitnessLevelLabel(value: string | number | null | undefined) {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "0" || v === "beginner") return "Beginner";
  if (v === "1" || v === "intermediate") return "Intermediate";
  if (v === "2" || v === "advanced") return "Advanced";
  return v ? String(value) : "-";
}

function fitnessLevelToValue(value: string | number | null | undefined) {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "0" || v === "beginner") return "0";
  if (v === "1" || v === "intermediate") return "1";
  if (v === "2" || v === "advanced") return "2";
  return "0";
}

function normalizeEquipmentNeeded(value: unknown) {
  const v = String(value ?? "").replace(/\s+/g, "").toLowerCase();
  if (!v) return "FullGym";
  if (v.includes("fullgym")) return "FullGym";
  if (v.includes("dumbbell")) return "Dumbbells";
  if (v.includes("home")) return "Home";
  if (v.includes("bodyweight")) return "Bodyweight";
  if (v.includes("band")) return "Bands";
  return "FullGym";
}

function pickValue(obj: any, keys: string[]) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function normalizeExercise(raw: any): ExerciseListItem {
  return {
    id: Number(pickValue(raw, ["id", "Id"]) ?? 0),
    name: toText(pickValue(raw, ["name", "Name"])),
    description: toText(pickValue(raw, ["description", "Description"])),
    primaryMuscles: toText(pickValue(raw, ["primaryMuscles", "PrimaryMuscles"])),
    secondaryMuscles: toText(pickValue(raw, ["secondaryMuscles", "SecondaryMuscles"])),
    equipmentNeeded: toText(pickValue(raw, ["equipmentNeeded", "EquipmentNeeded"])),
    fitnessLevel: pickValue(raw, ["fitnessLevel", "FitnessLevel"]) ?? 0,
    videoUrl: toText(pickValue(raw, ["videoUrl", "VideoUrl"])),
    instructions: toText(pickValue(raw, ["instructions", "Instructions"])),
    commonMistakes: toText(pickValue(raw, ["commonMistakes", "CommonMistakes"])),
    isGlobal: Boolean(pickValue(raw, ["isGlobal", "IsGlobal"])),
  };
}

function normalizeExercisesResponse(
  data: PagedResponse<ExerciseListItem> | ExerciseListItem[] | any
): ExerciseListItem[] {
  if (Array.isArray(data)) return data.map(normalizeExercise);
  const arr = data?.data || data?.Data;
  if (Array.isArray(arr)) return arr.map(normalizeExercise);
  return [];
}

function statusClass(isGlobal: boolean) {
  return isGlobal
    ? "border-[rgba(132,255,0,0.28)] bg-[rgba(132,255,0,0.12)] text-[#84FF00]"
    : "border-[rgba(0,217,255,0.28)] bg-[rgba(0,217,255,0.08)] text-[#00D9FF]";
}

function pillTone(kind: "green" | "orange" | "cyan" | "glass" = "glass") {
  if (kind === "green") return "border-[rgba(132,255,0,0.22)] bg-[rgba(132,255,0,0.08)] text-[#84FF00]";
  if (kind === "orange") return "border-[rgba(255,107,0,0.24)] bg-[rgba(255,107,0,0.10)] text-[#FFB36B]";
  if (kind === "cyan") return "border-[rgba(0,217,255,0.24)] bg-[rgba(0,217,255,0.10)] text-[#00D9FF]";
  return "border-white/10 bg-white/[0.04] text-white/80";
}

function cardClass(extra = "") {
  return [
    "overflow-hidden rounded-[24px] border border-white/10",
    "bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]",
    "shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl",
    "transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(132,255,0,0.25)]",
    extra,
  ].join(" ");
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#84FF00]/60 focus:bg-white/[0.05] transition";

const textareaClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#84FF00]/60 focus:bg-white/[0.05] transition min-h-28";

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-700 ${show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
    >
      {children}
    </div>
  );
}

export default function AdminExercisesPage() {
  const [items, setItems] = useState<ExerciseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<ExerciseListItem | null>(null);
  const [form, setForm] = useState<ExerciseForm>(emptyForm);

  // ─── Load both global + coach-owned and merge ───────────────────────────────
  async function loadExercises() {
    try {
      setLoading(true);
      setError("");

      const [globalData, coachData] = await Promise.all([
        apiRequest<PagedResponse<ExerciseListItem>>(ENDPOINTS.globalList),
        apiRequest<PagedResponse<ExerciseListItem>>(ENDPOINTS.coachOwnedList),
      ]);

      const globalItems = normalizeExercisesResponse(globalData);
      const coachItems = normalizeExercisesResponse(coachData);

      // Merge, dedup by id
      const merged = [...globalItems];
      for (const item of coachItems) {
        if (!merged.find((x) => x.id === item.id)) merged.push(item);
      }

      setItems(merged);
    } catch (err: any) {
      setError(err?.message || "Failed to load exercises");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExercises();
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const globals = items.filter((x) => x.isGlobal).length;
    const coachOwned = total - globals;
    return { total, globals, coachOwned };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((ex) => {
      const levelText = normalizeFitnessLevelLabel(ex.fitnessLevel).toLowerCase();
      const scopeText = ex.isGlobal ? "global" : "coach-owned";

      const matchesSearch =
        !q ||
        [
          ex.name,
          ex.description,
          ex.primaryMuscles,
          ex.secondaryMuscles,
          ex.equipmentNeeded,
          ex.instructions,
          ex.commonMistakes,
          normalizeFitnessLevelLabel(ex.fitnessLevel),
          scopeText,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));

      const matchesLevel = levelFilter === "all" || levelText === levelFilter;
      const matchesScope = scopeFilter === "all" || scopeText === scopeFilter;

      return matchesSearch && matchesLevel && matchesScope;
    });
  }, [items, search, levelFilter, scopeFilter]);

  function openCreate() {
    setMode("create");
    setSelected(null);
    setForm(emptyForm);
    setOpen(true);
  }

  async function openEdit(exercise: ExerciseListItem) {
    try {
      setError("");
      // Try fetching full details (coach-owned endpoint usually has more fields)
      // Fall back to list data if not available
      const details = await apiRequest<any>(
        `${API_URL}/api/Exercise/admin/${exercise.id}`
      ).catch(() => exercise);

      setMode("edit");
      setSelected(exercise);
      setForm({
        name: details?.name || exercise.name || "",
        description: details?.description || exercise.description || "",
        primaryMuscles: details?.primaryMuscles || exercise.primaryMuscles || "",
        secondaryMuscles: details?.secondaryMuscles || exercise.secondaryMuscles || "",
        equipmentNeeded: normalizeEquipmentNeeded(
          details?.equipmentNeeded ?? exercise.equipmentNeeded
        ),
        fitnessLevel: fitnessLevelToValue(
          details?.fitnessLevel ?? exercise.fitnessLevel
        ),
        videoUrl: details?.videoUrl || exercise.videoUrl || "",
        instructions: details?.instructions || exercise.instructions || "",
        commonMistakes: details?.commonMistakes || exercise.commonMistakes || "",
      });
      setOpen(true);
    } catch (err: any) {
      setError(err?.message || "Failed to load exercise details");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Admin DTO — no isGlobal field; backend handles it
    const dto = {
      name: form.name.trim(),
      description: form.description.trim(),
      primaryMuscles: form.primaryMuscles.trim(),
      secondaryMuscles: form.secondaryMuscles.trim(),
      equipmentNeeded: form.equipmentNeeded.trim(),
      fitnessLevel: Number(form.fitnessLevel),
      videoUrl: form.videoUrl.trim(),
      instructions: form.instructions.trim(),
      commonMistakes: form.commonMistakes.trim(),
    };

    try {
      setSaving(true);
      setError("");

      if (mode === "create") {
        await apiRequest<{ id: number }>(ENDPOINTS.create, {
          method: "POST",
          body: JSON.stringify(dto),
        });
      } else if (selected) {
        await apiRequest<void>(ENDPOINTS.update(selected.id), {
          method: "PUT",
          body: JSON.stringify(dto),
        });
      }

      setOpen(false);
      setSelected(null);
      setForm(emptyForm);
      await loadExercises();
    } catch (err: any) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(exercise: ExerciseListItem) {
    const ok = window.confirm(
      `متأكد إنك عايز تمسح التمرين: ${exercise.name} ؟`
    );
    if (!ok) return;

    try {
      setDeletingId(exercise.id);
      setError("");
      await apiRequest<void>(ENDPOINTS.remove(exercise.id), { method: "DELETE" });
      await loadExercises();
    } catch (err: any) {
      setError(err?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=80"
            alt="Fitness background"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.70)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(132,255,0,0.14),rgba(0,0,0,0.18),#050505)]" />
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#84FF00]/20 blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#00D9FF]/10 blur-[140px]" />
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="scanline" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#84FF00]/30 bg-[rgba(132,255,0,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#84FF00]">
              <ShieldCheck className="h-4 w-4" /> Admin Panel
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="max-w-4xl">
              <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-7xl">
                EXERCISES <span className="text-[#84FF00]">MANAGEMENT</span>
              </h1>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-8 flex flex-wrap gap-3">
              <StatPill icon={<Activity className="h-4 w-4" />} label="Total" value={stats.total} />
              <StatPill icon={<BadgeCheck className="h-4 w-4" />} label="Global" value={stats.globals} />
              <StatPill icon={<Layers3 className="h-4 w-4" />} label="Coach-Owned" value={stats.coachOwned} />
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8">
              <button
                onClick={openCreate}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#84FF00] px-6 font-bold text-black transition hover:bg-white"
              >
                <Sparkles className="h-5 w-5" />
                Add Global Exercise
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Reveal>
          <div className={cardClass("p-4 sm:p-5")}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                  Filter & Search
                </p>
                <h2 className="mt-2 text-xl font-bold uppercase tracking-tight sm:text-2xl">
                  Find exercises fast
                </h2>
              </div>

              <div className="relative w-full lg:max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#84FF00]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, muscles, level, equipment..."
                  className={`pl-11 ${inputClass}`}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
                className={inputClass}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value as ScopeFilter)}
                className={inputClass}
              >
                <option value="all">All Types</option>
                <option value="global">Global</option>
                <option value="coach-owned">Coach-Owned</option>
              </select>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75">
                <span>
                  Showing {filteredItems.length} of {items.length} exercises
                </span>
                <ChevronRight className="h-4 w-4 text-[#84FF00]" />
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Error banner ─────────────────────────────────────────────────── */}
        {error ? (
          <Reveal delay={80}>
            <div className="mt-6 rounded-[24px] border border-[rgba(255,107,0,0.28)] bg-[rgba(255,107,0,0.08)] p-4 text-sm text-[#FFB36B]">
              {error}
            </div>
          </Reveal>
        ) : null}

        {/* ── Table / Cards ─────────────────────────────────────────────────── */}
        <div className="mt-6 lg:mt-8">
          {loading ? (
            <Reveal delay={120}>
              <div className={cardClass("p-10 text-center")}>
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-[#84FF00]" />
                <p className="text-white/75">Loading exercises...</p>
              </div>
            </Reveal>
          ) : filteredItems.length === 0 ? (
            <Reveal delay={120}>
              <div className={cardClass("p-12 text-center")}>
                <Dumbbell className="mx-auto mb-4 h-12 w-12 text-[#84FF00]" />
                <h3 className="text-2xl font-black uppercase tracking-tight">No Exercises Found</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/70">
                  جرّب كلمة بحث مختلفة أو امسح الفلاتر الحالية.
                </p>
              </div>
            </Reveal>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_12px_40px_rgba(0,0,0,0.35)] lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-[1000px] w-full divide-y divide-white/10">
                    <thead className="bg-black/40">
                      <tr>
                        <Th>ID</Th>
                        <Th>Name</Th>
                        <Th>Primary Muscles</Th>
                        <Th>Level</Th>
                        <Th>Video</Th>
                        <Th>Type</Th>
                        <Th className="text-right">Actions</Th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {filteredItems.map((exercise) => (
                        <tr
                          key={exercise.id}
                          className="bg-white/[0.01] transition hover:bg-white/[0.04]"
                        >
                          <Td>{exercise.id}</Td>

                          <Td>
                            <div className="font-semibold text-white">{exercise.name}</div>
                            <div className="mt-1 text-xs text-white/45">
                              {exercise.secondaryMuscles || "-"}
                            </div>
                          </Td>

                          <Td className="text-white/80">
                            {exercise.primaryMuscles || "-"}
                          </Td>

                          <Td>
                            <MiniBadge tone="green">
                              {normalizeFitnessLevelLabel(exercise.fitnessLevel)}
                            </MiniBadge>
                          </Td>

                          <Td>
                            {exercise.videoUrl ? (
                              <a
                                href={exercise.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-[#84FF00] underline decoration-[#84FF00]/40 underline-offset-4"
                              >
                                <Video className="h-4 w-4" />
                                Open
                              </a>
                            ) : (
                              "-"
                            )}
                          </Td>

                          <Td>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(!!exercise.isGlobal)}`}
                            >
                              {exercise.isGlobal ? "Global" : "Coach-Owned"}
                            </span>
                          </Td>

                          <Td className="text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                onClick={() => openEdit(exercise)}
                                className="inline-flex h-10 items-center rounded-xl border border-[#84FF00]/35 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-[#84FF00] hover:text-black"
                              >
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(exercise)}
                                disabled={deletingId === exercise.id}
                                className="inline-flex h-10 items-center rounded-xl border border-[rgba(255,107,0,0.35)] bg-white/[0.03] px-4 text-sm font-semibold text-[#FFB36B] transition hover:bg-[rgba(255,107,0,0.10)] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {deletingId === exercise.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="grid gap-5 lg:hidden">
                {filteredItems.map((exercise) => (
                  <article key={exercise.id} className={cardClass()}>
                    <div className="border-b border-white/10 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                            ID #{exercise.id}
                          </p>
                          <h3 className="mt-2 text-2xl font-black uppercase tracking-tight">
                            {exercise.name}
                          </h3>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(!!exercise.isGlobal)}`}
                        >
                          {exercise.isGlobal ? "Global" : "Coach-Owned"}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 p-5 sm:grid-cols-2">
                      <InfoBox label="Primary Muscles" value={exercise.primaryMuscles || "-"} />
                      <InfoBox
                        label="Level"
                        value={normalizeFitnessLevelLabel(exercise.fitnessLevel)}
                        tone="green"
                      />
                    </div>

                    <div className="border-t border-white/10 p-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          onClick={() => openEdit(exercise)}
                          className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
                        >
                          <Edit3 className="mr-2 h-4 w-4" /> Edit
                        </button>

                        <button
                          onClick={() => handleDelete(exercise)}
                          disabled={deletingId === exercise.id}
                          className="inline-flex h-11 items-center justify-center rounded-xl border border-[rgba(255,107,0,0.35)] px-4 text-sm font-semibold text-[#FFB36B] transition hover:bg-[rgba(255,107,0,0.10)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === exercise.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>

                      <div className="mt-3">
                        {exercise.videoUrl ? (
                          <a
                            href={exercise.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#84FF00]/35 bg-white/[0.03] px-4 text-sm font-semibold text-[#84FF00]"
                          >
                            <Video className="mr-2 h-4 w-4" /> Open Video
                          </a>
                        ) : (
                          <div className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white/45">
                            No video link
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#0A0A0A] shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <div className="border-b border-white/10 px-6 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#84FF00]/30 bg-[rgba(132,255,0,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#84FF00]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {mode === "create" ? "New Global Exercise" : "Edit Exercise"}
                  </div>
                  <h2 className="mt-3 text-2xl font-black uppercase tracking-tight">
                    {mode === "create" ? "Create Exercise" : "Edit Exercise"}
                  </h2>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/75 transition hover:border-[#84FF00]/40 hover:text-[#84FF00]"
                >
                  Close
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-7">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Exercise Name">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                    required
                  />
                </Field>

                <Field label="Fitness Level">
                  <select
                    value={form.fitnessLevel}
                    onChange={(e) => setForm({ ...form, fitnessLevel: e.target.value })}
                    className={inputClass}
                  >
                    {FITNESS_LEVELS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={textareaClass}
                  placeholder="Exercise description..."
                  required
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Primary Muscles">
                  <input
                    value={form.primaryMuscles}
                    onChange={(e) => setForm({ ...form, primaryMuscles: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Quadriceps, Glutes"
                    required
                  />
                </Field>

                <Field label="Secondary Muscles">
                  <input
                    value={form.secondaryMuscles}
                    onChange={(e) => setForm({ ...form, secondaryMuscles: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Hamstrings"
                  />
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Equipment Needed">
                  <select
                    value={form.equipmentNeeded}
                    onChange={(e) => setForm({ ...form, equipmentNeeded: e.target.value })}
                    className={inputClass}
                  >
                    {EQUIPMENT_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Video URL">
                  <input
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <Field label="Instructions">
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className={textareaClass}
                  placeholder="How to perform the exercise..."
                />
              </Field>

              <Field label="Common Mistakes">
                <textarea
                  value={form.commonMistakes}
                  onChange={(e) => setForm({ ...form, commonMistakes: e.target.value })}
                  className={textareaClass}
                  placeholder="Common mistakes..."
                />
              </Field>

              {/* Info note */}
              <div className="flex items-center gap-3 rounded-2xl border border-[rgba(132,255,0,0.20)] bg-[rgba(132,255,0,0.06)] px-4 py-3 text-sm text-[#84FF00]">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  {mode === "create"
                    ? "هذا التمرين سيكون Global ومتاح لجميع المستخدمين."
                    : "التعديل سيُطبَّق على التمرين عبر الـ Admin endpoint."}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[#84FF00] px-5 py-3 font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : mode === "create" ? "Create" : "Update"}
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/20 px-5 py-3 font-semibold text-white/75 transition hover:border-[#84FF00] hover:text-[#84FF00]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .scanline {
          position: absolute;
          inset: -40% 0 auto 0;
          height: 40%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(132, 255, 0, 0.07),
            transparent
          );
          animation: scan 8s linear infinite;
          pointer-events: none;
        }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(320%); }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
      <span className="text-[#84FF00]">{icon}</span>
      <div>
        <div className="text-base font-black text-[#84FF00]">{value}</div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">{label}</div>
      </div>
    </div>
  );
}

function MiniBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "green" | "orange" | "cyan";
}) {
  const toneClass =
    tone === "green"
      ? pillTone("green")
      : tone === "orange"
        ? pillTone("orange")
        : pillTone("cyan");

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}

function InfoBox({
  label,
  value,
  tone = "glass",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "green" | "orange" | "cyan" | "glass";
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p
        className={`mt-2 text-sm font-medium ${
          tone === "green"
            ? "text-[#84FF00]"
            : tone === "cyan"
              ? "text-[#00D9FF]"
              : tone === "orange"
                ? "text-[#FFB36B]"
                : "text-white"
        }`}
      >
        {value ?? "-"}
      </p>
    </div>
  );
}

function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-white/45 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-4 text-sm text-white/80 ${className}`}>{children}</td>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/80">{label}</span>
      {children}
    </label>
  );
}