"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCheckInHistory, type CheckInHistoryItem } from "@/services/checkin";
import { getEnrollments, type Enrollment } from "@/services/nutrition-enrollment";
import ProgressChart from "@/components/nutrition/progress-chart";
import { Navigation } from "@/components/navigation";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function weightDeltaLabel(delta: number): string {
  if (Math.abs(delta) < 0.05) return "No change";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)} kg`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ProgressPage() {
  const params = useParams<{ enrollmentId: string }>();
  const router = useRouter();
  const enrollmentId = Number(params.enrollmentId);

  const [history, setHistory] = useState<CheckInHistoryItem[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [historyData, enrollments] = await Promise.all([
        getCheckInHistory(enrollmentId),
        getEnrollments(),
      ]);

      const sorted = [...historyData].sort((a, b) => a.weekNumber - b.weekNumber);
      setHistory(sorted);

      const matched = enrollments.find((e) => e.id === enrollmentId) ?? null;
      setEnrollment(matched);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        setLoadError("Your session has expired. Please log in again.");
      } else if (status === 404) {
        setLoadError("This enrollment has no progress data yet.");
      } else if (err?.request) {
        setLoadError("Couldn't reach the server. Check your connection and try again.");
      } else {
        setLoadError("Couldn't load your progress. Please try again.");
      }

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("Failed to load progress page data:", err);
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

  const firstWeight = history.length > 0 ? history[0].averageWeight : null;
  const latestWeight = history.length > 0 ? history[history.length - 1].averageWeight : null;
  const totalDelta = firstWeight !== null && latestWeight !== null ? latestWeight - firstWeight : null;

  const avgAdherence =
    history.length > 0
      ? Math.round(history.reduce((sum, h) => sum + h.adherencePercent, 0) / history.length)
      : null;

  const reviewedCount = history.filter((h) => h.coachReviewed).length;
  const totalWeeks = enrollment?.totalWeeks ?? null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] font-sans">
      {/* Background layers */}
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

      {/* Navigation on top */}
      <div className="relative z-30">
        <Navigation />
      </div>

      {/* Page content with safe top padding so nothing gets covered */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 pt-28 pb-24 md:pt-32">
        <div className="mb-10 animate-fade-in">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 text-sm text-white/50 transition-colors hover:text-[#84FF00]"
          >
            ← Back
          </button>

          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#84FF00]">
            My Nutrition
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Your <span className="text-[#84FF00]">Progress</span>
          </h1>

          {enrollment && (
            <p className="mt-2 text-sm text-white/50">
              {enrollment.planName} · Coach {enrollment.coachName}
            </p>
          )}
        </div>

        {isLoading && (
          <div className="py-10 text-center text-sm text-white/50">Loading your progress…</div>
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
            <p className="mb-2 text-[17px] font-bold text-white">No progress yet</p>
            <p className="text-[13.5px] text-white/55">
              Submit your first weekly check-in to start building your progress history.
            </p>
          </div>
        )}

        {!isLoading && !loadError && history.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* Summary stat cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                <span className="block text-2xl font-black tracking-tight text-[#84FF00]">
                  {latestWeight?.toFixed(1)}
                  <span className="ml-1 text-sm font-semibold text-white/45">kg</span>
                </span>
                <span className="text-xs font-medium text-white/70">Current Avg Weight</span>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                <span
                  className={cn(
                    "block text-2xl font-black tracking-tight",
                    totalDelta !== null && totalDelta < 0
                      ? "text-[#84FF00]"
                      : totalDelta !== null && totalDelta > 0
                      ? "text-[#FF6B00]"
                      : "text-white/70"
                  )}
                >
                  {totalDelta !== null ? weightDeltaLabel(totalDelta) : "—"}
                </span>
                <span className="text-xs font-medium text-white/70">Total Change</span>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                <span className="block text-2xl font-black tracking-tight text-[#00D9FF]">
                  {avgAdherence}%
                </span>
                <span className="text-xs font-medium text-white/70">Average Adherence</span>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                <span className="block text-2xl font-black tracking-tight text-white">
                  {reviewedCount}/{totalWeeks ?? history.length}
                </span>
                <span className="text-xs font-medium text-white/70">Weeks Reviewed</span>
              </div>
            </div>

            {/* Chart */}
            <ProgressChart history={history} />

            {/* Per-week breakdown */}
            <div className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6">
              <h3 className="mb-4 text-lg font-black uppercase tracking-tight text-white">
                Week-by-Week
              </h3>

              <div className="flex flex-col divide-y divide-white/10">
                {[...history].reverse().map((item) => (
                  <div
                    key={item.weekNumber}
                    className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-white">
                        Week {item.weekNumber}
                      </span>
                      <span className="text-xs text-white/45">{formatDate(item.submittedAt)}</span>
                    </div>

                    <div className="flex items-center gap-5 text-sm">
                      <span className="text-white/75">
                        {item.averageWeight.toFixed(1)}{" "}
                        <span className="text-white/40">kg</span>
                      </span>

                      <span className="text-white/75">
                        {item.adherencePercent}
                        <span className="text-white/40">% adherence</span>
                      </span>

                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase",
                          item.coachReviewed
                            ? "border-[#84FF00]/35 bg-[#84FF00]/10 text-[#84FF00]"
                            : "border-[#FF6B00]/35 bg-[#FF6B00]/10 text-[#FF6B00]"
                        )}
                      >
                        {item.coachReviewed ? "Reviewed" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}