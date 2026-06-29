"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import {
  Flame,
  TrendingUp,
  Clock,
  Dumbbell,
  Timer,
  Activity,
  Star,
  Play,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import "@/styles/globals.css";

type Plan = {
  id?: number;
  name: string;
  description?: string;
  expectedOutcome?: string;
  trackName?: string;
  coachName?: string;
  coachRating?: number | string | null;
  durationOnWeeks?: number;
  sessionsPerWeeks?: number;
  sessionsDuration?: number;
  trainingGoal?: string;
  fitnessLevel?: string;
  equipmentType?: string;
  photoThumbnailUrl?: string | null;
  isPublished?: boolean;
};

type PaginatedPlanResponse = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: Plan[];
};

type EnrollmentItem = {
  id?: number;
  programID?: number;
  workoutProgramID?: number;
  programId?: number;
  workoutProgramId?: number;
  status?: string;
  programName?: string;
};

type PlanApiResponse = PaginatedPlanResponse | Plan | Plan[] | null;

export default function PlanDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const planId = Number(params?.planId);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const [starting, setStarting] = useState(false);
  const [started, setStarted] = useState(false);

  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const getEnrollmentProgramId = (item: EnrollmentItem) =>
    item.programID ??
    item.workoutProgramID ??
    item.programId ??
    item.workoutProgramId ??
    null;

  const normalizePlanResponse = (payload: PlanApiResponse): Plan | null => {
    if (!payload) return null;

    // لو API بيرجع Pagination object
    if (typeof payload === "object" && !Array.isArray(payload) && "data" in payload) {
      const paginated = payload as PaginatedPlanResponse;

      if (Array.isArray(paginated.data) && paginated.data.length > 0) {
        // نحاول نجيب العنصر المطابق للـ id لو موجود
        const matched = paginated.data.find((item) => Number(item.id) === planId);
        return matched ?? paginated.data[0] ?? null;
      }

      return null;
    }

    // لو بيرجع Array مباشرة
    if (Array.isArray(payload)) {
      const matched = payload.find((item) => Number(item.id) === planId);
      return matched ?? payload[0] ?? null;
    }

    // لو بيرجع Object مباشر
    return payload as Plan;
  };

  // =========================
  // FETCH PLAN
  // =========================
  useEffect(() => {
    if (!Number.isFinite(planId) || planId <= 0) {
      setLoadingPlan(false);
      return;
    }

    let ignore = false;

    async function loadPlan() {
      try {
        setLoadingPlan(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/Program/${planId}`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) {
          throw new Error("Failed to load plan");
        }

        const payload: PlanApiResponse = await res.json();
        const normalizedPlan = normalizePlanResponse(payload);

        if (!ignore) {
          setPlan(normalizedPlan);
        }
      } catch (err) {
        console.error("Load plan error:", err);
      } finally {
        if (!ignore) {
          setLoadingPlan(false);
        }
      }
    }

    loadPlan();

    return () => {
      ignore = true;
    };
  }, [planId]);

  // =========================
  // CHECK EXISTING ENROLLMENT
  // =========================
  useEffect(() => {
    if (!Number.isFinite(planId) || planId <= 0) return;

    const token = getToken();
    if (!token) return;

    let ignore = false;

    async function loadEnrollment() {
      try {
        setCheckingEnrollment(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/Enrollment`,
          {
            method: "GET",
            headers: {
              accept: "text/plain",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (!res.ok) return;

        const data = await res.json().catch(() => null);
        if (!Array.isArray(data) || ignore) return;

        const enrolled = data.some((item: EnrollmentItem) => {
          const itemProgramId = getEnrollmentProgramId(item);
          const isActive = String(item.status || "").toLowerCase() === "active";

          return itemProgramId === planId && isActive;
        });

        if (enrolled) {
          setStarted(true);
        }
      } catch (err) {
        console.error("Load enrollment error:", err);
      } finally {
        if (!ignore) {
          setCheckingEnrollment(false);
        }
      }
    }

    loadEnrollment();

    return () => {
      ignore = true;
    };
  }, [planId]);

  // =========================
  // START PLAN
  // =========================
  async function startPlan() {
    try {
      setStarting(true);

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Enrollment/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            programID: planId,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.title || data?.error || "Failed to start plan",
        );
      }

      setStarted(true);

      if (data) {
        localStorage.setItem("currentEnrollment", JSON.stringify(data));
      }

      router.push("/program");
    } catch (error: any) {
      console.error("Start plan error:", error);
      alert(error?.message || "Failed to start plan");
    } finally {
      setStarting(false);
    }
  }

  if (loadingPlan) {
    return (
      <section className="min-h-screen bg-[#050505] text-white">
        <Navigation />
        <div className="container mx-auto px-5 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading plan details...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!plan) {
    return (
      <section className="min-h-screen bg-[#050505] text-white">
        <Navigation />
        <div className="container mx-auto px-5 py-24 text-center">
          <h1 className="text-3xl font-black">Plan not found</h1>
          <p className="mt-3 text-white/70">
            We could not load this training program.
          </p>
          <button
            onClick={() => router.push("/plans")}
            className="mt-8 rounded-xl border border-[#84FF00] px-6 py-3 font-bold text-[#84FF00] hover:bg-[#84FF00] hover:text-black transition-colors"
          >
            Back to Plans
          </button>
        </div>
      </section>
    );
  }

  const coachRatingValue =
    plan.coachRating !== null && plan.coachRating !== undefined
      ? Number(plan.coachRating)
      : 5;

  const stats = [
    {
      icon: Flame,
      label: "Goal",
      value: plan.trainingGoal || "—",
    },
    {
      icon: TrendingUp,
      label: "Level",
      value: plan.fitnessLevel || "—",
    },
    {
      icon: Clock,
      label: "Duration",
      value: `${plan.durationOnWeeks ?? "—"} Weeks`,
    },
    {
      icon: Dumbbell,
      label: "Sessions",
      value: `${plan.sessionsPerWeeks ?? "—"}/week`,
    },
    {
      icon: Timer,
      label: "Session Time",
      value: `${plan.sessionsDuration ?? "—"} min`,
    },
    {
      icon: Activity,
      label: "Equipment",
      value: plan.equipmentType || "—",
    },
  ];

  const buttonLabel = started
    ? "Continue Plan"
    : starting
      ? "Starting..."
      : checkingEnrollment
        ? "Checking..."
        : "Start Plan";

  const handlePrimaryAction = () => {
    if (started) {
      router.push("/program");
      return;
    }

    startPlan();
  };

  return (
    <section className="pd-page min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navigation />

      {/* HERO */}
      <div className="relative pt-16 h-[78vh] flex items-center justify-center overflow-hidden">
        {/* IMAGE */}
        <Image
          src={plan.photoThumbnailUrl || "/3d-gym-equipment.jpg"}
          alt={plan.name}
          fill
          priority
          className="object-cover pd-hero-image"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/75 z-[1]" />

        {/* GREEN RADIAL */}
        <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_top,rgba(132,255,0,0.18),transparent_45%)]" />

        {/* BOTTOM FADE */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/20 via-black/55 to-[#050505]" />

        {/* SIDE SHADOWS */}
        <div className="absolute left-0 top-0 h-full w-[25%] bg-gradient-to-r from-black/80 to-transparent z-[2]" />
        <div className="absolute right-0 top-0 h-full w-[25%] bg-gradient-to-l from-black/80 to-transparent z-[2]" />

        {/* GRID */}
        <div className="pd-grid z-[3]" />

        {/* GLOW */}
        <div className="pd-glow-left z-[3]" />
        <div className="pd-glow-right z-[3]" />

        {/* CONTENT */}
        <div className="relative z-10 text-center px-6 max-w-5xl">
          {/* BADGE */}
          <div className="pd-badge">
            <Sparkles size={14} />
            TRAINING PROGRAM
          </div>

          {/* TITLE */}
          <h1 className="pd-title">{plan.name}</h1>

          {/* COACH NAME */}
          <p className="mt-4 text-lg font-semibold text-white/90">
            Coach:{" "}
            <span className="text-[#84FF00]">
              {plan.coachName || "—"}
            </span>
          </p>

          {/* TRACK */}
          {plan.trackName ? (
            <p className="mt-2 text-sm uppercase tracking-[0.25em] text-white/60">
              {plan.trackName}
            </p>
          ) : null}

          {/* DESCRIPTION */}
          <p className="pd-description">
            Elite transformation system designed to maximize performance,
            endurance, and physique with science-backed training methods.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
            <button
              onClick={handlePrimaryAction}
              disabled={starting || checkingEnrollment}
              className={`pd-main-btn ${
                started ? "started" : ""
              } inline-flex items-center gap-2`}
            >
              {started ? (
                <CheckCircle2 size={18} />
              ) : starting || checkingEnrollment ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Play size={18} />
              )}

              {buttonLabel}
            </button>

            <div className="pd-rating">
              <Star size={16} fill="#FFD700" color="#FFD700" />
              <span>{coachRatingValue ? coachRatingValue.toFixed(1) : "5.0"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-5 py-20">
        {/* STATS */}
        <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-5 mb-20">
          {stats.map(({ icon: Icon, label, value }, i) => (
            <div
              key={i}
              className="pd-stat-card"
              style={{
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div className="pd-stat-icon">
                <Icon size={18} />
              </div>

              <span className="pd-stat-label">{label}</span>
              <span className="pd-stat-value">{value}</span>
            </div>
          ))}
        </div>

        {/* RESULTS */}
        <div className="pd-results">
          <div className="pd-results-badge">Expected Outcome</div>

          <h2 className="pd-results-title">WHAT YOU&apos;LL ACHIEVE</h2>

          <p className="pd-results-text">
            {plan.expectedOutcome || "No outcome description available."}
          </p>
        </div>
      </div>
    </section>
  );
}