"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CheckInForm from "@/components/nutrition/checkin-form";
import { Navigation } from "@/components/navigation";

import {
  getCheckInHistory,
  type CheckInHistoryItem,
  type CheckInSubmitResponse,
} from "@/services/checkin";
import { getEnrollments, type Enrollment } from "@/services/nutrition-enrollment";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Safely format a weight value that might be null/undefined from the API.
function formatWeight(value: number | null | undefined): string {
  return value !== null && value !== undefined ? value.toFixed(1) : "—";
}

function adjustmentLabel(kcal: number | null): string {
  if (kcal === null) return "Pending coach decision";
  if (kcal === 0) return "No change";
  return kcal > 0 ? `+${kcal} kcal` : `${kcal} kcal`;
}

function adjustmentClass(kcal: number | null): string {
  if (kcal === null) return "border-white/10 bg-white/[0.05] text-white/55";
  if (kcal === 0) return "border-white/10 bg-white/[0.05] text-white/55";
  return kcal > 0
    ? "border-[#00D9FF]/35 bg-[#00D9FF]/10 text-[#00D9FF]"
    : "border-[#FF6B00]/35 bg-[#FF6B00]/10 text-[#FF6B00]";
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function CheckInPage() {
  const params = useParams<{ enrollmentId: string }>();
  const router = useRouter();
  const enrollmentId = Number(params.enrollmentId);

  const [history, setHistory] = useState<CheckInHistoryItem[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [historyData, enrollments] = await Promise.all([
        getCheckInHistory(enrollmentId),
        getEnrollments(),
      ]);

      const sorted = [...historyData].sort((a, b) => b.weekNumber - a.weekNumber);
      setHistory(sorted);

      const matched = enrollments.find((e) => e.id === enrollmentId) ?? null;
      setEnrollment(matched);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        setLoadError("Your session has expired. Please log in again.");
      } else if (status === 404) {
        setLoadError("This enrollment has no check-in history yet.");
      } else if (err?.request) {
        setLoadError("Couldn't reach the server. Check your connection and try again.");
      } else {
        setLoadError("Couldn't load your check-in history. Please try again.");
      }

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("Failed to load check-in page data:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [enrollmentId]);

  useEffect(() => {
    if (!Number.isNaN(enrollmentId)) {
      loadData();
    }
  }, [enrollmentId, loadData]);

  const nextWeekNumber = history.length > 0 ? history[0].weekNumber + 1 : 1;
  const reviewedCount = history.filter((h) => h.coachReviewed).length;
  const latestAvgWeight = history.length > 0 ? history[0].averageWeight : null;
  const avgAdherence =
    history.length > 0
      ? Math.round(history.reduce((sum, h) => sum + h.adherencePercent, 0) / history.length)
      : null;

  const totalWeeks = enrollment?.totalWeeks ?? null;
  const maxWeekUnlocked = enrollment?.maxWeekUnlocked ?? null;

  const isPlanComplete = totalWeeks !== null && history.length >= totalWeeks;
  const isNextWeekLocked = maxWeekUnlocked !== null && nextWeekNumber > maxWeekUnlocked;

  const isSubmitDisabled = isLoading || !!loadError || isPlanComplete || isNextWeekLocked;

  let submitButtonLabel = `Submit Week ${nextWeekNumber} Check-In`;
  let lockReason: string | null = null;

  if (isPlanComplete) {
    submitButtonLabel = "Plan Complete";
    lockReason = "You've submitted check-ins for every week in this plan. Nice work.";
  } else if (isNextWeekLocked) {
    submitButtonLabel = `Week ${nextWeekNumber} Locked`;
    lockReason = "Your coach hasn't unlocked this week yet. It'll open up after your current week is reviewed.";
  }

  function handleSubmitSuccess(result: CheckInSubmitResponse) {
    setIsModalOpen(false);
    setBanner(
      `Week ${result.weekNumber} check-in submitted — average weight ${formatWeight(
        result.averageWeight
      )} kg. Your coach will review within 48 hours.`
    );
    loadData();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] font-sans">
      {/* Ambient background layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-40 h-[480px] w-[480px] rounded-full bg-[#84FF00]/20 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -right-36 h-[480px] w-[480px] rounded-full bg-[#84FF00]/12 blur-[120px]"
      />

      {/* Navigation */}
      <div className="relative z-30">
        <Navigation />
      </div>

      {/* Content pushed down so nothing appears under the nav */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 pt-28 pb-24 md:pt-32">
        <div className="mb-10 animate-fade-in">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 text-sm text-white/50 transition-colors hover:text-[#84FF00]"
          >
            ← Back
          </button>

          <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#84FF00]">
                My Nutrition
              </p>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Weekly <span className="text-[#84FF00]">Check-Ins</span>
              </h1>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={isSubmitDisabled}
                title={lockReason ?? undefined}
                className={cn(
                  "h-11 rounded-xl px-6 text-sm font-semibold whitespace-nowrap",
                  isSubmitDisabled
                    ? "cursor-not-allowed bg-white/10 text-white/40 hover:bg-white/10"
                    : "bg-white text-[#050505] hover:bg-[#84FF00]"
                )}
              >
                {submitButtonLabel}
              </Button>
              {lockReason && (
                <p className="max-w-[260px] text-right text-xs text-white/45">{lockReason}</p>
              )}
            </div>
          </div>

          {history.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                <span className="block text-2xl font-black tracking-tight text-[#84FF00]">
                  {formatWeight(latestAvgWeight)}
                </span>
                <span className="text-xs font-medium text-white/70">Latest Avg Weight (kg)</span>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                <span className="block text-2xl font-black tracking-tight text-[#84FF00]">
                  {avgAdherence !== null ? `${avgAdherence}%` : "—"}
                </span>
                <span className="text-xs font-medium text-white/70">Average Adherence</span>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                <span className="block text-2xl font-black tracking-tight text-[#84FF00]">
                  {reviewedCount}/{totalWeeks ?? history.length}
                </span>
                <span className="text-xs font-medium text-white/70">Check-Ins Reviewed</span>
              </div>
            </div>
          )}
        </div>

        {banner && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-[#84FF00]/35 bg-[#84FF00]/10 px-4 py-3.5 text-sm text-[#84FF00] animate-fade-in">
            {banner}
            <button
              type="button"
              onClick={() => setBanner(null)}
              aria-label="Dismiss"
              className="text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {isLoading && (
          <div className="py-10 text-center text-sm text-white/50">
            Loading your check-in history…
          </div>
        )}

        {!isLoading && loadError && (
          <div className="py-10 text-center text-sm text-[#FF6B00]">
            {loadError}
            <button
              type="button"
              onClick={loadData}
              className="mx-auto mt-3.5 block rounded-[10px] border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !loadError && history.length === 0 && (
          <div className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-14 text-center">
            <p className="mb-2 text-[17px] font-bold text-white">No check-ins yet</p>
            <p className="text-[13.5px] text-white/55">
              Submit your first weekly check-in to start tracking your progress.
            </p>
          </div>
        )}

        {!isLoading && !loadError && history.length > 0 && (
          <div className="flex flex-col gap-4.5">
            {history.map((item, index) => (
              <div
                key={item.weekNumber}
                className="animate-fade-in rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#84FF00]/30 hover:shadow-[0_10px_40px_rgba(132,255,0,0.25)]"
                style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
              >
                <div className="mb-4.5 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-base font-extrabold uppercase tracking-tight text-white">
                      Week {item.weekNumber}
                    </span>
                    <span className="text-[13px] text-white/50">{formatDate(item.submittedAt)}</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
                      item.coachReviewed
                        ? "border-[#84FF00]/35 bg-[#84FF00]/10 text-[#84FF00]"
                        : "border-[#FF6B00]/35 bg-[#FF6B00]/10 text-[#FF6B00]"
                    )}
                  >
                    {item.coachReviewed ? "Reviewed" : "Awaiting Review"}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10.5px] uppercase tracking-wide text-white/45">
                      Avg Weight
                    </span>
                    <span className="text-[15px] font-bold text-white">
                      {formatWeight(item.averageWeight)} kg
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10.5px] uppercase tracking-wide text-white/45">
                      Adherence
                    </span>
                    <span className="text-[15px] font-bold text-white">
                      {item.adherencePercent}%
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10.5px] uppercase tracking-wide text-white/45">
                      Energy
                    </span>
                    <span className="text-[15px] font-bold text-white">{item.energyLevel}/5</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10.5px] uppercase tracking-wide text-white/45">
                      Hunger
                    </span>
                    <span className="text-[15px] font-bold text-white">{item.hungerLevel}/5</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10.5px] uppercase tracking-wide text-white/45">
                      Sleep
                    </span>
                    <span className="text-[15px] font-bold text-white">{item.sleepQuality}/5</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10.5px] uppercase tracking-wide text-white/45">
                      Calories Applied
                    </span>
                    <span className="text-[15px] font-bold text-white">
                      {item.caloriesApplied} kcal
                    </span>
                  </div>
                </div>

                <div className="flex">
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-bold",
                      adjustmentClass(item.adjustmentKcal)
                    )}
                  >
                    {adjustmentLabel(item.adjustmentKcal)}
                  </span>
                </div>

                {item.coachDirectiveNote && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-[#84FF00]">
                      Coach&apos;s Note
                    </span>
                    <p className="text-[13.5px] leading-relaxed text-white/75">
                      {item.coachDirectiveNote}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <CheckInForm
          enrollmentId={enrollmentId}
          weekNumber={nextWeekNumber}
          onSuccess={handleSubmitSuccess}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}