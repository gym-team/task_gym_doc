"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  TRAINING_GOAL_OPTIONS,
  FITNESS_LEVEL_OPTIONS,
  EQUIPMENT_TYPE_OPTIONS,
} from "@/lib/program-enums";

type UpdateProgramPayload = {
  trackID: number | null;
  name: string;
  description: string;
  expectedOutcome: string;
  nextSteps: string;
  durationOnWeeks: number;
  sessionsPerWeeks: number;
  sessionsDuration: number;
  trainingGoal: number;
  fitnessLevel: number;
  equipmentType: number;
  photoThumbnailUrl: string | null;
};

type ProgramDetails = {
  id: number;
  name: string;
  description: string;
  expectedOutcome: string;
  nextSteps: string;
  trackName: string;
  coachName?: string;
  coachRating?: number;
  durationOnWeeks: number;
  sessionsPerWeeks: number;
  sessionsDuration: number;
  trainingGoal: string;
  fitnessLevel: string;
  equipmentType: string;
  photoThumbnailUrl: string | null;
  isPublished?: boolean;
  programWeekSummaryDto?: unknown[];
};

type Track = {
  id: number;
  name: string;
  description?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://fitzone-16.runasp.net";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80";

// The GET endpoint returns enums as strings (e.g. "LoseFat"), but the PUT
// endpoint expects the numeric value. These maps bridge that gap.
const TRAINING_GOAL_NAME_TO_VALUE: Record<string, number> = {
  LoseFat: 0,
  BuildMuscle: 1,
  GetStronger: 2,
  ImproveEndurance: 3,
  MoveBetter: 4,
  GeneralFitness: 5,
  MaintainWeight: 6,
};

const FITNESS_LEVEL_NAME_TO_VALUE: Record<string, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

const EQUIPMENT_TYPE_NAME_TO_VALUE: Record<string, number> = {
  FullGym: 0,
  Dumbbells: 1,
  Home: 2,
  Bodyweight: 3,
  Bands: 4,
};

function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function isValidNumber(value: string): boolean {
  if (!value.trim()) return false;
  return Number.isFinite(Number(value));
}

async function fetchProgram(id: string, token: string): Promise<ProgramDetails> {
  const res = await fetch(`${API_URL}/api/Program/${id}`, {
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

  return (await res.json()) as ProgramDetails;
}

async function fetchTracks(): Promise<Track[]> {
  const res = await fetch(`${API_URL}/api/Track`, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return (await res.json()) as Track[];
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

async function updateProgram(
  id: string,
  payload: UpdateProgramPayload,
  token: string
) {
  const res = await fetch(`${API_URL}/api/Program/${id}`, {
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: number; label: string }>;
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
    </label>
  );
}

function TrackSelect({
  value,
  onChange,
  tracks,
  loading,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  tracks: Track[];
  loading: boolean;
  error: string | null;
}) {
  const selected = tracks.find((t) => String(t.id) === value);

  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/80">
        Track<span className="ml-1 text-[#84FF00]">*</span>
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        required
        className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition focus:border-[#84FF00]/70 focus:ring-2 focus:ring-[#84FF00]/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="" disabled>
          Select a track
        </option>
        {tracks.map((track) => (
          <option key={track.id} value={track.id} className="bg-[#0A0A0A]">
            {track.name}
          </option>
        ))}
      </select>
      {loading ? (
        <span className="text-xs text-white/45">Loading tracks...</span>
      ) : error ? (
        <span className="text-xs text-red-300">{error}</span>
      ) : selected?.description ? (
        <span className="text-xs text-white/45">{selected.description}</span>
      ) : (
        <span className="text-xs text-white/45">
          Choose the track this program belongs to.
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          Upload a new cover image to replace the current one. The file is stored on the server and the returned URL is saved with the program.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/50">
          Recommended size: 1200 × 800 or higher. Maximum file size: 5 MB.
        </div>
      </div>
    </div>
  );
}

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams<{ programId: string }>();
  const programId = params?.programId;

  const [token, setToken] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    null
  );
  const [form, setForm] = useState({
    trackID: "",
    name: "",
    description: "",
    expectedOutcome: "",
    nextSteps: "",
    durationOnWeeks: "4",
    sessionsPerWeeks: "3",
    sessionsDuration: "60",
    trainingGoal: "0",
    fitnessLevel: "0",
    equipmentType: "0",
    photoThumbnailUrl: "",
  });

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      "";
    setToken(storedToken);
  }, []);

  useEffect(() => {
    let mounted = true;
    setTracksLoading(true);
    setTracksError(null);

    fetchTracks()
      .then((data) => {
        if (mounted) setTracks(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (mounted) {
          setTracksError(
            err instanceof Error ? err.message : "Failed to load tracks"
          );
        }
      })
      .finally(() => {
        if (mounted) setTracksLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Load the program once we have both the token and the tracks list,
  // since we need the tracks list to resolve trackName -> trackID.
  useEffect(() => {
    if (!token || !programId || tracksLoading) return;

    let mounted = true;
    setPageLoading(true);
    setPageError(null);

    fetchProgram(programId, token)
      .then((data) => {
        if (!mounted) return;

        const matchedTrack = tracks.find((t) => t.name === data.trackName);

        setForm({
          trackID: matchedTrack ? String(matchedTrack.id) : "",
          name: data.name ?? "",
          description: data.description ?? "",
          expectedOutcome: data.expectedOutcome ?? "",
          nextSteps: data.nextSteps ?? "",
          durationOnWeeks: String(data.durationOnWeeks ?? 0),
          sessionsPerWeeks: String(data.sessionsPerWeeks ?? 0),
          sessionsDuration: String(data.sessionsDuration ?? 0),
          trainingGoal: String(
            TRAINING_GOAL_NAME_TO_VALUE[data.trainingGoal] ?? 0
          ),
          fitnessLevel: String(
            FITNESS_LEVEL_NAME_TO_VALUE[data.fitnessLevel] ?? 0
          ),
          equipmentType: String(
            EQUIPMENT_TYPE_NAME_TO_VALUE[data.equipmentType] ?? 0
          ),
          photoThumbnailUrl: data.photoThumbnailUrl ?? "",
        });

        setThumbnailPreviewUrl(data.photoThumbnailUrl || null);
        setIsPublished(Boolean(data.isPublished));
      })
      .catch((err) => {
        if (mounted) {
          setPageError(
            err instanceof Error ? err.message : "Failed to load the program"
          );
        }
      })
      .finally(() => {
        if (mounted) setPageLoading(false);
      });

    return () => {
      mounted = false;
    };
    // tracks is intentionally included so trackName -> trackID resolves
    // correctly once the tracks list has arrived.
  }, [token, programId, tracksLoading, tracks]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl && thumbnailPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl]);

  const payload = useMemo<UpdateProgramPayload>(() => {
    return {
      trackID: form.trackID ? toNumber(form.trackID) : null,
      name: form.name.trim(),
      description: form.description.trim(),
      expectedOutcome: form.expectedOutcome.trim(),
      nextSteps: form.nextSteps.trim(),
      durationOnWeeks: toNumber(form.durationOnWeeks),
      sessionsPerWeeks: toNumber(form.sessionsPerWeeks),
      sessionsDuration: toNumber(form.sessionsDuration),
      trainingGoal: toNumber(form.trainingGoal),
      fitnessLevel: toNumber(form.fitnessLevel),
      equipmentType: toNumber(form.equipmentType),
      photoThumbnailUrl: form.photoThumbnailUrl.trim() || null,
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

    const preview = URL.createObjectURL(file);
    setThumbnailPreviewUrl((current) => {
      if (current && current.startsWith("blob:")) URL.revokeObjectURL(current);
      return preview;
    });

    try {
      setUploadingThumbnail(true);
      const url = await uploadThumbnail(file);
      setForm((s) => ({ ...s, photoThumbnailUrl: url }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload the image."
      );
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setForm((s) => ({ ...s, photoThumbnailUrl: "" }));
    setThumbnailPreviewUrl((current) => {
      if (current && current.startsWith("blob:")) URL.revokeObjectURL(current);
      return null;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setError(null);
      setLoading(true);

      if (!token) {
        throw new Error("Authentication is required. Please sign in again.");
      }

      if (!programId) {
        throw new Error("Missing program ID.");
      }

      const name = form.name.trim();
      const description = form.description.trim();
      const duration = Number(form.durationOnWeeks);
      const sessionsPerWeek = Number(form.sessionsPerWeeks);
      const sessionsDuration = Number(form.sessionsDuration);

      if (!form.trackID) {
        throw new Error("Please select a track.");
      }

      if (!name) {
        throw new Error("Program name is required.");
      }

      if (name.length < 3) {
        throw new Error("Program name must be at least 3 characters long.");
      }

      if (name.length > 120) {
        throw new Error("Program name must be 120 characters or fewer.");
      }

      if (!description) {
        throw new Error("Description is required.");
      }

      if (description.length < 20) {
        throw new Error("Description must be at least 20 characters long.");
      }

      if (!isValidNumber(form.durationOnWeeks) || duration < 1) {
        throw new Error("Duration must be at least 1 week.");
      }

      if (!isValidNumber(form.sessionsPerWeeks) || sessionsPerWeek < 1) {
        throw new Error("Sessions per week must be at least 1.");
      }

      if (!isValidNumber(form.sessionsDuration) || sessionsDuration < 1) {
        throw new Error("Session duration must be at least 1 minute.");
      }

      if (uploadingThumbnail) {
        throw new Error("Please wait for the image upload to finish.");
      }

      await updateProgram(programId, payload, token);

      router.push(`/coach/programs/${programId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update program");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-sm text-white/60">Loading program...</p>
      </main>
    );
  }

  if (pageError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
        <div className="max-w-md rounded-[24px] border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-sm text-red-100">{pageError}</p>
          <button
            type="button"
            onClick={() => router.push("/coach/programs")}
            className="mt-4 h-10 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
          >
            Back to programs
          </button>
        </div>
      </main>
    );
  }

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
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#84FF00]">
                Coach Programs
              </p>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                  isPublished
                    ? "bg-[#84FF00]/15 text-[#84FF00]"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              Edit training program
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/75 sm:text-lg">
              Update the details below. Changes are saved to this program as soon as you submit.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push(`/coach/programs/${programId}`)}
                className="h-11 rounded-xl border border-[#84FF00] bg-transparent px-5 text-sm font-semibold text-[#84FF00] transition hover:bg-[#84FF00] hover:text-black"
              >
                Back to program
              </button>
              <button
                type="submit"
                form="program-edit-form"
                disabled={loading || uploadingThumbnail}
                className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#84FF00] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
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

        <form
          id="program-edit-form"
          onSubmit={handleSubmit}
          className="grid gap-6"
        >
          <PageSection
            eyebrow="Overview"
            title="Basic metadata"
            description="Define the identity, purpose, and track of the program."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Program name"
                value={form.name}
                onChange={(v) => setForm((s) => ({ ...s, name: v }))}
                placeholder="12-Week Strength Foundations"
                required
                maxLength={120}
                helper="Use a clear, specific title."
              />

              <TrackSelect
                value={form.trackID}
                onChange={(v) => setForm((s) => ({ ...s, trackID: v }))}
                tracks={tracks}
                loading={tracksLoading}
                error={tracksError}
              />
            </div>

            <div className="mt-5 grid gap-5">
              <Field
                label="Description"
                value={form.description}
                onChange={(v) => setForm((s) => ({ ...s, description: v }))}
                placeholder="Describe the program clearly and professionally."
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
                  placeholder="What should the trainee achieve?"
                  textarea
                  maxLength={300}
                />

                <Field
                  label="Next steps"
                  value={form.nextSteps}
                  onChange={(v) => setForm((s) => ({ ...s, nextSteps: v }))}
                  placeholder="What comes after this program?"
                  textarea
                  maxLength={300}
                />
              </div>
            </div>
          </PageSection>

          <PageSection
            eyebrow="Configuration"
            title="Program attributes"
            description="Choose the structured values that power the program behavior."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="Training goal"
                value={form.trainingGoal}
                onChange={(v) => setForm((s) => ({ ...s, trainingGoal: v }))}
                options={TRAINING_GOAL_OPTIONS}
              />
              <SelectField
                label="Fitness level"
                value={form.fitnessLevel}
                onChange={(v) => setForm((s) => ({ ...s, fitnessLevel: v }))}
                options={FITNESS_LEVEL_OPTIONS}
              />
              <SelectField
                label="Equipment type"
                value={form.equipmentType}
                onChange={(v) => setForm((s) => ({ ...s, equipmentType: v }))}
                options={EQUIPMENT_TYPE_OPTIONS}
              />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <NumberField
                label="Duration in weeks"
                value={form.durationOnWeeks}
                onChange={(v) => setForm((s) => ({ ...s, durationOnWeeks: v }))}
                helper="Minimum: 1 week"
                min={1}
              />
              <NumberField
                label="Sessions per week"
                value={form.sessionsPerWeeks}
                onChange={(v) => setForm((s) => ({ ...s, sessionsPerWeeks: v }))}
                helper="Minimum: 1 session"
                min={1}
              />
              <NumberField
                label="Session duration (minutes)"
                value={form.sessionsDuration}
                onChange={(v) => setForm((s) => ({ ...s, sessionsDuration: v }))}
                helper="Minimum: 1 minute"
                min={1}
              />
            </div>
          </PageSection>

          <PageSection
            eyebrow="Media"
            title="Thumbnail image"
            description="Replace the cover image. The file is sent to the server, stored, and the returned link is saved automatically."
          >
            <ImageUploadField
              previewUrl={thumbnailPreviewUrl}
              onSelect={handleThumbnailSelect}
              onRemove={handleRemoveThumbnail}
              uploading={uploadingThumbnail}
            />

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/45">
              The uploaded image URL is stored in the program automatically.
            </div>
          </PageSection>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push(`/coach/programs/${programId}`)}
              className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingThumbnail || tracksLoading}
              className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-[#84FF00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}