"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Dumbbell,
  Clock,
  Calendar,
  Flame,
  Wind,
  Zap,
  ChevronDown,
  RotateCcw,
  Timer,
  Activity,
  BarChart2,
  StickyNote,
  Play,
  X,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { PremiumGymBackground } from "@/components/PremiumGymBackground";

// ─── helpers ──────────────────────────────────────────────────────────────────
function hasValue(val: any): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") return val.trim() !== "";
  if (typeof val === "number") return !isNaN(val) && val !== 0;
  return false;
}

// ─── Curated dark gym banners (Unsplash, no key needed) ───────────────────────
const GYM_BANNERS = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=85&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=85&fit=crop",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=85&fit=crop",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=85&fit=crop",
  "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1600&q=85&fit=crop",
  "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1600&q=85&fit=crop",
];

// ─── Floating particle (pure CSS, no canvas) ──────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#84FF00]"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0,
          }}
          animate={{
            y: [0, -60 - Math.random() * 80],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Neon glow orbs ───────────────────────────────────────────────────────────
function GlowOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(132,255,0,0.07) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(132,255,0,0.05) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute -bottom-20 left-1/3 w-[600px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(132,255,0,0.04) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="sg" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#84FF00" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sg)" />
      </svg>
    </div>
  );
}

// ─── Section badge ────────────────────────────────────────────────────────────
const SECTION_META: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  warmup: { bg: "bg-orange-500/10", text: "text-orange-300", border: "border-orange-500/30", glow: "#f97316" },
  main: { bg: "bg-[#84FF00]/10", text: "text-[#84FF00]", border: "border-[#84FF00]/30", glow: "#84FF00" },
  cooldown: { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/30", glow: "#38bdf8" },
  primer: { bg: "bg-violet-500/10", text: "text-violet-300", border: "border-violet-500/30", glow: "#a78bfa" },
};

function SectionBadge({ type }: { type: string }) {
  const key = type?.toLowerCase() ?? "main";
  const m = SECTION_META[key] ?? SECTION_META.main;
  return (
    <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${m.bg} ${m.text} ${m.border}`}>
      {type}
    </span>
  );
}

// ─── Note card ────────────────────────────────────────────────────────────────
function NoteCard({
  icon,
  title,
  text,
  accent,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm p-5"
      style={{ boxShadow: `0 0 0 1px ${accent}15, inset 0 1px 0 ${accent}10` }}
    >
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-bl-full opacity-20 blur-2xl"
        style={{ background: accent }}
      />
      <span
        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
        style={{ background: `linear-gradient(to bottom, ${accent}, transparent)` }}
      />
      <div className="flex items-center gap-2 mb-3 pl-4">
        <span style={{ color: accent }}>{icon}</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">{title}</h3>
      </div>
      <p className="pl-4 text-[15px] text-zinc-300 leading-relaxed">{text}</p>
    </motion.div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, delay = 0 }: { icon: React.ReactNode; title: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-3 mb-5"
    >
      <div className="w-10 h-10 rounded-xl bg-[#84FF00]/10 border border-[#84FF00]/30 flex items-center justify-center text-[#84FF00] shadow-[0_0_12px_rgba(132,255,0,0.2)]">
        {icon}
      </div>
      <h2 className="text-lg font-black uppercase tracking-[0.15em] text-white">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-[#84FF00]/40 via-[#84FF00]/10 to-transparent" />
    </motion.div>
  );
}

// ─── Inline video panel (appears above clicked card) ──────────────────────────
function InlineVideoPanel({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const embed = url
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "www.youtube.com/embed/");

  return (
    <motion.div
      initial={{ height: 0, opacity: 0, y: -12 }}
      animate={{ height: "auto", opacity: 1, y: 0 }}
      exit={{ height: 0, opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-sm shadow-[0_0_60px_rgba(132,255,0,0.10)]"
      style={{ boxShadow: "0 0 80px rgba(132,255,0,0.12), 0 0 0 1px rgba(132,255,0,0.10)" }}
    >
      <div className="flex items-center justify-between bg-zinc-950 px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#84FF00] shadow-[0_0_8px_#84FF00]" />
          <span className="text-sm font-bold text-white truncate">{title}</span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:border-red-500/40 border border-transparent flex items-center justify-center transition-all duration-200 flex-shrink-0"
        >
          <X size={14} className="text-gray-300" />
        </button>
      </div>

      <div className="relative w-full pt-[56.25%] bg-black">
        <iframe
          src={`${embed}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </motion.div>
  );
}

// ─── Exercise card ────────────────────────────────────────────────────────────
function ExerciseCard({
  exercise,
  index,
  openVideoKey,
  setOpenVideoKey,
}: {
  exercise: any;
  index: number;
  openVideoKey: string | number | null;
  setOpenVideoKey: React.Dispatch<React.SetStateAction<string | number | null>>;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasVideo = hasValue(exercise.videoUrl);
  const hasNotes = hasValue(exercise.notes);
  const hasTempo = hasValue(exercise.tempo);
  const hasRpe = hasValue(exercise.rpeTarget);
  const hasRest = hasValue(exercise.restSeconds);
  const hasExpandable = hasNotes || hasTempo || hasRpe;

  const cardKey = exercise.exerciseID ?? index;
  const isVideoOpen = openVideoKey === cardKey;

  return (
    <div className="w-full">
      <AnimatePresence initial={false}>
        {isVideoOpen && hasVideo && (
          <div className="mb-3">
            <InlineVideoPanel
              url={exercise.videoUrl}
              title={exercise.exerciseName}
              onClose={() => setOpenVideoKey(null)}
            />
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.055, duration: 0.45, ease: "easeOut" }}
        whileHover={{ y: -2 }}
        className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm transition-all duration-300 hover:border-[#84FF00]/40 hover:shadow-[0_0_24px_rgba(132,255,0,0.08)]"
      >
        <motion.span
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-[#84FF00]"
          initial={{ scaleY: 0 }}
          whileHover={{ scaleY: 1 }}
          transition={{ duration: 0.25 }}
          style={{ transformOrigin: "top" }}
        />

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#84FF00]/0 to-transparent group-hover:via-[#84FF00]/40 transition-all duration-500" />

        <div className="flex items-center gap-4 p-5">
          <motion.div
            className="w-11 h-11 rounded-xl bg-[#84FF00]/10 border border-[#84FF00]/25 flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-[#84FF00] font-black text-sm drop-shadow-[0_0_6px_#84FF00]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="font-bold text-white text-[15px] leading-snug">{exercise.exerciseName}</h3>
              {hasValue(exercise.sectionType) && <SectionBadge type={exercise.sectionType} />}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
              {hasValue(exercise.sets) && (
                <span className="flex items-center gap-1.5">
                  <RotateCcw size={12} className="text-[#84FF00]" />
                  <span className="text-zinc-200">{exercise.sets}</span>
                  <span>sets</span>
                </span>
              )}
              {hasValue(exercise.reps) && (
                <span className="flex items-center gap-1.5">
                  <Activity size={12} className="text-[#84FF00]" />
                  <span className="text-zinc-200">{exercise.reps}</span>
                  <span>reps</span>
                </span>
              )}
              {hasRest && (
                <span className="flex items-center gap-1.5">
                  <Timer size={12} className="text-[#84FF00]" />
                  <span className="text-zinc-200">{exercise.restSeconds}s</span>
                  <span>rest</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasVideo && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setOpenVideoKey(isVideoOpen ? null : cardKey)}
                className="w-10 h-10 rounded-xl bg-[#84FF00] text-black flex items-center justify-center shadow-[0_0_0_0_rgba(132,255,0,0)] hover:shadow-[0_0_18px_rgba(132,255,0,0.55)] transition-shadow duration-300"
              >
                <Play size={14} fill="currentColor" />
              </motion.button>
            )}

            {hasExpandable && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setExpanded(!expanded)}
                className="w-10 h-10 rounded-xl border border-zinc-700 flex items-center justify-center text-zinc-400 hover:border-[#84FF00]/50 hover:text-[#84FF00] transition-all duration-200"
              >
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown size={15} />
                </motion.div>
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-4 border-t border-zinc-800/60 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hasTempo && (
                  <div className="bg-zinc-900/70 rounded-xl p-3 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Tempo</p>
                    <p className="text-sm font-bold text-white">{exercise.tempo}</p>
                  </div>
                )}
                {hasRpe && (
                  <div className="bg-zinc-900/70 rounded-xl p-3 border border-zinc-800">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">RPE Target</p>
                    <p className="text-sm font-bold text-[#84FF00] drop-shadow-[0_0_6px_#84FF00]">
                      {exercise.rpeTarget}
                      <span className="text-zinc-500 font-normal text-xs"> / 10</span>
                    </p>
                  </div>
                )}
                {hasNotes && (
                  <div className="col-span-2 sm:col-span-3 bg-zinc-900/70 rounded-xl p-3 border border-zinc-800 flex gap-2.5">
                    <StickyNote size={14} className="text-[#84FF00] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-zinc-300 leading-relaxed">{exercise.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Meta pill ────────────────────────────────────────────────────────────────
function MetaPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2 shadow-lg">
      <span className="text-[#84FF00]">{icon}</span>
      <span className="text-sm font-semibold text-white">{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openVideoKey, setOpenVideoKey] = useState<string | number | null>(null);

  const [bannerUrl] = useState(() => {
    const idx = Number(sessionId ?? 0) % GYM_BANNERS.length;
    return GYM_BANNERS[Math.abs(idx)];
  });

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSession() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Enrollment/sessions/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-t-[#84FF00] animate-spin" />
          <div className="absolute inset-2 flex items-center justify-center">
            <Dumbbell size={18} className="text-[#84FF00]" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-sm tracking-widest uppercase">Loading Session</p>
          <p className="text-zinc-600 text-xs mt-1">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-5 px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center"
        >
          <Dumbbell size={32} className="text-zinc-600" />
        </motion.div>
        <p className="text-white font-black text-xl">Session not found</p>
        <p className="text-zinc-500 text-sm text-center max-w-xs">
          This session could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  const exercises = session.sessionExerciseDto ?? [];

  const sections: { type: string; items: any[] }[] = [];
  const seen = new Map<string, any[]>();

  for (const ex of exercises) {
    const key = ex.sectionType?.trim() || "Main";
    if (!seen.has(key)) {
      const a: any[] = [];
      seen.set(key, a);
      sections.push({ type: key, items: a });
    }
    seen.get(key)!.push(ex);
  }

  let globalIdx = 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <Navigation />

      <section className="relative h-[70vh] overflow-hidden flex items-center justify-center">
        <motion.div className="absolute inset-0 scale-110" style={{ y: heroY }}>
          <img
            src={bannerUrl}
            alt="gym"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.45) saturate(1.15)" }}
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-transparent to-zinc-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#84FF00]/15 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

        <Particles />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-[#84FF00]/30 bg-[#84FF00]/10 backdrop-blur-sm"
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[#84FF00] shadow-[0_0_6px_#84FF00]"
            />
            <span className="text-[#84FF00] text-xs font-bold uppercase tracking-[0.25em]">
              Training Session
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-black mb-7 leading-[1.05] tracking-tight"
          >
            {session.sessionTitle.split(" ").map((word: string, i: number) =>
              i === 0 ? (
                <span key={i} className="text-[#84FF00]" style={{ textShadow: "0 0 40px rgba(132,255,0,0.7)" }}>
                  {word}{" "}
                </span>
              ) : (
                <span key={i} className="text-white">
                  {word}{" "}
                </span>
              )
            )}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {hasValue(session.weekDay) && <MetaPill icon={<Calendar size={13} />} label={session.weekDay} />}
            {hasValue(session.estimatedDuration) && <MetaPill icon={<Clock size={13} />} label={`${session.estimatedDuration} min`} />}
            {hasValue(session.dayOrder) && <MetaPill icon={<BarChart2 size={13} />} label={`Day ${session.dayOrder}`} />}
            {exercises.length > 0 && <MetaPill icon={<Dumbbell size={13} />} label={`${exercises.length} exercises`} />}
          </motion.div>
        </motion.div>
      </section>

      {(hasValue(session.warmupNotes) || hasValue(session.primerNotes)) && (
        <section className="relative overflow-hidden bg-zinc-950">
          <GlowOrbs />
          <div className="absolute inset-0 bg-zinc-950/55 z-[1]" />
          <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-zinc-950 to-transparent z-[2]" />

          <div className="relative z-10 max-w-3xl mx-auto px-5 pt-14 pb-10 space-y-10">
            {hasValue(session.warmupNotes) && (
              <div>
                <SectionHeader icon={<Flame size={17} />} title="Warm Up" delay={0.05} />
                <NoteCard icon={<Flame size={15} />} title="Warmup Notes" text={session.warmupNotes} accent="#f97316" delay={0.1} />
              </div>
            )}
            {hasValue(session.primerNotes) && (
              <div>
                <SectionHeader icon={<Zap size={17} />} title="Primer" delay={0.1} />
                <NoteCard icon={<Zap size={15} />} title="Primer Notes" text={session.primerNotes} accent="#a78bfa" delay={0.15} />
              </div>
            )}
          </div>
        </section>
      )}

      {exercises.length > 0 && (
        <section
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(180deg, #050505 0%, #081006 35%, rgba(132,255,0,0.07) 100%)" }}
        >
          <PremiumGymBackground />

          <div className="absolute inset-0 bg-black/35 z-[1]" />

          <div
            className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(132,255,0,0.8) 2px, rgba(132,255,0,0.8) 3px)",
              backgroundSize: "100% 6px",
            }}
          />

          <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-b from-zinc-950 via-zinc-950/60 to-transparent z-[3]" />
          <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-[3]" />

          <div className="relative z-10 max-w-3xl mx-auto px-5 py-16">
            <SectionHeader icon={<Dumbbell size={17} />} title="Exercises" delay={0.05} />
            <div className="space-y-10">
              {sections.map((section, si) => (
                <div key={section.type}>
                  {sections.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + si * 0.08 }}
                      className="flex items-center gap-3 mb-4"
                    >
                      <SectionBadge type={section.type} />
                      <div className="flex-1 h-px bg-zinc-700/60" />
                      <span className="text-zinc-500 text-xs">{section.items.length} exercises</span>
                    </motion.div>
                  )}
                  <div className="space-y-3">
                    {section.items.map((ex: any) => {
                      const idx = globalIdx++;
                      return (
                        <ExerciseCard
                          key={ex.exerciseID ?? idx}
                          exercise={ex}
                          index={idx}
                          openVideoKey={openVideoKey}
                          setOpenVideoKey={setOpenVideoKey}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(hasValue(session.cooldownNotes) || (exercises.length === 0 && !hasValue(session.warmupNotes))) && (
        <section className="relative overflow-hidden bg-zinc-950">
          <GlowOrbs />
          <div className="absolute inset-0 bg-zinc-950/55 z-[1]" />
          <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-zinc-950 to-transparent z-[2]" />

          <div className="relative z-10 max-w-3xl mx-auto px-5 py-14 space-y-10">
            {hasValue(session.cooldownNotes) && (
              <div>
                <SectionHeader icon={<Wind size={17} />} title="Cool Down" />
                <NoteCard icon={<Wind size={15} />} title="Cooldown Notes" text={session.cooldownNotes} accent="#38bdf8" />
              </div>
            )}
            {exercises.length === 0 && !hasValue(session.warmupNotes) && !hasValue(session.cooldownNotes) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Dumbbell size={26} className="text-zinc-600" />
                </div>
                <p className="text-zinc-400 text-sm">No content available for this session.</p>
              </motion.div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}