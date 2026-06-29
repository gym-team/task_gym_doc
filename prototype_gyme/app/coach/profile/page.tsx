"use client";

import { useEffect, useState } from "react";
import {
  Dumbbell,
  Award,
  DollarSign,
  Star,
  Briefcase,
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  getMyCoachProfile,
  updateMyCoachProfile,
  Coach,
} from "@/lib/coach";

type FormState = {
  about: string;
  yearsOfExperience: string;
  price: string;
};

type SaveState = "idle" | "saving" | "success" | "error";

function getInitials(fullName: string | undefined | null): string {
  if (!fullName) return "?";

  return (
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export default function CoachProfilePage() {
  const [profile, setProfile] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState<FormState>({
    about: "",
    yearsOfExperience: "",
    price: "",
  });

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");

  // =============================
  // LOAD PROFILE
  // =============================
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMyCoachProfile();
        setProfile(data);
        setForm({
          about: data.about ?? "",
          yearsOfExperience: String(data.yearsOfExperience ?? ""),
          price: String(data.price ?? ""),
        });
      } catch (err) {
        console.error("Failed to load coach profile", err);
        setLoadError("Couldn't load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // لو المستخدم بدأ يعدل تاني بعد ما كان فيه نجاح/خطأ، نرجّع الحالة عادي
    if (saveState !== "idle" && saveState !== "saving") {
      setSaveState("idle");
    }
  }

  async function handleSave() {
    setSaveState("saving");
    setSaveError("");

    try {
      const experienceNum = Number(form.yearsOfExperience);
      const priceNum = Number(form.price);

      if (!form.about.trim()) {
        throw new Error("Please write a short bio about yourself.");
      }
      if (!Number.isFinite(experienceNum) || experienceNum < 0) {
        throw new Error("Please enter a valid number of years of experience.");
      }
      if (!priceNum || priceNum <= 0) {
        throw new Error("Please enter a valid price.");
      }

      const updated = await updateMyCoachProfile({
        about: form.about.trim(),
        yearsOfExperience: experienceNum,
        price: priceNum,
      });

      // الـ PUT برجع بس الحقول اللي حدثها (about, yearsOfExperience, price)
      // ومش برجع fullName/rating/photoUrl/programCount. لو استبدلنا الـ
      // profile بالكامل بنتيجة الـ PUT هنفقد الحقول دي من الواجهة، فبندمج
      // النتيجة فوق الـ profile القديم بدل الاستبدال الكامل
      setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
      setSaveState("success");

      setTimeout(() => {
        setSaveState((s) => (s === "success" ? "idle" : s));
      }, 2500);
    } catch (err: any) {
      setSaveState("error");
      setSaveError(err?.message ?? "Something went wrong while saving.");
    }
  }

  const isSaving = saveState === "saving";

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      <Navigation />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-[#84FF00]/10 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 -right-32 h-96 w-96 rounded-full bg-[#00D9FF]/10 blur-[120px]" />

      <main className="relative pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* ===================== HEADER ===================== */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#84FF00]/30 bg-[#84FF00]/5 px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#84FF00]" />
              <span className="text-xs font-bold tracking-widest text-[#84FF00] uppercase">
                Coach Profile
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tight">
              COACH <span className="text-[#84FF00]">SETTINGS</span>
            </h1>
            <p className="mt-3 text-zinc-400">
              Manage your public bio, experience, and coaching rate.
            </p>
          </div>

          {/* ===================== LOADING ===================== */}
          {loading && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-[#84FF00]" />
              <span className="text-zinc-400">Loading your profile...</span>
            </div>
          )}

          {/* ===================== LOAD ERROR ===================== */}
          {!loading && loadError && (
            <div className="rounded-3xl border border-[#FF6B00]/30 bg-[#FF6B00]/10 p-8 flex items-center gap-4">
              <XCircle className="h-6 w-6 text-[#FF6B00] flex-shrink-0" />
              <span className="text-[#FF6B00]">{loadError}</span>
            </div>
          )}

          {/* ===================== MAIN CONTENT ===================== */}
          {!loading && !loadError && profile && (
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
              {/* ---------- IDENTITY CARD ---------- */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 flex flex-col items-center text-center h-fit">
                <div className="relative">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={profile.fullName}
                      className="h-28 w-28 rounded-full object-cover border border-[#84FF00]/30"
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#84FF00]/30 to-[#00D9FF]/20 border border-[#84FF00]/30 flex items-center justify-center">
                      <span className="text-3xl font-black text-[#84FF00]">
                        {getInitials(profile.fullName)}
                      </span>
                    </div>
                  )}
                </div>

                <h2 className="mt-5 text-xl font-extrabold text-white">
                  {profile.fullName}
                </h2>

                <div className="mt-2 flex items-center gap-2 text-zinc-400 text-sm">
                  <Star size={14} className="text-[#84FF00] fill-[#84FF00]" />
                  <span>{profile.rating.toFixed(1)} rating</span>
                </div>

                <div className="mt-6 w-full pt-6 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-2">
                      <Award size={14} className="text-[#00D9FF]" />
                      Experience
                    </span>
                    <span className="font-bold text-white">
                      {form.yearsOfExperience || "—"} yrs
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-2">
                      <DollarSign size={14} className="text-[#00D9FF]" />
                      Price
                    </span>
                    <span className="font-bold text-white">
                      ${form.price || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-2">
                      <Briefcase size={14} className="text-[#00D9FF]" />
                      Programs
                    </span>
                    <span className="font-bold text-white">
                      {profile.programCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* ---------- EDITABLE FORM ---------- */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-6">
                  Public Profile
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  {/* About */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 mb-2">
                      <Dumbbell size={14} className="text-[#84FF00]" />
                      About / Bio
                    </label>
                    <textarea
                      value={form.about}
                      disabled={isSaving}
                      onChange={(e) => handleChange("about", e.target.value)}
                      placeholder="Tell trainees about your coaching background and approach..."
                      rows={5}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white text-sm focus:border-[#84FF00] focus:outline-none transition disabled:opacity-50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Years of Experience */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 mb-2">
                        <Award size={14} className="text-[#84FF00]" />
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="1"
                        value={form.yearsOfExperience}
                        disabled={isSaving}
                        onChange={(e) =>
                          handleChange("yearsOfExperience", e.target.value)
                        }
                        placeholder="e.g. 7"
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white text-sm focus:border-[#84FF00] focus:outline-none transition disabled:opacity-50"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 mb-2">
                        <DollarSign size={14} className="text-[#84FF00]" />
                        Price (per program)
                      </label>
                      <input
                        type="number"
                        min={1}
                        step="0.01"
                        value={form.price}
                        disabled={isSaving}
                        onChange={(e) => handleChange("price", e.target.value)}
                        placeholder="e.g. 60"
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white text-sm focus:border-[#84FF00] focus:outline-none transition disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* ---------- READ-ONLY STATS NOTE ---------- */}
                <p className="mt-4 text-xs text-zinc-500">
                  Name, rating, and program count are managed automatically and
                  can't be edited here.
                </p>

                {/* ---------- FEEDBACK ---------- */}
                {saveState === "error" && saveError && (
                  <div className="mt-6 rounded-xl border border-[#FF6B00]/30 bg-[#FF6B00]/10 p-4 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                    <span className="text-[#FF6B00] text-sm">{saveError}</span>
                  </div>
                )}

                {saveState === "success" && (
                  <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-green-300 text-sm font-semibold">
                      Profile updated successfully
                    </span>
                  </div>
                )}

                {/* ---------- SAVE BUTTON ---------- */}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="mt-8 h-12 w-full sm:w-auto sm:px-10 rounded-xl bg-[#84FF00] text-black font-bold text-sm uppercase tracking-wide transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}