"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Loader2,
  Lock,
  LucideIcon,
  Moon,
  Scale,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DayCard } from "./day-card";
import { DayProtocol } from "@/types/day-protocol";
import { getWeekDetails } from "@/services/nutrition-week";

type WeekViewerData = {
  weekNumber: number;
  weekProtocolType: string;
  weekDescription: string;
  focusNote: string;
  progressionNote: string;
  nextWeekPreview: string;
  isUnlocked: boolean;
  coachDirectiveNote: string | null;
  dayProtocols: DayProtocol[];
  maxWeekUnlocked?: number;
};

type Props = {
  enrollmentId: number;
  weekNumber: number;
};

const weekdayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const statCards: Array<{
  label: string;
  icon: LucideIcon;
  tone: string;
}> = [
  { label: "Adaptive macros", icon: Flame, tone: "text-[#84FF00]" },
  { label: "Coach reviewed", icon: ShieldCheck, tone: "text-[#00D9FF]" },
  { label: "Elite nutrition flow", icon: Dumbbell, tone: "text-[#FF6B00]" },
  { label: "Precision tracking", icon: Scale, tone: "text-white" },
];

function sortDays(days?: DayProtocol[]) {
  if (!days?.length) return [];
  return [...days].sort(
    (a, b) =>
      weekdayOrder.indexOf(a.weekDay) - weekdayOrder.indexOf(b.weekDay)
  );
}

export default function WeekViewer({ enrollmentId, weekNumber }: Props) {
  const [data, setData] = useState<WeekViewerData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadWeek() {
      try {
        setLoading(true);
        setError(null);

        // ✅ api.get يرجع response.data مباشرة بدون wrapper
        const weekData = await getWeekDetails(enrollmentId, weekNumber) as WeekViewerData;

        if (!mounted) return;
        setData(weekData);

        const days = sortDays(weekData.dayProtocols);
        setSelectedDay(days[0]?.weekDay ?? "Monday");
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadWeek();

    return () => {
      mounted = false;
    };
  }, [enrollmentId, weekNumber]);

  const sortedDays = useMemo(() => sortDays(data?.dayProtocols), [data]);

  const currentDay =
    sortedDays.find((day) => day.weekDay === selectedDay) ?? sortedDays[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/14237.jpg"
            alt="Elite fitness background"
            fill
            priority
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#84FF00]/15 via-black/15 to-[#050505]" />
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#84FF00]/20 blur-[140px]" />
          <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-[#00D9FF]/10 blur-[140px]" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div className="scan-line" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <Badge className="rounded-full border border-[#84FF00]/30 bg-[#84FF00]/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#84FF00]">
              Nutrition Week Viewer
            </Badge>
            <Badge className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
              Week {weekNumber}
            </Badge>
            <Badge className="rounded-full border border-[#00D9FF]/25 bg-[#00D9FF]/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#00D9FF]">
              Enrollment #{enrollmentId}
            </Badge>
          </div>

          <div className="max-w-4xl space-y-6">
            <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-[#84FF00]">Elite</span> Week
              <br />
              <span className="text-white">Meal Protocol</span>
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              Full weekly breakdown with day protocols, meal timing, food choices,
              and coach directives. Built for performance, not generic calorie tracking.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-xl bg-white px-5 font-semibold text-black hover:bg-[#84FF00]">
                <Link href="/nutrition/enrollments">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Enrollments
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-11 rounded-xl border-[#84FF00]/50 bg-transparent px-5 font-semibold text-[#84FF00] hover:border-[#84FF00] hover:bg-[#84FF00]/10 hover:text-[#84FF00]"
              >
                <Link href={`/nutrition/enrollments/${enrollmentId}/checkin`}>
                  Submit Check-In
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.label}
                    className={cn(
                      "glass-card animate-fade-up border-white/10 bg-white/[0.03] shadow-none backdrop-blur-xl",
                      "transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(132,255,0,0.18)]",
                      index === 0 && "delay-75"
                    )}
                  >
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <Icon className={`h-6 w-6 ${item.tone}`} />
                      </div>
                      <div>
                        <p className="text-sm text-white/65">{item.label}</p>
                        <p className="text-xl font-bold text-white">
                          {index === 0
                            ? "Macro split"
                            : index === 1
                            ? "Coach note"
                            : index === 2
                            ? "Training fuel"
                            : "Weight trend"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : data ? (
          <div className="space-y-10">
            <section className="animate-fade-up">
              {data.coachDirectiveNote ? (
                <Card className="border-[#84FF00]/30 bg-[#84FF00]/10 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#84FF00]" />
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#84FF00]">
                        Coach directive
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {data.coachDirectiveNote}
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <Card className="glass-card overflow-hidden border-white/10 bg-white/[0.03] backdrop-blur-xl">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* ✅ تم تصحيح: protocolType → weekProtocolType */}
                      <Badge className="rounded-full border border-[#FF6B00]/30 bg-[#FF6B00]/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#FF6B00]">
                        {data.weekProtocolType || "Weekly Protocol"}
                      </Badge>
                      {/* ✅ تم إزالة calorieModifier لأنه غير موجود في الـ type */}
                      <Badge className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
                        {data.isUnlocked ? "Unlocked" : "Locked"}
                      </Badge>
                    </div>

                    <div className="mt-5 space-y-3">
                      {/* ✅ تم تصحيح: data.weekNumber فقط */}
                      <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                        Week {data.weekNumber ?? weekNumber}
                      </h2>
                      <p className="max-w-3xl text-sm leading-7 text-white/75 sm:text-base">
                        {data.weekDescription ||
                          "A structured week with progressive meal timing and high-performance nutrition."}
                      </p>
                    </div>

                    <Separator className="my-6 bg-white/10" />

                    <div className="grid gap-4 md:grid-cols-3">
                      <InfoTile
                        icon={Flame}
                        label="Focus"
                        value={data.focusNote || "Performance"}
                        accent="text-[#84FF00]"
                      />
                      <InfoTile
                        icon={Moon}
                        label="Progression"
                        value={data.progressionNote || "Controlled adaptation"}
                        accent="text-[#00D9FF]"
                      />
                      <InfoTile
                        icon={CalendarDays}
                        label="Next week"
                        value={
                          data.nextWeekPreview ||
                          "Preview unlocks after coach review"
                        }
                        accent="text-[#FF6B00]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10 bg-white/[0.03] backdrop-blur-xl">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-5 w-5 text-[#84FF00]" />
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                        Week controls
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <MetricChip label="Days" value={sortedDays.length || 7} />
                      <MetricChip
                        label="Meals"
                        value={
                          data.dayProtocols?.reduce(
                            (sum, day) => sum + (day.meals?.length || 0),
                            0
                          ) || 0
                        }
                      />
                      <MetricChip
                        label="Calories"
                        value={`${Math.round(
                          currentDay?.totalCaloriesTarget || 0
                        )} kcal`}
                      />
                      <MetricChip
                        label="Protein"
                        value={`${Math.round(
                          currentDay?.proteinTargetG || 0
                        )} g`}
                      />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="mb-2 text-xs uppercase tracking-[0.24em] text-white/45">
                        Available days
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sortedDays.map((day) => {
                          const active = day.weekDay === selectedDay;
                          return (
                            <button
                              key={day.weekDay}
                              onClick={() => setSelectedDay(day.weekDay)}
                              className={cn(
                                "rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300",
                                active
                                  ? "border-[#84FF00] bg-[#84FF00] text-black"
                                  : "border-white/10 bg-white/5 text-white/70 hover:border-[#84FF00]/40 hover:text-white"
                              )}
                            >
                              {day.weekDay.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="animate-fade-up delay-150">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#84FF00]">
                    Daily breakdown
                  </p>
                  <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
                    Days, Meals & Foods
                  </h3>
                </div>
                <Badge className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/70">
                  Week viewer
                </Badge>
              </div>

              <Tabs
                value={selectedDay}
                onValueChange={setSelectedDay}
                className="space-y-6"
              >
                <TabsList className="grid h-auto grid-cols-2 gap-2 rounded-[24px] border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl md:grid-cols-4 xl:grid-cols-7">
                  {sortedDays.map((day) => (
                    <TabsTrigger
                      key={day.weekDay}
                      value={day.weekDay}
                      className="rounded-2xl px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 data-[state=active]:bg-[#84FF00] data-[state=active]:text-black"
                    >
                      {day.weekDay.slice(0, 3)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {sortedDays.map((day) => (
                  <TabsContent
                    key={day.weekDay}
                    value={day.weekDay}
                    className="mt-0"
                  >
                    <DayCard day={day} />
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-6">
      <div className="h-56 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]" />
        <div className="h-72 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]" />
      </div>
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.03]" />
        <div className="h-96 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.03]" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-red-500/30 bg-red-500/10">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-red-400" />
          <div>
            <p className="font-semibold text-white">Unable to load this week</p>
            <p className="text-sm text-white/70">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent}`} />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium leading-6 text-white">{value}</p>
    </div>
  );
}

function MetricChip({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-[#84FF00]">{value}</p>
    </div>
  );
}