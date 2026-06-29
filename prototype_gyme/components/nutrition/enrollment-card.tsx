import Link from "next/link";
import { Flame, Salad } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Enrollment } from "@/types/enrollment";

type Props = {
  enrollment: Enrollment;
};

function statusMeta(status: string) {
  const value = (status || "").toLowerCase();

  if (value.includes("active")) {
    return {
      label: "Active",
      className: "bg-[#84FF00]/15 text-[#84FF00]",
    };
  }

  if (value.includes("completed")) {
    return {
      label: "Completed",
      className: "bg-blue-500/15 text-blue-400",
    };
  }

  if (value.includes("cancelled")) {
    return {
      label: "Cancelled",
      className: "bg-red-500/15 text-red-400",
    };
  }

  return {
    label: status || "Unknown",
    className: "bg-white/10 text-zinc-200",
  };
}

export function EnrollmentCard({ enrollment }: Props) {
  const totalWeeks = enrollment.totalWeeks ?? Math.max(enrollment.maxWeekUnlocked, 1);
  const progress = Math.min(
    100,
    Math.max(0, (enrollment.maxWeekUnlocked / totalWeeks) * 100)
  );

  const status = statusMeta(enrollment.status);

  return (
    <Card
      className="
        relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#0a0a0a]
        transition-all duration-300
        hover:-translate-y-1 hover:border-[#84FF00]/40 hover:shadow-[0_0_25px_#84FF0022]
      "
    >
      <span className="absolute top-0 right-0 w-32 h-32 bg-[#84FF00]/5 rounded-bl-full blur-2xl pointer-events-none" />

      <CardContent className="relative z-10 space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge className={`rounded-full ${status.className} hover:${status.className}`}>
                {status.label}
              </Badge>

              {enrollment.pendingCheckIn ? (
                <Badge className="rounded-full bg-amber-500/15 text-amber-400 hover:bg-amber-500/15">
                  Pending Check-In
                </Badge>
              ) : null}

              {enrollment.pendingCoachReview ? (
                <Badge className="rounded-full bg-sky-500/15 text-sky-400 hover:bg-sky-500/15">
                  Awaiting Review
                </Badge>
              ) : null}
            </div>

            <h3 className="mt-4 text-2xl font-black text-white">
              {enrollment.planName}
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Coach: {enrollment.coachName || "Unknown"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#84FF00]/20 bg-[#84FF00]/5 px-4 py-3 text-right flex-shrink-0">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
              Current Calories
            </p>
            <p className="mt-2 text-2xl font-black text-[#84FF00]">
              {Math.round(enrollment.currentAdjustedKcal)} kcal
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Week progress</span>
            <span className="text-white font-semibold">
              {enrollment.maxWeekUnlocked} / {totalWeeks}
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#84FF00] shadow-[0_0_10px_#84FF00] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-zinc-800 bg-white/5 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Baseline</p>
            <p className="mt-2 font-semibold text-white">
              {Math.round(enrollment.baselineCalories)} kcal
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Unlocked</p>
            <p className="mt-2 font-semibold text-white">
              Week {enrollment.maxWeekUnlocked}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Started</p>
            <p className="mt-2 font-semibold text-white">
              {new Date(enrollment.startDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative z-10 flex flex-col gap-3 p-6 pt-0 sm:flex-row">
       

        <Button
          asChild
          variant="outline"
          className="
            w-full rounded-xl border-zinc-800 bg-transparent text-white
            transition-all duration-300
            hover:border-[#84FF00]/40 hover:bg-[#84FF00]/5
          "
        >
          <Link href={`/nutrition/${enrollment.nutritionPlanID}`}>
            <span className="flex items-center justify-center gap-2">
              <Salad size={15} />
              Preview Calories
            </span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}