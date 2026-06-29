"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getCoachConstraints, updateCoachConstraints } from "@/services/coach-constraint";
import type { CoachNutritionConstraint } from "@/types/coach-constraint";

const ADJUSTMENT_VECTOR_OPTIONS = [
  { label: "Rest Day Carbs", value: 0 },
  { label: "Training Day Carbs", value: 1 },
  { label: "Fat", value: 2 },
  { label: "Proportional", value: 3 },
];

type NumericField = keyof {
  [K in keyof CoachNutritionConstraint as CoachNutritionConstraint[K] extends number | string ? K : never]: unknown;
};

const FIELD_GROUPS: {
  title: string;
  icon: React.ReactNode;
  fields: (keyof CoachNutritionConstraint)[];
}[] = [
  {
    title: "Weight Tracking",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#84FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><polyline points="18 9 12 15 8 11 3 16"/>
      </svg>
    ),
    fields: ["weightAveragingDays", "deviationTriggerKg"],
  },
  {
    title: "Weekly Change Targets",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#84FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    fields: ["expectedWeeklyChangeMin", "expectedWeeklyChangeMax"],
  },
  {
    title: "Macro Floors",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#84FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    fields: ["proteinFloorG", "fatFloorG"],
  },
  {
    title: "Calorie Bounds",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
    fields: ["calorieFloor", "calorieCeiling"],
  },
  {
    title: "Adjustment Limits",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
      </svg>
    ),
    fields: ["maxSingleAdjustmentKcal", "maxCumulativeDriftKcal"],
  },
  {
    title: "Strategy",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    fields: ["preferredAdjustmentVector", "adherenceThresholdPercent"],
  },
];

const FIELD_LABELS: Record<string, string> = {
  weightAveragingDays: "Weight Averaging Days",
  deviationTriggerKg: "Deviation Trigger (kg)",
  expectedWeeklyChangeMin: "Min Weekly Change",
  expectedWeeklyChangeMax: "Max Weekly Change",
  proteinFloorG: "Protein Floor (g)",
  fatFloorG: "Fat Floor (g)",
  calorieFloor: "Calorie Floor",
  calorieCeiling: "Calorie Ceiling",
  maxSingleAdjustmentKcal: "Max Single Adjustment (kcal)",
  maxCumulativeDriftKcal: "Max Cumulative Drift (kcal)",
  preferredAdjustmentVector: "Adjustment Vector",
  adherenceThresholdPercent: "Adherence Threshold (%)",
};

const TOGGLE_FIELDS: { key: keyof CoachNutritionConstraint; label: string; accent: string }[] = [
  { key: "requireConsecutiveWeeksDeviation", label: "Require Consecutive Weeks Deviation", accent: "#84FF00" },
  { key: "applyTrainingWeekNoiseCorrection", label: "Apply Training Week Noise Correction", accent: "#84FF00" },
  { key: "energyLevelEscalationRule", label: "Energy Level Escalation Rule", accent: "#FF6B00" },
  { key: "preserveLeanMassOverRate", label: "Preserve Lean Mass Over Rate", accent: "#FF6B00" },
  { key: "enableBaselineRecalibrationReview", label: "Enable Baseline Recalibration Review", accent: "#00D9FF" },
];

function getVectorValue(val: string | number | undefined): number {
  if (val === undefined) return 0;
  const s = String(val);
  const match = ADJUSTMENT_VECTOR_OPTIONS.find((o) => o.label === s || String(o.value) === s);
  return match ? match.value : 0;
}

export default function CoachConstraintsPage() {
  const params = useParams<{ enrollmentId: string }>();
  const enrollmentId = Number(params.enrollmentId);

  const [data, setData] = useState<CoachNutritionConstraint | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const scanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const res = await getCoachConstraints(enrollmentId);
        if (!alive) return;
        setData(res);
      } catch (err) {
        if (!alive) return;
        showToast(err instanceof Error ? err.message : "Failed to load constraints.", false);
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (!Number.isNaN(enrollmentId)) load();
    return () => { alive = false; };
  }, [enrollmentId]);

  function showToast(text: string, ok: boolean) {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSave() {
    if (!data) return;
    try {
      setSaving(true);
      const vectorString = String(data.preferredAdjustmentVector);
      const vectorMatch = ADJUSTMENT_VECTOR_OPTIONS.find(
        (o) => o.label === vectorString || String(o.value) === vectorString
      );
      const payload = {
        ...data,
        preferredAdjustmentVector: vectorMatch ? vectorMatch.value : Number(vectorString),
      } as unknown as CoachNutritionConstraint;
      const res = await updateCoachConstraints(enrollmentId, payload);
      showToast(res.message, true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save constraints.", false);
    } finally {
      setSaving(false);
    }
  }

  function setField<K extends keyof CoachNutritionConstraint>(key: K, val: CoachNutritionConstraint[K]) {
    setData((p) => (p ? { ...p, [key]: val } : p));
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');

        .fz-root {
          min-height: 100vh;
          background: #050505;
          color: #fff;
          font-family: 'Inter', sans-serif;
        }

        /* ── HERO ── */
        .fz-hero {
          position: relative;
          min-height: 260px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          padding: 0 0 48px;
        }
        .fz-hero-bg {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=60') center/cover no-repeat;
          opacity: 0.35;
        }
        .fz-hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.70);
        }
        .fz-hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(132,255,0,0.14), rgba(0,0,0,0.18), #050505);
        }
        .fz-glow-tl {
          position: absolute;
          top: -60px;
          left: -60px;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: rgba(132,255,0,0.20);
          filter: blur(120px);
          pointer-events: none;
        }
        .fz-glow-br {
          position: absolute;
          bottom: -80px;
          right: -60px;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: rgba(132,255,0,0.12);
          filter: blur(130px);
          pointer-events: none;
        }
        .fz-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(132,255,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(132,255,0,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.06;
        }
        .fz-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(132,255,0,0.5), transparent);
          animation: fz-scan 4s linear infinite;
          opacity: 0.4;
        }
        @keyframes fz-scan {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        .fz-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          width: 100%;
        }
        .fz-kicker {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #84FF00;
          margin: 0 0 10px;
        }
        .fz-hero-title {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 900;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          line-height: 1.05;
          margin: 0;
          color: #fff;
        }
        .fz-hero-title span { color: #84FF00; }
        .fz-enrollment-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          padding: 6px 14px;
          background: rgba(132,255,0,0.08);
          border: 1px solid rgba(132,255,0,0.25);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: #84FF00;
          letter-spacing: 0.06em;
        }
        .fz-enrollment-chip .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #84FF00;
          animation: fz-pulse 2s ease-in-out infinite;
        }
        @keyframes fz-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* ── BACK BUTTON ── */
        .fz-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: transparent;
          border: 1px solid #84FF00;
          color: #84FF00;
          font-size: 13px;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          transition: background 200ms, color 200ms;
          white-space: nowrap;
        }
        .fz-back-btn:hover {
          background: #84FF00;
          color: #000;
        }

        /* ── MAIN CONTENT ── */
        .fz-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 32px 96px;
        }

        /* ── TOAST ── */
        .fz-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 100;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: fz-slide-in 300ms ease;
          max-width: 360px;
        }
        .fz-toast.ok {
          background: rgba(132,255,0,0.12);
          border: 1px solid rgba(132,255,0,0.35);
          color: #84FF00;
        }
        .fz-toast.err {
          background: rgba(255,107,0,0.12);
          border: 1px solid rgba(255,107,0,0.35);
          color: #FF6B00;
        }
        @keyframes fz-slide-in {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }

        /* ── GROUPS ── */
        .fz-groups {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .fz-card {
          background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 24px;
          overflow: hidden;
          transition: transform 300ms, box-shadow 300ms;
          animation: fz-fade-up 500ms ease both;
        }
        .fz-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 40px rgba(132,255,0,0.18);
        }
        @keyframes fz-fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fz-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 24px 0;
        }
        .fz-card-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .fz-card-body {
          padding: 16px 24px 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .fz-card-body.single { grid-template-columns: 1fr; }
        .fz-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .fz-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.40);
        }
        .fz-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          font-family: 'Inter', sans-serif;
          transition: border-color 200ms, background 200ms;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          -moz-appearance: textfield;
        }
        .fz-input::-webkit-inner-spin-button,
        .fz-input::-webkit-outer-spin-button { -webkit-appearance: none; }
        .fz-input:focus {
          border-color: #84FF00;
          background: rgba(132,255,0,0.05);
        }
        .fz-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2384FF00' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
          cursor: pointer;
        }
        .fz-select option {
          background: #0A0A0A;
          color: #fff;
        }

        /* ── TOGGLES ── */
        .fz-toggles-card {
          background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 24px;
          overflow: hidden;
          padding: 24px;
          margin-bottom: 20px;
          animation: fz-fade-up 500ms 200ms ease both;
        }
        .fz-toggles-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin: 0 0 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .fz-toggles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }
        .fz-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 200ms, background 200ms;
        }
        .fz-toggle-row:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.14);
        }
        .fz-toggle-label {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
          line-height: 1.4;
        }
        .fz-switch {
          position: relative;
          width: 40px;
          height: 22px;
          flex-shrink: 0;
        }
        .fz-switch input { opacity: 0; width: 0; height: 0; }
        .fz-switch-track {
          position: absolute;
          inset: 0;
          border-radius: 11px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.15);
          transition: background 200ms, border-color 200ms;
        }
        .fz-switch-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          transition: transform 200ms, background 200ms;
        }
        .fz-switch input:checked ~ .fz-switch-track {
          background: rgba(132,255,0,0.2);
          border-color: #84FF00;
        }
        .fz-switch input:checked ~ .fz-switch-thumb {
          transform: translateX(18px);
          background: #84FF00;
        }

        /* ── SAVE BAR ── */
        .fz-save-bar {
          position: sticky;
          bottom: 24px;
          display: flex;
          justify-content: flex-end;
          padding: 0;
          animation: fz-fade-up 500ms 300ms ease both;
        }
        .fz-save-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 36px;
          background: #fff;
          color: #000;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: background 200ms, transform 100ms;
          box-shadow: 0 4px 32px rgba(0,0,0,0.5);
        }
        .fz-save-btn:hover:not(:disabled) { background: #84FF00; }
        .fz-save-btn:active:not(:disabled) { transform: scale(0.98); }
        .fz-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── LOADING ── */
        .fz-loading {
          min-height: 100vh;
          background: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 20px;
        }
        .fz-spinner {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(132,255,0,0.15);
          border-top-color: #84FF00;
          border-radius: 50%;
          animation: fz-spin 700ms linear infinite;
        }
        @keyframes fz-spin { to { transform: rotate(360deg); } }
        .fz-loading-text {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── EMPTY ── */
        .fz-empty {
          text-align: center;
          padding: 80px 32px;
          color: rgba(255,255,255,0.3);
          font-size: 15px;
        }

        @media (max-width: 640px) {
          .fz-hero-inner { flex-direction: column; align-items: flex-start; }
          .fz-card-body { grid-template-columns: 1fr; }
          .fz-main { padding: 32px 16px 80px; }
        }
      `}</style>

      <div className="fz-root">
        {/* ── TOAST ── */}
        {toast && (
          <div className={`fz-toast ${toast.ok ? "ok" : "err"}`}>
            {toast.ok ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            {toast.text}
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div className="fz-loading">
            <div className="fz-spinner" />
            <p className="fz-loading-text">Loading constraints...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* ── HERO ── */}
            <section className="fz-hero">
              <div className="fz-hero-bg" />
              <div className="fz-hero-overlay" />
              <div className="fz-hero-gradient" />
              <div className="fz-glow-tl" />
              <div className="fz-glow-br" />
              <div className="fz-grid" />
              <div className="fz-scanline" ref={scanRef} />

              <div className="fz-hero-inner">
                <div>
                  <p className="fz-kicker">Coach Dashboard · Nutrition</p>
                  <h1 className="fz-hero-title">
                    CONSTRAINT<br /><span>EDITOR</span>
                  </h1>
                  <div className="fz-enrollment-chip">
                    <span className="dot" />
                    ENROLLMENT #{enrollmentId}
                  </div>
                </div>
                <Link className="fz-back-btn" href="/coach">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Back to Dashboard
                </Link>
              </div>
            </section>

            {/* ── MAIN ── */}
            <main className="fz-main">
              {data ? (
                <>
                  {/* ── FIELD GROUPS ── */}
                  <div className="fz-groups">
                    {FIELD_GROUPS.map((group, gi) => (
                      <div className="fz-card" key={group.title} style={{ animationDelay: `${gi * 60}ms` }}>
                        <div className="fz-card-header">
                          {group.icon}
                          <span className="fz-card-title">{group.title}</span>
                        </div>
                        <div className={`fz-card-body ${group.fields.length === 1 ? "single" : ""}`}>
                          {group.fields.map((fkey) => (
                            <div className="fz-field" key={fkey}>
                              <label className="fz-label" htmlFor={fkey}>{FIELD_LABELS[fkey]}</label>
                              {fkey === "preferredAdjustmentVector" ? (
                                <select
                                  id={fkey}
                                  className="fz-input fz-select"
                                  value={getVectorValue(data.preferredAdjustmentVector as string | number)}
                                  onChange={(e) => setField("preferredAdjustmentVector", e.target.value as unknown as CoachNutritionConstraint["preferredAdjustmentVector"])}
                                >
                                  {ADJUSTMENT_VECTOR_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  id={String(fkey)}
                                  type="number"
                                  className="fz-input"
                                  value={data[fkey] as number}
                                  onChange={(e) => {
                                    const k = fkey;
                                    setData((p) => p ? { ...p, [k]: Number(e.target.value) } : p);
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── TOGGLES ── */}
                  <div className="fz-toggles-card">
                    <p className="fz-toggles-title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#84FF00" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                      Protocol Rules
                    </p>
                    <div className="fz-toggles-grid">
                      {TOGGLE_FIELDS.map(({ key, label, accent }) => (
                        <label className="fz-toggle-row" key={key} style={{ "--accent": accent } as React.CSSProperties}>
                          <span className="fz-toggle-label">{label}</span>
                          <span className="fz-switch">
                            <input
                              type="checkbox"
                              checked={data[key] as boolean}
                              onChange={(e) => setField(key, e.target.checked as unknown as CoachNutritionConstraint[typeof key])}
                            />
                            <span className="fz-switch-track" style={data[key] ? { background: `rgba(${accent === "#84FF00" ? "132,255,0" : accent === "#FF6B00" ? "255,107,0" : "0,217,255"},0.2)`, borderColor: accent } : {}} />
                            <span className="fz-switch-thumb" style={data[key] ? { background: accent, transform: "translateX(18px)" } : {}} />
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ── SAVE ── */}
                  <div className="fz-save-bar">
                    <button className="fz-save-btn" onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <div className="fz-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          Save Constraints
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="fz-empty">No constraints found for this enrollment.</div>
              )}
            </main>
          </>
        )}
      </div>
    </>
  );
}