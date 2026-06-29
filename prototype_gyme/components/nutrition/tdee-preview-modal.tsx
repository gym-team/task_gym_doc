"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Flame,
  Trophy,
  Sparkles,
  Loader2,
  Dumbbell,
  Apple,
  Beef,
  ChevronRight,
} from "lucide-react";

import { getEnrollments, previewTDEE, startEnrollment } from "@/services/nutrition-enrollment";
import { Enrollment } from "@/types/enrollment";
import { NutritionPlan, NutritionPlanDetails } from "@/types/nutrition-plan";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PlanDetailsProps {
  plan: NutritionPlanDetails;
}

interface TdeePreviewResponse {
  bmr: number;
  tdee: number;
  adjustedCalories: number;

  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;

  goal: string;
  activityLevel: string;
  calculationMethod: string;
}

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: number | null;
  planName?: string;
  isSubscribed?: boolean;
  currentEnrollmentId?: number | null;
  onStarted?: (enrollment: unknown) => void;
}

type EnrollmentLike = Partial<Enrollment> & Record<string, unknown>;
type ApiPayload = Record<string, unknown> | null | undefined;

const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatKcal = (value: unknown) => {
  return `${Math.round(safeNumber(value))} kcal`;
};

function getHeroImage(plan: NutritionPlan) {
  const goal = (plan.trainingGoal || "").toLowerCase();

  if (goal.includes("fat") || goal.includes("loss") || goal.includes("cut")) {
    return "/nutrition-fat-loss.jpg";
  }

  if (
    goal.includes("muscle") ||
    goal.includes("hypertrophy") ||
    goal.includes("gain")
  ) {
    return "/nutrition-muscle-gain.jpg";
  }

  if (
    goal.includes("performance") ||
    goal.includes("athletic") ||
    goal.includes("endurance")
  ) {
    return "/nutrition-performance.jpg";
  }

  return "/feature-nutrition-plan.jpg";
}

function normalizePreviewPayload(payload: ApiPayload): TdeePreviewResponse {
  const p = (payload ?? {}) as Record<string, unknown>;

  return {
    bmr: safeNumber(p.bmr),
    tdee: safeNumber(p.tdee),
    adjustedCalories: safeNumber(p.adjustedCalories ?? p.adjustedCaloriesKcal),

    proteinTargetG: safeNumber(
      p.proteinTargetG ?? p.proteinGrams ?? p.proteinG
    ),
    carbTargetG: safeNumber(p.carbTargetG ?? p.carbGrams ?? p.carbG),
    fatTargetG: safeNumber(p.fatTargetG ?? p.fatGrams ?? p.fatG),

    goal: String(p.goal ?? p.trainingGoal ?? ""),
    activityLevel: String(p.activityLevel ?? p.activity ?? ""),
    calculationMethod: String(
      p.calculationMethod ?? p.methodLabel ?? "Mifflin-St Jeor (1990)"
    ),
  };
}

function extractEnrollments(payload: unknown): EnrollmentLike[] {
  if (Array.isArray(payload)) return payload as EnrollmentLike[];

  const p = payload as Record<string, unknown> | null | undefined;
  if (!p || typeof p !== "object") return [];

  if (Array.isArray(p.data)) return p.data as EnrollmentLike[];
  if (Array.isArray(p.result)) return p.result as EnrollmentLike[];
  if (Array.isArray(p.items)) return p.items as EnrollmentLike[];

  return [];
}

function getEnrollmentPlanId(enrollment: EnrollmentLike): number {
  return safeNumber(
    enrollment.nutritionPlanId ??
      enrollment.nutritionPlanID ??
      enrollment.planId ??
      enrollment.NutritionPlanId ??
      enrollment.NutritionPlanID
  );
}

export function TdeePreviewModal({
  open,
  onOpenChange,
  planId,
  planName,
  isSubscribed,
  currentEnrollmentId,
  onStarted,
}: PreviewModalProps) {
  const router = useRouter();

  const [data, setData] = useState<TdeePreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !planId) return;

    let mounted = true;

    const loadPreview = async () => {
      try {
        setLoadingPreview(true);
        setError("");

        const payload = await previewTDEE(planId);

        if (!mounted) return;

        setData(normalizePreviewPayload(payload as ApiPayload));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load preview.");
      } finally {
        setLoadingPreview(false);
      }
    };

    loadPreview();

    return () => {
      mounted = false;
    };
  }, [open, planId]);

  const handleStartEnrollment = async () => {
    if (!planId) return;

    try {
      setLoadingStart(true);

      const payload = await startEnrollment(planId);

      onStarted?.(payload);

      onOpenChange(false);

      const startedId = safeNumber(
        (payload as Record<string, unknown> | null | undefined)?.id
      );

      if (startedId) {
        router.push(`/nutrition/enrollments/${startedId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrollment failed.");
    } finally {
      setLoadingStart(false);
    }
  };

  const handleContinuePlan = () => {
    if (!currentEnrollmentId) return;
    onOpenChange(false);
    router.push(`/nutrition/enrollments/${currentEnrollmentId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl">Preview My Targets</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Plan: {planName}
          </DialogDescription>
        </DialogHeader>

        {loadingPreview ? (
          <div className="flex items-center gap-3 py-10 text-zinc-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Preview...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-orange-500/15 text-orange-400">
                {data.goal}
              </Badge>

              <Badge className="bg-white/10 text-zinc-200">
                {data.activityLevel}
              </Badge>

              <Badge className="bg-emerald-500/15 text-emerald-400">
                {data.calculationMethod}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Flame className="h-4 w-4" />
                  BMR
                </div>
                <div className="mt-4 text-4xl font-bold">
                  {formatKcal(data.bmr)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Dumbbell className="h-4 w-4" />
                  TDEE
                </div>
                <div className="mt-4 text-4xl font-bold">
                  {formatKcal(data.tdee)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <ChevronRight className="h-4 w-4" />
                  Adjusted Calories
                </div>
                <div className="mt-4 text-4xl font-bold">
                  {formatKcal(data.adjustedCalories)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Beef className="h-4 w-4" />
                  Protein
                </div>
                <div className="mt-4 text-4xl font-bold">
                  {Math.round(data.proteinTargetG)} g
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Apple className="h-4 w-4" />
                  Carbs
                </div>
                <div className="mt-4 text-4xl font-bold">
                  {Math.round(data.carbTargetG)} g
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Flame className="h-4 w-4" />
                  Fat
                </div>
                <div className="mt-4 text-4xl font-bold">
                  {Math.round(data.fatTargetG)} g
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="mb-4 text-zinc-400">Target Breakdown</p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 p-4">
                  <p className="text-zinc-500">Protein</p>
                  <p className="mt-2 text-2xl font-bold">
                    {Math.round(data.proteinTargetG)} g
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 p-4">
                  <p className="text-zinc-500">Carbs</p>
                  <p className="mt-2 text-2xl font-bold">
                    {Math.round(data.carbTargetG)} g
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 p-4">
                  <p className="text-zinc-500">Fat</p>
                  <p className="mt-2 text-2xl font-bold">
                    {Math.round(data.fatTargetG)} g
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/15 bg-transparent text-white hover:bg-white/5"
          >
            Close
          </Button>

          {isSubscribed ? (
            <Button
              onClick={handleContinuePlan}
              disabled={!currentEnrollmentId}
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              Continue Plan
            </Button>
          ) : (
            <Button
              onClick={handleStartEnrollment}
              disabled={loadingStart}
              className="bg-orange-500 text-black hover:bg-orange-400"
            >
              {loadingStart ? "Starting..." : "Start Enrollment"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PlanDetails({ plan }: PlanDetailsProps) {
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);

  const planId = useMemo(() => plan.id ?? null, [plan.id]);
  const heroImage = useMemo(() => getHeroImage(plan), [plan]);

  const coachInitial =
    plan.coachName?.trim()?.charAt(0)?.toUpperCase() || "E";

  const [existingEnrollment, setExistingEnrollment] =
    useState<Enrollment | null>(null);

  const [checkingEnrollment, setCheckingEnrollment] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    const loadEnrollments = async () => {
      try {
        const payload = await getEnrollments();
        const enrollments = extractEnrollments(payload);

        const found = enrollments.find((e) => {
          const planIdFromApi = getEnrollmentPlanId(e);
          const status = String(e.status ?? "").toLowerCase();

          return planIdFromApi === Number(plan.id) && status === "active";
        });

        if (mounted) {
          setExistingEnrollment((found as Enrollment) || null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setCheckingEnrollment(false);
        }
      }
    };

    loadEnrollments();

    return () => {
      mounted = false;
    };
  }, [plan.id]);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden border-white/10 bg-[#0B0F0E] text-white shadow-2xl shadow-black/30">
          <CardContent className="p-0">
            <div className="relative h-[320px] w-full">
              <Image
                src={heroImage}
                alt={plan.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="space-y-8 p-6 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                    {plan.name}
                  </h1>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="rounded-full bg-[#84FF00]/15 text-[#84FF00]">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Premium Plan
                    </Badge>

                    <Badge className="rounded-full border-white/10 bg-white/5 text-white/70">
                      {plan.trainingGoal}
                    </Badge>

                    <Badge className="rounded-full border-white/10 bg-white/5 text-white/70">
                      {plan.fitnessLevel}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#84FF00] font-black text-black">
                    {coachInitial}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {plan.coachName || "Unknown Coach"}
                    </p>
                    <p className="text-sm text-white/60">
                      Assigned nutrition specialist
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                    Duration
                  </p>
                  <p className="mt-3 text-xl font-bold text-white">
                    {plan.durationOnWeeks} Weeks
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                    Goal
                  </p>
                  <p className="mt-3 text-xl font-bold text-white">
                    {plan.trainingGoal}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                    Strategy
                  </p>
                  <p className="mt-3 text-xl font-bold text-white">
                    {plan.calorieStrategy}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-[#84FF00]/20 bg-gradient-to-b from-[#84FF00]/10 to-transparent p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-[#84FF00]">
                  <Trophy className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-[0.22em]">
                    Ready to start?
                  </p>
                </div>

                <h3 className="mt-4 text-xl font-black text-white">
                  Preview your targets and unlock the plan.
                </h3>

                <p className="mt-3 leading-7 text-white/65">
                  Review your calorie targets, validate the nutrition direction,
                  and start enrollment when ready.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-white/15 bg-transparent text-white hover:border-[#84FF00]/40 hover:bg-[#84FF00]/5 hover:text-[#84FF00]"
                    onClick={() => setPreviewOpen(true)}
                    disabled={!planId || checkingEnrollment}
                  >
                    {checkingEnrollment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Preview My Targets"
                    )}
                  </Button>

                  {existingEnrollment ? (
                    <Button
                      className="h-11 rounded-xl bg-[#84FF00] font-bold text-black hover:bg-[#9BFF2D]"
                      onClick={() =>
                        router.push(
                          `/nutrition/enrollments/${existingEnrollment.id}`
                        )
                      }
                    >
                      Continue Plan
                    </Button>
                  ) : (
                    <Button
                      className="h-11 rounded-xl bg-[#84FF00] font-bold text-black hover:bg-[#9BFF2D]"
                      onClick={() => setPreviewOpen(true)}
                      disabled={!planId || checkingEnrollment}
                    >
                      Enroll Now
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-start">
                <Button
                  asChild
                  variant="ghost"
                  className="h-11 rounded-xl text-white/75 hover:bg-white/5 hover:text-white"
                >
                  <Link href="/nutrition" className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back to Catalog
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TdeePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        planId={planId}
        planName={plan.name}
        isSubscribed={!!existingEnrollment}
        currentEnrollmentId={existingEnrollment?.id ?? null}
        onStarted={(enrollment) => {
          const id = safeNumber(
            (enrollment as Record<string, unknown> | null | undefined)?.id
          );
          if (id) router.push(`/nutrition/enrollments/${id}`);
        }}
      />
    </>
  );
}