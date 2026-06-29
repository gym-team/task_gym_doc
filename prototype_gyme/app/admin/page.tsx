"use client";

import { Navigation } from "@/components/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  RefreshCw,
  Dumbbell,
  Salad,
  BadgeAlert,
  Sparkles,
} from "lucide-react";

type PageResponse<T> = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
};

type NutritionPlan = {
  id: number;
  name: string;
  description: string;
  expectedOutcome?: string | null;
  coachName?: string | null;
  coachRating?: number | null;
  trainingGoal?: string | null;
  fitnessLevel?: string | null;
  equipmentType?: string | null;
  durationOnWeeks: number;
  isPublished: boolean;
  isLinkedToProgram?: boolean | null;
  photoThumbnailUrl?: string | null;
};

type Program = {
  id: number;
  name: string;
  description: string;
  expectedOutcome?: string | null;
  trackName?: string | null;
  coachName?: string | null;
  coachRating?: number | null;
  durationOnWeeks: number;
  sessionsPerWeeks?: number | null;
  sessionsDuration?: number | null;
  trainingGoal?: string | null;
  fitnessLevel?: string | null;
  equipmentType?: string | null;
  photoThumbnailUrl?: string | null;
  isPublished: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://fitzone-16.runasp.net";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1800&q=80";

function resolveImageSrc(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return url;
  return `${API_URL}${url}`;
}

async function getToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

async function fetchNutritionPlans(token: string) {
  const url = new URL(`${API_URL}/api/NutritionPlan`);
  url.searchParams.set("PageIndex", "1");
  url.searchParams.set("PageSize", "100");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to load nutrition plans (${res.status})`);
  }

  return (await res.json()) as PageResponse<NutritionPlan>;
}

async function fetchPrograms(token: string) {
  const url = new URL(`${API_URL}/api/Program`);
  url.searchParams.set("PageIndex", "1");
  url.searchParams.set("PageSize", "100");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to load programs (${res.status})`);
  }

  return (await res.json()) as PageResponse<Program>;
}

async function deleteNutritionPlan(id: number, token: string) {
  const res = await fetch(`${API_URL}/api/NutritionPlan/admin/${id}`, {
    method: "DELETE",
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to delete nutrition plan (${res.status})`);
  }
}

async function deleteProgram(id: number, token: string) {
  const res = await fetch(`${API_URL}/api/Program/admin/${id}`, {
    method: "DELETE",
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to delete program (${res.status})`);
  }
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-[#84FF00]">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight text-[#84FF00]">
            {value}
          </div>
          <div className="text-sm text-white/70">{label}</div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
        active
          ? "border-[#84FF00]/30 bg-[#84FF00] text-black shadow-[0_12px_40px_rgba(132,255,0,0.22)]"
          : "border-white/10 bg-white/[0.03] text-white/80 hover:border-white/20 hover:bg-white/[0.05]",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#84FF00]">
          Admin Console
        </p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(132,255,0,0.18)]">
      {children}
    </div>
  );
}

function ItemImage({ src, alt }: { src?: string | null; alt: string }) {
  const image = resolveImageSrc(src);
  if (!image) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center bg-black/30 text-xs text-white/40">
        No image
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={alt}
      className="aspect-[16/10] w-full object-cover"
    />
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "accent";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
      : tone === "warning"
        ? "border-orange-500/20 bg-orange-500/10 text-orange-200"
        : tone === "accent"
          ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
          : "border-white/10 bg-white/[0.04] text-white/75";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${toneClass}`}
    >
      {children}
    </span>
  );
}

export default function AdminNutritionAndProgramsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"plans" | "programs">("plans");

  const [token, setToken] = useState("");
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plansSearch, setPlansSearch] = useState("");
  const [programsSearch, setProgramsSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const t = await getToken();
      setToken(t);

      if (!t) {
        throw new Error("Authentication is required. Please sign in again.");
      }

      setPlansLoading(true);
      setProgramsLoading(true);

      const [plansRes, programsRes] = await Promise.all([
        fetchNutritionPlans(t),
        fetchPrograms(t),
      ]);

      setPlans(plansRes?.data || []);
      setPrograms(programsRes?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setLoading(false);
      setPlansLoading(false);
      setProgramsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPlans = useMemo(() => {
    const q = plansSearch.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter((item) => {
      const haystack = [
        item.name,
        item.description,
        item.expectedOutcome || "",
        item.coachName || "",
        item.trainingGoal || "",
        item.fitnessLevel || "",
        item.equipmentType || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [plans, plansSearch]);

  const filteredPrograms = useMemo(() => {
    const q = programsSearch.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter((item) => {
      const haystack = [
        item.name,
        item.description,
        item.expectedOutcome || "",
        item.trackName || "",
        item.coachName || "",
        item.trainingGoal || "",
        item.fitnessLevel || "",
        item.equipmentType || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [programs, programsSearch]);

  const onDeletePlan = async (id: number) => {
    const ok = window.confirm(
      "Delete this nutrition plan permanently?"
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      setError(null);
      if (!token) throw new Error("Authentication is required.");
      await deleteNutritionPlan(id, token);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete nutrition plan"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const onDeleteProgram = async (id: number) => {
    const ok = window.confirm("Delete this program permanently?");
    if (!ok) return;

    try {
      setDeletingId(id);
      setError(null);
      if (!token) throw new Error("Authentication is required.");
      await deleteProgram(id, token);
      setPrograms((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete program");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navigation />

      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(132,255,0,0.12),rgba(0,0,0,0.18),#050505)]" />
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#84FF00]/20 blur-[140px]" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[#00D9FF]/15 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="relative max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#84FF00]">
              Admin Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              Manage nutrition plans and programs
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/75 sm:text-lg">
              Review content, search quickly, and remove items when needed.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Nutrition plans"
                value={String(plans.length || 0)}
                icon={<Salad className="h-5 w-5" />}
              />
              <StatCard
                label="Programs"
                value={String(programs.length || 0)}
                icon={<Dumbbell className="h-5 w-5" />}
              />
              <StatCard
                label="Admin actions"
                value="Delete"
                icon={<Trash2 className="h-5 w-5" />}
              />
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadAll}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#84FF00] bg-transparent px-5 text-sm font-semibold text-[#84FF00] transition hover:bg-[#84FF00] hover:text-black"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <Link
                href="/admin"
                className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
              >
                Admin Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {error ? (
          <div className="mb-6 rounded-[24px] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-100">
            <div className="flex items-center gap-2 font-semibold">
              <BadgeAlert className="h-4 w-4" />
              Action failed
            </div>
            <div className="mt-2 text-red-100/80">{error}</div>
          </div>
        ) : null}

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-3 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-2">
            <TabButton
              active={activeTab === "plans"}
              onClick={() => setActiveTab("plans")}
              icon={<Salad className="h-4 w-4" />}
            >
              Nutrition Plans
            </TabButton>
            <TabButton
              active={activeTab === "programs"}
              onClick={() => setActiveTab("programs")}
              icon={<Dumbbell className="h-4 w-4" />}
            >
              Programs
            </TabButton>
          </div>
        </div>

        {activeTab === "plans" ? (
          <section className="mt-8">
            <SectionHeader
              title="Nutrition plans"
              description="Browse all plans currently available in the system."
            />

            <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 text-white/45" />
              <input
                value={plansSearch}
                onChange={(e) => setPlansSearch(e.target.value)}
                placeholder="Search plans by name, goal, level, or coach..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
            </div>

            {loading || plansLoading ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[420px] animate-pulse rounded-[24px] border border-white/10 bg-white/5"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredPlans.map((plan) => (
                  <CardShell key={plan.id}>
                    <ItemImage src={plan.photoThumbnailUrl} alt={plan.name} />
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-white">
                          {plan.name}
                        </h3>
                        {plan.isPublished ? (
                          <Badge tone="success">Published</Badge>
                        ) : (
                          <Badge tone="warning">Draft</Badge>
                        )}
                        {plan.isLinkedToProgram ? (
                          <Badge tone="accent">Linked</Badge>
                        ) : null}
                      </div>

                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/70">
                        {plan.description}
                      </p>

                      {plan.expectedOutcome ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">
                          <span className="font-semibold text-white/75">
                            Outcome:
                          </span>{" "}
                          {plan.expectedOutcome}
                        </p>
                      ) : null}

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <MiniField label="Coach" value={plan.coachName || "-"} />
                        <MiniField
                          label="Weeks"
                          value={String(plan.durationOnWeeks)}
                        />
                        <MiniField
                          label="Goal"
                          value={plan.trainingGoal || "-"}
                        />
                        <MiniField
                          label="Level"
                          value={plan.fitnessLevel || "-"}
                        />
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                     
                        <button
                          type="button"
                          onClick={() => onDeletePlan(plan.id)}
                          disabled={deletingId === plan.id}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#84FF00]/30 bg-[#84FF00]/10 text-[#84FF00] transition hover:bg-[#84FF00] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardShell>
                ))}

                {!filteredPlans.length ? (
                  <div className="col-span-full rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/60">
                    No nutrition plans found.
                  </div>
                ) : null}
              </div>
            )}
          </section>
        ) : (
          <section className="mt-8">
            <SectionHeader
              title="Programs"
              description="Browse all training programs currently available in the system."
            />

            <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 text-white/45" />
              <input
                value={programsSearch}
                onChange={(e) => setProgramsSearch(e.target.value)}
                placeholder="Search programs by name, track, goal, or coach..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
            </div>

            {loading || programsLoading ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[420px] animate-pulse rounded-[24px] border border-white/10 bg-white/5"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredPrograms.map((program) => (
                  <CardShell key={program.id}>
                    <ItemImage src={program.photoThumbnailUrl} alt={program.name} />
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-white">
                          {program.name}
                        </h3>
                        {program.isPublished ? (
                          <Badge tone="success">Published</Badge>
                        ) : (
                          <Badge tone="warning">Draft</Badge>
                        )}
                      </div>

                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/70">
                        {program.description}
                      </p>

                      {program.expectedOutcome ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">
                          <span className="font-semibold text-white/75">
                            Outcome:
                          </span>{" "}
                          {program.expectedOutcome}
                        </p>
                      ) : null}

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <MiniField
                          label="Coach"
                          value={program.coachName || "-"}
                        />
                        <MiniField
                          label="Weeks"
                          value={String(program.durationOnWeeks)}
                        />
                        <MiniField
                          label="Track"
                          value={program.trackName || "-"}
                        />
                        <MiniField
                          label="Sessions"
                          value={String(program.sessionsPerWeeks ?? "-")}
                        />
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onDeleteProgram(program.id)}
                          disabled={deletingId === program.id}
                          className="flex-1 rounded-xl border border-[#84FF00]/30 bg-[#84FF00]/10 px-4 py-2.5 text-sm font-semibold text-[#84FF00] transition hover:bg-[#84FF00] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === program.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </CardShell>
                ))}

                {!filteredPrograms.length ? (
                  <div className="col-span-full rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/60">
                    No programs found.
                  </div>
                ) : null}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function MiniField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-white">{value}</div>
    </div>
  );
}