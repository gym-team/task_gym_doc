"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// ============================================================
// FITZONE VISUAL SYSTEM
// Premium • Dark • Neon Green • Futuristic • Athletic
// ============================================================

type NutritionPlanSummary = {
  id: number;
  name: string;
  description: string;
  expectedOutcome?: string | null;
  coachName?: string | null;
  coachRating?: number | null;
  trainingGoal?: string | null;
  fitnessLevel?: string | null;
  equipmentType?: string | null;
  durationOnWeeks: number;
  isPublished: boolean;
  isLinkedToProgram?: boolean | null;
  photoThumbnailUrl?: string | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://fitzone-16.runasp.net";

// Fallback image shown whenever a plan has no photo, or the photo URL fails to load.
const FALLBACK_PLAN_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80";

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

async function deleteNutritionPlan(token: string, planId: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/NutritionPlan/${planId}`, {
    method: "DELETE",
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
}

async function togglePublish(planId: number, publish: boolean, token: string) {
  const res = await fetch(
    `${API_URL}/api/nutritionplan/${planId}/${publish ? "publish" : "unpublish"}`,
    {
      method: "POST",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
}

function resolveImageSrc(url?: string | null) {
  if (!url) return "";

  // Already absolute (e.g. http(s) link pasted elsewhere) — use as-is.
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // Files we uploaded ourselves live in this Next.js app's public/uploads,
  // and are served from this same frontend domain — never from the API.
  if (url.startsWith("/uploads/")) return url;

  // Any other relative path is assumed to live on the FitZone API.
  return `${API_URL}${url}`;
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4 backdrop-blur-sm">
      <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] backdrop-blur">
      <div className="text-2xl font-black text-[#84FF00]">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/70">
        {label}
      </div>
    </div>
  );
}

function HeroGlow() {
  return (
    <>
      <div className="pointer-events-none absolute -left-20 top-[-80px] h-[260px] w-[260px] rounded-full bg-[#84FF00]/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-100px] right-[-40px] h-[260px] w-[260px] rounded-full bg-[#00D9FF]/12 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(132,255,0,0.14),rgba(0,0,0,0.18),#050505)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,255,0,0.08),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,107,0,0.06),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.06]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(132,255,0,0.8),transparent)] opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden opacity-30">
        <div className="scanline" />
      </div>
    </>
  );
}

function PlanCard({
  plan,
  token,
  onChanged,
}: {
  plan: NutritionPlanSummary;
  token: string;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageSrc = resolveImageSrc(plan.photoThumbnailUrl);
  // Show the fallback gym image whenever there's no thumbnail at all,
  // OR the thumbnail URL exists but failed to actually load (broken/404).
  const showFallback = !imageSrc || imgError;

  const statusLabel = plan.isPublished ? "Published" : "Draft";
  const statusClass = plan.isPublished
    ? "border-[#84FF00]/30 bg-[#84FF00]/15 text-[#84FF00]"
    : "border-[#FF6B00]/30 bg-[#FF6B00]/15 text-[#FFB07A]";

  const handleTogglePublish = async () => {
    try {
      setBusy(true);
      await togglePublish(plan.id, !plan.isPublished, token);
      onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleDeletePlan = async () => {
    try {
      setBusy(true);
      await deleteNutritionPlan(token, plan.id);
      window.location.href = "/coach/plans";
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_12px_50px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(132,255,0,0.25)]">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#84FF00,transparent)]" />
        <div className="absolute -right-20 top-8 h-40 w-40 rounded-full bg-[#84FF00]/10 blur-[100px]" />
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="shrink-0">
          <img
            src={showFallback ? FALLBACK_PLAN_IMAGE : imageSrc}
            alt={plan.name}
            onError={() => setImgError(true)}
            className="h-36 w-36 rounded-2xl border border-white/10 object-cover shadow-lg"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black uppercase tracking-[0.12em] text-white">
              {plan.name}
            </h3>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusClass}`}>
              {statusLabel}
            </span>
            {plan.isLinkedToProgram ? (
              <span className="rounded-full border border-[#00D9FF]/30 bg-[#00D9FF]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#00D9FF]">
                Linked
              </span>
            ) : null}
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">
            {plan.description || "No description added yet."}
          </p>

          {plan.expectedOutcome ? (
            <p className="mt-3 text-sm text-white/70">
              <span className="font-semibold text-white">Expected outcome:</span>{" "}
              <span className="text-[#84FF00]">{plan.expectedOutcome}</span>
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetaItem label="Goal" value={plan.trainingGoal || "-"} />
            <MetaItem label="Level" value={plan.fitnessLevel || "-"} />
            <MetaItem label="Equipment" value={plan.equipmentType || "-"} />
            <MetaItem label="Weeks" value={String(plan.durationOnWeeks ?? "-")} />
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:w-56">
          <Link
            href={`/coach/plans/${plan.id}/edit`}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white text-sm font-semibold text-black transition duration-300 hover:bg-[#84FF00]"
          >
            Edit plan
          </Link>

          <Link
            href={`/coach/plans/${plan.id}/weeks`}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#84FF00] bg-transparent text-sm font-semibold text-[#84FF00] transition duration-300 hover:bg-[#84FF00] hover:text-black"
          >
            +Add week
          </Link>

          <Link
            href={`/coach/plans/${plan.id}`}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] text-sm font-semibold text-white transition duration-300 hover:bg-white/10"
          >
            Plan details
          </Link>

          <button
            type="button"
            onClick={handleTogglePublish}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#84FF00]/30 bg-[#84FF00]/12 px-4 py-2 text-sm font-semibold text-[#84FF00] transition duration-300 hover:bg-[#84FF00] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Working..." : plan.isPublished ? "Unpublish" : "Publish"}
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#FF6B00]/30 bg-[#FF6B00]/12 px-4 py-2 text-sm font-semibold text-[#FFB07A] transition duration-300 hover:bg-[#FF6B00] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete Plan
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#0A0A0A] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
            <h2 className="text-2xl font-black uppercase tracking-[0.14em] text-white">
              Delete Plan
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Are you sure you want to delete this nutrition plan?
              <br />
              <span className="font-semibold text-[#FF6B00]">
                This action cannot be undone.
              </span>
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlan}
                disabled={busy}
                className="rounded-xl bg-[#FF6B00] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
              >
                {busy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CoachPlansPage() {
  const [plans, setPlans] = useState<NutritionPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("accessToken") || ""
      : "";

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) throw new Error("No auth token found. Please log in again.");

      const data = await fetchCoachPlans(token);
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPlans = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plans.filter((plan) => {
      const matchesQuery =
        !q ||
        plan.name.toLowerCase().includes(q) ||
        (plan.description || "").toLowerCase().includes(q) ||
        (plan.trainingGoal || "").toLowerCase().includes(q) ||
        (plan.fitnessLevel || "").toLowerCase().includes(q) ||
        (plan.equipmentType || "").toLowerCase().includes(q);

      const matchesPublished = showPublishedOnly ? plan.isPublished : true;
      return matchesQuery && matchesPublished;
    });
  }, [plans, query, showPublishedOnly]);

  const publishedCount = plans.filter((p) => p.isPublished).length;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <style jsx global>{`
        .scanline {
          position: absolute;
          left: 0;
          right: 0;
          top: -30%;
          height: 120px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(132, 255, 0, 0.12),
            transparent
          );
          animation: scan 8s linear infinite;
        }

        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.7; }
          50% { opacity: 0.15; }
          100% { transform: translateY(1400px); opacity: 0; }
        }

        .fade-up {
          animation: fadeUp 700ms ease both;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-35" />
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.70)]" />
        <HeroGlow />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#84FF00]/30 bg-[#84FF00]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#84FF00]">
                Elite Nutrition System
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black uppercase tracking-[0.06em] text-white sm:text-5xl lg:text-7xl">
                Nutrition <span className="text-[#84FF00]">Plans</span> Control
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                Manage premium nutrition plans in a dark, high-performance interface built for an elite fitness platform.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/coach/plans/create"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition duration-300 hover:bg-[#84FF00]"
                >
                  Create Plan
                </Link>
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#84FF00] bg-transparent px-5 text-sm font-semibold text-[#84FF00] transition duration-300 hover:bg-[#84FF00] hover:text-black"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="fade-up grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <StatChip label="Active Plans" value={String(plans.length)} />
              <StatChip label="Published" value={String(publishedCount)} />
              <StatChip label="Drafts" value={String(Math.max(plans.length - publishedCount, 0))} />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="fade-up rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_12px_50px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#84FF00]">
                Coach Dashboard
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">
                Programs Overview
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70">
                Search plans, filter published items, and move into weeks management with an interface that matches the rest of the FITZONE ecosystem.
              </p>
            </div>

            <label className="grid gap-2 lg:w-[420px]">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                Search Plans
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, goal, level, equipment..."
                className="h-12 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#84FF00]/60"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={showPublishedOnly}
                onChange={(e) => setShowPublishedOnly(e.target.checked)}
                className="h-4 w-4 accent-[#84FF00]"
              />
              Published only
            </label>

            <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-white/70">
              {filteredPlans.length} result(s)
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-[24px] border border-white/10 bg-white/5"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-[#FF6B00]/30 bg-[#FF6B00]/12 p-5 text-[#FFB07A]">
              <div className="font-black uppercase tracking-[0.12em] text-white">
                Failed to load plans
              </div>
              <div className="mt-2 text-sm leading-7 text-white/80">{error}</div>
              <button
                type="button"
                onClick={load}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#84FF00] px-5 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Try again
              </button>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-10 text-center">
              <h2 className="text-2xl font-black uppercase tracking-[0.12em] text-white">
                No plans found
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Create a new nutrition plan to start building weeks and meals.
              </p>
              <Link
                href="/coach/plans/create"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
              >
                Create first plan
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} token={token} onChanged={load} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}