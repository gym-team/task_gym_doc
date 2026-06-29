"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  ChevronRight,
  Zap,
  Calendar,
  Target,
  Dumbbell,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { PremiumGymBackground } from "@/components/PremiumGymBackground";

// ─── Types ───────────────────────────────────────────────────────────────────
type WeekItem = {
  weekNumber: number;
  weekDescription: string;
  focusArea: string;
  progressionNote: string;
  nextWeekPreview: string;
  sessionCount: number;
  isUnlocked: boolean;
};

type EnrollmentItem = {
  id: number;
  programName: string;
  maxWeekUnlocked: number;
  totalWeeks: number;
};

type SessionItem = {
  id: number;
  sessionTitle: string;
  weekDay: string;
};

type WeekDetails = {
  weekDescription?: string;
  focusArea?: string;
  progressionNote?: string;
  nextWeekPreview?: string;
  sessionSummaryDto?: SessionItem[];
};

// ─── Glow button ──────────────────────────────────────────────────────────────
function GlowButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative group overflow-hidden
        bg-[#84FF00] text-black font-bold
        px-5 py-2.5 rounded-xl
        transition-all duration-300
        hover:shadow-[0_0_25px_#84FF00aa]
        active:scale-95
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
}

// ─── Week card ────────────────────────────────────────────────────────────────
function WeekCard({
  week,
  unlocked,
  selected,
  onClick,
  index,
}: {
  week: number;
  unlocked: boolean;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      disabled={!unlocked}
      onClick={onClick}
      className={`
        relative group overflow-hidden
        p-4 rounded-2xl border text-left
        transition-all duration-300
        ${
          selected
            ? "border-[#84FF00] bg-[#84FF00]/15 shadow-[0_0_20px_#84FF0055]"
            : unlocked
            ? "border-[#84FF00]/40 bg-[#84FF00]/5 hover:border-[#84FF00]/80 hover:bg-[#84FF00]/10 hover:shadow-[0_0_14px_#84FF0033]"
            : "border-zinc-800 bg-zinc-900/50 opacity-40 cursor-not-allowed"
        }
      `}
    >
      {selected && (
        <span className="absolute top-0 right-0 w-16 h-16 bg-[#84FF00]/20 rounded-bl-full blur-xl" />
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">
            Week
          </p>
          <p
            className={`text-2xl font-black ${
              selected ? "text-[#84FF00]" : unlocked ? "text-white" : "text-gray-600"
            }`}
          >
            {String(week).padStart(2, "0")}
          </p>
        </div>

        <div
          className={`
            w-9 h-9 rounded-xl flex items-center justify-center
            ${
              selected
                ? "bg-[#84FF00] text-black"
                : unlocked
                ? "bg-[#84FF00]/10 text-[#84FF00]"
                : "bg-zinc-800 text-zinc-600"
            }
          `}
        >
          {unlocked ? <Unlock size={16} /> : <Lock size={16} />}
        </div>
      </div>
    </motion.button>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────
function SessionCard({
  session,
  index,
  onOpen,
}: {
  session: SessionItem;
  index: number;
  onOpen: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="
        relative group overflow-hidden
        border border-zinc-800 hover:border-[#84FF00]/40
        rounded-2xl p-5
        bg-[#0a0a0a] hover:bg-[#84FF00]/5
        transition-all duration-300
        hover:shadow-[0_0_20px_#84FF0022]
      "
    >
      <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-[#84FF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#84FF00]/10 border border-[#84FF00]/20 flex items-center justify-center flex-shrink-0">
          <Dumbbell size={20} className="text-[#84FF00]" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base truncate">
            {session.sessionTitle}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-gray-400 text-sm">
            <Calendar size={13} />
            <span>{session.weekDay}</span>
          </div>
        </div>

        <GlowButton onClick={onOpen} className="flex-shrink-0 text-sm">
          Open
          <ChevronRight size={15} />
        </GlowButton>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProgramPage() {
  const router = useRouter();

  const [enrollment, setEnrollment] = useState<EnrollmentItem | null>(null);
  const [weeks, setWeeks] = useState<WeekItem[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedWeekInfo, setSelectedWeekInfo] = useState<WeekItem | null>(null);
  const [weekData, setWeekData] = useState<WeekDetails | null>(null);
  const [weekLoading, setWeekLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;

  useEffect(() => {
    loadEnrollment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadEnrollment() {
    try {
      setPageLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Enrollment`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const enrollmentData: EnrollmentItem = data[0];
        setEnrollment(enrollmentData);
        await loadWeeks(enrollmentData.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  }

  async function loadWeeks(enrollmentId: number) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Enrollment/${enrollmentId}/weeks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setWeeks(data);

        const firstUnlocked = data.find((w: WeekItem) => w.isUnlocked) ?? data[0];
        if (firstUnlocked) {
          await loadWeek(firstUnlocked.weekNumber, firstUnlocked);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadWeek(weekNumber: number, weekInfo?: WeekItem) {
    try {
      setSelectedWeek(weekNumber);
      setSelectedWeekInfo(
        weekInfo ?? weeks.find((w) => w.weekNumber === weekNumber) ?? null
      );
      setWeekLoading(true);
      setWeekData(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Enrollment/${enrollment?.id}/weeks/${weekNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      setWeekData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setWeekLoading(false);
    }
  }

  const totalWeeks = enrollment?.totalWeeks ?? weeks.length;
  const progress =
    enrollment && totalWeeks > 0
      ? Math.round((enrollment.maxWeekUnlocked / totalWeeks) * 100)
      : 0;

  if (pageLoading || !enrollment) {
    return (
      <div
        className="
          min-h-screen bg-black text-white
          bg-[linear-gradient(180deg,#050505_0%,#081006_30%,rgba(132,255,0,0.06)_100%)]
        "
      >
        <Navigation />
        <main className="pt-[60px] min-h-[calc(100vh-60px)] bg-black flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#84FF00] border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm tracking-widest uppercase">
              Loading program
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen bg-black text-white
        bg-[linear-gradient(180deg,#050505_0%,#081006_30%,rgba(132,255,0,0.06)_100%)]
      "
    >
      <Navigation />

      <main className="pt-[60px]">
        <>
          {/* ── HERO ───────────────────────────────────────────────────────── */}
          <section className="relative h-[65vh] overflow-hidden flex items-center justify-center">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source
                src="/vecteezy_modern-neon-lit-gym-interior-featuring-treadmills-and_62263172.mp4"
                type="video/mp4"
              />
            </video>

            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#84FF00]/20 via-transparent to-[#84FF00]/10" />

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="relative z-10 text-center px-6 max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <Zap size={14} className="text-[#84FF00]" />
                <span className="text-[#84FF00] text-xs uppercase tracking-[0.25em] font-semibold">
                  Active Program
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="text-5xl md:text-7xl font-black mb-6 leading-tight"
              >
                {enrollment.programName
                  .split(" ")
                  .map((word: string, i: number) =>
                    i === 0 ? (
                      <span
                        key={i}
                        className="text-[#84FF00] drop-shadow-[0_0_25px_#84FF00]"
                      >
                        {word}{" "}
                      </span>
                    ) : (
                      <span key={i}>{word} </span>
                    )
                  )}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="flex flex-wrap items-center justify-center gap-5 mt-2"
              >
                <div className="w-64">
                  <div className="flex justify-between text-xs text-gray-300 mb-2">
                    <span>Progress</span>
                    <span className="text-[#84FF00] font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-[#84FF00] rounded-full shadow-[0_0_10px_#84FF00]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2">
                  <Target size={15} className="text-[#84FF00]" />
                  <span className="text-sm text-gray-200">
                    Week{" "}
                    <span className="text-white font-bold">
                      {enrollment.maxWeekUnlocked}
                    </span>{" "}
                    / {totalWeeks}
                  </span>
                </div>
              </motion.div>
            </motion.div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
          </section>

          {/* ── CONTENT SECTION ────────────────────────────────────────────── */}
          <section
            className="
              relative overflow-hidden
              bg-[linear-gradient(180deg,#050505_0%,#081006_30%,rgba(132,255,0,0.08)_100%)]
            "
          >
            <PremiumGymBackground />

            <div className="absolute inset-0 bg-black/40 z-[1]" />
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black via-black/90 to-transparent z-[2]" />
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black to-transparent z-[2]" />

            <div className="relative z-10 container mx-auto px-6 py-16">
              {/* ── WEEK SELECTOR ─────────────────────────────────────────────── */}
              <div className="max-w-5xl mx-auto mb-10">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-lg font-bold text-gray-200 mb-5 uppercase tracking-widest"
                >
                  Select Week
                </motion.h2>

                {weeks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {weeks.map((week, i) => (
                      <WeekCard
                        key={week.weekNumber}
                        week={week.weekNumber}
                        unlocked={week.isUnlocked}
                        selected={selectedWeek === week.weekNumber}
                        onClick={() => loadWeek(week.weekNumber, week)}
                        index={i}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-zinc-800 bg-black/40 p-6 text-gray-400">
                    No weeks available.
                  </div>
                )}
              </div>

              {/* ── WEEK DETAILS ──────────────────────────────────────────────── */}
              <div className="max-w-5xl mx-auto">
                {weekLoading && (
                  <div className="flex flex-col gap-4 mt-4">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-20 rounded-2xl bg-zinc-900 animate-pulse"
                      />
                    ))}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {selectedWeekInfo && !weekLoading && (
                    <motion.div
                      key={selectedWeek}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.45 }}
                    >
                      <div className="mb-8 p-6 rounded-2xl border border-zinc-800 bg-[#0a0a0a] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#84FF00]/5 rounded-bl-full blur-2xl" />

                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-[#84FF00]/10 border border-[#84FF00]/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#84FF00] font-black text-lg">
                              {String(selectedWeekInfo.weekNumber).padStart(2, "0")}
                            </span>
                          </div>

                          <div className="flex-1">
                            <h2 className="text-2xl font-black mb-2">
                              Week {selectedWeekInfo.weekNumber}{" "}
                              <span className="text-[#84FF00]">Overview</span>
                            </h2>

                            {selectedWeekInfo.weekDescription && (
                              <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                                {selectedWeekInfo.weekDescription}
                              </p>
                            )}

                            {selectedWeekInfo.focusArea && (
                              <div className="flex items-center gap-2 mt-3">
                                <Target size={14} className="text-[#84FF00]" />
                                <span className="text-sm text-gray-300">
                                  Focus:{" "}
                                  <span className="text-[#84FF00] font-semibold">
                                    {selectedWeekInfo.focusArea}
                                  </span>
                                </span>
                              </div>
                            )}

                            {selectedWeekInfo.progressionNote && (
                              <p className="mt-3 text-sm text-gray-400">
                                {selectedWeekInfo.progressionNote}
                              </p>
                            )}

                            {selectedWeekInfo.nextWeekPreview && (
                              <p className="mt-2 text-sm text-[#84FF00]">
                                Next Week: {selectedWeekInfo.nextWeekPreview}
                              </p>
                            )}

                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#84FF00]/10 border border-[#84FF00]/20">
                              <span className="text-[#84FF00] font-bold">
                                Sessions:
                              </span>
                              <span className="text-white">
                                {selectedWeekInfo.sessionCount ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-4 font-semibold">
                        Sessions
                      </h3>

                      <div className="space-y-3">
                        {weekData?.sessionSummaryDto?.map((session, i) => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            index={i}
                            onOpen={() => router.push(`/program/${session.id}`)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!weekData && !weekLoading && !selectedWeek && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#84FF00]/10 border border-[#84FF00]/20 flex items-center justify-center mb-4">
                      <Dumbbell size={28} className="text-[#84FF00]" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Select a week above to view your sessions
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        </>
      </main>
    </div>
  );
}