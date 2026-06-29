"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Flame, Star, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NutritionPlan } from "@/types/nutrition-plan";

// NutritionPlan الحقيقي بالفعل فيه:
// coachRating, expectedOutcome, photoThumbnailUrl, isLinkedToProgram
// مفيش حاجة اسمها thumbnailUrl أو linkedToProgram في الـ API الحقيقي،
// فمحتاجين نستخدم الأسماء الصحيحة دي بس
export type NutritionPlanCardData = NutritionPlan & {
  dayProtocolCount?: number;
};

interface PlanCardProps {
  plan: NutritionPlanCardData;
  className?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 },
} as const;

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://fitzone-16.runasp.net";

// نفس منطق resolveImageSrc بتاع صفحة coach/plans:
// - http(s) كامل -> يستخدم كما هو
// - /uploads/... -> ده مخزن جوه public/uploads بتاع Next.js نفسه، يفضل كما هو
// - أي path نسبي تاني -> نفترض إنه على الـ API ونلحقه بـ API_URL
function resolveImageSrc(url?: string | null) {
  if (!url) return "/plansimagedeful.png";

  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  if (url.startsWith("/uploads/")) return url;

  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${API_URL}${normalized}`;
}

export function PlanCard({ plan, className }: PlanCardProps) {
  const imageSrc = resolveImageSrc(plan.photoThumbnailUrl);
  const rating = plan.coachRating ?? 4.8;

  return (
    <motion.div {...fadeUp} className={cn("group h-full", className)}>
      <Card className="relative h-full overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-0 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(132,255,0,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,255,0,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,107,0,0.10),transparent_35%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={imageSrc}
              alt={plan.name}
              fill
              unoptimized={imageSrc.startsWith("http")}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            <div className="absolute left-4 top-4 flex gap-2">
              {plan.isPublished ? (
                <Badge className="border-0 bg-[#84FF00] text-black hover:bg-[#84FF00]">
                  Published
                </Badge>
              ) : (
                <Badge className="border border-white/15 bg-black/40 text-white/80">
                  Draft
                </Badge>
              )}

              {plan.isLinkedToProgram ? (
                <Badge className="border-0 bg-[#00D9FF]/20 text-[#00D9FF] hover:bg-[#00D9FF]/20">
                  Linked Program
                </Badge>
              ) : null}
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-sm text-white/90 backdrop-blur-md">
              <Star className="h-4 w-4 fill-[#84FF00] text-[#84FF00]" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-white/60">coach rating</span>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-[#84FF00]/15 text-[#84FF00] hover:bg-[#84FF00]/15">
                  {plan.trainingGoal}
                </Badge>
                <Badge className="border-0 bg-white/10 text-white/80 hover:bg-white/10">
                  {plan.fitnessLevel}
                </Badge>
                <Badge className="border-0 bg-[#FF6B00]/15 text-[#FF6B00] hover:bg-[#FF6B00]/15">
                  {plan.durationOnWeeks} Weeks
                </Badge>
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                {plan.name}
              </h3>

              <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                <span className="font-medium text-white">
                  {plan.coachName || "Elite Coach"}
                </span>
                <span className="text-white/35">•</span>
                <span>{plan.equipmentType}</span>
              </div>
            </div>

            <p className="line-clamp-3 text-sm leading-6 text-white/72">
              {plan.description}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2 text-white/55">
                  <Target className="h-4 w-4 text-[#84FF00]" />
                  <span className="text-xs uppercase tracking-[0.2em]">
                    Focus
                  </span>
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {plan.expectedOutcome || "Performance driven"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2 text-white/55">
                  <CalendarDays className="h-4 w-4 text-[#FF6B00]" />
                  <span className="text-xs uppercase tracking-[0.2em]">
                    Duration
                  </span>
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {plan.durationOnWeeks} Weeks
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-sm text-white/65">
                <Flame className="h-4 w-4 text-[#84FF00]" />
                <span>Adaptive nutrition plan</span>
              </div>

              <Button
                asChild
                variant="outline"
                className="h-11 border-[#84FF00]/60 bg-transparent px-4 text-[#84FF00] hover:bg-[#84FF00] hover:text-black"
              >
                <Link href={`/nutrition/${plan.id}`} className="flex items-center gap-2">
                  View Details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}