import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock3, Droplets, Flame, Soup, UtensilsCrossed } from "lucide-react";
import { Meal } from "@/types/meal";
import { FoodItem } from "./food-item";

function prettyTiming(timingType: string, timeFromTrainingMinutes?: number | null) {
  const map: Record<string, string> = {
    Breakfast: "Breakfast",
    PreWorkout: "Pre-workout",
    PostWorkout: "Post-workout",
    Lunch: "Lunch",
    Snack: "Snack",
    Dinner: "Dinner",
    BeforeBed: "Before bed",
  };

  const base = map[timingType] ?? timingType.replace(/([a-z])([A-Z])/g, "$1 $2");
  if (typeof timeFromTrainingMinutes !== "number") return base;

  const abs = Math.abs(timeFromTrainingMinutes);
  const human =
    abs < 60
      ? `${abs} min`
      : `${Math.floor(abs / 60)}h${abs % 60 ? ` ${abs % 60}m` : ""}`;

  if (timeFromTrainingMinutes < 0) return `${base} · ${human} before training`;
  if (timeFromTrainingMinutes > 0) return `${base} · within ${human} after training`;
  return `${base} · training tied`;
}

export function MealCard({ meal, index }: { meal: Meal; index: number }) {
  // ✅ API يرجع foodItems — هذا هو الاسم الصح
 const items: any[] =
  (meal as any).foodItems ??
  (meal as any).Food ??
  [];
  return (
    <Card
      className={cn(
        "border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(132,255,0,0.18)]",
        index % 2 === 0 ? "glass-card" : ""
      )}
    >
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border border-[#84FF00]/30 bg-[#84FF00]/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#84FF00]">
                Meal {index + 1}
              </Badge>
              <Badge className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/75">
                <Clock3 className="mr-1 h-3.5 w-3.5" />
                {prettyTiming(meal.timingType, meal.timeFromTrainingMinutes)}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white">{meal.name}</h3>
          </div>

          <div className="grid min-w-[250px] grid-cols-2 gap-2">
            <MetaChip icon={Flame}           label="Calories" value={meal.targetCalories}          accent="text-[#84FF00]" />
            <MetaChip icon={Soup}            label="Protein"  value={`${meal.targetProteinG} g`}   accent="text-[#00D9FF]" />
            <MetaChip icon={UtensilsCrossed} label="Carbs"    value={`${meal.targetCarbG} g`}      accent="text-[#FF6B00]" />
            <MetaChip icon={Droplets}        label="Fat"      value={`${meal.targetFatG} g`}       accent="text-white" />
          </div>
        </div>

        {items.length ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
              Food items
            </p>
            <div className="space-y-3">
              {items.map((item, idx) => (
                // ✅ item.foodItemID هو الصح حسب الـ Food interface
                <FoodItem key={`${item.foodItemID}-${idx}`} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/55">
            No food assignments for this meal yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetaChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
      <div className="mb-1 flex items-center gap-2">
        <Icon className={cn("h-4 w-4", accent)} />
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</p>
      </div>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}