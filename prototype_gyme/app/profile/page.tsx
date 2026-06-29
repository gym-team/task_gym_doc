"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Ruler,
  Weight,
  MapPin,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  getMyProfile,
  updateMyProfile,
  Trainee,
  Gender,
} from "@/lib/trainee";

type FormState = {
  gender: Gender;
  weight: string;
  height: string;
  address: string;
  dateOfBirth: string; // yyyy-MM-dd, متوافق مع <input type="date">
};

type SaveState = "idle" | "saving" | "success" | "error";

function toDateInputValue(isoString: string): string {
  // بياخد أي صيغة تاريخ جاية من الـ API ويحولها لـ yyyy-MM-dd
  if (!isoString) return "";
  return isoString.split("T")[0];
}

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

export default function ProfilePage() {
  const [profile, setProfile] = useState<Trainee | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState<FormState>({
    gender: "Male",
    weight: "",
    height: "",
    address: "",
    dateOfBirth: "",
  });

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");

  // =============================
  // LOAD PROFILE
  // =============================
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMyProfile();
        setProfile(data);
        setForm({
          gender: data.gender,
          weight: String(data.weight ?? ""),
          height: String(data.height ?? ""),
          address: data.address ?? "",
          dateOfBirth: toDateInputValue(data.dateOfBirth),
        });
      } catch (err) {
        console.error("Failed to load profile", err);
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
      const weightNum = Number(form.weight);
      const heightNum = Number(form.height);

      if (!form.dateOfBirth) {
        throw new Error("Please select your date of birth.");
      }
      if (!weightNum || weightNum <= 0) {
        throw new Error("Please enter a valid weight.");
      }
      if (!heightNum || heightNum <= 0) {
        throw new Error("Please enter a valid height.");
      }
      if (!form.address.trim()) {
        throw new Error("Please enter your address.");
      }

      const updated = await updateMyProfile({
        gender: form.gender,
        weight: weightNum,
        height: heightNum,
        address: form.address.trim(),
        // نثبّت التاريخ على منتصف الليل UTC صريحًا، بدل الاعتماد على
        // تحويل ضمني قد يختلف حسب توقيت المتصفح ويغيّر اليوم بمقدار يوم
        dateOfBirth: `${form.dateOfBirth}T00:00:00.000Z`,
      });

      // الـ PUT برجع بس الحقول اللي حدثها (gender, weight, height, address,
      // dateOfBirth) ومش برجع fullName/email/id/photoUrl. لو استبدلنا الـ
      // profile بالكامل بنتيجة الـ PUT هنفقد الحقول دي من الواجهة، فبندمج
      // النتيجة فوق الـ profile القديم بدل الاستبدال الكامل
      setProfile((prev) => (prev ? { ...prev, ...updated } : updated));
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
                My Profile
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tight">
              ACCOUNT <span className="text-[#84FF00]">SETTINGS</span>
            </h1>
            <p className="mt-3 text-zinc-400">
              Manage your personal information and physical stats.
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
                  <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#84FF00]/30 to-[#00D9FF]/20 border border-[#84FF00]/30 flex items-center justify-center">
                    <span className="text-3xl font-black text-[#84FF00]">
                      {getInitials(profile.fullName)}
                    </span>
                  </div>
                </div>

                <h2 className="mt-5 text-xl font-extrabold text-white">
                  {profile.fullName}
                </h2>

                <div className="mt-2 flex items-center gap-2 text-zinc-400 text-sm">
                  <Mail size={14} />
                  <span className="truncate">{profile.email}</span>
                </div>

                <div className="mt-6 w-full pt-6 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Weight</span>
                    <span className="font-bold text-white">
                      {form.weight || "—"} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Height</span>
                    <span className="font-bold text-white">
                      {form.height || "—"} cm
                    </span>
                  </div>
                </div>
              </div>

              {/* ---------- EDITABLE FORM ---------- */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-6">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Gender */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 mb-2">
                      <User size={14} className="text-[#84FF00]" />
                      Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Male", "Female"] as Gender[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleChange("gender", g)}
                          className={`h-11 rounded-xl border font-semibold text-sm transition disabled:opacity-50 ${
                            form.gender === g
                              ? "border-[#84FF00] bg-[#84FF00]/10 text-[#84FF00]"
                              : "border-white/10 bg-black/30 text-zinc-400 hover:border-white/20"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 mb-2">
                      <Calendar size={14} className="text-[#84FF00]" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      disabled={isSaving}
                      onChange={(e) =>
                        handleChange("dateOfBirth", e.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white text-sm focus:border-[#84FF00] focus:outline-none transition disabled:opacity-50 [color-scheme:dark]"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 mb-2">
                      <Weight size={14} className="text-[#84FF00]" />
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min={1}
                      step="0.1"
                      value={form.weight}
                      disabled={isSaving}
                      onChange={(e) => handleChange("weight", e.target.value)}
                      placeholder="e.g. 82"
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white text-sm focus:border-[#84FF00] focus:outline-none transition disabled:opacity-50"
                    />
                  </div>

                  {/* Height */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 mb-2">
                      <Ruler size={14} className="text-[#84FF00]" />
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min={1}
                      step="0.1"
                      value={form.height}
                      disabled={isSaving}
                      onChange={(e) => handleChange("height", e.target.value)}
                      placeholder="e.g. 178"
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white text-sm focus:border-[#84FF00] focus:outline-none transition disabled:opacity-50"
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-400 mb-2">
                      <MapPin size={14} className="text-[#84FF00]" />
                      Address
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      disabled={isSaving}
                      onChange={(e) =>
                        handleChange("address", e.target.value)
                      }
                      placeholder="e.g. Cairo, Egypt"
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white text-sm focus:border-[#84FF00] focus:outline-none transition disabled:opacity-50"
                    />
                  </div>
                </div>

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