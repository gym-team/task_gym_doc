"use client";

// app/coach/plans/[planId]/page.tsx

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Flame,
  RefreshCw,
  Sparkles,
  Target,
  UtensilsCrossed,
  Waves,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type NutritionWeekSummary = {
  id: number;
  weekNumber: number;
  weekProtocolType: string;
  calorieModifier: number;
  weekDescription: string | null;
  focusNote: string | null;
  progressionNote: string | null;
  nextWeekPreview: string | null;
  dayProtocolCount: number;
};

type NutritionPlanDetail = {
  id: number;
  name: string;
  description: string;
  expectedOutcome: string;
  coachName: string;
  coachRating: number;
  trainingGoal: string;
  fitnessLevel: string;
  equipmentType: string;
  durationOnWeeks: number;
  isPublished: boolean;
  isLinkedToProgram: boolean;
  photoThumbnailUrl: string | null;
  calorieStrategy: string;
  tdeeAdjustmentKcal: number;
  absoluteCalorieTarget: number;
  proteinTargetPerKg: number;
  linkedWorkoutProgramID: number | null;
  nextSteps: string;
  nutritionWeeks: NutritionWeekSummary[];
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://fitzone-16.runasp.net";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=80";

const WEEK_PROTOCOL_COLORS: Record<string, string> = {
  Standard: "bg-cyan-500/15 text-cyan-200 border-cyan-500/20",
  "High Volume": "bg-orange-500/15 text-orange-200 border-orange-500/20",
  Deload: "bg-violet-500/15 text-violet-200 border-violet-500/20",
  Refeed: "bg-emerald-500/15 text-emerald-200 border-emerald-500/20",
  Peak: "bg-red-500/15 text-red-200 border-red-500/20",
};

function weekProtocolColor(type: string) {
  return (
    WEEK_PROTOCOL_COLORS[type] ?? "bg-white/10 text-white/60 border-white/10"
  );
}

function resolveImageSrc(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return url;
  return `${API_URL}${url}`;
}
function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "success" | "warning" | "accent" | "default";
}) {
  const styles = {
    success:
      "border-[#84FF00]/30 bg-[#84FF00]/10 text-[#84FF00]",
    warning:
      "border-[#FF6B00]/30 bg-[#FF6B00]/10 text-[#FF6B00]",
    accent:
      "border-[#00D9FF]/30 bg-[#00D9FF]/10 text-[#00D9FF]",
    default:
      "border-white/10 bg-white/5 text-white/70",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(132,255,0,0.18)]">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-[#84FF00]">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight text-[#84FF00]">
            {value}
          </div>
          <div className="text-sm text-white/70">{label}</div>
        </div>
      </div>
    </div>
  );
}

function MetricPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(132,255,0,0.16)]">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#84FF00]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function WeekCard({
  week,
  planId,
}: {
  week: NutritionWeekSummary;
  planId: number;
}) {
  const colorCls = weekProtocolColor(week.weekProtocolType);

  return (
    <div className="group rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_10px_40px_rgba(132,255,0,0.22)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#84FF00]/20 bg-[#84FF00]/10 text-lg font-black text-[#84FF00]">
            W{week.weekNumber}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${colorCls}`}
              >
                {week.weekProtocolType}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55">
                <Flame className="mr-1 h-3.5 w-3.5 text-[#FF6B00]" />
                x{week.calorieModifier}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55">
                <CalendarDays className="mr-1 h-3.5 w-3.5 text-[#00D9FF]" />
                {week.dayProtocolCount} day{week.dayProtocolCount !== 1 ? "s" : ""}
              </span>
            </div>

            {week.weekDescription ? (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
                {week.weekDescription}
              </p>
            ) : (
              <p className="mt-3 text-sm text-white/45">No week description provided.</p>
            )}

            {(week.focusNote || week.progressionNote || week.nextWeekPreview) && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {week.focusNote ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      Focus
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/70">
                      {week.focusNote}
                    </p>
                  </div>
                ) : null}

                {week.progressionNote ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      Progression
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/70">
                      {week.progressionNote}
                    </p>
                  </div>
                ) : null}

                {week.nextWeekPreview ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      Next Week
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/70">
                      {week.nextWeekPreview}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <Link
            href={`/coach/plans/${planId}/weeks/${week.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[#84FF00]/30 bg-[#84FF00]/10 px-4 py-2 text-sm font-semibold text-[#84FF00] transition hover:bg-[#84FF00] hover:text-black"
          >
            Week Details
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────

async function fetchPlanDetail(
  planId: number,
  token: string
): Promise<NutritionPlanDetail> {
  const res = await fetch(`${API_URL}/api/NutritionPlan/${planId}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
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
    throw new Error(message);
  }

  if (!text) return {} as NutritionPlanDetail;

  try {
    return JSON.parse(text);
  } catch {
    return {} as NutritionPlanDetail;
  }
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function PlanDetailsPage() {
  const params = useParams<{ planId: string }>();
  const planId = useMemo(
    () =>
      Number(Array.isArray(params?.planId) ? params.planId[0] : params?.planId),
    [params]
  );

  const [token, setToken] = useState("");
  const [plan, setPlan] = useState<NutritionPlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const data = await fetchPlanDetail(planId, token);
      setPlan(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load plan");
    } finally {
      setLoading(false);
    }
  }, [token, planId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-4">
            <div className="h-44 animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-24 animate-pulse rounded-[24px] border border-white/10 bg-white/5" />
              <div className="h-24 animate-pulse rounded-[24px] border border-white/10 bg-white/5" />
              <div className="h-24 animate-pulse rounded-[24px] border border-white/10 bg-white/5" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-[24px] border border-white/10 bg-white/5"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const weeks = plan?.nutritionWeeks
    ? [...plan.nutritionWeeks].sort((a, b) => a.weekNumber - b.weekNumber)
    : [];

  const planImage = resolveImageSrc(plan?.photoThumbnailUrl);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(132,255,0,0.14),rgba(0,0,0,0.18),#050505)]" />
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#84FF00]/20 blur-[140px]" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[#00D9FF]/15 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
            <div className="relative max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#84FF00]">
                Coach · Nutrition Plans
              </p>

              <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
                {plan?.name ?? `Plan #${planId}`}
              </h1>

              {plan?.description ? (
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                  {plan.description}
                </p>
              ) : (
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
                  No description provided.
                </p>
              )}

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Weeks"
                  value={String(plan?.durationOnWeeks ?? 0)}
                  icon={<CalendarDays className="h-5 w-5" />}
                />
                <StatCard
                  label="Goal"
                  value={plan?.trainingGoal ?? "-"}
                  icon={<Target className="h-5 w-5" />}
                />
                <StatCard
                  label="Coach"
                  value={plan?.coachName ?? "-"}
                  icon={<Dumbbell className="h-5 w-5" />}
                />
                <StatCard
                  label="Weeks added"
                  value={String(weeks.length)}
                  icon={<Sparkles className="h-5 w-5" />}
                />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/coach/plans"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#84FF00] bg-transparent px-5 text-sm font-semibold text-[#84FF00] transition hover:bg-[#84FF00] hover:text-black"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  All Plans
                </Link>

                <Link
                  href={`/coach/plans/${planId}/weeks`}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
                >
                  <Sparkles className="h-4 w-4" />
                  Add Week
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                <div className="relative aspect-[16/11]">
                  {planImage ? (
                    <img
                      src={planImage}
                      alt={plan?.name ?? "Nutrition plan"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-black/30">
                      <UtensilsCrossed className="h-12 w-12 text-[#84FF00]/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.75),transparent)]" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex flex-wrap gap-2">
                      <Pill tone={plan?.isPublished ? "success" : "warning"}>
                        {plan?.isPublished ? "Published" : "Draft"}
                      </Pill>
                      <Pill tone={plan?.isLinkedToProgram ? "accent" : "default"}>
                        {plan?.isLinkedToProgram ? "Linked to program" : "Standalone"}
                      </Pill>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-2">
                  <MetricPill
                    label="Fitness level"
                    value={plan?.fitnessLevel ?? "-"}
                  />
                  <MetricPill
                    label="Equipment"
                    value={plan?.equipmentType ?? "-"}
                  />
                  <MetricPill
                    label="Calorie strategy"
                    value={plan?.calorieStrategy ?? "-"}
                  />
                  <MetricPill
                    label="Protein target"
                    value={plan ? `${plan.proteinTargetPerKg} g/kg` : "-"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {error ? (
          <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6">
          <SectionCard
            eyebrow="Plan overview"
            title="Nutrition summary"
            description="Review the key plan details before managing weeks."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricPill label="Coach rating" value={plan ? `${plan.coachRating}` : "-"} />
              <MetricPill label="TDEE adjustment" value={plan ? `${plan.tdeeAdjustmentKcal} kcal` : "-"} />
              <MetricPill label="Absolute target" value={plan ? `${plan.absoluteCalorieTarget} kcal` : "-"} />
              <MetricPill label="Linked program ID" value={plan?.linkedWorkoutProgramID != null ? String(plan.linkedWorkoutProgramID) : "None"} />
            </div>

            {plan?.expectedOutcome ? (
              <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Expected outcome
                </p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {plan.expectedOutcome}
                </p>
              </div>
            ) : null}

            {plan?.nextSteps ? (
              <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Next steps
                </p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {plan.nextSteps}
                </p>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            eyebrow="Progress"
            title="Weekly structure"
            description="Weeks are sorted from earliest to latest so you can manage the progression clearly."
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="text-sm text-white/60">
                {weeks.length} week{weeks.length !== 1 ? "s" : ""} added
              </div>

              <Link
                href={`/coach/plans/${planId}/weeks`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
              >
                <Sparkles className="h-4 w-4" />
                Add Week
              </Link>
            </div>

            {weeks.length === 0 && !error ? (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-12 text-center">
                <p className="text-white/55">No weeks added yet.</p>
                <Link
                  href={`/coach/plans/${planId}/weeks`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
                >
                  <Sparkles className="h-4 w-4" />
                  Create first week
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {weeks.map((week) => (
                  <WeekCard key={week.id} week={week} planId={planId} />
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    </main>
  );
}