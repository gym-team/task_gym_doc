"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Area,
  Dot,
} from "recharts";
import type { CheckInHistoryItem } from "@/services/checkin";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface ProgressChartProps {
  history: CheckInHistoryItem[];
}

interface ChartPoint {
  week: string;
  weekNumber: number;
  weight: number;
  adherence: number;
  coachReviewed: boolean;
}

/* ------------------------------------------------------------------ */
/*  Custom pieces                                                     */
/* ------------------------------------------------------------------ */

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const point: ChartPoint = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/95 px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm">
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-white/45">
        Week {point.weekNumber}
      </p>
      <div className="flex items-center gap-2 text-sm">
        <span className="inline-block h-2 w-2 rounded-full bg-[#84FF00]" />
        <span className="text-white/70">Weight</span>
        <span className="ml-auto font-bold text-white">{point.weight.toFixed(1)} kg</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-sm">
        <span className="inline-block h-2 w-2 rounded-full bg-[#00D9FF]" />
        <span className="text-white/70">Adherence</span>
        <span className="ml-auto font-bold text-white">{point.adherence}%</span>
      </div>
      <p
        className={`mt-2 text-[11px] font-semibold ${
          point.coachReviewed ? "text-[#84FF00]" : "text-[#FF6B00]"
        }`}
      >
        {point.coachReviewed ? "Reviewed" : "Awaiting Review"}
      </p>
    </div>
  );
}

function WeightDot(props: any) {
  const { cx, cy, payload } = props;
  const reviewed: boolean = payload?.coachReviewed;
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={5}
      fill={reviewed ? "#84FF00" : "#FF6B00"}
      stroke="#050505"
      strokeWidth={2}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function ProgressChart({ history }: ProgressChartProps) {
  if (history.length === 0) return null;

  // Oldest → newest, left to right.
  const data: ChartPoint[] = [...history]
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .map((item) => ({
      week: `W${item.weekNumber}`,
      weekNumber: item.weekNumber,
      weight: item.averageWeight,
      adherence: item.adherencePercent,
      coachReviewed: item.coachReviewed,
    }));

  const weights = data.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightPadding = Math.max((maxWeight - minWeight) * 0.15, 1);

  return (
    <div className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-white/45">
            Progress Over Time
          </p>
          <h3 className="text-lg font-black uppercase tracking-tight text-white">
            Weight &amp; Adherence Trend
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/60">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#84FF00]" />
            Avg Weight
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#00D9FF]" />
            Adherence
          </span>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#84FF00" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#84FF00" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />

            <XAxis
              dataKey="week"
              stroke="rgba(255,255,255,0.35)"
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
              tickLine={false}
            />

            <YAxis
              yAxisId="weight"
              domain={[minWeight - weightPadding, maxWeight + weightPadding]}
              stroke="rgba(255,255,255,0.35)"
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v: number) => `${v.toFixed(0)}`}
            />

            <YAxis
              yAxisId="adherence"
              orientation="right"
              domain={[0, 100]}
              stroke="rgba(255,255,255,0.35)"
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v: number) => `${v}%`}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />

            <Area
              yAxisId="weight"
              type="monotone"
              dataKey="weight"
              stroke="none"
              fill="url(#weightFill)"
              isAnimationActive
            />

            <Line
              yAxisId="adherence"
              type="monotone"
              dataKey="adherence"
              stroke="#00D9FF"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3, fill: "#00D9FF", stroke: "#050505", strokeWidth: 1 }}
              activeDot={{ r: 5 }}
              isAnimationActive
            />

            <Line
              yAxisId="weight"
              type="monotone"
              dataKey="weight"
              stroke="#84FF00"
              strokeWidth={3}
              dot={<WeightDot />}
              activeDot={{ r: 7 }}
              isAnimationActive
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-center text-[11px] text-white/35">
        Dot color reflects review status — green is reviewed, orange is awaiting review.
      </p>
    </div>
  );
}