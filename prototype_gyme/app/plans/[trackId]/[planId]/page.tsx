"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
} from "lucide-react";

import "@/styles/globals.css";

export default function PlanDetailsPage() {
  const params = useParams();
  const planId = Number(params?.planId);

  const [plan, setPlan] = useState<any>(null);

  const [starting, setStarting] =
    useState(false);

  const [started, setStarted] =
    useState(false);

  // =========================
  // FETCH PLAN
  // =========================
  useEffect(() => {
    if (!planId) return;

    async function loadPlan() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/Program/${planId}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        setPlan(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadPlan();
  }, [planId]);

  // =========================
  // START PLAN
  // =========================
  async function startPlan() {
    try {
      setStarting(true);

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Enrollment/start`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            programId: planId,
          }),
        }
      );

      setStarted(true);
    } catch {
      alert("Failed to start plan");
    } finally {
      setStarting(false);
    }
  }

  if (!plan) return null;

  const stats = [
    {
      icon: Flame,
      label: "Goal",
      value: plan.trainingGoal,
    },

    {
      icon: TrendingUp,
      label: "Level",
      value: plan.fitnessLevel,
    },

    {
      icon: Clock,
      label: "Duration",
      value: `${plan.durationOnWeeks} Weeks`,
    },

    {
      icon: Dumbbell,
      label: "Sessions",
      value: `${plan.sessionsPerWeeks}/week`,
    },

    {
      icon: Timer,
      label: "Session Time",
      value: `${plan.sessionsDuration} min`,
    },

    {
      icon: Activity,
      label: "Equipment",
      value: plan.equipmentType,
    },
  ];

  return (
    <section className="pd-page min-h-screen bg-[#050505] text-white overflow-hidden">
                     <Navigation />

      {/* HERO */}
      <div className="relative pt-16 h-[78vh] flex items-center justify-center overflow-hidden">

        {/* IMAGE */}
        <Image
          src={
            plan.photoThumbnailUrl ||
            "/3d-gym-equipment.jpg"
          }
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
          <h1 className="pd-title">
            {plan.name}
          </h1>

          {/* DESCRIPTION */}
          <p className="pd-description">
            Elite transformation system designed
            to maximize performance, endurance,
            and physique with science-backed
            training methods.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">

            <button
              onClick={startPlan}
              disabled={starting || started}
              className={`pd-main-btn ${
                started ? "started" : ""
              }`}
            >
              <Play size={18} />

              {started
                ? "Plan Started"
                : starting
                ? "Starting..."
                : "Start Plan"}
            </button>

            <div className="pd-rating">
              <Star
                size={16}
                fill="#FFD700"
                color="#FFD700"
              />

              <span>
                {plan.coachRating || "5.0"}
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-5 py-20">

        {/* STATS */}
        <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-5 mb-20">

          {stats.map(
            (
              {
                icon: Icon,
                label,
                value,
              },
              i
            ) => (
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

                <span className="pd-stat-label">
                  {label}
                </span>

                <span className="pd-stat-value">
                  {value}
                </span>
              </div>
            )
          )}

        </div>

        {/* RESULTS */}
        <div className="pd-results">

          <div className="pd-results-badge">
            Expected Outcome
          </div>

          <h2 className="pd-results-title">
            WHAT YOU'LL ACHIEVE
          </h2>

          <p className="pd-results-text">
            {plan.expectedOutcome}
          </p>

        </div>

      </div>
    </section>
  );
}