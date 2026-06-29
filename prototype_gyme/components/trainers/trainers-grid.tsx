"use client";

import { useEffect, useMemo, useState, type ElementType } from "react";
import Link from "next/link";
import {
  Instagram,
  Twitter,
  Facebook,
  Star,
  DollarSign,
  ArrowUpRight,
  Users,
  Activity,
  Clock3,
  Sparkles,
} from "lucide-react";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { PremiumGymBackground } from "@/components/PremiumGymBackground";

type Coach = {
  id: number;
  fullName: string;
  about: string;
  yearsOfExperience: number;
  rating: number;
  price: number;
  photoUrl: string | null;
};

const LIME = "#84FF00";
const ORANGE = "#FF6B00";
const CYAN = "#00D9FF";

const LIME_GLOW = "rgba(132,255,0,0.25)";
const LIME_FADE = "rgba(132,255,0,0.12)";
const BORDER = "rgba(255,255,255,0.10)";
const CARD_BG =
  "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02))";

function normalizeCoachResponse(payload: any): Coach[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.result)) return payload.result;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.trainers)) return payload.trainers;
  return [];
}
function getFallbackCoachImage(id: number) {
  const images = [
    "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=1200&q=90",
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=90",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=90",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=90",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=90",
    "https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=1200&q=90",
  ];

  return images[id % images.length];
}
function ProfileButton({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex">
      <span
        className="group/btn relative inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 overflow-hidden"
        style={{
          color: LIME,
          border: `1px solid rgba(132,255,0,0.35)`,
          background: "rgba(255,255,255,0.02)",
          boxShadow: "none",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = LIME;
          el.style.color = "#000";
          el.style.borderColor = LIME;
          el.style.boxShadow = `0 0 20px ${LIME_GLOW}, 0 0 42px ${LIME_FADE}`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "rgba(255,255,255,0.02)";
          el.style.color = LIME;
          el.style.borderColor = "rgba(132,255,0,0.35)";
          el.style.boxShadow = "none";
        }}
      >
        View Profile
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
      </span>
    </Link>
  );
}

function SocialBtn({
  icon: Icon,
  accentColor,
}: {
  icon: ElementType;
  accentColor: string;
}) {
  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: "white",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = `${accentColor}22`;
        el.style.borderColor = `${accentColor}88`;
        el.style.boxShadow = `0 0 12px ${accentColor}44`;
        el.style.color = accentColor;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(255,255,255,0.06)";
        el.style.borderColor = "rgba(255,255,255,0.10)";
        el.style.boxShadow = "none";
        el.style.color = "white";
      }}
      aria-hidden="true"
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

function StatPill({
  icon: Icon,
  value,
  color,
  label,
}: {
  icon: ElementType;
  value: string;
  color: string;
  label: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold"
      style={{
        background: `${color}16`,
        border: `1px solid ${color}33`,
        color,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{value}</span>
      <span className="text-white/45 font-medium uppercase tracking-[0.18em]">
        {label}
      </span>
    </div>
  );
}

function TrainerCard({
  trainer,
  index,
}: {
  trainer: Coach;
  index: number;
}) {
  const imageSrc = trainer.photoUrl || getFallbackCoachImage(trainer.id);

  return (
    <article
      className="group relative flex w-full max-w-[420px] flex-col overflow-hidden rounded-[24px] border transition-all duration-300 hover:-translate-y-2"
      style={{
        background: CARD_BG,
        borderColor: BORDER,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        animationDelay: `${index * 70}ms`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(132,255,0,0.35)";
        el.style.boxShadow = "0 10px 40px rgba(132,255,0,0.16)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = BORDER;
        el.style.boxShadow = "none";
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#84FF00] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative h-80 overflow-hidden">
        <img
  src={imageSrc}
  alt={trainer.fullName}
  loading="lazy"
  decoding="async"
  referrerPolicy="no-referrer"
  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
/>
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,5,5,0.98),rgba(5,5,5,0.56)_40%,rgba(5,5,5,0.05)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(132,255,0,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,107,0,0.12),transparent_26%)]" />

        <div className="absolute top-4 right-4 rounded-full border border-[#84FF00]/30 bg-black/55 px-3 py-1.5 backdrop-blur-md">
          <span className="text-[10px] font-bold tracking-[0.28em] text-[#84FF00] uppercase">
            {trainer.yearsOfExperience} YRS
          </span>
        </div>

        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 backdrop-blur-md">
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">
            <Sparkles className="h-3.5 w-3.5 text-[#84FF00]" />
            Elite Coach
          </span>
        </div>

        <div className="absolute bottom-4 left-4 flex translate-y-3 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <SocialBtn icon={Instagram} accentColor="#E1306C" />
          <SocialBtn icon={Twitter} accentColor="#1DA1F2" />
          <SocialBtn icon={Facebook} accentColor="#1877F2" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-[-0.04em] text-white leading-[0.95]">
              {trainer.fullName}
            </h3>
            <div className="mt-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-[#84FF00] to-transparent" />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-right">
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/45">
              Price
            </div>
            <div className="text-sm font-black text-[#84FF00]">
              ${trainer.price}
            </div>
          </div>
        </div>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70">
          {trainer.about}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <StatPill
            icon={Star}
            value={String(trainer.rating)}
            color="#FFD700"
            label="rating"
          />
          <StatPill
            icon={DollarSign}
            value={String(trainer.price)}
            color={LIME}
            label="price"
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
          <span className="text-[10px] tracking-[0.35em] uppercase text-white/35">
            Trainer Profile
          </span>
          <ProfileButton href={`/trainers/${trainer.id}`} />
        </div>
      </div>
    </article>
  );
}

export function TrainersGrid() {
  const [trainers, setTrainers] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = trainers.length;
    const avgRating =
      total > 0
        ? (
            trainers.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) /
            total
          ).toFixed(1)
        : "0.0";

    return {
      total,
      avgRating,
    };
  }, [trainers]);

  useEffect(() => {
    let cancelled = false;

    async function loadTrainers() {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) {
          throw new Error("NEXT_PUBLIC_API_URL is not defined");
        }

        const res = await fetch(`${baseUrl}/api/Coach`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to load coaches (${res.status})`);
        }

        const data = normalizeCoachResponse(await res.json());

        if (!cancelled) {
          setTrainers(data);
        }
      } catch (err) {
        console.error("Failed to load coaches", err);
        if (!cancelled) {
          setTrainers([]);
          setError("Failed to load coaches.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTrainers();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-[#050505] py-24 text-white">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(132,255,0,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(0,217,255,0.05),transparent_32%),linear-gradient(to_bottom,#050505,#0a0a0a_55%,#050505)]" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,.035) 1px, transparent 1px)
            `,
            backgroundSize: "58px 58px",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 rounded-[32px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 md:p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#84FF00]/20 bg-[#84FF00]/10 px-4 py-2 text-[10px] tracking-[0.35em] uppercase text-[#84FF00]">
              <Users className="h-4 w-4" />
              Elite Coaches
            </div>

            <div className="mt-5 text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-[-0.06em] leading-[0.92]">
              TRAINERS <span className="text-[#84FF00]">NETWORK</span>
            </div>

            <p className="mt-5 max-w-2xl text-sm md:text-base leading-relaxed text-white/72">
              Premium fitness coaches presented with a dark glass UI, neon green
              accents, and performance-driven visual hierarchy.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 md:flex md:flex-wrap md:justify-end">
              <StatPill icon={Users} value="—" color={LIME} label="coaches" />
              <StatPill icon={Star} value="—" color="#FFD700" label="avg" />
              <StatPill icon={Clock3} value="LIVE" color={ORANGE} label="updated" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !trainers.length) {
    return (
      <section className="relative overflow-hidden bg-[#050505] py-28 text-white">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(132,255,0,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,107,0,0.06),transparent_32%),linear-gradient(to_bottom,#050505,#0a0a0a_55%,#050505)]" />
        <PremiumGymBackground />

        <div className="absolute top-0 left-0 h-32 w-full bg-gradient-to-b from-black via-black/90 to-transparent z-[2]" />
        <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black to-transparent z-[2]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 rounded-[32px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 md:p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#84FF00]/20 bg-[#84FF00]/10 px-4 py-2 text-[10px] tracking-[0.35em] uppercase text-[#84FF00]">
              <Users className="h-4 w-4" />
              Elite Coaches
            </div>

            <div className="mt-5 text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-[-0.06em] leading-[0.92]">
              TRAINERS <span className="text-[#84FF00]">NETWORK</span>
            </div>

            <p className="mt-5 max-w-2xl text-sm md:text-base leading-relaxed text-white/72">
              Premium fitness coaches presented with a dark glass UI, neon green
              accents, and performance-driven visual hierarchy.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 md:p-10 backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#84FF00]/20 bg-[#84FF00]/10 px-4 py-2 text-[10px] tracking-[0.35em] uppercase text-[#84FF00]">
                <Activity className="h-4 w-4" />
                Elite Platform
              </div>

              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-[-0.04em]">
                Could not load the <span className="text-[#84FF00]">trainers</span>
              </h3>

              <p className="max-w-2xl text-sm md:text-base leading-relaxed text-white/70">
                Check the API URL, the endpoint response, or the network request. The
                component is ready for a valid coach list.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#050505] py-24 text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(132,255,0,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(0,217,255,0.06),transparent_32%),linear-gradient(to_bottom,#050505,#0a0a0a_55%,#050505)]" />

      <PremiumGymBackground />

      <div
        className="absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,.035) 1px, transparent 1px)
          `,
          backgroundSize: "58px 58px",
        }}
      />

      <div className="absolute top-0 left-0 h-32 w-full bg-gradient-to-b from-black via-black/90 to-transparent z-[2]" />
      <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black to-transparent z-[2]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-14 rounded-[32px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 md:p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#84FF00]/20 bg-[#84FF00]/10 px-4 py-2 text-[10px] tracking-[0.35em] uppercase text-[#84FF00]">
                <Users className="h-4 w-4" />
                Elite Coaches
              </div>

              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-[-0.06em] leading-[0.92]">
                TRAINERS{" "}
                <span className="text-[#84FF00]">NETWORK</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm md:text-base leading-relaxed text-white/72">
                Premium fitness coaches presented with a dark glass UI, neon green
                accents, and performance-driven visual hierarchy.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatPill
                icon={Users}
                value={String(stats.total)}
                color={LIME}
                label="coaches"
              />
              <StatPill
                icon={Star}
                value={stats.avgRating}
                color="#FFD700"
                label="avg"
              />
              <StatPill
                icon={Clock3}
                value="LIVE"
                color={ORANGE}
                label="updated"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {trainers.map((trainer, i) => (
            <TrainerCard key={trainer.id} trainer={trainer} index={i} />
          ))}
        </div>
      </div>

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

        @keyframes scanLine {
          0% {
            transform: translateY(-120px);
            opacity: 0;
          }
          10% {
            opacity: 0.32;
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
    </section>
  );
}