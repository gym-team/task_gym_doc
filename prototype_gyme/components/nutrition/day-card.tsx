import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DayProtocol } from "@/types/day-protocol";
import { Dumbbell, Flame, Leaf, Moon, Sparkles } from "lucide-react";
import { MealCard } from "./meal-card";

function formatDayType(type: string) {
  const map: Record<string, string> = {
    TrainingDay: "Training Day",
    RestDay: "Rest Day",
    HighDay: "High Day",
    DeloadDay: "Deload Day",
  };

  return map[type] ?? type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function macroPct(value: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

export function DayCard({ day }: { day: DayProtocol }) {
  const calories = day.totalCaloriesTarget || 0;
  const protein  = day.proteinTargetG || 0;
  const carbs    = day.carbTargetG || 0;
  const fat      = day.fatTargetG || 0;

  const proteinPct = macroPct(protein * 4, calories);
  const carbPct    = macroPct(carbs * 4, calories);
  const fatPct     = macroPct(fat * 9, calories);

  return (
    <Card className="glass-card overflow-hidden border-white/10 bg-white/[0.03] backdrop-blur-xl">
      <CardContent className="space-y-6 p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border border-[#84FF00]/30 bg-[#84FF00]/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#84FF00]">
                {day.weekDay}
              </Badge>
              {/* ✅ تم تصحيح: day.protocolType → day.dayProtocolType */}
              <Badge
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]",
                  day.dayProtocolType === "TrainingDay"
                    ? "border-[#84FF00]/30 bg-[#84FF00]/10 text-[#84FF00]"
                    : day.dayProtocolType === "RestDay"
                      ? "border-[#00D9FF]/30 bg-[#00D9FF]/10 text-[#00D9FF]"
                      : "border-[#FF6B00]/30 bg-[#FF6B00]/10 text-[#FF6B00]"
                )}
              >
                {formatDayType(day.dayProtocolType)}
              </Badge>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
              {formatDayType(day.dayProtocolType)}
            </h2>
            {/* ✅ تم تصحيح: day.notes → day.protocolNotes */}
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">
              {day.protocolNotes || "Structured day protocol with curated macronutrients and meal timing."}
            </p>
          </div>

          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            <MiniStat icon={Flame}    label="Calories" value={`${Math.round(calories)} kcal`} accent="text-[#84FF00]" />
            <MiniStat icon={Dumbbell} label="Protein"  value={`${Math.round(protein)} g`}    accent="text-[#00D9FF]" />
            <MiniStat icon={Leaf}     label="Carbs"    value={`${Math.round(carbs)} g`}      accent="text-[#FF6B00]" />
            <MiniStat icon={Moon}     label="Fat"      value={`${Math.round(fat)} g`}        accent="text-white" />
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="grid gap-3 rounded-[22px] border border-white/10 bg-black/30 p-4 md:grid-cols-3">
          <MacroBar label="Protein" pct={proteinPct} className="text-[#84FF00]" />
          <MacroBar label="Carbs"   pct={carbPct}    className="text-[#00D9FF]" />
          <MacroBar label="Fat"     pct={fatPct}     className="text-[#FF6B00]" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#84FF00]" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
              Meals
            </p>
          </div>

          <div className="grid gap-4">
            {/* ✅ day.meals هو الصح حسب الـ DayProtocol interface */}
            {(day.meals || []).length ? (
              day.meals.map((meal, index) => (
                <MealCard key={`${meal.id}-${index}`} meal={meal} index={index} />
              ))
            ) : (
              <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-white/55">
                No meals defined for this day yet.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function MacroBar({
  label,
  pct,
  className,
}: {
  label: string;
  pct: number;
  className?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
        <p className={cn("text-sm font-semibold", className)}>{pct}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full",
            className?.includes("84FF00")
              ? "bg-[#84FF00]"
              : className?.includes("00D9FF")
                ? "bg-[#00D9FF]"
                : "bg-[#FF6B00]"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cn("h-4 w-4", accent)} />
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{label}</p>
      </div>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}