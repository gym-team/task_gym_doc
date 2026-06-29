"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import type { Trainer } from "@/components/trainers/trainer-detail";

type AnyObj = Record<string, any>;

function pick(source: AnyObj | null | undefined, keys: string[]) {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function normalizePayload(payload: any) {
  if (!payload) return null;
  if (payload.data) return payload.data;
  if (payload.trainer) return payload.trainer;
  if (payload.result) return payload.result;
  return payload;
}

function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function SectionTitle({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-4 mb-10">
      <div className="flex items-center gap-4">
        <span className="text-white/15 text-xs tracking-[0.35em] uppercase">
          {index}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-[#84FF00]/20 via-white/10 to-transparent" />
      </div>

      <div className="max-w-3xl">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] text-white leading-[0.95]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-4 text-sm md:text-base text-white/70 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  accent = "green",
}: {
  value: string;
  label: string;
  accent?: "green" | "orange" | "cyan";
}) {
  const accentClass =
    accent === "orange"
      ? "text-[#FF6B00]"
      : accent === "cyan"
        ? "text-[#00D9FF]"
        : "text-[#84FF00]";

  return (
    <div className="rounded-2xl border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] backdrop-blur-xl px-5 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
      <div className={`text-2xl md:text-3xl font-black ${accentClass}`}>
        {value}
      </div>
      <div className="mt-1 text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/70">
        {label}
      </div>
    </div>
  );
}

export default function TrainerPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  const heroReveal = useReveal<HTMLElement>();
  const specialReveal = useReveal<HTMLElement>();
  const scheduleReveal = useReveal<HTMLElement>();
  const quoteReveal = useReveal<HTMLElement>();

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    async function getTrainer() {
      try {
        setLoading(true);
        setError(false);

        if (!id) throw new Error("Missing trainer id");

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");

        const res = await fetch(`${baseUrl}/api/Coach/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`Failed to fetch trainer (${res.status})`);

        const data = normalizePayload(await res.json());
        if (!data) throw new Error("Empty trainer response");

        setTrainer(data as Trainer);
      } catch (err) {
        console.error("Trainer fetch error:", err);
        setError(true);
        setTrainer(null);
      } finally {
        setLoading(false);
      }
    }

    getTrainer();
  }, [id]);

  const view = useMemo(() => {
    const t = (trainer as AnyObj | null) ?? {};

    const fullName =
      pick(t, ["name", "fullName", "trainerName"]) ||
      `${pick(t, ["firstName", "first_name"]) ?? ""} ${pick(t, ["lastName", "last_name"]) ?? ""}`.trim() ||
      "Unnamed Coach";

    const firstName = pick(t, ["firstName", "first_name"]) || fullName.split(" ")[0] || "Coach";
    const lastName =
      pick(t, ["lastName", "last_name"]) ||
      fullName.split(" ").slice(1).join(" ") ||
      "";

    const specialization = pick(t, ["specialization", "speciality", "specialty", "title"]) || "Elite Coach";
    const bio = pick(t, ["bio", "about", "description", "summary"]) || "No bio available.";
    const imageUrl = pick(t, ["imageUrl", "image", "photoUrl", "avatar", "picture", "profileImage"]);
    const yearsExp = pick(t, ["yearsExp", "yearsOfExperience", "experienceYears", "experience"]);
    const clientsCount = pick(t, ["clientsCount", "clientCount", "clients", "totalClients"]);
    const successRate = pick(t, ["successRate", "success", "successPercent", "rate"]);
    const philosophy =
      pick(t, ["philosophy", "quote", "motto", "slogan"]) ||
      "Excellence is not a destination — it is a continuous journey of precision, discipline, and measured progress.";

    const specializations =
      pick(t, ["specializations", "skills", "expertise", "categories"]) ||
      [
        {
          name: "Power Training",
          desc: "Elite strength programming designed around biomechanics and progressive overload.",
        },
        {
          name: "Body Composition",
          desc: "Science-backed methods for muscle gain, fat loss, and sustainable transformation.",
        },
        {
          name: "Athletic Performance",
          desc: "Speed, agility, endurance, and reaction work for competitive performance.",
        },
      ];

    const schedule =
      pick(t, ["schedule", "weeklySchedule", "workingHours", "availability"]) ||
      [
        { day: "Monday", className: "Power & Strength", time: "06:00 — 08:00" },
        { day: "Wednesday", className: "Body Composition", time: "07:00 — 09:00" },
        { day: "Thursday", className: "Athletic Performance", time: "17:00 — 19:00" },
        { day: "Saturday", className: "Private Sessions", time: "08:00 — 14:00" },
      ];

    return {
      fullName,
      firstName,
      lastName,
      specialization,
      bio,
      imageUrl,
      yearsExp,
      clientsCount,
      successRate,
      philosophy,
      specializations,
      schedule,
    };
  }, [trainer]);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
        <div className="fixed inset-0 -z-50 bg-[radial-gradient(circle_at_top_left,rgba(132,255,0,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,217,255,0.06),transparent_32%),linear-gradient(to_bottom,#050505,#0a0a0a_45%,#050505)]" />

        <div
          className="fixed inset-0 pointer-events-none -z-20 opacity-100"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,.035) 1px, transparent 1px)
            `,
            backgroundSize: "58px 58px",
          }}
        />

        <div
          className="fixed inset-0 pointer-events-none -z-10 transition-all duration-300"
          style={{
            background: `radial-gradient(circle 380px at ${mousePos.x}px ${mousePos.y}px, rgba(132,255,0,0.14) 0%, rgba(255,107,0,0.08) 26%, rgba(0,0,0,0.86) 70%)`,
          }}
        />

        <div className="fixed top-[-180px] left-[-180px] w-[560px] h-[560px] rounded-full bg-[#84FF00]/15 blur-[180px] animate-[floatBlob_11s_ease-in-out_infinite]" />
        <div className="fixed bottom-[-180px] right-[-180px] w-[560px] h-[560px] rounded-full bg-[#FF6B00]/14 blur-[180px] animate-[floatBlob_13s_ease-in-out_infinite]" />

        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] backdrop-blur-xl p-8 shadow-[0_10px_40px_rgba(132,255,0,0.08)]">
            <div className="mx-auto relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-[#84FF00] animate-spin" />
              <div className="absolute inset-3 rounded-full border-4 border-white/5 border-b-[#FF6B00] animate-spin [animation-direction:reverse] [animation-duration:1.6s]" />
              <div className="absolute inset-7 rounded-full border border-[#84FF00]/20 bg-black/40 backdrop-blur-md" />
            </div>

            <div className="mt-8 h-px w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-[#84FF00] via-white to-[#FF6B00] animate-[loadingBar_1.4s_ease-in-out_infinite]" />
            </div>

            <p className="mt-6 text-center text-[10px] tracking-[0.45em] uppercase text-white/35">
              Loading Elite Profile
            </p>
          </div>
        </main>

        <style jsx global>{`
          @keyframes floatBlob {
            0%,
            100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            33% {
              transform: translate3d(30px, -20px, 0) scale(1.04);
            }
            66% {
              transform: translate3d(-18px, 25px, 0) scale(0.98);
            }
          }

          @keyframes loadingBar {
            0% {
              transform: translateX(-120%);
            }
            100% {
              transform: translateX(420%);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
        <div className="fixed inset-0 -z-50 bg-[radial-gradient(circle_at_top_left,rgba(132,255,0,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,107,0,0.06),transparent_32%),linear-gradient(to_bottom,#050505,#0a0a0a_45%,#050505)]" />

        <div
          className="fixed inset-0 pointer-events-none -z-20 opacity-100"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,.035) 1px, transparent 1px)
            `,
            backgroundSize: "58px 58px",
          }}
        />

        <Navigation />

        <main className="min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] backdrop-blur-xl p-10 md:p-14 shadow-[0_10px_40px_rgba(0,0,0,0.35)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#84FF00]/40 to-transparent" />
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#FF6B00]/10 blur-[120px]" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[#84FF00]/10 blur-[120px]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] tracking-[0.35em] uppercase text-white/60">
                <span className="h-2 w-2 rounded-full bg-[#FF6B00]" />
                Trainer not found
              </div>

              <div className="mt-8 text-7xl md:text-9xl font-black tracking-[-0.08em] text-white/10">
                404
              </div>

              <h1 className="mt-4 text-3xl md:text-5xl font-black uppercase tracking-[-0.04em] text-white">
                Missing <span className="text-[#84FF00]">Coach Profile</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm md:text-base text-white/70 leading-relaxed">
                The profile could not be loaded from the API. Check the id, the endpoint, or the API response shape.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="h-11 rounded-xl bg-white px-5 font-semibold text-black transition-colors hover:bg-[#84FF00]">
                  Back to Trainers
                </button>
                <button className="h-11 rounded-xl border border-[#84FF00]/40 bg-transparent px-5 font-semibold text-[#84FF00] transition-colors hover:bg-[#84FF00] hover:text-black">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />

        <style jsx global>{`
          @keyframes floatBlob {
            0%,
            100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            33% {
              transform: translate3d(30px, -20px, 0) scale(1.04);
            }
            66% {
              transform: translate3d(-18px, 25px, 0) scale(0.98);
            }
          }
        `}</style>
      </div>
    );
  }

  const stats = [
    {
      value: view.yearsExp !== undefined && view.yearsExp !== null ? `${view.yearsExp}+` : "—",
      label: "Years",
      accent: "green" as const,
    },
    {
      value:
        view.clientsCount !== undefined && view.clientsCount !== null
          ? String(view.clientsCount)
          : "—",
      label: "Clients",
      accent: "orange" as const,
    },
    {
      value:
        view.successRate !== undefined && view.successRate !== null
          ? `${view.successRate}%`
          : "—",
      label: "Success",
      accent: "cyan" as const,
    },
  ];

  const specializations = Array.isArray(view.specializations)
    ? view.specializations
    : [];

  const scheduleItems = Array.isArray(view.schedule) ? view.schedule : [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="fixed inset-0 -z-50 bg-[radial-gradient(circle_at_top_left,rgba(132,255,0,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(0,217,255,0.06),transparent_30%),linear-gradient(to_bottom,#050505,#0a0a0a_45%,#050505)]" />

      <div
        className="fixed inset-0 pointer-events-none -z-30 opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,.035) 1px, transparent 1px)
          `,
          backgroundSize: "58px 58px",
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none -z-20 transition-all duration-300"
        style={{
          background: `radial-gradient(circle 420px at ${mousePos.x}px ${mousePos.y}px, rgba(132,255,0,0.12) 0%, rgba(255,107,0,0.07) 26%, rgba(0,0,0,0.90) 72%)`,
        }}
      />

      <div className="fixed top-[-190px] left-[-190px] w-[600px] h-[600px] rounded-full bg-[#84FF00]/14 blur-[190px] animate-[floatBlob_11s_ease-in-out_infinite]" />
      <div className="fixed bottom-[-190px] right-[-190px] w-[600px] h-[600px] rounded-full bg-[#FF6B00]/12 blur-[190px] animate-[floatBlob_13s_ease-in-out_infinite]" />
      <div className="fixed top-[38%] left-[46%] w-[440px] h-[440px] rounded-full bg-[#00D9FF]/6 blur-[190px] animate-[floatBlob_15s_ease-in-out_infinite]" />

      <Navigation />

      <main className="relative z-10 pt-16">
        <section
          ref={heroReveal.ref}
          className="relative min-h-screen flex items-center py-24 lg:py-28"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#84FF00]/30 to-transparent" />
          <div className="absolute left-0 right-0 top-[24%] h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
            <div
              style={{
                opacity: heroReveal.visible || mounted ? 1 : 0,
                transform:
                  heroReveal.visible || mounted ? "translateY(0)" : "translateY(40px)",
                transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
                <span className="h-2.5 w-2.5 rounded-full bg-[#84FF00] shadow-[0_0_18px_rgba(132,255,0,0.55)]" />
                <span className="text-[10px] tracking-[0.35em] uppercase text-white/70">
                  Elite Coach Profile
                </span>
              </div>

              <h1 className="mt-6 text-5xl sm:text-6xl lg:text-8xl font-black uppercase tracking-[-0.06em] leading-[0.92] text-white">
                {view.firstName}{" "}
                <span className="text-[#84FF00]">{view.lastName}</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm md:text-lg text-white/75 leading-relaxed">
                {view.bio}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-[#84FF00]/20 bg-[#84FF00]/10 px-4 py-2 text-xs tracking-[0.3em] uppercase text-[#84FF00]">
                  {view.specialization}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.3em] uppercase text-white/60">
                  Live Availability
                </span>
                <span className="rounded-full border border-[#00D9FF]/20 bg-[#00D9FF]/10 px-4 py-2 text-xs tracking-[0.3em] uppercase text-[#00D9FF]">
                  Recovery Ready
                </span>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((s) => (
                  <StatCard
                    key={s.label}
                    value={s.value}
                    label={s.label}
                    accent={s.accent}
                  />
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <button className="h-12 rounded-xl bg-white px-6 font-semibold text-black transition-all duration-300 hover:bg-[#84FF00] hover:shadow-[0_10px_30px_rgba(132,255,0,0.22)]">
                  Book Session
                </button>
                <button className="h-12 rounded-xl border border-[#84FF00]/40 bg-transparent px-6 font-semibold text-[#84FF00] transition-all duration-300 hover:bg-[#84FF00] hover:text-black hover:shadow-[0_10px_30px_rgba(132,255,0,0.18)]">
                  View Schedule
                </button>
              </div>
            </div>

            <div
              className="relative"
              style={{
                opacity: heroReveal.visible || mounted ? 1 : 0,
                transform:
                  heroReveal.visible || mounted ? "translateY(0)" : "translateY(40px)",
                transition: "all 0.9s cubic-bezier(0.22,1,0.36,1) 0.08s",
              }}
            >
              <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] backdrop-blur-xl shadow-[0_18px_70px_rgba(0,0,0,0.35)]">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40"
                  style={{
                    backgroundImage: view.imageUrl
                      ? `url(${view.imageUrl})`
                      : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35),rgba(0,0,0,0.68)),linear-gradient(to_bottom,rgba(132,255,0,0.12),rgba(0,0,0,0.10),#050505)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,255,0,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,107,0,0.12),transparent_28%)]" />

                <div className="absolute top-5 left-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#84FF00] animate-pulse" />
                  <span className="text-[10px] tracking-[0.35em] uppercase text-white/70">
                    Live
                  </span>
                </div>

                <div className="absolute top-5 right-5 z-10 rounded-full border border-[#84FF00]/20 bg-black/35 px-4 py-2 backdrop-blur-md">
                  <span className="text-[10px] tracking-[0.35em] uppercase text-[#84FF00]">
                    Coach / {String(id ?? "001").padStart(3, "0")}
                  </span>
                </div>

                <div className="relative min-h-[520px] flex items-end">
                  {view.imageUrl ? (
                    <img
                      src={view.imageUrl}
                      alt={view.fullName}
                      className="absolute inset-0 h-full w-full object-cover object-center opacity-95"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-9xl font-black text-white/10">
                          {view.fullName?.[0] ?? "C"}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,5,5,0.94),rgba(5,5,5,0.30),rgba(5,5,5,0.08))]" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#84FF00]/30 to-transparent" />
                  <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                       style={{
                         backgroundImage:
                           "linear-gradient(to right, rgba(132,255,0,.9) 1px, transparent 1px), linear-gradient(to bottom, rgba(132,255,0,.9) 1px, transparent 1px)",
                         backgroundSize: "24px 24px",
                       }} />

                  <div className="relative z-10 w-full p-6 md:p-8">
                    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] backdrop-blur-xl p-5 md:p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] tracking-[0.35em] uppercase text-white/45">
                            Focus
                          </p>
                          <div className="mt-2 text-xl md:text-2xl font-black uppercase tracking-[-0.04em]">
                            <span className="text-white">Performance</span>{" "}
                            <span className="text-[#84FF00]">Driven</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#84FF00]/20 bg-[#84FF00]/10 px-4 py-3 text-right">
                          <div className="text-[#84FF00] text-xl md:text-2xl font-black">
                            Elite
                          </div>
                          <div className="text-[10px] tracking-[0.3em] uppercase text-white/70">
                            Standard
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                          <div className="text-[10px] tracking-[0.3em] uppercase text-white/45">
                            Specialty
                          </div>
                          <div className="mt-2 text-sm md:text-base text-white/85 font-medium">
                            {view.specialization}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                          <div className="text-[10px] tracking-[0.3em] uppercase text-white/45">
                            Status
                          </div>
                          <div className="mt-2 text-sm md:text-base text-white/85 font-medium">
                            Accepting Clients
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <div className="absolute left-0 right-0 top-[18%] h-px bg-gradient-to-r from-transparent via-[#84FF00]/12 to-transparent animate-[scanLine_6s_linear_infinite]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={specialReveal.ref}
          className="relative py-24 lg:py-28 border-t border-white/5"
          style={{
            opacity: specialReveal.visible ? 1 : 0,
            transform: specialReveal.visible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <SectionTitle
              index="01"
              title="SPECIALIZATIONS"
              subtitle="The coach profile is structured like a premium fitness SaaS card: compact, readable, and visually intense without being crowded."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {specializations.length > 0 ? (
                specializations.map((spec: any, i: number) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 lg:p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(132,255,0,0.25)]"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(132,255,0,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,107,0,0.06),transparent_26%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#84FF00]/20 bg-[#84FF00]/10 text-[#84FF00]">
                        <span className="text-sm font-black">
                          0{i + 1}
                        </span>
                      </div>

                      <h3 className="text-xl md:text-2xl font-black uppercase tracking-[-0.04em] text-white">
                        {spec?.name ?? spec?.title ?? `Specialty ${i + 1}`}
                      </h3>

                      <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-white/72">
                        {spec?.desc ?? spec?.description ?? "No description available."}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-white/70">
                  No specializations available.
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          ref={scheduleReveal.ref}
          className="relative py-24 lg:py-28 border-t border-white/5"
          style={{
            opacity: scheduleReveal.visible ? 1 : 0,
            transform: scheduleReveal.visible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <SectionTitle
              index="02"
              title="WEEKLY SCHEDULE"
              subtitle="The timetable is styled like a high-end training dashboard: minimal labels, strong hierarchy, and neon focus."
            />

            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
              {scheduleItems.length > 0 ? (
                scheduleItems.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-[140px_1fr_auto] items-start md:items-center gap-3 md:gap-8 px-5 md:px-7 py-5 border-b border-white/8 last:border-b-0 bg-black/10 hover:bg-white/[0.04] transition-colors duration-300"
                  >
                    <div className="text-[10px] tracking-[0.35em] uppercase text-white/35">
                      {item?.day ?? `Day ${i + 1}`}
                    </div>

                    <div className="text-lg md:text-xl font-medium text-white/85">
                      {item?.className ?? item?.name ?? item?.title ?? "Session"}
                    </div>

                    <div className="text-xs md:text-sm tracking-[0.3em] uppercase text-[#84FF00]">
                      {item?.time ?? item?.hours ?? "—"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-white/70">No schedule available.</div>
              )}
            </div>
          </div>
        </section>

        <section
          ref={quoteReveal.ref}
          className="relative py-24 lg:py-28 border-t border-white/5"
          style={{
            opacity: quoteReveal.visible ? 1 : 0,
            transform: quoteReveal.visible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease",
          }}
        >
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 md:p-12 text-center">
              <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-[#84FF00]/10 blur-[140px]" />
              <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-[#FF6B00]/10 blur-[140px]" />

              <p className="relative z-10 text-6xl md:text-8xl font-black leading-none text-white/10">
                “
              </p>

              <blockquote className="relative z-10 -mt-6 text-xl md:text-3xl font-light italic leading-relaxed text-white/82">
                {view.philosophy}
              </blockquote>

              <div className="relative z-10 mt-8 text-[10px] tracking-[0.45em] uppercase text-white/35">
                {view.fullName}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes floatBlob {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(30px, -20px, 0) scale(1.04);
          }
          66% {
            transform: translate3d(-18px, 25px, 0) scale(0.98);
          }
        }

        @keyframes loadingBar {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(420%);
          }
        }

        @keyframes scanLine {
          0% {
            transform: translateY(-120px);
            opacity: 0;
          }
          10% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.18;
          }
          100% {
            transform: translateY(980px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}