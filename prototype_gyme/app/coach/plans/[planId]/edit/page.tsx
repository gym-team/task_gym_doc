"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  TRAINING_GOAL_OPTIONS,
  FITNESS_LEVEL_OPTIONS,
  EQUIPMENT_TYPE_OPTIONS,
  CALORIE_STRATEGY_OPTIONS,
} from "@/lib/nutrition-plan-enums";

type ProgramSummary = {
  id: number;
  name: string;
  trackName?: string | null;
  isPublished?: boolean | null;
};

type NutritionPlanSummary = {
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
  linkedWorkoutProgramID?: number | null;
  photoThumbnailUrl?: string | null;
};

type UpdateNutritionPlanPayload = {
  linkedWorkoutProgramID: number | null;
  name: string;
  description: string;
  expectedOutcome: string;
  nextSteps: string;
  trainingGoal: number;
  fitnessLevel: number;
  equipmentType: number;
  calorieStrategyType: number;
  durationOnWeeks: number;
  tdeeAdjustmentKcal: number;
  absoluteCalorieTarget: number;
  proteinTargetPerKg: number;
  photoThumbnailUrl: string | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://fitzone-16.runasp.net";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80";

function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function isValidNumber(value: string): boolean {
  if (!value.trim()) return false;
  return Number.isFinite(Number(value));
}

function mapTrainingGoalToNumber(value?: string | null): string {
  switch (value) {
    case "LoseFat":
      return "0";
    case "BuildMuscle":
      return "1";
    case "GetStronger":
      return "2";
    case "ImproveEndurance":
      return "3";
    case "MoveBetter":
      return "4";
    case "GeneralFitness":
      return "5";
    case "MaintainWeight":
      return "6";
    default:
      return "0";
  }
}

function mapFitnessLevelToNumber(value?: string | null): string {
  switch (value) {
    case "Beginner":
      return "0";
    case "Intermediate":
      return "1";
    case "Advanced":
      return "2";
    default:
      return "0";
  }
}

function mapEquipmentTypeToNumber(value?: string | null): string {
  switch (value) {
    case "FullGym":
      return "0";
    case "Dumbbells":
      return "1";
    case "Home":
      return "2";
    case "Bodyweight":
      return "3";
    case "Bands":
      return "4";
    default:
      return "0";
  }
}

function resolveImageSrc(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return url;
  return `${API_URL}${url}`;
}

async function fetchCoachPlans(token: string) {
  const res = await fetch(`${API_URL}/api/nutritionplan/coach`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return (await res.json()) as NutritionPlanSummary[];
}

async function fetchMyPrograms(token: string) {
  const res = await fetch(`${API_URL}/api/Program/mine`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return (await res.json()) as ProgramSummary[];
}

async function uploadThumbnail(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `Upload failed with status ${res.status}`);
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}

async function updateNutritionPlan(
  planId: number,
  payload: UpdateNutritionPlanPayload,
  token: string
) {
  const res = await fetch(`${API_URL}/api/nutritionplan/${planId}`, {
    method: "PUT",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return await res.text();
}

function PageSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#84FF00]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  required,
  maxLength,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  required?: boolean;
  maxLength?: number;
  helper?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/80">
        {label}
        {required ? <span className="ml-1 text-[#84FF00]">*</span> : null}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          maxLength={maxLength}
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-[#84FF00]/70 focus:ring-2 focus:ring-[#84FF00]/20"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-[#84FF00]/70 focus:ring-2 focus:ring-[#84FF00]/20"
        />
      )}
      {helper ? <span className="text-xs text-white/45">{helper}</span> : null}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  helper,
  step = "1",
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  step?: string;
  min?: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-[#84FF00]/70 focus:ring-2 focus:ring-[#84FF00]/20"
      />
      {helper ? <span className="text-xs text-white/45">{helper}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: number; label: string }>;
  helper?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition focus:border-[#84FF00]/70 focus:ring-2 focus:ring-[#84FF00]/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0A0A0A]">
            {opt.label}
          </option>
        ))}
      </select>
      {helper ? <span className="text-xs text-white/45">{helper}</span> : null}
    </label>
  );
}

function ProgramSelect({
  value,
  onChange,
  programs,
  loading,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  programs: ProgramSummary[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/80">
        Linked workout program
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition focus:border-[#84FF00]/70 focus:ring-2 focus:ring-[#84FF00]/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">None</option>
        {programs.map((program) => (
          <option key={program.id} value={program.id} className="bg-[#0A0A0A]">
            {program.name}
          </option>
        ))}
      </select>
      {loading ? (
        <span className="text-xs text-white/45">Loading your programs...</span>
      ) : error ? (
        <span className="text-xs text-red-300">{error}</span>
      ) : (
        <span className="text-xs text-white/45">
          Optional. Select one of your programs or leave it as None.
        </span>
      )}
    </label>
  );
}

function ImageUploadField({
  previewUrl,
  onSelect,
  onRemove,
  uploading,
}: {
  previewUrl: string | null;
  onSelect: (file: File | null) => void;
  onRemove: () => void;
  uploading: boolean;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSelect(e.target.files?.[0] ?? null);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-start">
      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
        <div className="flex aspect-square items-center justify-center bg-black/30">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Thumbnail preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="px-6 text-center">
              <div className="text-sm font-semibold text-white">
                No image selected
              </div>
              <div className="mt-1 text-xs text-white/45">
                PNG, JPG, WEBP, or GIF
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-white/10 bg-white text-sm font-semibold text-black transition hover:bg-[#84FF00]">
            <span className="px-4 py-2.5">
              {uploading ? "Uploading..." : previewUrl ? "Change image" : "Upload image"}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              className="hidden"
              onChange={handleChange}
              disabled={uploading}
            />
          </label>

          {previewUrl ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={uploading}
              className="rounded-xl border border-[#84FF00] bg-transparent px-4 py-2.5 text-sm font-semibold text-[#84FF00] transition hover:bg-[#84FF00] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove
            </button>
          ) : null}
        </div>

        <p className="text-sm leading-6 text-white/75">
          Upload a clean cover image for the plan. The file is stored on the server and the returned URL is saved with the plan.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/50">
          Recommended size: 1200 × 800 or higher. Maximum file size: 5 MB.
        </div>
      </div>
    </div>
  );
}

export default function EditNutritionPlanPage() {
  const router = useRouter();
  const params = useParams();

  const planId = useMemo(() => {
    const raw =
      (params as { planId?: string | string[]; id?: string | string[] })
        ?.planId ??
      (params as { planId?: string | string[]; id?: string | string[] })?.id ??
      "";
    const value = Array.isArray(raw) ? raw[0] : raw;
    return Number(value);
  }, [params]);

  const [token, setToken] = useState("");
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [plan, setPlan] = useState<NutritionPlanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailObjectUrl, setThumbnailObjectUrl] = useState<string | null>(
    null
  );
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    null
  );
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [form, setForm] = useState({
    linkedWorkoutProgramID: "",
    name: "",
    description: "",
    expectedOutcome: "",
    nextSteps: "",
    trainingGoal: "0",
    fitnessLevel: "0",
    equipmentType: "0",
    calorieStrategyType: "0",
    durationOnWeeks: "4",
    tdeeAdjustmentKcal: "0",
    absoluteCalorieTarget: "0",
    proteinTargetPerKg: "2",
    photoThumbnailUrl: "",
  });

  useEffect(() => {
    const t =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      "";
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;

    const loadPrograms = async () => {
      try {
        setProgramsLoading(true);
        const data = await fetchMyPrograms(token);
        setPrograms(Array.isArray(data) ? data : []);
      } catch {
        setPrograms([]);
      } finally {
        setProgramsLoading(false);
      }
    };

    loadPrograms();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    if (!Number.isFinite(planId) || planId <= 0) {
      setLoading(false);
      setError("Invalid plan ID.");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchCoachPlans(token);
        const found = data.find((p) => p.id === planId) || null;

        setPlan(found);

        if (!found) {
          throw new Error(`Plan with ID ${planId} was not found.`);
        }

        setForm({
          linkedWorkoutProgramID:
            found.linkedWorkoutProgramID != null
              ? String(found.linkedWorkoutProgramID)
              : "",
          name: found.name || "",
          description: found.description || "",
          expectedOutcome: found.expectedOutcome || "",
          nextSteps: "",
          trainingGoal: mapTrainingGoalToNumber(found.trainingGoal),
          fitnessLevel: mapFitnessLevelToNumber(found.fitnessLevel),
          equipmentType: mapEquipmentTypeToNumber(found.equipmentType),
          calorieStrategyType: "0",
          durationOnWeeks: String(found.durationOnWeeks ?? 4),
          tdeeAdjustmentKcal: "0",
          absoluteCalorieTarget: "0",
          proteinTargetPerKg: "2",
          photoThumbnailUrl: found.photoThumbnailUrl || "",
        });

        if (found.photoThumbnailUrl) {
          setThumbnailPreviewUrl(resolveImageSrc(found.photoThumbnailUrl));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plan");
        setPlan(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, planId]);

  useEffect(() => {
    return () => {
      if (thumbnailObjectUrl) URL.revokeObjectURL(thumbnailObjectUrl);
    };
  }, [thumbnailObjectUrl]);

  const payload = useMemo<UpdateNutritionPlanPayload>(() => {
    return {
      linkedWorkoutProgramID: toNullableNumber(form.linkedWorkoutProgramID),
      name: form.name.trim(),
      description: form.description.trim(),
      expectedOutcome: form.expectedOutcome.trim(),
      nextSteps: form.nextSteps.trim(),
      trainingGoal: toNumber(form.trainingGoal),
      fitnessLevel: toNumber(form.fitnessLevel),
      equipmentType: toNumber(form.equipmentType),
      calorieStrategyType: toNumber(form.calorieStrategyType),
      durationOnWeeks: toNumber(form.durationOnWeeks),
      tdeeAdjustmentKcal: toNumber(form.tdeeAdjustmentKcal),
      absoluteCalorieTarget: toNumber(form.absoluteCalorieTarget),
      proteinTargetPerKg: toNumber(form.proteinTargetPerKg),
      photoThumbnailUrl: form.photoThumbnailUrl.trim()
        ? form.photoThumbnailUrl.trim()
        : null,
    };
  }, [form]);

  const handleThumbnailSelect = async (file: File | null) => {
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported image format. Use PNG, JPG, WEBP, or GIF.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image size must be 5 MB or smaller.");
      return;
    }

    setError(null);
    setThumbnailFile(file);

    const objectUrl = URL.createObjectURL(file);
    setThumbnailObjectUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return objectUrl;
    });
    setThumbnailPreviewUrl(objectUrl);

    try {
      setUploadingThumbnail(true);
      const url = await uploadThumbnail(file);
      setForm((s) => ({ ...s, photoThumbnailUrl: url }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload the image."
      );
      setThumbnailFile(null);

      const fallback = plan?.photoThumbnailUrl
        ? resolveImageSrc(plan.photoThumbnailUrl)
        : null;

      setThumbnailObjectUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      setThumbnailPreviewUrl(fallback);
      setForm((s) => ({ ...s, photoThumbnailUrl: plan?.photoThumbnailUrl || "" }));
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailObjectUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setThumbnailPreviewUrl(null);
    setForm((s) => ({ ...s, photoThumbnailUrl: "" }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      if (!token) {
        throw new Error("Authentication is required. Please sign in again.");
      }

      if (!plan) {
        throw new Error("Plan is not loaded.");
      }

      if (!payload.name) {
        throw new Error("Plan name is required.");
      }

      if (payload.name.length < 3) {
        throw new Error("Plan name must be at least 3 characters long.");
      }

      if (payload.name.length > 120) {
        throw new Error("Plan name must be 120 characters or fewer.");
      }

      if (!payload.description) {
        throw new Error("Description is required.");
      }

      if (payload.description.length < 20) {
        throw new Error("Description must be at least 20 characters long.");
      }

      if (!isValidNumber(form.durationOnWeeks) || payload.durationOnWeeks < 1) {
        throw new Error("Duration must be at least 1 week.");
      }

      if (!isValidNumber(form.proteinTargetPerKg) || payload.proteinTargetPerKg <= 0) {
        throw new Error("Protein target must be greater than 0.");
      }

      if (uploadingThumbnail) {
        throw new Error("Please wait for the image upload to finish.");
      }

      await updateNutritionPlan(plan.id, payload, token);
      router.push(`/coach/plans/${plan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(132,255,0,0.14),rgba(0,0,0,0.18),#050505)]" />
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#84FF00]/20 blur-[140px]" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[#FF6B00]/15 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="relative max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#84FF00]">
              Coach Nutrition Plans
            </p>
            <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              Edit nutrition plan
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/75 sm:text-lg">
              Update the plan structure, link it to a workout program, and replace the cover image when needed.
            </p>

           

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={`/coach/plans/${planId}`}
                className="h-11 rounded-xl border border-[#84FF00] px-5 py-2.5 text-sm font-semibold text-[#84FF00] transition hover:bg-[#84FF00] hover:text-black"
              >
                Back to details
              </Link>
              <Link
                href={`/coach/plans/${planId}/weeks`}
                className="h-11 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
              >
                Manage weeks
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {error ? (
          <div className="mb-6 rounded-[24px] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4">
            <div className="h-36 animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
            <div className="h-56 animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
            <div className="h-64 animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
          </div>
        ) : plan ? (
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#84FF00]">
                    Editing plan #{plan.id}
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
                    {plan.name}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
                    {plan.description || "No description available."}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80">
                  <div>
                    <span className="text-white/50">Status:</span>{" "}
                    {plan.isPublished ? "Published" : "Draft"}
                  </div>
                  <div>
                    <span className="text-white/50">Duration:</span>{" "}
                    {plan.durationOnWeeks} weeks
                  </div>
                </div>
              </div>
            </div>

            <PageSection
              eyebrow="Overview"
              title="Basic metadata"
              description="Keep the title, description, and plan purpose clear and concise."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Plan name"
                  value={form.name}
                  onChange={(v) => setForm((s) => ({ ...s, name: v }))}
                  placeholder="12-Week Performance Nutrition Plan"
                  required
                  maxLength={120}
                  helper="Use a clear title."
                />

                <ProgramSelect
                  value={form.linkedWorkoutProgramID}
                  onChange={(v) =>
                    setForm((s) => ({ ...s, linkedWorkoutProgramID: v }))
                  }
                  programs={programs}
                  loading={programsLoading}
                  error={null}
                />
              </div>

              <div className="mt-5 grid gap-5">
                <Field
                  label="Description"
                  value={form.description}
                  onChange={(v) => setForm((s) => ({ ...s, description: v }))}
                  placeholder="Describe the plan in a professional way."
                  textarea
                  required
                  maxLength={800}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Expected outcome"
                    value={form.expectedOutcome}
                    onChange={(v) =>
                      setForm((s) => ({ ...s, expectedOutcome: v }))
                    }
                    placeholder="What should the user achieve?"
                    textarea
                    maxLength={300}
                  />

                  <Field
                    label="Next steps"
                    value={form.nextSteps}
                    onChange={(v) => setForm((s) => ({ ...s, nextSteps: v }))}
                    placeholder="What comes after this plan?"
                    textarea
                    maxLength={300}
                  />
                </div>
              </div>
            </PageSection>

            <PageSection
              eyebrow="Configuration"
              title="Plan attributes"
              description="Select the structured values that define the plan behavior."
            >
              <div className="grid gap-5 md:grid-cols-3">
                <SelectField
                  label="Training goal"
                  value={form.trainingGoal}
                  onChange={(v) => setForm((s) => ({ ...s, trainingGoal: v }))}
                  options={TRAINING_GOAL_OPTIONS}
                  helper="Backend receives the numeric value only."
                />
                <SelectField
                  label="Fitness level"
                  value={form.fitnessLevel}
                  onChange={(v) => setForm((s) => ({ ...s, fitnessLevel: v }))}
                  options={FITNESS_LEVEL_OPTIONS}
                  helper="Backend receives the numeric value only."
                />
                <SelectField
                  label="Equipment type"
                  value={form.equipmentType}
                  onChange={(v) => setForm((s) => ({ ...s, equipmentType: v }))}
                  options={EQUIPMENT_TYPE_OPTIONS}
                  helper="Backend receives the numeric value only."
                />
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Calorie strategy"
                  value={form.calorieStrategyType}
                  onChange={(v) =>
                    setForm((s) => ({ ...s, calorieStrategyType: v }))
                  }
                  options={CALORIE_STRATEGY_OPTIONS}
                  helper="0 = Absolute, 1 = TDEE Relative"
                />
                <NumberField
                  label="Duration in weeks"
                  value={form.durationOnWeeks}
                  onChange={(v) => setForm((s) => ({ ...s, durationOnWeeks: v }))}
                  helper="Minimum: 1 week"
                  min={1}
                />
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <NumberField
                  label="TDEE adjustment kcal"
                  value={form.tdeeAdjustmentKcal}
                  onChange={(v) =>
                    setForm((s) => ({ ...s, tdeeAdjustmentKcal: v }))
                  }
                />
                <NumberField
                  label="Absolute calorie target"
                  value={form.absoluteCalorieTarget}
                  onChange={(v) =>
                    setForm((s) => ({ ...s, absoluteCalorieTarget: v }))
                  }
                />
                <NumberField
                  label="Protein target per kg"
                  value={form.proteinTargetPerKg}
                  onChange={(v) =>
                    setForm((s) => ({ ...s, proteinTargetPerKg: v }))
                  }
                  helper="Must be greater than 0"
                  step="0.1"
                  min={0}
                />
              </div>
            </PageSection>

            <PageSection
              eyebrow="Media"
              title="Thumbnail image"
              description="Upload a cover image. The image is stored on the server and the URL is saved automatically."
            >
              <ImageUploadField
                previewUrl={thumbnailPreviewUrl}
                onSelect={handleThumbnailSelect}
                onRemove={handleRemoveThumbnail}
                uploading={uploadingThumbnail}
              />

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/45">
                The current image preview updates immediately after selection.
              </div>
            </PageSection>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push(`/coach/plans/${plan.id}`)}
                className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingThumbnail || programsLoading}
                className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#84FF00] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-xl font-semibold text-white">Plan not found</h2>
            <p className="mt-2 text-sm text-white/60">
              The requested plan could not be loaded.
            </p>
            <Link
              href="/coach/plans"
              className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#84FF00]"
            >
              Go back
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}