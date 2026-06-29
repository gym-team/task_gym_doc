"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, CalendarClock, ClipboardList, Salad, Zap } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { EnrollmentCard } from "@/components/nutrition/enrollment-card";
import { getEnrollments } from "@/services/nutrition-enrollment";
import type { Enrollment } from "@/types/enrollment";

function normalizeEnrollmentsResponse(response: unknown): Enrollment[] {
  if (Array.isArray(response)) return response as Enrollment[];

  if (response && typeof response === "object") {
    const data = response as { data?: unknown; items?: unknown; result?: unknown };

    if (Array.isArray(data.data)) return data.data as Enrollment[];
    if (Array.isArray(data.items)) return data.items as Enrollment[];
    if (Array.isArray(data.result)) return data.result as Enrollment[];
  }

  return [];
}

function StatCard({
  label,
  value,
  icon,
  index,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="
        relative overflow-hidden
        rounded-2xl border border-[#84FF00]/15 bg-[#0a0a0a]
        p-5
        transition-all duration-300
        hover:border-[#84FF00]/40 hover:shadow-[0_0_20px_#84FF0022]
      "
    >
      <span className="absolute top-0 right-0 w-20 h-20 bg-[#84FF00]/5 rounded-bl-full blur-2xl" />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-white">{value}</p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-[#84FF00]/10 border border-[#84FF00]/20 flex items-center justify-center text-[#84FF00]">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function NutritionEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeCount = useMemo(
    () =>
      enrollments.filter((e) =>
        (e.status || "").toLowerCase().includes("active")
      ).length,
    [enrollments]
  );

  const pendingCheckIns = useMemo(
    () => enrollments.filter((e) => e.pendingCheckIn).length,
    [enrollments]
  );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError("");
        setLoading(true);

        const res = await getEnrollments();
        const payload = (res as any)?.data ?? (res as any)?.result ?? res;

        if (mounted) {
          setEnrollments(normalizeEnrollmentsResponse(payload));
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load enrollments.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main
      className="
        min-h-screen bg-black text-white
        px-4 pt-24 pb-10 md:px-8
        bg-[linear-gradient(180deg,#050505_0%,#081006_30%,rgba(132,255,0,0.06)_100%)]
      "
    >
      <Navigation />

      <section className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-[#84FF00]" />
            <span className="text-[#84FF00] text-xs uppercase tracking-[0.3em] font-semibold">
              My Nutrition
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black leading-tight">
            <span className="text-[#84FF00] drop-shadow-[0_0_25px_#84FF00]">
              My{" "}
            </span>
            Enrollments
          </h1>

          <p className="mt-4 max-w-3xl text-sm md:text-base text-gray-400">
            Keep track of your active nutrition plans, current calorie target,
            and week unlock status.
          </p>
        </motion.div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Active"
            value={activeCount}
            icon={<Flame size={18} />}
            index={0}
          />
          <StatCard
            label="Pending Check-Ins"
            value={pendingCheckIns}
            icon={<CalendarClock size={18} />}
            index={1}
          />
          <StatCard
            label="Total Enrollments"
            value={enrollments.length}
            icon={<ClipboardList size={18} />}
            index={2}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-16 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#84FF00] border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm uppercase tracking-widest">
              Loading enrollments
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        ) : enrollments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#84FF00]/10 border border-[#84FF00]/20 flex items-center justify-center">
              <Salad size={28} className="text-[#84FF00]" />
            </div>
            <p className="text-gray-400 text-sm">No nutrition plans yet.</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {enrollments.map((enrollment, i) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <EnrollmentCard enrollment={enrollment} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}