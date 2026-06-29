"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CircleDashed,
  Layers3,
  Target,
  Activity,
  Zap,
  ClipboardCheck,
  TrendingUp,
  Lock,
  Check,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { EnrollmentCard } from "@/components/nutrition/enrollment-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEnrollments } from "@/services/nutrition-enrollment";
import type { Enrollment } from "@/types/enrollment";
import { cn } from "@/lib/utils";

function normalizeEnrollmentsResponse(response: unknown): Enrollment[] {
  if (Array.isArray(response)) return response as Enrollment[];

  if (response && typeof response === "object") {
    const data = response as { data?: unknown; items?: unknown; result?: unknown };

    if (Array.isArray(data.data)) return data.data as Enrollment[];
    if (Array.isArray(data.items)) return data.items as Enrollment[];
    if (Array.isArray(data.result)) return data.result as Enrollment[];
  }

  return [];
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function StatCard({
  label,
  value,
  icon,
  index,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="
        relative overflow-hidden
        rounded-2xl border border-[#84FF00]/15 bg-[#0a0a0a]
        p-5
        transition-all duration-300
        hover:border-[#84FF00]/40 hover:shadow-[0_0_20px_#84FF0022]
      "
    >
      <span className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-[#84FF00]/5 blur-2xl" />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-white">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#84FF00]/20 bg-[#84FF00]/10 text-[#84FF00]">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Primary action button for the top action bar — Check-In / Progress.
 * Glows on hover, lifts slightly, and supports a "locked" disabled state
 * with a tooltip-style hint underneath.
 */
function ActionButton({
  href,
  label,
  description,
  icon,
  index,
  disabled,
  disabledHint,
  variant = "solid",
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  disabled?: boolean;
  disabledHint?: string;
  variant?: "solid" | "outline";
}) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      whileHover={disabled ? undefined : { y: -4 }}
      className={cn(
        "group relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        disabled
          ? "cursor-not-allowed border-white/10 bg-white/[0.02] opacity-60"
          : variant === "solid"
          ? "border-[#84FF00]/25 bg-gradient-to-br from-[#84FF00]/10 to-transparent hover:border-[#84FF00]/60 hover:shadow-[0_0_30px_#84FF0033]"
          : "border-[#00D9FF]/25 bg-gradient-to-br from-[#00D9FF]/10 to-transparent hover:border-[#00D9FF]/60 hover:shadow-[0_0_30px_#00D9FF33]"
      )}
    >
      {!disabled && (
        <span
          className={cn(
            "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100",
            variant === "solid" ? "bg-[#84FF00]/25 opacity-40" : "bg-[#00D9FF]/25 opacity-40"
          )}
        />
      )}

      <div
        className={cn(
          "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
          disabled
            ? "border-white/10 bg-white/5 text-white/30"
            : variant === "solid"
            ? "border-[#84FF00]/30 bg-[#84FF00]/10 text-[#84FF00]"
            : "border-[#00D9FF]/30 bg-[#00D9FF]/10 text-[#00D9FF]"
        )}
      >
        {disabled ? <Lock size={18} /> : icon}
      </div>

      <div className="relative z-10 flex-1">
        <p className={cn("text-base font-bold", disabled ? "text-white/40" : "text-white")}>
          {label}
        </p>
        <p className={cn("mt-0.5 text-xs", disabled ? "text-white/30" : "text-gray-400")}>
          {disabled ? disabledHint ?? description : description}
        </p>
      </div>
    </motion.div>
  );

  if (disabled) {
    return <div aria-disabled="true">{content}</div>;
  }

  return (
    <Link href={href} className="flex flex-1">
      {content}
    </Link>
  );
}

/**
 * One button per week in the plan. Unlocked weeks (week <= maxWeekUnlocked)
 * are real links into that week's detail page; locked weeks render as
 * disabled, non-interactive buttons with a lock glyph.
 */
function WeekButton({
  week,
  enrollmentId,
  unlocked,
  isCurrent,
  index,
}: {
  week: number;
  enrollmentId: number;
  unlocked: boolean;
  isCurrent: boolean;
  index: number;
}) {
  const base = cn(
    "relative flex h-11 min-w-[88px] items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-all duration-300"
  );

  if (!unlocked) {
    return (
      <motion.button
        type="button"
        disabled
        aria-disabled="true"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
        className={cn(base, "cursor-not-allowed border-white/10 bg-white/[0.02] text-zinc-500")}
        title="This week hasn't been unlocked yet"
      >
        <Lock size={12} className="text-zinc-600" />
        Week {week}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Link
        href={`/nutrition/enrollments/${enrollmentId}/week/${week}`}
        className={cn(
          base,
          isCurrent
            ? "border-[#84FF00]/60 bg-[#84FF00]/15 text-[#84FF00] shadow-[0_0_18px_#84FF0033]"
            : "border-[#84FF00]/20 bg-[#84FF00]/5 text-[#84FF00]/90 hover:border-[#84FF00]/50 hover:bg-[#84FF00]/10 hover:shadow-[0_0_14px_#84FF0022]"
        )}
      >
        {isCurrent ? <Zap size={12} /> : <Check size={12} className="opacity-70" />}
        Week {week}
      </Link>
    </motion.div>
  );
}

export default function EnrollmentDetailsPage() {
  const params = useParams<{ enrollmentId: string }>();
  const enrollmentId = Number(params.enrollmentId);

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError("");
        setLoading(true);

        const res = await getEnrollments();
        const payload = (res as any)?.data ?? (res as any)?.result ?? res;

        if (mounted) setEnrollments(normalizeEnrollmentsResponse(payload));
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load enrollment details."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const enrollment = useMemo(
    () => enrollments.find((item) => item.id === enrollmentId),
    [enrollments, enrollmentId]
  );

  if (Number.isNaN(enrollmentId)) {
    notFound();
  }

  const totalWeeks = enrollment?.totalWeeks ?? enrollment?.maxWeekUnlocked ?? 0;
  const maxWeekUnlocked = enrollment?.maxWeekUnlocked ?? 0;

  return (
    <main
      className="
        min-h-screen bg-black text-white
        px-4 pt-24 pb-10 md:px-8
        bg-[linear-gradient(180deg,#050505_0%,#081006_30%,rgba(132,255,0,0.06)_100%)]
      "
    >
      <Navigation />

      <section className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-2">
            <Zap size={14} className="text-[#84FF00]" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#84FF00]">
              My Nutrition
            </span>
          </div>

          <h1 className="text-3xl font-black leading-tight md:text-5xl">
            <span className="text-[#84FF00] drop-shadow-[0_0_25px_#84FF00]">
              Enrollment
            </span>{" "}
            Details
          </h1>

          <p className="mt-4 max-w-3xl text-sm text-gray-400 md:text-base">
            Review your nutrition enrollment, unlocked weeks, calorie targets,
            and current progress status.
          </p>

          <div className="mt-6">
            <Button
              asChild
              variant="ghost"
              className="
                border border-[#84FF00]/20
                bg-[#84FF00]/5
                text-[#84FF00]
                hover:bg-[#84FF00]/10
                hover:text-[#84FF00]
              "
            >
              <Link href="/nutrition/enrollments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Enrollments
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Primary action bar — Check-In + Progress */}
        {!loading && !error && enrollment && (
          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
            <ActionButton
              href={`/nutrition/enrollments/${enrollment.id}/checkin`}
              label="Weekly Check-In"
              description={
                enrollment.pendingCheckIn
                  ? "Your next check-in is ready to submit"
                  : "Log your weekly weight, energy & adherence"
              }
              icon={<ClipboardCheck size={20} />}
              index={0}
              variant="solid"
            />
            <ActionButton
              href={`/nutrition/enrollments/${enrollment.id}/progress`}
              label="View Progress"
              description="Track your weight trend & check-in history"
              icon={<TrendingUp size={20} />}
              index={1}
              variant="outline"
            />
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-3 xl:grid-cols-3">
          <StatCard
            label="Plan"
            value={enrollment?.planName ?? "-"}
            icon={<Target size={18} />}
            index={0}
          />
          <StatCard
            label="Started"
            value={enrollment ? formatDate(enrollment.startDate) : "-"}
            icon={<CalendarDays size={18} />}
            index={1}
          />
          <StatCard
            label="Status"
            value={enrollment?.status ?? "-"}
            icon={<Activity size={18} />}
            index={2}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-16 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#84FF00] border-t-transparent" />
            <p className="text-sm uppercase tracking-widest text-gray-400">
              Loading enrollment details
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        ) : !enrollment ? (
          <div className="rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-16 text-center text-zinc-400">
            Enrollment not found.
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-2xl border border-[#84FF00]/15 bg-[#0a0a0a] p-5 transition-all duration-300 hover:border-[#84FF00]/40 hover:shadow-[0_0_20px_#84FF0022]">
              <EnrollmentCard enrollment={enrollment} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-[#84FF00]/15 bg-[#0a0a0a] p-5 transition-all duration-300 hover:border-[#84FF00]/40 hover:shadow-[0_0_20px_#84FF0022]">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Target className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.25em]">
                    Plan
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {enrollment.planName}
                </p>
              </div>

              <div className="rounded-2xl border border-[#84FF00]/15 bg-[#0a0a0a] p-5 transition-all duration-300 hover:border-[#84FF00]/40 hover:shadow-[0_0_20px_#84FF0022]">
                <div className="flex items-center gap-2 text-zinc-400">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.25em]">
                    Started
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {formatDate(enrollment.startDate)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#84FF00]/15 bg-[#0a0a0a] p-5 transition-all duration-300 hover:border-[#84FF00]/40 hover:shadow-[0_0_20px_#84FF0022]">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.25em]">
                    Baseline
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {Math.round(enrollment.baselineCalories)} kcal
                </p>
              </div>

              <div className="rounded-2xl border border-[#84FF00]/15 bg-[#0a0a0a] p-5 transition-all duration-300 hover:border-[#84FF00]/40 hover:shadow-[0_0_20px_#84FF0022]">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Layers3 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.25em]">
                    Current
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">
                  {Math.round(enrollment.currentAdjustedKcal)} kcal
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#84FF00]/15 bg-[#0a0a0a] p-6 transition-all duration-300 hover:border-[#84FF00]/40 hover:shadow-[0_0_20px_#84FF0022]">
              <div className="mb-4 flex items-center gap-2 text-zinc-400">
                <CircleDashed className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.25em]">
                  Unlock Status
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {Array.from(
                  { length: totalWeeks || maxWeekUnlocked },
                  (_, idx) => {
                    const week = idx + 1;
                    const unlocked = week <= maxWeekUnlocked;
                    const isCurrent = week === maxWeekUnlocked;

                    return (
                      <WeekButton
                        key={week}
                        week={week}
                        enrollmentId={enrollment.id}
                        unlocked={unlocked}
                        isCurrent={isCurrent}
                        index={idx}
                      />
                    );
                  }
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/20 p-5 text-zinc-300">
                <p className="text-sm text-zinc-400">Current week unlock</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  Week {enrollment.maxWeekUnlocked}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {enrollment.pendingCheckIn ? (
                    <Badge className="rounded-full bg-orange-500/15 text-orange-400 hover:bg-orange-500/15">
                      Pending Check-In
                    </Badge>
                  ) : null}

                  {enrollment.pendingCoachReview ? (
                    <Badge className="rounded-full bg-sky-500/15 text-sky-400 hover:bg-sky-500/15">
                      Awaiting Coach Review
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-[#84FF00]/15 bg-[#0a0a0a] p-6 md:flex-row md:items-center md:justify-between transition-all duration-300 hover:border-[#84FF00]/40 hover:shadow-[0_0_20px_#84FF0022]">
              <div>
                <p className="text-sm text-zinc-500">Need the full plan?</p>
                <p className="mt-1 text-zinc-200">
                  Open the nutrition plan page to preview calories and review
                  the plan structure.
                </p>
              </div>

              <Button
                asChild
                className="
                  rounded-xl bg-[#84FF00] font-semibold text-black
                  hover:bg-[#9aff33]
                "
              >
                <Link href={`/nutrition/${enrollment.nutritionPlanID}`}>
                  Preview Calories
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}