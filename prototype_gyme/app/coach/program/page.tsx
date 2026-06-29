"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  Dumbbell,
  Search,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

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
  photoThumbnailUrl: string | null;
  isPublished: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://fitzone-16.runasp.net";

const ENDPOINTS = {
  mine: `${API_URL}/api/Program/mine`,
  remove: (id: number) => `${API_URL}/api/Program/${id}`,
  publish: (id: number) => `${API_URL}/api/Program/${id}/publish`,
  unpublish: (id: number) => `${API_URL}/api/Program/${id}/unpublish`,
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

async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    if (isJson) {
      const data = await res.json().catch(() => null);
      message =
        data?.message || data?.details || data?.title || data?.error || message;
    } else {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }

    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  if (isJson) return (await res.json()) as T;

  return (await res.text()) as unknown as T;
}

function normText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeLabel(value: string) {
  const v = value.trim().toLowerCase();

  if (!v) return "-";
  if (v.includes("lose") || v.includes("fat")) return "Lose Fat";
  if (v.includes("build") || v.includes("muscle")) return "Build Muscle";
  if (v.includes("strong")) return "Get Stronger";
  if (v.includes("endurance")) return "Endurance";
  if (v.includes("move") || v.includes("mobility")) return "Move Better";
  if (v.includes("general")) return "General Fitness";
  if (v.includes("maintain")) return "Maintain Weight";
  if (v.includes("beginner")) return "Beginner";
  if (v.includes("intermediate")) return "Intermediate";
  if (v.includes("advanced")) return "Advanced";
  if (v.includes("gym")) return "Full Gym";
  if (v.includes("dumbbell")) return "Dumbbells";
  if (v.includes("bodyweight")) return "Bodyweight";
  if (v.includes("band")) return "Bands";
  if (v.includes("home")) return "Home";

  return value;
}

function normalizeProgram(raw: any): Program {
  return {
    id: Number(raw?.id ?? raw?.Id ?? 0),
    name: normText(raw?.name ?? raw?.Name),
    description: normText(raw?.description ?? raw?.Description),
    expectedOutcome: normText(raw?.expectedOutcome ?? raw?.ExpectedOutcome),
    trackName: normText(raw?.trackName ?? raw?.TrackName),
    coachName: normText(raw?.coachName ?? raw?.CoachName),
    coachRating: Number(raw?.coachRating ?? raw?.CoachRating ?? 0),
    durationOnWeeks: Number(raw?.durationOnWeeks ?? raw?.DurationOnWeeks ?? 0),
    sessionsPerWeeks: Number(
      raw?.sessionsPerWeeks ?? raw?.SessionsPerWeeks ?? 0,
    ),
    sessionsDuration: Number(
      raw?.sessionsDuration ?? raw?.SessionsDuration ?? 0,
    ),
    trainingGoal: normText(raw?.trainingGoal ?? raw?.TrainingGoal),
    fitnessLevel: normText(raw?.fitnessLevel ?? raw?.FitnessLevel),
    equipmentType: normText(raw?.equipmentType ?? raw?.EquipmentType),
    photoThumbnailUrl: raw?.photoThumbnailUrl ?? raw?.PhotoThumbnailUrl ?? null,
    isPublished: Boolean(raw?.isPublished ?? raw?.IsPublished),
  };
}

function statusTone(isPublished: boolean) {
  return isPublished
    ? "border-[rgba(132,255,0,0.28)] bg-[rgba(132,255,0,0.12)] text-[#84FF00]"
    : "border-[rgba(255,107,0,0.28)] bg-[rgba(255,107,0,0.12)] text-[#FFB36B]";
}

function badgeTone(kind: "green" | "orange" | "cyan" | "glass" = "glass") {
  if (kind === "green")
    return "border-[rgba(132,255,0,0.20)] bg-[rgba(132,255,0,0.08)] text-[#84FF00]";
  if (kind === "orange")
    return "border-[rgba(255,107,0,0.22)] bg-[rgba(255,107,0,0.10)] text-[#FFB36B]";
  if (kind === "cyan")
    return "border-[rgba(0,217,255,0.22)] bg-[rgba(0,217,255,0.10)] text-[#00D9FF]";
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

function inputClass() {
  return [
    "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none",
    "placeholder:text-white/35 focus:border-[#84FF00]/60 focus:bg-white/[0.05]",
    "transition",
  ].join(" ");
}

async function loadImage(url: string) {
  return url;
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
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

export default function CoachProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  async function loadPrograms() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Program[]>(ENDPOINTS.mine);
      const normalized = Array.isArray(data) ? data.map(normalizeProgram) : [];
      setPrograms(normalized);
    } catch (err: any) {
      setError(err?.message || "Failed to load programs");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  const stats = useMemo(() => {
    const total = programs.length;
    const published = programs.filter((p) => p.isPublished).length;
    const drafts = total - published;
    const avgWeeks = total
      ? Math.round(
          programs.reduce((sum, p) => sum + (p.durationOnWeeks || 0), 0) /
            total,
        )
      : 0;

    return { total, published, drafts, avgWeeks };
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return programs;

    return programs.filter((program) =>
      [
        program.name,
        program.trackName,
        program.description,
        program.expectedOutcome,
        program.trainingGoal,
        program.fitnessLevel,
        program.equipmentType,
        program.coachName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [programs, search]);

  
  async function handlePublishToggle(program: Program) {
    try {
      setPublishingId(program.id);
      setError("");

      await apiRequest<void>(
        program.isPublished
          ? ENDPOINTS.unpublish(program.id)
          : ENDPOINTS.publish(program.id),
        { method: "POST" }
      );

      await loadPrograms();
    } catch (err: any) {
      setError(err?.message || "Operation failed");
    } finally {
      setPublishingId(null);
    }
  }

async function handleDelete(id: number, name: string) {
    const ok = window.confirm(`متأكد إنك عايز تمسح البرنامج: ${name} ؟`);
    if (!ok) return;

    try {
      setDeletingId(id);
      setError("");

      await apiRequest<void>(ENDPOINTS.remove(id), {
        method: "DELETE",
      });

      await loadPrograms();
    } catch (err: any) {
      setError(err?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1800&q=80"
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
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
              <Sparkles className="h-4 w-4 text-[#84FF00]" /> Elite Fitness
              Platform
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="max-w-4xl">
              <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-7xl">
                COACH <span className="text-[#84FF00]">PROGRAMS</span>
              </h1>
            </div>
          </Reveal>

 <Reveal delay={140}>
  <div className="mt-8 flex flex-wrap items-center gap-3">
    <StatPill
      icon={<Users className="h-4 w-4" />}
      label="Programs"
      value={stats.total}
    />

    <StatPill
      icon={<BadgeCheck className="h-4 w-4" />}
      label="Published"
      value={stats.published}
    />

    <StatPill
      icon={<Target className="h-4 w-4" />}
      label="Drafts"
      value={stats.drafts}
    />

    <StatPill
      icon={<CalendarDays className="h-4 w-4" />}
      label="Avg Weeks"
      value={stats.avgWeeks}
    />

    <Link
      href="/coach/program/create"
      className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#84FF00] px-6 font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-[#9CFF33] hover:shadow-[0_0_25px_rgba(132,255,0,.45)]"
    >
      + Create Program
    </Link>
  </div>
</Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Reveal>
          <div className={cardClass("p-4 sm:p-5")}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                  Filter & Search
                </p>
                <h2 className="mt-2 text-xl font-bold uppercase tracking-tight sm:text-2xl">
                  Find programs fast
                </h2>
              </div>

              <div className="relative w-full lg:max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#84FF00]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, goal, coach, level, equipment..."
                  className={`pl-11 ${inputClass()}`}
                />
              </div>
            </div>
          </div>
        </Reveal>

        {error ? (
          <Reveal delay={80}>
            <div className="mt-6 rounded-[24px] border border-[rgba(255,107,0,0.28)] bg-[rgba(255,107,0,0.08)] p-4 text-sm text-[#FFB36B]">
              {error}
            </div>
          </Reveal>
        ) : null}

        {loading ? (
          <Reveal delay={120}>
            <div className={cardClass("mt-6 p-10 text-center")}>
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-[#84FF00]" />
              <p className="text-white/75">Loading programs...</p>
            </div>
          </Reveal>
        ) : filteredPrograms.length === 0 ? (
          <Reveal delay={120}>
            <div className={cardClass("mt-6 p-12 text-center")}>
              <Dumbbell className="mx-auto mb-4 h-12 w-12 text-[#84FF00]" />
              <h3 className="text-2xl font-black uppercase tracking-tight">
                No Programs Found
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/70">
                جرّب كلمة بحث مختلفة أو امسح الفلاتر الحالية.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {filteredPrograms.map((program, index) => (
              <Reveal key={program.id} delay={index * 40}>
                <article className={cardClass()}>
                  <div className="relative h-56 overflow-hidden border-b border-white/10 sm:h-64">
                    {program.photoThumbnailUrl ? (
                      <img
                        src={program.photoThumbnailUrl}
                        alt={program.name}
                        className="h-full w-full object-cover opacity-80 transition-transform duration-700 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(132,255,0,0.14),transparent_55%),linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
                        <div className="text-center">
                          <Activity className="mx-auto mb-3 h-14 w-14 text-[#84FF00]" />
                          <p className="text-sm uppercase tracking-[0.22em] text-white/55">
                            No Preview
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,5,5,0.96),rgba(5,5,5,0.18),transparent)]" />
                    <div
                      className={`absolute left-4 top-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(program.isPublished)}`}
                    >
                      {program.isPublished ? "Published" : "Draft"}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                      <MiniBadge tone="green">
                        {normalizeLabel(program.fitnessLevel)}
                      </MiniBadge>
                      <MiniBadge tone="orange">
                        {normalizeLabel(program.trainingGoal)}
                      </MiniBadge>
                      <MiniBadge tone="cyan">
                        {normalizeLabel(program.equipmentType)}
                      </MiniBadge>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                          {program.trackName || "Track"}
                        </p>
                        <h3 className="mt-2 text-2xl font-black uppercase tracking-tight">
                          {program.name}
                        </h3>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                          Rating
                        </p>
                        <p className="mt-1 font-bold text-[#84FF00]">
                          {program.coachRating.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/75">
                      {program.description}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <InfoCard
                        label="Weeks"
                        value={program.durationOnWeeks}
                        icon={
                          <CalendarDays className="h-4 w-4 text-[#84FF00]" />
                        }
                      />
                      <InfoCard
                        label="Sessions / Week"
                        value={program.sessionsPerWeeks}
                        icon={<Target className="h-4 w-4 text-[#FF6B00]" />}
                      />
                      <InfoCard
                        label="Session Duration"
                        value={`${program.sessionsDuration} min`}
                        icon={<Zap className="h-4 w-4 text-[#00D9FF]" />}
                      />
                      <InfoCard
                        label="Coach"
                        value={program.coachName}
                        icon={<Trophy className="h-4 w-4 text-[#84FF00]" />}
                      />
                    </div>

                    <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                        Expected Outcome
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white/80">
                        {program.expectedOutcome}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/coach/program/${program.id}`}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#00D9FF] px-4 text-sm font-semibold text-black"
                      >
                        Plan Details
                      </Link>

                      <Link
                        href={`/coach/program/${program.id}/weeks`}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-[#84FF00] px-4 text-sm font-semibold text-[#84FF00] transition hover:bg-[#84FF00] hover:text-black"
                      >
                        Add Week
                      </Link>

                      <Link
                        href={`/coach/program/${program.id}/edit`}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handlePublishToggle(program)}
                        disabled={publishingId === program.id}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-cyan-500 px-4 text-sm font-semibold text-cyan-300"
                      >
                        {publishingId === program.id
                          ? "Loading..."
                          : program.isPublished
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        onClick={() => handleDelete(program.id, program.name)}
                        disabled={deletingId === program.id}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-red-500 px-4 text-sm font-semibold text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === program.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>

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
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(320%);
          }
        }
      `}</style>
    </div>
  );
}

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
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">
          {label}
        </div>
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
      ? badgeTone("green")
      : tone === "orange"
        ? badgeTone("orange")
        : badgeTone("cyan");

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}
    >
      {children}
    </span>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm font-medium text-white">{value ?? "-"}</p>
    </div>
  );
}
