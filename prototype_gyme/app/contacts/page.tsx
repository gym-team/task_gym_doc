"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { MessageCircle, Search, AlertTriangle } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface WorkoutProgramSummary {
  enrollmentId: number;
  programId: number;
  programName: string;
  trackId: number;
  trackName: string;
  startDate: string;
  endDate: string | null;
  currentWeek: number;
  totalWeeks: number;
  status: string;
}

interface NutritionPlanSummary {
  enrollmentId: number;
  planId: number;
  planName: string;
  startDate: string;
  endDate: string | null;
  goalType: string;
  status: string;
}

interface CoachContact {
  coachId: string;
  coachName: string;
  coachAvatarUrl: string | null;
  specialization: string | null;
  activeWorkoutProgram: WorkoutProgramSummary | null;
  activeNutritionPlan: NutritionPlanSummary | null;
}

interface TraineeContact {
  traineeId: string;
  traineeName: string;
  traineeAvatarUrl: string | null;
  joinedAt: string;
  currentWorkoutProgram: WorkoutProgramSummary | null;
  currentNutritionPlan: NutritionPlanSummary | null;
  history: {
    workoutPrograms: WorkoutProgramSummary[];
    nutritionPlans: NutritionPlanSummary[];
  };
}

type ContactsResponse =
  | { role: "Trainee"; coaches: CoachContact[] }
  | { role: "Coach"; trainees: TraineeContact[] };

interface NormalizedContact {
  id: string;
  name: string;
  avatarUrl: string | null;
  subtitle: string;
  program: WorkoutProgramSummary | null;
}

// ============================================================================
// Config
// ============================================================================

const API_BASE_URL = "https://fitzone-16.runasp.net";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") ?? localStorage.getItem("accessToken");
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function formatJoinDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

// ✅ Resolve avatar URL once — used in normalize so the render stays clean
function resolveAvatar(url: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE_URL}/${url}`;
}

function normalize(data: ContactsResponse): {
  role: "Coach" | "Trainee";
  contacts: NormalizedContact[];
} {
  if (data.role === "Trainee") {
    return {
      role: "Trainee",
      contacts: data.coaches.map((c) => ({
        id: c.coachId,
        name: c.coachName,
        avatarUrl: resolveAvatar(c.coachAvatarUrl),
        subtitle: c.specialization ?? "Coach",
        program: c.activeWorkoutProgram,
      })),
    };
  }
  return {
    role: "Coach",
    contacts: data.trainees.map((t) => ({
      id: t.traineeId,
      name: t.traineeName,
      avatarUrl: resolveAvatar(t.traineeAvatarUrl),
      subtitle: `Joined ${formatJoinDate(t.joinedAt)}`,
      program: t.currentWorkoutProgram,
    })),
  };
}

// ============================================================================
// Avatar component — handles broken images gracefully
// ============================================================================

function Avatar({
  url,
  name,
  size = 14,
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const sizeClass = `w-${size} h-${size}`;

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border border-white/10`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-[#84FF00]/20 to-[#00D9FF]/10 border border-white/10 flex items-center justify-center`}
    >
      <span className="text-[#84FF00] font-bold text-sm">{initials(name)}</span>
    </div>
  );
}

// ============================================================================
// Progress ring
// ============================================================================

function ProgressRing({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.min(current / total, 1) : 0;
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      className="shrink-0 -rotate-90"
    >
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
      />
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke="#84FF00"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90"
        style={{
          transformOrigin: "24px 24px",
          fill: "#84FF00",
          fontSize: "11px",
          fontWeight: 800,
        }}
      >
        {current}/{total}
      </text>
    </svg>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function ContactsPage() {
  const [role, setRole] = useState<"Coach" | "Trainee" | null>(null);
  const [contacts, setContacts] = useState<NormalizedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/api/Chat/contacts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (res.status === 401)
          throw new Error("Your session expired. Please sign in again.");
        if (!res.ok)
          throw new Error("Couldn't load your contacts. Please try again.");

        const data: ContactsResponse = await res.json();
        if (cancelled) return;

        const { role, contacts } = normalize(data);
        setRole(role);
        setContacts(contacts);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Something went wrong.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const heading = role === "Coach" ? "Your trainees" : "Your coaches";
  const emptyCopy =
    role === "Coach"
      ? "No trainees yet. Once someone enrolls in one of your programs, they'll show up here."
      : "No coaches yet. Enroll in a program to start a conversation with a coach.";

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden">
      <AmbientGlow />
      <Navigation />

      <main className="flex-1 relative z-10 pt-20">
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6 pt-10 pb-24">
          {/* Header */}
          <div className="mb-8 fade-up" style={{ animationDelay: "0ms" }}>
            <p className="text-[#84FF00] text-xs font-bold uppercase tracking-[0.2em] mb-2">
              Messages
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              {heading}
            </h1>
          </div>

          {/* Search */}
          {!isLoading && !error && contacts.length > 0 && (
            <div className="mb-6 fade-up" style={{ animationDelay: "60ms" }}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    role === "Coach"
                      ? "Search trainees..."
                      : "Search coaches..."
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-[#84FF00]/50 focus:outline-none focus:ring-1 focus:ring-[#84FF00]/20 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-4 animate-pulse"
                >
                  <div className="w-14 h-14 rounded-full bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-white/5 rounded" />
                    <div className="h-2.5 w-2/3 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="rounded-2xl border border-[#FF6B00]/30 bg-[#FF6B00]/[0.06] p-6 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#FF6B00] shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold text-sm mb-1">
                  Couldn't load contacts
                </p>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && contacts.length === 0 && (
            <div className="text-center py-20">
              <MessageCircle className="h-10 w-10 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                {emptyCopy}
              </p>
            </div>
          )}

          {/* No search results */}
          {!isLoading &&
            !error &&
            contacts.length > 0 &&
            filtered.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-12">
                No matches for "{query}"
              </p>
            )}

          {/* Contact list */}
          {!isLoading && !error && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((contact, idx) => (
                <Link
                  key={contact.id}
                  href={`/chat/${contact.id}`}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#84FF00]/30 p-4 transition-all duration-200 fade-up"
                  style={{ animationDelay: `${100 + idx * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {/* ✅ Avatar — now uses the Avatar component with onError fallback */}
                    <div className="shrink-0">
                      <Avatar
                        url={contact.avatarUrl}
                        name={contact.name}
                        size={14}
                      />
                    </div>

                    {/* Name + subtitle */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm uppercase tracking-wide truncate group-hover:text-[#84FF00] transition-colors">
                        {contact.name}
                      </h3>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">
                        {contact.subtitle}
                      </p>
                      {contact.program && (
                        <p className="text-[10px] text-[#00D9FF] uppercase tracking-wide mt-1 truncate">
                          {contact.program.programName}
                        </p>
                      )}
                    </div>

                    {/* Progress ring */}
                    {contact.program && (
                      <ProgressRing
                        current={contact.program.currentWeek}
                        total={contact.program.totalWeeks}
                      />
                    )}

                    {/* Chat icon */}
                    <div className="shrink-0 w-9 h-9 rounded-full bg-[#84FF00]/10 group-hover:bg-[#84FF00] flex items-center justify-center transition-colors">
                      <MessageCircle className="h-4 w-4 text-[#84FF00] group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-up {
          animation: fade-up 0.5s ease-out both;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Ambient background
// ============================================================================

function AmbientGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-[0.08] blur-[100px]"
        style={{ background: "#84FF00" }}
      />
      <div
        className="absolute top-1/3 -right-40 w-96 h-96 rounded-full opacity-[0.06] blur-[100px]"
        style={{ background: "#00D9FF" }}
      />
    </div>
  );
}
