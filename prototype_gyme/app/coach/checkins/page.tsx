"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Navigation } from "@/components/navigation";
import {
  getCoachCheckInDetails,
  getCoachQueue,
  manualUnlockCoachEnrollment,
  submitCoachCheckInDecision,
} from "@/services/coach-checkin";
import type {
  CoachAdjustmentVectorType,
  CoachCheckInDecisionPayload,
  CoachCheckInDecisionType,
  CoachCheckInDetails,
  CoachCheckInQueueItem,
  CoachNoteActionType,
} from "@/types/coach-checkin";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const decisionOptions: Array<{ value: CoachCheckInDecisionType; label: string }> = [
  { value: 0, label: "Approved" },
  { value: 1, label: "Modified" },
  { value: 2, label: "Override" },
  { value: 3, label: "Deferred" },
];

const adjustmentVectorOptions: Array<{ value: CoachAdjustmentVectorType; label: string }> = [
  { value: 0, label: "Rest Day Carbs" },
  { value: 1, label: "Training Day Carbs" },
  { value: 2, label: "Fat" },
  { value: 3, label: "Proportional" },
];

const noteActionOptions: Array<{ value: CoachNoteActionType; label: string }> = [
  { value: 0, label: "Acknowledged" },
  { value: 1, label: "Action Taken" },
  { value: 2, label: "Not Relevant" },
];

/* ─── styles ─────────────────────────────────────────────────────────────
   IMPORTANT: every rule below is scoped under `.fz-checkins-page` so it
   cannot leak out and affect the shared <Navigation /> or layout. The old
   version used a bare `*` reset and unscoped `body` rules, which overrode
   margins/padding and the font-family for the ENTIRE page, breaking the
   navbar above it. Never use `*` or bare `body`/`html` selectors inside a
   page-level <style> block — always scope to a unique root class.
   ────────────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');

  .fz-checkins-page {
    --neon: #84FF00;
    --orange: #FF6B00;
    --cyan: #00D9FF;
    --bg-primary: #050505;
    --bg-secondary: #0A0A0A;
    --bg-card: rgba(255,255,255,0.03);
    --bg-glass: rgba(255,255,255,0.05);
    --border: rgba(255,255,255,0.10);
    --border-hover: rgba(132,255,0,0.35);
    --text-muted: rgba(255,255,255,0.60);
    --text-body: rgba(255,255,255,0.80);

    font-family: 'Inter', sans-serif;
    background: var(--bg-primary);
    color: #fff;
  }

  .fz-checkins-page *,
  .fz-checkins-page *::before,
  .fz-checkins-page *::after {
    box-sizing: border-box;
  }

  /* ── hero ── */
  .fz-checkins-page .fz-hero {
    position: relative;
    min-height: 420px;
    display: flex;
    align-items: flex-end;
    padding: 0 0 56px;
    overflow: hidden;
  }

  .fz-checkins-page .fz-hero-bg {
    position: absolute;
    inset: 0;
    background-image: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80');
    background-size: cover;
    background-position: center;
    opacity: 0.35;
  }

  .fz-checkins-page .fz-hero-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.72);
  }

  .fz-checkins-page .fz-hero-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(132,255,0,0.13), rgba(0,0,0,0.15), #050505);
  }

  .fz-checkins-page .fz-hero-glow-tl {
    position: absolute;
    top: -80px;
    left: -80px;
    width: 440px;
    height: 440px;
    border-radius: 50%;
    background: rgba(132,255,0,0.18);
    filter: blur(130px);
    pointer-events: none;
  }

  .fz-checkins-page .fz-hero-glow-br {
    position: absolute;
    bottom: -60px;
    right: -60px;
    width: 360px;
    height: 360px;
    border-radius: 50%;
    background: rgba(132,255,0,0.10);
    filter: blur(120px);
    pointer-events: none;
  }

  .fz-checkins-page .fz-hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .fz-checkins-page .fz-hero-scanline {
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(132,255,0,0.4), transparent);
    animation: fzScan 4s linear infinite;
  }

  @keyframes fzScan {
    0%   { top: 0%; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  .fz-checkins-page .fz-hero-content {
    position: relative;
    z-index: 2;
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
  }

  .fz-checkins-page .fz-hero-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--neon);
    background: rgba(132,255,0,0.10);
    border: 1px solid rgba(132,255,0,0.30);
    border-radius: 100px;
    padding: 6px 14px;
    margin-bottom: 20px;
  }

  .fz-checkins-page .fz-hero-kicker::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--neon);
    animation: fzPulse 2s ease-in-out infinite;
  }

  @keyframes fzPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.7); }
  }

  .fz-checkins-page .fz-hero-title {
    font-size: clamp(36px, 5vw, 60px);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    color: #fff;
    margin: 0;
  }

  .fz-checkins-page .fz-hero-title span { color: var(--neon); }

  .fz-checkins-page .fz-hero-sub {
    margin-top: 14px;
    font-size: 16px;
    color: var(--text-muted);
    max-width: 480px;
    line-height: 1.6;
  }

  .fz-checkins-page .fz-hero-stats {
    display: flex;
    gap: 16px;
    margin-top: 28px;
    flex-wrap: wrap;
  }

  .fz-checkins-page .fz-stat-chip {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 12px;
    padding: 12px 20px;
    text-align: center;
    backdrop-filter: blur(8px);
  }

  .fz-checkins-page .fz-stat-chip-num {
    font-size: 22px;
    font-weight: 900;
    color: var(--neon);
    display: block;
  }

  .fz-checkins-page .fz-stat-chip-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-top: 2px;
  }

  /* ── buttons ── */
  .fz-checkins-page .fz-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    padding: 0 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    text-decoration: none;
    white-space: nowrap;
  }

  .fz-checkins-page .fz-btn-primary {
    background: #fff;
    color: #000;
  }

  .fz-checkins-page .fz-btn-primary:hover { background: var(--neon); }

  .fz-checkins-page .fz-btn-outline {
    background: transparent;
    color: var(--neon);
    border: 1px solid var(--neon);
  }

  .fz-checkins-page .fz-btn-outline:hover {
    background: rgba(132,255,0,0.12);
  }

  .fz-checkins-page .fz-btn-ghost {
    background: transparent;
    color: var(--neon);
    border: 1px solid rgba(132,255,0,0.30);
    font-size: 13px;
    height: 34px;
    padding: 0 14px;
    border-radius: 8px;
  }

  .fz-checkins-page .fz-btn-ghost:hover { background: rgba(132,255,0,0.10); }

  .fz-checkins-page .fz-btn-danger-ghost {
    background: transparent;
    color: var(--orange);
    border: 1px solid rgba(255,107,0,0.30);
    font-size: 13px;
    height: 34px;
    padding: 0 14px;
    border-radius: 8px;
  }

  .fz-checkins-page .fz-btn-danger-ghost:hover { background: rgba(255,107,0,0.10); }

  .fz-checkins-page .fz-btn-submit {
    width: 100%;
    background: var(--neon);
    color: #000;
    font-size: 15px;
    font-weight: 700;
    height: 52px;
    border-radius: 14px;
    justify-content: center;
    margin-top: 4px;
  }

  .fz-checkins-page .fz-btn-submit:hover { background: #9fff33; }
  .fz-checkins-page .fz-btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── layout ── */
  .fz-checkins-page .fz-main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  .fz-checkins-page .fz-banner {
    margin-bottom: 28px;
    padding: 14px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    background: rgba(132,255,0,0.10);
    border: 1px solid rgba(132,255,0,0.30);
    color: var(--neon);
  }

  .fz-checkins-page .fz-banner-error {
    background: rgba(255,107,0,0.10);
    border-color: rgba(255,107,0,0.30);
    color: var(--orange);
  }

  .fz-checkins-page .fz-grid {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 24px;
    align-items: start;
  }

  @media (max-width: 960px) {
    .fz-checkins-page .fz-grid { grid-template-columns: 1fr; }
  }

  /* ── panel / card ── */
  .fz-checkins-page .fz-panel {
    background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
  }

  .fz-checkins-page .fz-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border);
  }

  .fz-checkins-page .fz-panel-title {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: #fff;
  }

  .fz-checkins-page .fz-pill {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 100px;
    background: rgba(132,255,0,0.12);
    border: 1px solid rgba(132,255,0,0.30);
    color: var(--neon);
  }

  /* ── queue table ── */
  .fz-checkins-page .fz-table-wrap {
    overflow-x: auto;
  }

  .fz-checkins-page .fz-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .fz-checkins-page .fz-table thead tr {
    border-bottom: 1px solid var(--border);
  }

  .fz-checkins-page .fz-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .fz-checkins-page .fz-table td {
    padding: 14px 16px;
    color: var(--text-body);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    vertical-align: middle;
  }

  .fz-checkins-page .fz-table tbody tr {
    transition: background 0.15s;
    cursor: default;
  }

  .fz-checkins-page .fz-table tbody tr:hover { background: rgba(255,255,255,0.03); }

  .fz-checkins-page .fz-table tbody tr.is-selected {
    background: rgba(132,255,0,0.06);
  }

  .fz-checkins-page .fz-table tbody tr.is-selected td { color: #fff; }

  .fz-checkins-page .fz-table-name {
    font-weight: 600;
    color: #fff;
  }

  .fz-checkins-page .fz-empty {
    padding: 48px 24px;
    text-align: center;
    color: var(--text-muted);
    font-size: 14px;
  }

  /* ── review panel ── */
  .fz-checkins-page .fz-review { padding: 24px; display: flex; flex-direction: column; gap: 16px; }

  .fz-checkins-page .fz-review-section {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
  }

  .fz-checkins-page .fz-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--neon);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .fz-checkins-page .fz-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(132,255,0,0.20);
  }

  .fz-checkins-page .fz-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .fz-checkins-page .fz-meta-item {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 10px 14px;
  }

  .fz-checkins-page .fz-meta-key {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .fz-checkins-page .fz-meta-val {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
  }

  .fz-checkins-page .fz-meta-val-green { color: var(--neon); }
  .fz-checkins-page .fz-meta-val-orange { color: var(--orange); }
  .fz-checkins-page .fz-meta-val-cyan { color: var(--cyan); }

  .fz-checkins-page .fz-client-note {
    background: rgba(0,217,255,0.05);
    border: 1px solid rgba(0,217,255,0.18);
    border-radius: 12px;
    padding: 14px 18px;
    font-size: 14px;
    color: var(--text-body);
    line-height: 1.65;
    white-space: pre-wrap;
  }

  .fz-checkins-page .fz-history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 13px;
  }

  .fz-checkins-page .fz-history-item:last-child { border-bottom: none; }

  .fz-checkins-page .fz-history-week {
    font-weight: 700;
    color: #fff;
  }

  .fz-checkins-page .fz-history-detail {
    color: var(--text-muted);
    font-size: 12px;
    margin-top: 2px;
  }

  /* ── form ── */
  .fz-checkins-page .fz-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }

  .fz-checkins-page .fz-field label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .fz-checkins-page .fz-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    color: #fff;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 0 14px;
    height: 44px;
    transition: border-color 0.2s;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
  }

  .fz-checkins-page .fz-input:focus {
    border-color: var(--neon);
    background: rgba(132,255,0,0.05);
  }

  .fz-checkins-page .fz-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.5)' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
    cursor: pointer;
  }

  .fz-checkins-page .fz-input option {
    background: #1a1a1a;
    color: #fff;
  }

  .fz-checkins-page .fz-textarea {
    height: auto;
    padding: 12px 14px;
    resize: vertical;
    min-height: 100px;
  }

  /* ── loading ── */
  .fz-checkins-page .fz-loading {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    font-size: 16px;
    color: var(--text-muted);
    flex-direction: column;
    gap: 16px;
  }

  .fz-checkins-page .fz-spinner {
    width: 40px;
    height: 40px;
    border: 2px solid rgba(255,255,255,0.10);
    border-top-color: var(--neon);
    border-radius: 50%;
    animation: fzSpin 0.8s linear infinite;
  }

  @keyframes fzSpin { to { transform: rotate(360deg); } }

  /* ── priority badges ── */
  .fz-checkins-page .fz-priority {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 100px;
  }

  .fz-checkins-page .fz-priority-high {
    background: rgba(255,107,0,0.14);
    border: 1px solid rgba(255,107,0,0.35);
    color: var(--orange);
  }

  .fz-checkins-page .fz-priority-medium {
    background: rgba(132,255,0,0.10);
    border: 1px solid rgba(132,255,0,0.30);
    color: var(--neon);
  }

  .fz-checkins-page .fz-priority-low {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    color: var(--text-muted);
  }
`;

const getPriorityClass = (label: string) => {
  const l = label?.toLowerCase() ?? "";
  if (l.includes("high") || l.includes("urgent")) return "fz-priority fz-priority-high";
  if (l.includes("med")) return "fz-priority fz-priority-medium";
  return "fz-priority fz-priority-low";
};

/* ─── component ──────────────────────────────────────────────────── */
export default function CoachCheckInsPage() {
  const [queue, setQueue] = useState<CoachCheckInQueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<CoachCheckInDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [decision, setDecision] = useState<CoachCheckInDecisionType>(0);
  const [finalAdjustmentKcal, setFinalAdjustmentKcal] = useState<string>("");
  const [appliedAdjustmentVector, setAppliedAdjustmentVector] = useState<CoachAdjustmentVectorType>(0);
  const [noteAction, setNoteAction] = useState<CoachNoteActionType>(0);
  const [coachNote, setCoachNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  /* ── load queue ── */
  useEffect(() => {
    let alive = true;
    async function loadQueue() {
      try {
        setLoading(true);
        setError(null);
        const res = await getCoachQueue();
        if (!alive) return;
        setQueue(res);
        const first = res.find((i) => i.checkInId > 0) ?? null;
        setSelectedId(first?.checkInId ?? null);
      } catch (err) {
        if (!alive) return;
        setError(getErrorMessage(err));
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadQueue();
    return () => { alive = false; };
  }, []);

  /* ── reset form on detail change ── */
  useEffect(() => {
    if (details) {
      setDecision(0);
      setFinalAdjustmentKcal(details.systemProposalKcal !== null ? String(details.systemProposalKcal) : "");
      setAppliedAdjustmentVector(0);
      setNoteAction(details.clientNote?.trim() ? 1 : 0);
      setCoachNote("");
    }
  }, [details]);

  /* ── load detail ── */
  useEffect(() => {
    if (selectedId === null || selectedId <= 0) { setDetails(null); return; }
    const checkInId = selectedId;
    let alive = true;
    async function loadDetails() {
      try {
        setDetailLoading(true);
        setError(null);
        const res = await getCoachCheckInDetails(checkInId);
        if (!alive) return;
        setDetails(res);
      } catch (err) {
        if (!alive) return;
        setError(getErrorMessage(err));
      } finally {
        if (alive) setDetailLoading(false);
      }
    }
    loadDetails();
    return () => { alive = false; };
  }, [selectedId]);

  const selectedQueueItem = useMemo(
    () => queue.find((i) => i.checkInId === selectedId) ?? null,
    [queue, selectedId]
  );

  /* ── submit decision ── */
  async function handleDecision() {
    if (selectedId === null || selectedId <= 0) return;
    const parsed = finalAdjustmentKcal.trim() === "" ? null : Number(finalAdjustmentKcal.trim());
    if (parsed !== null && Number.isNaN(parsed)) { setMessage("Final adjustment kcal must be a valid number."); return; }
    const payload: CoachCheckInDecisionPayload = { decision, finalAdjustmentKcal: parsed, appliedAdjustmentVector, noteAction, coachNote: coachNote.trim() };
    const checkInId = selectedId;
    try {
      setSaving(true); setMessage(null);
      const res = await submitCoachCheckInDecision(checkInId, payload);
      setMessage(res.message);
      const remaining = queue.filter((i) => i.checkInId !== checkInId);
      setQueue(remaining);
      setDetails(null);
      setCoachNote("");
      setSelectedId(remaining.find((i) => i.checkInId > 0)?.checkInId ?? null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to submit decision.");
    } finally {
      setSaving(false);
    }
  }

  /* ── manual unlock ── */
  async function handleManualUnlock(enrollmentId: number) {
    try {
      setSaving(true); setMessage(null);
      const res = await manualUnlockCoachEnrollment(enrollmentId);
      setMessage(res.message);
      const remaining = queue.filter((i) => i.enrollmentId !== enrollmentId);
      setQueue(remaining);
      if (selectedQueueItem?.enrollmentId === enrollmentId) {
        setDetails(null);
        setSelectedId(remaining.find((i) => i.checkInId > 0)?.checkInId ?? null);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to manual unlock.");
    } finally {
      setSaving(false);
    }
  }

  /* ── loading screen ── */
  if (loading) {
    return (
      <div className="fz-checkins-page">
        <style>{styles}</style>
        <div className="fz-loading">
          <div className="fz-spinner" />
          <span>Loading check-ins…</span>
        </div>
      </div>
    );
  }

  /* ── main render ── */
  return (
    <div className="fz-checkins-page">
      <style>{styles}</style>

      {/* Navigation */}
      <div style={{ paddingTop: "0" }}>
        <Navigation />
      </div>

      {/* Hero */}
      <section className="fz-hero" style={{ paddingTop: "80px" }}>
        <div className="fz-hero-bg" />
        <div className="fz-hero-overlay" />
        <div className="fz-hero-gradient" />
        <div className="fz-hero-glow-tl" />
        <div className="fz-hero-glow-br" />
        <div className="fz-hero-grid" />
        <div className="fz-hero-scanline" />

        <div className="fz-hero-content">
          <div>
            <p className="fz-hero-kicker">Coach Dashboard</p>
            <h1 className="fz-hero-title">
              CHECK-IN <span>REVIEW</span>
            </h1>
            <p className="fz-hero-sub">
              Inspect client submissions, analyse algorithmic proposals, and deliver precision-calibrated decisions.
            </p>
            <div className="fz-hero-stats">
              <div className="fz-stat-chip">
                <span className="fz-stat-chip-num">{queue.length}</span>
                <span className="fz-stat-chip-label">Pending</span>
              </div>
              <div className="fz-stat-chip">
                <span className="fz-stat-chip-num">{queue.filter((i) => i.checkInId > 0).length}</span>
                <span className="fz-stat-chip-label">Ready</span>
              </div>
              <div className="fz-stat-chip">
                <span className="fz-stat-chip-num">{queue.filter((i) => i.checkInId <= 0).length}</span>
                <span className="fz-stat-chip-label">Locked</span>
              </div>
            </div>
          </div>

          <Link href="/coach" className="fz-btn fz-btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </section>

      {/* Main content */}
      <main className="fz-main">
        {message && <div className="fz-banner">{message}</div>}
        {error   && <div className="fz-banner fz-banner-error">{error}</div>}

        <div className="fz-grid">

          {/* ── Queue panel ── */}
          <section className="fz-panel">
            <div className="fz-panel-head">
              <span className="fz-panel-title">Queue</span>
              <span className="fz-pill">{queue.length} items</span>
            </div>

            {queue.length ? (
              <div className="fz-table-wrap">
                <table className="fz-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Plan</th>
                      <th>Week</th>
                      <th>Priority</th>
                      <th>Submitted</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((item) => {
                      const hasCheckIn = item.checkInId > 0;
                      return (
                        <tr
                          key={`${item.enrollmentId}-${item.checkInId}`}
                          className={item.checkInId === selectedId ? "is-selected" : ""}
                        >
                          <td><span className="fz-table-name">{item.traineeName}</span></td>
                          <td>{item.planName}</td>
                          <td style={{ color: "var(--neon)", fontWeight: 700 }}>
                            {item.weekNumber}<span style={{ color: "var(--text-muted)", fontWeight: 400 }}>/{item.totalWeeks}</span>
                          </td>
                          <td>
                            <span className={getPriorityClass(item.priorityLabel)}>
                              {item.priorityLabel}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : "—"}
                          </td>
                          <td>
                            {hasCheckIn ? (
                              <button
                                className="fz-btn fz-btn-ghost"
                                onClick={() => setSelectedId(item.checkInId)}
                                type="button"
                              >
                                Review
                              </button>
                            ) : (
                              <button
                                className="fz-btn fz-btn-danger-ghost"
                                onClick={() => handleManualUnlock(item.enrollmentId)}
                                type="button"
                                disabled={saving}
                              >
                                Unlock
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="fz-empty">
                <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
                No pending check-ins.
              </div>
            )}
          </section>

          {/* ── Review panel ── */}
          <section className="fz-panel">
            <div className="fz-panel-head">
              <span className="fz-panel-title">Review Panel</span>
              {selectedQueueItem && (
                <span className={getPriorityClass(selectedQueueItem.priorityLabel)} style={{ fontSize: 11 }}>
                  {selectedQueueItem.priorityLabel}
                </span>
              )}
            </div>

            {detailLoading ? (
              <div className="fz-empty">
                <div className="fz-spinner" style={{ margin: "0 auto 12px" }} />
                Loading details…
              </div>
            ) : details ? (
              <div className="fz-review">

                {/* Measurements */}
                <div className="fz-review-section">
                  <div className="fz-section-label">Measurements</div>
                  <div className="fz-meta-grid">
                    <div className="fz-meta-item">
                      <div className="fz-meta-key">Avg Weight</div>
                      <div className="fz-meta-val fz-meta-val-green">{details.averageWeight ?? "—"}</div>
                    </div>
                    <div className="fz-meta-item">
                      <div className="fz-meta-key">Weight Δ</div>
                      <div className="fz-meta-val fz-meta-val-orange">{details.weightDeltaKg ?? "—"} kg</div>
                    </div>
                    <div className="fz-meta-item">
                      <div className="fz-meta-key">Expected Range</div>
                      <div className="fz-meta-val" style={{ fontSize: 13 }}>
                        {details.expectedMin ?? "—"} → {details.expectedMax ?? "—"}
                      </div>
                    </div>
                    <div className="fz-meta-item">
                      <div className="fz-meta-key">Adherence</div>
                      <div className="fz-meta-val fz-meta-val-green">{details.adherencePercent ?? "—"}%</div>
                    </div>
                    <div className="fz-meta-item">
                      <div className="fz-meta-key">Energy Level</div>
                      <div className="fz-meta-val fz-meta-val-cyan">{details.energyLevel ?? "—"}</div>
                    </div>
                    <div className="fz-meta-item">
                      <div className="fz-meta-key">Hunger Level</div>
                      <div className="fz-meta-val fz-meta-val-orange">{details.hungerLevel ?? "—"}</div>
                    </div>
                    <div className="fz-meta-item">
                      <div className="fz-meta-key">Sleep Quality</div>
                      <div className="fz-meta-val fz-meta-val-cyan">{details.sleepQuality ?? "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Algorithm */}
                <div className="fz-review-section">
                  <div className="fz-section-label">Algorithm Proposal</div>
                  <div className="fz-meta-grid">
                    <div className="fz-meta-item">
                      <div className="fz-meta-key">Proposal Kcal</div>
                      <div className="fz-meta-val fz-meta-val-green">{details.systemProposalKcal ?? "—"}</div>
                    </div>
                    <div className="fz-meta-item">
                      <div className="fz-meta-key">Confidence</div>
                      <div className="fz-meta-val">{details.systemConfidence ?? "—"}</div>
                    </div>
                    <div className="fz-meta-item" style={{ gridColumn: "1 / -1" }}>
                      <div className="fz-meta-key">Reasoning</div>
                      <div className="fz-meta-val" style={{ fontSize: 13, fontWeight: 500 }}>
                        {details.systemProposalReasoning ?? "—"}
                      </div>
                    </div>
                    <div className="fz-meta-item" style={{ gridColumn: "1 / -1" }}>
                      <div className="fz-meta-key">Projected Outcome (No Action)</div>
                      <div className="fz-meta-val fz-meta-val-orange" style={{ fontSize: 13 }}>
                        {details.projectedOutcomeIfNoAction ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client note */}
                <div className="fz-review-section">
                  <div className="fz-section-label">Client Note</div>
                  <div className="fz-client-note">
                    {details.clientNote || "No client note submitted."}
                  </div>
                </div>

                {/* Weight history */}
                {details.weightHistory?.length ? (
                  <div className="fz-review-section">
                    <div className="fz-section-label">Weight History</div>
                    {details.weightHistory.map((item) => (
                      <div className="fz-history-item" key={item.weekNumber}>
                        <div>
                          <div className="fz-history-week">Week {item.weekNumber}</div>
                          <div className="fz-history-detail">
                            Weight: {item.averageWeight ?? "—"} · Calories: {item.caloriesApplied ?? "—"}
                          </div>
                        </div>
                        <div style={{ color: "var(--neon)", fontWeight: 700, fontSize: 13 }}>
                          {item.averageWeight ?? "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Decision form */}
                <div className="fz-review-section">
                  <div className="fz-section-label">Coach Decision</div>
                  <div className="fz-form-grid">
                    <div className="fz-field">
                      <label>Decision Type</label>
                      <select
                        className="fz-input fz-select"
                        value={decision}
                        onChange={(e) => setDecision(Number(e.target.value) as CoachCheckInDecisionType)}
                      >
                        {decisionOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="fz-field">
                      <label>Final Adjustment (kcal)</label>
                      <input
                        className="fz-input"
                        type="number"
                        value={finalAdjustmentKcal}
                        onChange={(e) => setFinalAdjustmentKcal(e.target.value)}
                        placeholder="e.g. −100"
                      />
                    </div>

                    <div className="fz-field">
                      <label>Adjustment Vector</label>
                      <select
                        className="fz-input fz-select"
                        value={appliedAdjustmentVector}
                        onChange={(e) => setAppliedAdjustmentVector(Number(e.target.value) as CoachAdjustmentVectorType)}
                      >
                        {adjustmentVectorOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="fz-field">
                      <label>Note Action</label>
                      <select
                        className="fz-input fz-select"
                        value={noteAction}
                        onChange={(e) => setNoteAction(Number(e.target.value) as CoachNoteActionType)}
                      >
                        {noteActionOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="fz-field" style={{ marginBottom: 16 }}>
                    <label>Coach Note</label>
                    <textarea
                      className="fz-input fz-textarea"
                      value={coachNote}
                      onChange={(e) => setCoachNote(e.target.value)}
                      placeholder="Write your coaching note here…"
                      rows={4}
                    />
                  </div>

                  <button
                    className="fz-btn fz-btn-submit"
                    onClick={handleDecision}
                    disabled={saving || selectedId === null || selectedId <= 0}
                    type="button"
                  >
                    {saving ? "Submitting…" : "Submit Decision →"}
                  </button>
                </div>

              </div>
            ) : (
              <div className="fz-empty">
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>◎</div>
                Select a queue item to start reviewing.
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}