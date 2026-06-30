"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Target,
  Trophy,
  UtensilsCrossed,
  Zap,
  Crown,
  Sparkles,
  LogIn,
  Loader2,
} from "lucide-react";

import { NutritionPlanDetails } from "@/types/nutrition-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TdeePreviewModal } from "@/components/nutrition/tdee-preview-modal";

interface PlanDetailsProps {
  plan: NutritionPlanDetails;
}

type EnrollmentLite = {
  id: number;
  nutritionPlanID?: number;
  nutritionPlanId?: number;
  planId?: number;
  status?: string;
  planName?: string;
};

function formatTarget(plan: NutritionPlanDetails) {
  if (plan.calorieStrategy?.toLowerCase().includes("absolute")) {
    return plan.absoluteCalorieTarget
      ? `${plan.absoluteCalorieTarget} kcal/day`
      : "Absolute target";
  }

  if (
    plan.tdeeAdjustmentKcal !== undefined &&
    plan.tdeeAdjustmentKcal !== null &&
    plan.tdeeAdjustmentKcal !== 0
  ) {
    const sign = plan.tdeeAdjustmentKcal > 0 ? "+" : "";
    return `TDEE ${sign}${plan.tdeeAdjustmentKcal} kcal`;
  }

  return "TDEE based";
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://fitzone-16.runasp.net";

// نفس منطق resolveImageSrc المستخدم في باقي الصفحات (coach/plans, PlanCard):
// - http(s) كامل -> يستخدم كما هو
// - /uploads/... -> مخزن جوه public/uploads بتاع Next.js نفسه، يفضل كما هو
// - أي path نسبي تاني -> نفترض إنه على الـ API ونلحقه بالـ API_BASE
function resolveImageSrc(url?: string | null): string | null {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  if (url.startsWith("/uploads/")) return url;

  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE}${normalized}`;
}

// الصور الثابتة دي بتتستخدم بس كـ fallback لو الخطة مفيهاش صورة مرفوعة
// (photoThumbnailUrl) أصلاً
function getFallbackHeroImage(plan: NutritionPlanDetails) {
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

function getStoredToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("authToken")
  );
}

export function PlanDetails({ plan }: PlanDetailsProps) {
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentEnrollmentId, setCurrentEnrollmentId] = useState<number | null>(
    null
  );

  const planId = useMemo(() => plan.id ?? null, [plan.id]);

  // أولوية للصورة الحقيقية بتاعة الخطة (photoThumbnailUrl)، ولو مش موجودة
  // نرجع للصورة الثابتة حسب الـ goal
  const heroImage = useMemo(
    () => resolveImageSrc(plan.photoThumbnailUrl) || getFallbackHeroImage(plan),
    [plan]
  );

  // الصور الجاية من الـ API (absolute URL أو من فولدر uploads بتاع
  // Next.js) لسه ممكن تكون مش مضافة في next.config.js remotePatterns،
  // فبنعطّل التحسين بتاعها لحد ما الدومين يتضاف هناك
  const isRemoteImage = heroImage.startsWith("http");

  const coachInitial =
    plan.coachName?.trim()?.charAt(0)?.toUpperCase() || "E";

  useEffect(() => {
    let alive = true;

    async function checkEnrollment() {
      try {
        setCheckingEnrollment(true);

        const token = getStoredToken();
        if (!token || !planId) {
          if (alive) {
            setIsEnrolled(false);
            setCurrentEnrollmentId(null);
          }
          return;
        }

        const response = await fetch(`${API_BASE}/api/nutritionenrollment`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          if (alive) {
            setIsEnrolled(false);
            setCurrentEnrollmentId(null);
          }
          return;
        }

        const data = (await response.json()) as EnrollmentLite[] | any;

        const enrollments: EnrollmentLite[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : [];

        const existing = enrollments.find((item) => {
          const itemPlanId =
            item.nutritionPlanID ?? item.nutritionPlanId ?? item.planId;
          const status = (item.status ?? "").toLowerCase();

          return (
            Number(itemPlanId) === Number(planId) &&
            (status === "active" ||
              status === "pendingcoachreview" ||
              status === "pendingcheckin")
          );
        });

        if (alive && existing) {
          setIsEnrolled(true);
          setCurrentEnrollmentId(existing.id);
        } else if (alive) {
          setIsEnrolled(false);
          setCurrentEnrollmentId(null);
        }
      } catch {
        if (alive) {
          setIsEnrolled(false);
          setCurrentEnrollmentId(null);
        }
      } finally {
        if (alive) setCheckingEnrollment(false);
      }
    }

    checkEnrollment();

    return () => {
      alive = false;
    };
  }, [planId]);

  const handlePreview = () => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setPreviewOpen(true);
  };

  const handleContinue = () => {
    if (currentEnrollmentId) {
      router.push(`/nutrition/enrollments/${currentEnrollmentId}`);
    }
  };

  return (
    <>
      <div className="min-w-0 space-y-8">
        <Card className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="relative min-h-[440px] w-full md:min-h-[560px]">
            <Image
              src={heroImage}
              alt={plan.name}
              fill
              unoptimized={isRemoteImage}
              className="object-cover"
              priority
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.97)_0%,rgba(0,0,0,0.78)_30%,rgba(0,0,0,0.22)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,255,0,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,217,255,0.12),transparent_35%)]" />
            <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:60px_60px]" />

            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#84FF00] to-transparent opacity-70" />

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="rounded-full border-0 bg-[#84FF00] px-3 py-1 text-black hover:bg-[#84FF00]">
                  {plan.trainingGoal}
                </Badge>
                <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/85 hover:bg-white/10">
                  {plan.fitnessLevel}
                </Badge>
                <Badge className="rounded-full border-0 bg-[#00D9FF]/15 px-3 py-1 text-[#00D9FF] hover:bg-[#00D9FF]/15">
                  {plan.durationOnWeeks} Weeks
                </Badge>
              </div>

              <h1 className="max-w-5xl break-words text-4xl font-black uppercase leading-[0.9] tracking-tight text-white md:text-6xl xl:text-7xl">
                {plan.name}
              </h1>

              <p className="mt-6 max-w-4xl text-base leading-8 text-white/75 md:text-lg">
                {plan.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/80">
                <span className="font-semibold text-white">
                  {plan.coachName || "Elite Coach"}
                </span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-[#84FF00]" />
                  Premium Nutrition Protocol
                </span>
                <span className="text-white/30">•</span>
                <span className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#FF6B00]" />
                  Performance Driven
                </span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 md:p-10">
            <div className="grid gap-8 xl:grid-cols-[1.7fr_420px]">
              <div className="min-w-0 space-y-8">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-xl">
                  <div className="mb-4 flex items-center gap-2 text-[#84FF00]">
                    <Sparkles className="h-4 w-4" />
                    <p className="text-xs font-bold uppercase tracking-[0.25em]">
                      Plan Overview
                    </p>
                  </div>

                  <p className="max-w-none leading-8 text-white/75">
                    {plan.description}
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#84FF00]/30">
                    <div className="flex items-center gap-2 text-white/55">
                      <Target className="h-4 w-4 text-[#84FF00]" />
                      <p className="text-xs uppercase tracking-[0.22em]">
                        Calorie Strategy
                      </p>
                    </div>
                    <p className="mt-3 break-words text-xl font-bold text-white">
                      {plan.calorieStrategy}
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      {formatTarget(plan)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#84FF00]/30">
                    <div className="flex items-center gap-2 text-white/55">
                      <UtensilsCrossed className="h-4 w-4 text-[#84FF00]" />
                      <p className="text-xs uppercase tracking-[0.22em]">
                        Protein Target
                      </p>
                    </div>
                    <p className="mt-3 text-xl font-bold text-white">
                      {plan.proteinTargetPerKg} g/kg
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      Daily protein target per kilogram of bodyweight.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-1">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                      Equipment Type
                    </p>
                    <p className="mt-3 break-words text-base font-medium text-white/85">
                      {plan.equipmentType}
                    </p>
                  </div>
                </div>

                {plan.expectedOutcome ? (
                  <div className="rounded-3xl border border-[#84FF00]/20 bg-[#84FF00]/5 p-6 md:p-8">
                    <div className="flex items-center gap-2 text-[#84FF00]">
                      <CheckCircle2 className="h-4 w-4" />
                      <p className="text-xs font-bold uppercase tracking-[0.22em]">
                        Expected Outcome
                      </p>
                    </div>
                    <p className="mt-4 leading-8 text-white/75">
                      {plan.expectedOutcome}
                    </p>
                  </div>
                ) : null}

                {plan.nutritionWeeks?.length ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-xl">
                    <div className="mb-5 flex items-center gap-2 text-[#84FF00]">
                      <Zap className="h-4 w-4" />
                      <p className="text-xs font-bold uppercase tracking-[0.22em]">
                        Weekly Structure
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {plan.nutritionWeeks.slice(0, 6).map((week, index) => (
                        <div
                          key={week.id ?? index}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4"
                        >
                          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                            Week {week.weekNumber ?? index + 1}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {week.weekDescription ||
                              week.focusArea ||
                              "Nutrition week"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <aside className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                    Coach
                  </p>

                  <div className="mt-5 flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#84FF00]/25 bg-[#84FF00]/10 font-black text-[#84FF00]">
                      {coachInitial}
                    </div>

                    <div className="min-w-0">
                      <p className="break-words text-lg font-semibold text-white">
                        {plan.coachName || "Unknown Coach"}
                      </p>
                      <p className="mt-1 text-sm text-white/60">
                        Assigned nutrition specialist
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                    Plan Metrics
                  </p>

                  <div className="mt-5 grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                        Duration
                      </p>
                      <p className="mt-2 text-lg font-bold text-white">
                        {plan.durationOnWeeks} Weeks
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                        Goal
                      </p>
                      <p className="mt-2 break-words text-lg font-bold text-white">
                        {plan.trainingGoal}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                        Level
                      </p>
                      <p className="mt-2 break-words text-lg font-bold text-white">
                        {plan.fitnessLevel}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                        Strategy
                      </p>
                      <p className="mt-2 break-words text-lg font-bold text-white">
                        {plan.calorieStrategy}
                      </p>
                    </div>
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
                    Review your calorie targets, validate the nutrition
                    direction, and start enrollment when ready.
                  </p>

                  <div className="mt-6 flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className="h-11 rounded-xl border-white/15 bg-transparent text-white hover:border-[#84FF00]/40 hover:bg-[#84FF00]/5 hover:text-[#84FF00]"
                      onClick={handlePreview}
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

                    {isEnrolled ? (
                      <Button
                        className="h-11 rounded-xl bg-[#84FF00] font-bold text-black hover:bg-[#9BFF2D]"
                        onClick={handleContinue}
                        disabled={!currentEnrollmentId}
                      >
                        Continue Plan
                      </Button>
                    ) : (
                      <Button
                        className="h-11 rounded-xl bg-[#84FF00] font-bold text-black hover:bg-[#9BFF2D]"
                        onClick={handlePreview}
                        disabled={!planId || checkingEnrollment}
                      >
                        Enroll Now
                      </Button>
                    )}

                    {!getStoredToken() ? (
                      <Button
                        variant="ghost"
                        className="h-11 rounded-xl text-white/75 hover:bg-white/5 hover:text-white"
                        asChild
                      >
                        <Link href="/login" className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" />
                          Login to continue
                        </Link>
                      </Button>
                    ) : null}
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
              </aside>
            </div>
          </CardContent>
        </Card>
      </div>

      <TdeePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        planId={planId}
        planName={plan.name}
        isSubscribed={isEnrolled}
        currentEnrollmentId={currentEnrollmentId}
        onStarted={(enrollment) => {
          const id = (enrollment as any)?.id;
          if (id) router.push(`/nutrition/enrollments/${id}`);
        }}
      />
    </>
  );
}