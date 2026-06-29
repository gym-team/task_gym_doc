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
      `Week ${result.weekNumber} check-in submitted — average weight ${result.averageWeight.toFixed(
        1
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
                  {latestAvgWeight?.toFixed(1)}
                </span>
                <span className="text-xs font-medium text-white/70">Latest Avg Weight (kg)</span>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
                <span className="block text-2xl font-black tracking-tight text-[#84FF00]">
                  {avgAdherence}%
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
                      {item.averageWeight.toFixed(1)} kg
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
/* ------------------------------------------------------------------ */
/*  Styles — FitZone Elite design system                              */
/* ------------------------------------------------------------------ */

const styles = `
  .ck-page {
    position: relative;
    background: #050505;
    min-height: 100vh;
    overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .ck-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 44px 44px;
    opacity: 0.05;
    pointer-events: none;
  }
  .ck-glow {
    position: absolute;
    width: 480px;
    height: 480px;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
  }
  .ck-glow-top {
    top: -160px;
    left: -120px;
    background: rgba(132,255,0,0.20);
  }
  .ck-glow-bottom {
    bottom: -200px;
    right: -140px;
    background: rgba(132,255,0,0.12);
  }
  .ck-container {
    position: relative;
    max-width: 880px;
    margin: 0 auto;
    padding: 56px 24px 96px;
    z-index: 1;
  }
  .ck-header {
    margin-bottom: 40px;
    animation: ck-fade-up 500ms ease-out both;
  }
  .ck-back {
    background: none;
    border: none;
    color: rgba(255,255,255,0.5);
    font-size: 13px;
    cursor: pointer;
    padding: 0;
    margin-bottom: 24px;
  }
  .ck-back:hover {
    color: #84FF00;
  }
  .ck-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }
  .ck-eyebrow {
    color: #84FF00;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin: 0 0 8px;
  }
  .ck-title {
    color: #fff;
    font-size: 34px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    margin: 0;
    line-height: 1.1;
  }
  .ck-title-accent {
    color: #84FF00;
  }
  .ck-submit-btn {
    background: #fff;
    color: #050505;
    border: none;
    border-radius: 12px;
    padding: 0 22px;
    height: 44px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 200ms;
  }
  .ck-submit-btn:hover {
    background: #84FF00;
  }
  .ck-stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .ck-stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .ck-stat-card-value {
    color: #84FF00;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.5px;
  }
  .ck-stat-card-label {
    color: rgba(255,255,255,0.70);
    font-size: 12px;
    font-weight: 500;
  }
  .ck-banner {
    margin: 0 0 24px;
    padding: 14px 18px;
    border-radius: 14px;
    font-size: 13.5px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    animation: ck-fade-up 400ms ease-out both;
  }
  .ck-banner-success {
    background: rgba(132,255,0,0.10);
    color: #84FF00;
    border: 1px solid rgba(132,255,0,0.35);
  }
  .ck-banner-dismiss {
    background: none;
    border: none;
    color: inherit;
    font-size: 18px;
    cursor: pointer;
    line-height: 1;
  }
  .ck-state {
    color: rgba(255,255,255,0.5);
    font-size: 14px;
    padding: 40px 0;
    text-align: center;
  }
  .ck-state-error {
    color: #FF6B00;
  }
  .ck-retry {
    display: block;
    margin: 14px auto 0;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.10);
    color: #fff;
    border-radius: 10px;
    padding: 9px 18px;
    font-size: 13px;
    cursor: pointer;
  }
  .ck-empty {
    text-align: center;
    background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 24px;
    padding: 56px 24px;
  }
  .ck-empty-title {
    color: #fff;
    font-size: 17px;
    font-weight: 700;
    margin: 0 0 8px;
  }
  .ck-empty-text {
    color: rgba(255,255,255,0.55);
    font-size: 13.5px;
    margin: 0;
  }
  .ck-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .ck-card {
    background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 24px;
    padding: 24px;
    overflow: hidden;
    transition: transform 300ms, box-shadow 300ms, border-color 300ms;
    animation: ck-fade-up 500ms ease-out both;
  }
  .ck-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 40px rgba(132,255,0,0.25);
    border-color: rgba(132,255,0,0.3);
  }
  .ck-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .ck-card-top-left {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }
  .ck-week-badge {
    color: #fff;
    font-weight: 800;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: -0.2px;
  }
  .ck-date {
    color: rgba(255,255,255,0.5);
    font-size: 13px;
  }
  .ck-review-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .ck-review-yes {
    background: rgba(132,255,0,0.12);
    color: #84FF00;
    border: 1px solid rgba(132,255,0,0.35);
  }
  .ck-review-pending {
    background: rgba(255,107,0,0.10);
    color: #FF6B00;
    border: 1px solid rgba(255,107,0,0.35);
  }
  .ck-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }
    .ck-page {
  padding-top: 80px;
}
  .ck-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .ck-stat-label {
    font-size: 10.5px;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .ck-stat-value {
    font-size: 15px;
    color: #fff;
    font-weight: 700;
  }
  .ck-card-footer {
    display: flex;
  }
  .ck-chip {
    font-size: 12px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 999px;
  }
  .ck-chip-cyan {
    background: rgba(0,217,255,0.10);
    color: #00D9FF;
    border: 1px solid rgba(0,217,255,0.35);
  }
  .ck-chip-orange {
    background: rgba(255,107,0,0.10);
    color: #FF6B00;
    border: 1px solid rgba(255,107,0,0.35);
  }
  .ck-chip-neutral {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.55);
    border: 1px solid rgba(255,255,255,0.10);
  }
  .ck-coach-note {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .ck-coach-note-label {
    display: block;
    font-size: 11px;
    font-weight: 800;
    color: #84FF00;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }
  .ck-coach-note-text {
    color: rgba(255,255,255,0.75);
    font-size: 13.5px;
    margin: 0;
    line-height: 1.6;
  }

  @keyframes ck-fade-up {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .ck-header, .ck-banner, .ck-card { animation: none; }
    .ck-card:hover { transform: none; }
  }

  @media (max-width: 640px) {
    .ck-stats-row {
      grid-template-columns: 1fr;
    }
    .ck-stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .ck-title {
      font-size: 26px;
    }
  }
`;