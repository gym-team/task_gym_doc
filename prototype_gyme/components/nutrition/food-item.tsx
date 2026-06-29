import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Food } from "@/types/food";
import { CheckCircle2, Package, Sparkles } from "lucide-react";

function fmt(n: number) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

export function FoodItem({ item }: { item: Food }) {
  // ✅ الـ macros موجودة مباشرة في الـ Food interface
  const groupBadge = item.swapGroupID ? `Swap ${item.swapGroupID}` : "Fixed choice";

  return (
    <Card className="border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-[#84FF00]/30 hover:bg-white/[0.05]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* ✅ item.foodName هو الصح حسب الـ Food interface */}
            <Badge className="rounded-full border border-[#84FF00]/30 bg-[#84FF00]/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#84FF00]">
              {item.foodName || "Food Item"}
            </Badge>

            {item.isOptional ? (
              <Badge className="rounded-full border border-[#FF6B00]/30 bg-[#FF6B00]/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#FF6B00]">
                Optional
              </Badge>
            ) : null}

            {/* ✅ item.swapGroupID هو الصح حسب الـ Food interface */}
            {item.swapGroupID ? (
              <Badge className="rounded-full border border-[#00D9FF]/30 bg-[#00D9FF]/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#00D9FF]">
                {groupBadge}
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1">
              <Package className="h-3.5 w-3.5 text-[#84FF00]" />
              {item.amountGrams}g
            </span>
            {item.category ? (
              <span className="text-white/45">{item.category}</span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MacroPill label="kcal" value={item.macroCalories}  accent="text-[#84FF00]" />
          <MacroPill label="P"    value={item.macroProteinG}  accent="text-[#00D9FF]" />
          <MacroPill label="C"    value={item.macroCarbG}     accent="text-[#FF6B00]" />
          <MacroPill label="F"    value={item.macroFatG}      accent="text-white" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/60">
          <Sparkles className="h-3.5 w-3.5 text-[#00D9FF]" />
          {item.swapGroupID ? "Choose one alternative" : "Direct assignment"}
        </div>
        {item.isOptional ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/60">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#FF6B00]" />
            Can be skipped
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function MacroPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className={cn("mt-1 text-base font-bold", accent)}>{fmt(value)}</p>
    </div>
  );
}