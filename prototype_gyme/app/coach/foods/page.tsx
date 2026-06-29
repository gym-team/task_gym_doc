"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createCoachFood,
  deleteCoachFood,
  getCategoryLabel,
  getCoachFoods,
  normalizeCategoryForForm,
  updateCoachFood,
} from "@/services/coach-food";
import {
  CoachFoodCategory,
  type CoachFood,
  type CoachFoodCreateDto,
  type CoachFoodListParams,
  type CoachFoodUpdateDto,
} from "@/types/coach-food";

type CoachFoodFormState = CoachFoodCreateDto & {
  id?: number;
  isGlobal?: boolean;
};

const initialForm: CoachFoodFormState = {
  name: "",
  category: CoachFoodCategory.Protein,
  caloriesPer100g: 0,
  proteinPer100g: 0,
  carbPer100g: 0,
  fatPer100g: 0,
  fiberPer100g: 0,
  servingSizeG: 100,
  servingSizeName: "100 g",
  isWhole: false,
  isGlobal: false,
};

const categoryOptions = [
  { label: "Protein", value: CoachFoodCategory.Protein },
  { label: "Carbohydrate", value: CoachFoodCategory.Carbohydrate },
  { label: "Fat", value: CoachFoodCategory.Fat },
  { label: "Vegetable", value: CoachFoodCategory.Vegetable },
  { label: "Fruit", value: CoachFoodCategory.Fruit },
  { label: "Dairy", value: CoachFoodCategory.Dairy },
  { label: "Legume", value: CoachFoodCategory.Legume },
  { label: "Supplement", value: CoachFoodCategory.Supplement },
  { label: "Other", value: CoachFoodCategory.Other },
];

const categoryColors: Record<
  string,
  { bg: string; border: string; color: string }
> = {
  Protein: {
    bg: "rgba(132,255,0,0.10)",
    border: "rgba(132,255,0,0.28)",
    color: "#84FF00",
  },
  Carbohydrate: {
    bg: "rgba(0,217,255,0.10)",
    border: "rgba(0,217,255,0.28)",
    color: "#00D9FF",
  },
  Fat: {
    bg: "rgba(255,107,0,0.10)",
    border: "rgba(255,107,0,0.28)",
    color: "#FF6B00",
  },
  Vegetable: {
    bg: "rgba(80,220,100,0.10)",
    border: "rgba(80,220,100,0.28)",
    color: "#50DC64",
  },
  Fruit: {
    bg: "rgba(255,180,0,0.10)",
    border: "rgba(255,180,0,0.28)",
    color: "#FFB400",
  },
  Dairy: {
    bg: "rgba(200,200,255,0.10)",
    border: "rgba(200,200,255,0.28)",
    color: "#C8C8FF",
  },
  Legume: {
    bg: "rgba(160,110,60,0.14)",
    border: "rgba(160,110,60,0.30)",
    color: "#C8854A",
  },
  Supplement: {
    bg: "rgba(200,50,200,0.10)",
    border: "rgba(200,50,200,0.28)",
    color: "#D060D0",
  },
  Other: {
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.60)",
  },
};

function friendlyFoodError(err: unknown) {
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred.";
}

/* ─── styles ─────────────────────────────────────────────────────────────
   IMPORTANT: every rule below is scoped under `.fz-foods-page` so it cannot
   leak out and affect the shared <Navigation /> or layout. The previous
   version used a bare `*` reset (with margin/padding: 0!) and an unscoped
   `body` font-family rule — those apply to the ENTIRE document, not just
   this component, which is what broke the navbar above it. Never use `*`,
   `body`, or `html` selectors inside a page-level <style> block — always
   scope every rule to a unique root class.
   ────────────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');

  .fz-foods-page {
    --neon: #84FF00;
    --orange: #FF6B00;
    --cyan: #00D9FF;
    --bg-primary: #050505;
    --border: rgba(255,255,255,0.10);
    --text-muted: rgba(255,255,255,0.55);
    --text-body: rgba(255,255,255,0.80);

    font-family: 'Inter', sans-serif;
    background: var(--bg-primary);
    color: #fff;
    -webkit-text-size-adjust: 100%;
  }

  .fz-foods-page *,
  .fz-foods-page *::before,
  .fz-foods-page *::after {
    box-sizing: border-box;
  }

  /* ══════════════════════════════
     HERO
  ══════════════════════════════ */
  .fz-foods-page .fz-hero {
    position: relative;
    min-height: 480px;
    display: flex;
    align-items: flex-end;
    padding-bottom: 52px;
    overflow: hidden;
  }

  .fz-foods-page .fz-hero-bg {
    position: absolute; inset: 0;
    background-image: url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80');
    background-size: cover;
    background-position: center 30%;
    opacity: 0.32;
  }

  .fz-foods-page .fz-hero-overlay  { position: absolute; inset: 0; background: rgba(0,0,0,0.72); }
  .fz-foods-page .fz-hero-gradient { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(132,255,0,0.12), rgba(0,0,0,0.14), #050505); }

  .fz-foods-page .fz-hero-glow-tl {
    position: absolute; top: -80px; left: -80px;
    width: 420px; height: 420px; border-radius: 50%;
    background: rgba(132,255,0,0.16); filter: blur(130px); pointer-events: none;
  }
  .fz-foods-page .fz-hero-glow-br {
    position: absolute; bottom: -60px; right: -60px;
    width: 340px; height: 340px; border-radius: 50%;
    background: rgba(0,217,255,0.10); filter: blur(120px); pointer-events: none;
  }
  .fz-foods-page .fz-hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }
  .fz-foods-page .fz-hero-scanline {
    position: absolute; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(132,255,0,0.38), transparent);
    animation: fzFoodsScan 4s linear infinite;
  }
  @keyframes fzFoodsScan {
    0%   { top: 0%;   opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  /* Hero content wrapper */
  .fz-foods-page .fz-hero-content {
    position: relative; z-index: 2;
    width: 100%; max-width: 1280px;
    margin: 0 auto; padding: 0 20px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* On large screens: title left, actions right */
  @media (min-width: 768px) {
    .fz-foods-page .fz-hero-content {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 32px;
    }
  }

  .fz-foods-page .fz-hero-kicker {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--neon);
    background: rgba(132,255,0,0.10);
    border: 1px solid rgba(132,255,0,0.30);
    border-radius: 100px; padding: 5px 12px; margin-bottom: 16px;
  }
  .fz-foods-page .fz-hero-kicker::before {
    content: ''; width: 6px; height: 6px;
    border-radius: 50%; background: var(--neon);
    animation: fzFoodsPulse 2s ease-in-out infinite;
  }
  @keyframes fzFoodsPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.35; transform: scale(0.65); }
  }

  .fz-foods-page .fz-hero-title {
    font-size: clamp(28px, 6vw, 58px);
    font-weight: 900; line-height: 1.05;
    letter-spacing: -0.03em; text-transform: uppercase; color: #fff;
    margin: 0;
  }
  .fz-foods-page .fz-hero-title span { color: var(--neon); }

  .fz-foods-page .fz-hero-sub {
    margin-top: 12px; font-size: 14px;
    color: var(--text-muted); max-width: 440px; line-height: 1.65;
  }

  .fz-foods-page .fz-hero-stats {
    display: flex; gap: 10px; margin-top: 22px; flex-wrap: wrap;
  }
  .fz-foods-page .fz-stat-chip {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 12px; padding: 10px 16px; text-align: center;
    backdrop-filter: blur(8px); min-width: 80px;
  }
  .fz-foods-page .fz-stat-chip-num   { font-size: 20px; font-weight: 900; color: var(--neon); display: block; }
  .fz-foods-page .fz-stat-chip-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-top: 2px; }

  /* Hero actions: search + button */
  .fz-foods-page .fz-hero-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  @media (min-width: 480px) {
    .fz-foods-page .fz-hero-actions {
      flex-direction: row;
      align-items: center;
      width: auto;
    }
  }

  .fz-foods-page .fz-search {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 12px; color: #fff;
    font-family: 'Inter', sans-serif; font-size: 14px;
    padding: 0 16px; height: 44px;
    width: 100%;
    outline: none; transition: border-color 0.2s, background 0.2s;
  }
  @media (min-width: 480px) {
    .fz-foods-page .fz-search { width: 240px; }
  }
  @media (min-width: 1024px) {
    .fz-foods-page .fz-search { width: 280px; }
  }
  .fz-foods-page .fz-search::placeholder { color: var(--text-muted); }
  .fz-foods-page .fz-search:focus { border-color: var(--neon); background: rgba(132,255,0,0.05); }

  /* ══════════════════════════════
     BUTTONS
  ══════════════════════════════ */
  .fz-foods-page .fz-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    height: 44px; padding: 0 20px; border-radius: 12px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    border: none; transition: all 0.2s; text-decoration: none;
    white-space: nowrap; font-family: 'Inter', sans-serif;
  }
  .fz-foods-page .fz-btn:disabled { opacity: 0.38; cursor: not-allowed; }

  .fz-foods-page .fz-btn-primary { background: #fff; color: #000; }
  .fz-foods-page .fz-btn-primary:hover:not(:disabled) { background: var(--neon); }

  /* full width on mobile */
  .fz-foods-page .fz-btn-block { width: 100%; }
  @media (min-width: 480px) { .fz-foods-page .fz-btn-block { width: auto; } }

  .fz-foods-page .fz-btn-ghost {
    background: transparent; color: var(--neon);
    border: 1px solid rgba(132,255,0,0.28);
    font-size: 12px; height: 32px; padding: 0 12px; border-radius: 8px;
  }
  .fz-foods-page .fz-btn-ghost:hover:not(:disabled) { background: rgba(132,255,0,0.10); }

  .fz-foods-page .fz-btn-danger {
    background: transparent; color: var(--orange);
    border: 1px solid rgba(255,107,0,0.28);
    font-size: 12px; height: 32px; padding: 0 12px; border-radius: 8px;
  }
  .fz-foods-page .fz-btn-danger:hover:not(:disabled) { background: rgba(255,107,0,0.10); }

  .fz-foods-page .fz-btn-save {
    background: var(--neon); color: #000;
    font-size: 15px; font-weight: 700;
    height: 50px; border-radius: 14px;
    flex: 1;
  }
  .fz-foods-page .fz-btn-save:hover:not(:disabled) { background: #9fff33; }

  .fz-foods-page .fz-btn-cancel {
    background: transparent; color: var(--text-muted);
    border: 1px solid rgba(255,255,255,0.14);
    height: 50px; border-radius: 14px; padding: 0 24px;
  }
  .fz-foods-page .fz-btn-cancel:hover:not(:disabled) { border-color: rgba(255,255,255,0.28); color: #fff; }

  /* ══════════════════════════════
     LAYOUT
  ══════════════════════════════ */
  .fz-foods-page .fz-main {
    max-width: 1280px; margin: 0 auto;
    padding: 24px 16px 60px;
  }
  @media (min-width: 640px)  { .fz-foods-page .fz-main { padding: 32px 24px 80px; } }
  @media (min-width: 1024px) { .fz-foods-page .fz-main { padding: 40px 32px 80px; } }

  .fz-foods-page .fz-banner {
    margin-bottom: 20px; padding: 12px 16px;
    border-radius: 12px; font-size: 14px; font-weight: 500;
    background: rgba(132,255,0,0.09); border: 1px solid rgba(132,255,0,0.28); color: var(--neon);
    line-height: 1.5;
  }
  .fz-foods-page .fz-banner-error {
    background: rgba(255,107,0,0.09); border-color: rgba(255,107,0,0.28); color: var(--orange);
  }

  /* ══════════════════════════════
     PANEL
  ══════════════════════════════ */
  .fz-foods-page .fz-panel {
    background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
    border: 1px solid var(--border); border-radius: 20px; overflow: hidden;
  }
  @media (min-width: 640px) { .fz-foods-page .fz-panel { border-radius: 24px; } }

  .fz-foods-page .fz-panel-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px 14px; border-bottom: 1px solid var(--border);
    gap: 12px; flex-wrap: wrap;
  }
  @media (min-width: 640px) { .fz-foods-page .fz-panel-head { padding: 20px 24px 16px; } }

  .fz-foods-page .fz-panel-title {
    font-size: 12px; font-weight: 700; letter-spacing: 0.10em;
    text-transform: uppercase; color: #fff;
  }
  .fz-foods-page .fz-pill {
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 4px 12px; border-radius: 100px;
    background: rgba(132,255,0,0.10); border: 1px solid rgba(132,255,0,0.28); color: var(--neon);
    white-space: nowrap;
  }

  /* ══════════════════════════════
     TABLE  (desktop)
     CARDS  (mobile)
  ══════════════════════════════ */

  /* Hide table on small screens, show cards */
  .fz-foods-page .fz-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  @media (max-width: 767px) { .fz-foods-page .fz-table-wrap { display: none; } }

  .fz-foods-page .fz-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 700px; }
  .fz-foods-page .fz-table thead tr { border-bottom: 1px solid var(--border); }
  .fz-foods-page .fz-table th {
    padding: 12px 14px; text-align: left;
    font-size: 10px; font-weight: 700; letter-spacing: 0.10em;
    text-transform: uppercase; color: var(--text-muted); white-space: nowrap;
  }
  .fz-foods-page .fz-table td {
    padding: 13px 14px; color: var(--text-body);
    border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle;
  }
  .fz-foods-page .fz-table tbody tr { transition: background 0.14s; }
  .fz-foods-page .fz-table tbody tr:hover { background: rgba(255,255,255,0.025); }
  .fz-foods-page .fz-table tbody tr:last-child td { border-bottom: none; }

  /* Mobile card list — shown only on small screens */
  .fz-foods-page .fz-card-list { display: none; }
  @media (max-width: 767px) { .fz-foods-page .fz-card-list { display: flex; flex-direction: column; } }

  .fz-foods-page .fz-food-card {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex; flex-direction: column; gap: 10px;
  }
  .fz-foods-page .fz-food-card:last-child { border-bottom: none; }

  .fz-foods-page .fz-food-card-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 12px;
  }

  .fz-foods-page .fz-food-card-name {
    font-size: 15px; font-weight: 700; color: #fff; line-height: 1.3;
  }

  .fz-foods-page .fz-food-card-macros {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  }

  .fz-foods-page .fz-macro-pill {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 6px 8px; text-align: center;
  }
  .fz-foods-page .fz-macro-pill-val {
    font-size: 13px; font-weight: 700; display: block;
  }
  .fz-foods-page .fz-macro-pill-key {
    font-size: 9px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-top: 1px;
  }

  .fz-foods-page .fz-food-card-footer {
    display: flex; align-items: center;
    justify-content: space-between; gap: 8px; flex-wrap: wrap;
  }

  /* Shared */
  .fz-foods-page .fz-food-name { font-weight: 600; color: #fff; }

  .fz-foods-page .fz-cat-badge {
    display: inline-block; font-size: 10px; font-weight: 700;
    letter-spacing: 0.07em; text-transform: uppercase;
    padding: 3px 10px; border-radius: 100px;
    white-space: nowrap;
  }

  .fz-foods-page .fz-status-global {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--cyan);
  }
  .fz-foods-page .fz-status-private {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--text-muted);
  }

  .fz-foods-page .fz-row-actions { display: flex; gap: 6px; align-items: center; }

  .fz-foods-page .fz-empty { padding: 48px 24px; text-align: center; color: var(--text-muted); font-size: 14px; }

  /* ══════════════════════════════
     PAGINATION
  ══════════════════════════════ */
  .fz-foods-page .fz-pagination {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 16px 20px; border-top: 1px solid var(--border);
    font-size: 13px; color: var(--text-muted); flex-wrap: wrap;
  }
  .fz-foods-page .fz-page-btn {
    background: rgba(255,255,255,0.05); border: 1px solid var(--border);
    color: #fff; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif;
    height: 36px; padding: 0 16px; border-radius: 10px; cursor: pointer;
    transition: all 0.2s; white-space: nowrap;
  }
  .fz-foods-page .fz-page-btn:hover:not(:disabled) { border-color: var(--neon); color: var(--neon); }
  .fz-foods-page .fz-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ══════════════════════════════
     MODAL
  ══════════════════════════════ */
  .fz-foods-page .fz-modal-backdrop {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.82); backdrop-filter: blur(4px);
    display: flex; align-items: flex-end; justify-content: center;
    padding: 0;
  }
  @media (min-width: 640px) {
    .fz-foods-page .fz-modal-backdrop {
      align-items: center;
      padding: 24px;
    }
  }

  .fz-foods-page .fz-modal {
    background: #0d0d0d;
    border: 1px solid rgba(255,255,255,0.12);
    width: 100%; max-width: 680px;
    max-height: 95vh; overflow-y: auto;
    box-shadow: 0 0 80px rgba(132,255,0,0.08);
    /* Bottom sheet on mobile */
    border-radius: 20px 20px 0 0;
  }
  @media (min-width: 640px) {
    .fz-foods-page .fz-modal {
      border-radius: 24px;
      max-height: 90vh;
    }
  }

  .fz-foods-page .fz-modal-head {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 20px 20px 16px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: #0d0d0d; z-index: 1;
    gap: 12px;
  }
  @media (min-width: 640px) { .fz-foods-page .fz-modal-head { padding: 24px 24px 20px; } }

  /* drag handle on mobile */
  .fz-foods-page .fz-modal-handle {
    width: 36px; height: 4px; background: rgba(255,255,255,0.15);
    border-radius: 2px; margin: 0 auto 16px;
    display: block;
  }
  @media (min-width: 640px) { .fz-foods-page .fz-modal-handle { display: none; } }

  .fz-foods-page .fz-modal-title {
    font-size: 16px; font-weight: 900; letter-spacing: -0.02em;
    text-transform: uppercase; color: #fff;
  }
  @media (min-width: 640px) { .fz-foods-page .fz-modal-title { font-size: 18px; } }
  .fz-foods-page .fz-modal-title span { color: var(--neon); }

  .fz-foods-page .fz-modal-sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; line-height: 1.5; }

  .fz-foods-page .fz-modal-close {
    background: rgba(255,255,255,0.06); border: 1px solid var(--border);
    color: var(--text-muted); width: 32px; height: 32px; min-width: 32px;
    border-radius: 8px; cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s; font-family: 'Inter', sans-serif;
  }
  .fz-foods-page .fz-modal-close:hover { border-color: rgba(255,255,255,0.28); color: #fff; }

  .fz-foods-page .fz-modal-body { padding: 16px 20px; }
  @media (min-width: 640px) { .fz-foods-page .fz-modal-body { padding: 24px; } }

  /* ── form grid ── */
  .fz-foods-page .fz-form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  @media (min-width: 480px) {
    .fz-foods-page .fz-form-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
  }
  .fz-foods-page .fz-form-full { grid-column: 1 / -1; }

  .fz-foods-page .fz-field label {
    display: block; font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 7px;
  }

  .fz-foods-page .fz-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px; color: #fff;
    font-size: 16px; /* prevent iOS zoom */
    font-family: 'Inter', sans-serif;
    padding: 0 14px; height: 48px; outline: none;
    transition: border-color 0.2s, background 0.2s;
    appearance: none; -webkit-appearance: none;
  }
  @media (min-width: 640px) {
    .fz-foods-page .fz-input { font-size: 14px; height: 44px; }
  }
  .fz-foods-page .fz-input:focus { border-color: var(--neon); background: rgba(132,255,0,0.04); }
  .fz-foods-page .fz-input:disabled { opacity: 0.4; cursor: not-allowed; }
  .fz-foods-page .fz-input option { background: #1a1a1a; color: #fff; }

  .fz-foods-page .fz-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.45)' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
    padding-right: 36px; cursor: pointer;
  }

  /* ── checkbox row ── */
  .fz-foods-page .fz-checkbox-row {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border); border-radius: 12px;
    padding: 14px 16px; cursor: pointer; transition: border-color 0.2s;
  }
  .fz-foods-page .fz-checkbox-row:hover { border-color: rgba(255,255,255,0.20); }
  .fz-foods-page .fz-checkbox-row input[type="checkbox"] {
    width: 20px; height: 20px; accent-color: var(--neon); cursor: pointer; flex-shrink: 0;
  }
  .fz-foods-page .fz-checkbox-label { font-size: 14px; font-weight: 500; color: var(--text-body); }

  /* ── modal footer ── */
  .fz-foods-page .fz-modal-footer {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    padding: 16px 20px 20px; border-top: 1px solid var(--border);
  }
  @media (min-width: 640px) { .fz-foods-page .fz-modal-footer { padding: 20px 24px; flex-wrap: nowrap; } }

  /* ── loading ── */
  .fz-foods-page .fz-loading {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg-primary); color: var(--text-muted);
    flex-direction: column; gap: 16px; font-size: 15px;
  }
  .fz-foods-page .fz-spinner {
    width: 40px; height: 40px;
    border: 2px solid rgba(255,255,255,0.08); border-top-color: var(--neon);
    border-radius: 50%; animation: fzFoodsSpin 0.75s linear infinite;
  }
  @keyframes fzFoodsSpin { to { transform: rotate(360deg); } }

  .fz-foods-page .fz-macro-stack { line-height: 1.3; }
`;

/* ─── helpers ─────────────────────────────────────────────────────── */
function CategoryBadge({ label }: { label: string }) {
  const c = categoryColors[label] ?? categoryColors.Other;
  return (
    <span
      className="fz-cat-badge"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
      }}
    >
      {label}
    </span>
  );
}

/* ─── component ──────────────────────────────────────────────────── */
export default function CoachFoodsPage() {
  // Fetch all foods once — search & pagination are fully client-side
  // so typing never triggers a re-fetch and never steals focus.
  const [allFoods, setAllFoods] = useState<CoachFood[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CoachFoodFormState>(initialForm);
  const [saving, setSaving] = useState(false);

  /* ── load ALL foods once on mount ── */
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await getCoachFoods({
          pageIndex: 1,
          pageSize: 9999,
          search: "",
        });
        if (!alive) return;
        setAllFoods(res.data);
      } catch (err) {
        if (!alive) return;
        setError(friendlyFoodError(err));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  /* ── client-side filter ── */
  const filteredFoods = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allFoods;
    return allFoods.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        getCategoryLabel(f.category).toLowerCase().includes(q),
    );
  }, [allFoods, search]);

  /* ── client-side pagination ── */
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredFoods.length / pageSize)),
    [filteredFoods.length, pageSize],
  );

  const foods = useMemo(
    () => filteredFoods.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
    [filteredFoods, pageIndex, pageSize],
  );

  const totalCount = filteredFoods.length;
  const globalCount = allFoods.filter((f) => f.isGlobal).length;
  const privateCount = allFoods.filter((f) => !f.isGlobal).length;

  /* ── reset to page 1 on new search ── */
  function handleSearchChange(value: string) {
    setSearch(value);
    setPageIndex(1);
  }

  /* ── refresh allFoods from server (after create/update/delete) ── */
  async function refresh() {
    const res = await getCoachFoods({
      pageIndex: 1,
      pageSize: 9999,
      search: "",
    });
    setAllFoods(res.data);
  }

  /* ── form helpers ── */
  function openCreate() {
    setError(null);
    setForm(initialForm);
    setFormOpen(true);
  }

  function openEdit(food: CoachFood) {
    if (food.isGlobal) {
      setError(
        "Global food items cannot be edited. Create a private copy if you need a custom version.",
      );
      return;
    }
    setError(null);
    setForm({
      id: food.id,
      isGlobal: food.isGlobal,
      name: food.name,
      category: normalizeCategoryForForm(food.category),
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbPer100g: food.carbPer100g,
      fatPer100g: food.fatPer100g,
      fiberPer100g: 0,
      servingSizeG: food.servingSizeG,
      servingSizeName: food.servingSizeName,
      isWhole: false,
    });
    setFormOpen(true);
  }

  async function handleSubmit() {
    try {
      setSaving(true);
      setError(null);
      if (form.id) {
        if (form.isGlobal) {
          setError("Global food items cannot be edited.");
          return;
        }
        const payload: CoachFoodUpdateDto = {
          name: form.name,
          category: form.category,
          caloriesPer100g: form.caloriesPer100g,
          proteinPer100g: form.proteinPer100g,
          carbPer100g: form.carbPer100g,
          fatPer100g: form.fatPer100g,
          fiberPer100g: form.fiberPer100g ?? 0,
          servingSizeG: form.servingSizeG,
          servingSizeName: form.servingSizeName,
          isWhole: Boolean(form.isWhole),
        };
        await updateCoachFood(form.id, payload);
      } else {
        const payload: CoachFoodCreateDto = {
          name: form.name,
          category: form.category,
          caloriesPer100g: form.caloriesPer100g,
          proteinPer100g: form.proteinPer100g,
          carbPer100g: form.carbPer100g,
          fatPer100g: form.fatPer100g,
          fiberPer100g: form.fiberPer100g ?? 0,
          servingSizeG: form.servingSizeG,
          servingSizeName: form.servingSizeName,
          isWhole: Boolean(form.isWhole),
        };
        await createCoachFood(payload);
      }
      setFormOpen(false);
      await refresh();
    } catch (err) {
      setError(friendlyFoodError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, isGlobal: boolean) {
    if (isGlobal) {
      setError(
        "Global food items cannot be deleted. Create a private copy if you need to customize it.",
      );
      return;
    }
    if (!window.confirm("Delete this food item?")) return;
    try {
      setError(null);
      await deleteCoachFood(id);
      await refresh();
    } catch (err) {
      setError(friendlyFoodError(err));
    }
  }

  /* ── loading screen ── */
  if (loading) {
    return (
      <div className="fz-foods-page">
        <style>{styles}</style>
        <div className="fz-loading">
          <div className="fz-spinner" />
          <span>Loading food library…</span>
        </div>
      </div>
    );
  }

  /* ── main render ── */
  return (
    <div className="fz-foods-page">
      <style>{styles}</style>

      {/* ── Hero ── */}
      <section className="fz-hero" style={{ paddingTop: 80 }}>
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
              FOOD <span>LIBRARY</span>
            </h1>
            <p className="fz-hero-sub">
              Manage your nutrition database with per-100g macros. Build custom
              foods or reference global entries.
            </p>
            <div className="fz-hero-stats">
              <div className="fz-stat-chip">
                <span className="fz-stat-chip-num">{totalCount}</span>
                <span className="fz-stat-chip-label">Total Foods</span>
              </div>
              <div className="fz-stat-chip">
                <span className="fz-stat-chip-num">{globalCount}</span>
                <span className="fz-stat-chip-label">Global</span>
              </div>
              <div className="fz-stat-chip">
                <span className="fz-stat-chip-num">{privateCount}</span>
                <span className="fz-stat-chip-label">Private</span>
              </div>
            </div>
          </div>

          <div className="fz-hero-actions">
            <input
              className="fz-search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search foods, categories…"
            />
            <button
              className="fz-btn fz-btn-primary"
              onClick={openCreate}
              type="button"
            >
              + Create Food
            </button>
          </div>
        </div>
      </section>

      {/* ── Main ── */}
      <main className="fz-main">
        {error && <div className="fz-banner fz-banner-error">{error}</div>}

        <section className="fz-panel">
          <div className="fz-panel-head">
            <span className="fz-panel-title">All Foods</span>
            <span className="fz-pill">{totalCount} entries</span>
          </div>

          <div className="fz-table-wrap">
            <table className="fz-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Kcal / 100g</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fat</th>
                  <th>Serving</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {foods.length ? (
                  foods.map((food) => (
                    <tr key={food.id}>
                      <td>
                        <span className="fz-food-name">{food.name}</span>
                      </td>
                      <td>
                        <CategoryBadge
                          label={getCategoryLabel(food.category)}
                        />
                      </td>
                      <td>
                        <span style={{ color: "var(--neon)", fontWeight: 700 }}>
                          {food.caloriesPer100g}
                        </span>
                      </td>
                      <td>
                        <div className="fz-macro-stack">
                          <span className="fz-macro">
                            {food.proteinPer100g}g
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: "var(--cyan)", fontWeight: 700 }}>
                          {food.carbPer100g}g
                        </span>
                      </td>
                      <td>
                        <span
                          style={{ color: "var(--orange)", fontWeight: 700 }}
                        >
                          {food.fatPer100g}g
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                        {food.servingSizeG}g · {food.servingSizeName}
                      </td>
                      <td>
                        {food.isGlobal ? (
                          <span className="fz-status-global">⬡ Global</span>
                        ) : (
                          <span className="fz-status-private">◉ Private</span>
                        )}
                      </td>
                      <td>
                        <div className="fz-row-actions">
                          <button
                            className="fz-btn fz-btn-ghost"
                            onClick={() => openEdit(food)}
                            type="button"
                            disabled={food.isGlobal}
                          >
                            Edit
                          </button>
                          <button
                            className="fz-btn fz-btn-danger"
                            onClick={() => handleDelete(food.id, food.isGlobal)}
                            type="button"
                            disabled={food.isGlobal}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <div className="fz-empty">
                        <div
                          style={{
                            fontSize: 36,
                            marginBottom: 10,
                            opacity: 0.25,
                          }}
                        >
                          ⬡
                        </div>
                        No foods found. Try adjusting your search or create a
                        new entry.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="fz-pagination">
            <button
              className="fz-page-btn"
              disabled={pageIndex <= 1}
              onClick={() => setPageIndex((p) => p - 1)}
              type="button"
            >
              ← Prev
            </button>
            <span>
              Page <strong style={{ color: "#fff" }}>{pageIndex}</strong> of{" "}
              <strong style={{ color: "#fff" }}>{totalPages}</strong>
            </span>
            <button
              className="fz-page-btn"
              disabled={pageIndex >= totalPages}
              onClick={() => setPageIndex((p) => p + 1)}
              type="button"
            >
              Next →
            </button>
          </div>
        </section>
      </main>

      {/* ── Modal ── */}
      {formOpen && (
        <div className="fz-modal-backdrop">
          <div className="fz-modal">
            {/* Modal header */}
            <div className="fz-modal-head">
              <div>
                <div className="fz-modal-title">
                  {form.id ? "EDIT" : "CREATE"} <span>FOOD</span>
                </div>
                <div className="fz-modal-sub">
                  {form.id
                    ? "Update the nutritional values for this food entry."
                    : "Add a new food to your private library. Values are per 100g."}
                </div>
              </div>
              <button
                className="fz-modal-close"
                onClick={() => setFormOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Global warning */}
            {form.isGlobal && (
              <div style={{ padding: "16px 24px 0" }}>
                <div className="fz-banner fz-banner-error">
                  This is a global food entry and cannot be edited. Create a
                  private copy to customise it.
                </div>
              </div>
            )}

            {/* Form body */}
            <div className="fz-modal-body">
              <div className="fz-form-grid">
                {/* Name — full width */}
                <div className="fz-field fz-form-full">
                  <label>Food Name</label>
                  <input
                    className="fz-input"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Chicken Breast, Skinless"
                    disabled={Boolean(form.isGlobal)}
                  />
                </div>

                {/* Category */}
                <div className="fz-field">
                  <label>Category</label>
                  <select
                    className="fz-input fz-select"
                    value={form.category}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        category: Number(e.target.value) as CoachFoodCategory,
                      }))
                    }
                    disabled={Boolean(form.isGlobal)}
                  >
                    {categoryOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calories */}
                <div className="fz-field">
                  <label>Calories / 100g</label>
                  <input
                    className="fz-input"
                    type="number"
                    min={0}
                    step="1"
                    value={form.caloriesPer100g}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        caloriesPer100g: Number(e.target.value),
                      }))
                    }
                    disabled={Boolean(form.isGlobal)}
                  />
                </div>

                {/* Protein */}
                <div className="fz-field">
                  <label>Protein / 100g (g)</label>
                  <input
                    className="fz-input"
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.proteinPer100g}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        proteinPer100g: Number(e.target.value),
                      }))
                    }
                    disabled={Boolean(form.isGlobal)}
                  />
                </div>

                {/* Carbs */}
                <div className="fz-field">
                  <label>Carbs / 100g (g)</label>
                  <input
                    className="fz-input"
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.carbPer100g}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        carbPer100g: Number(e.target.value),
                      }))
                    }
                    disabled={Boolean(form.isGlobal)}
                  />
                </div>

                {/* Fat */}
                <div className="fz-field">
                  <label>Fat / 100g (g)</label>
                  <input
                    className="fz-input"
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.fatPer100g}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        fatPer100g: Number(e.target.value),
                      }))
                    }
                    disabled={Boolean(form.isGlobal)}
                  />
                </div>

                {/* Fiber */}
                <div className="fz-field">
                  <label>Fiber / 100g (g)</label>
                  <input
                    className="fz-input"
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.fiberPer100g ?? 0}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        fiberPer100g: Number(e.target.value),
                      }))
                    }
                    disabled={Boolean(form.isGlobal)}
                  />
                </div>

                {/* Serving size g */}
                <div className="fz-field">
                  <label>Serving Size (g)</label>
                  <input
                    className="fz-input"
                    type="number"
                    min={0}
                    step="1"
                    value={form.servingSizeG}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        servingSizeG: Number(e.target.value),
                      }))
                    }
                    disabled={Boolean(form.isGlobal)}
                  />
                </div>

                {/* Serving label */}
                <div className="fz-field">
                  <label>Serving Label</label>
                  <input
                    className="fz-input"
                    value={form.servingSizeName}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        servingSizeName: e.target.value,
                      }))
                    }
                    placeholder="e.g. 1 cup, 1 slice"
                    disabled={Boolean(form.isGlobal)}
                  />
                </div>

                {/* Whole food checkbox */}
                <label
                  className="fz-checkbox-row fz-form-full"
                  style={{ cursor: form.isGlobal ? "not-allowed" : "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form.isWhole)}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isWhole: e.target.checked }))
                    }
                    disabled={Boolean(form.isGlobal)}
                  />
                  <div>
                    <div className="fz-checkbox-label">Whole food</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      Mark if this is a minimally-processed whole food.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal footer */}
            <div className="fz-modal-footer">
              <button
                className="fz-btn fz-btn-save"
                onClick={handleSubmit}
                disabled={saving || Boolean(form.isGlobal)}
                type="button"
              >
                {saving ? "Saving…" : form.id ? "Update Food" : "Create Food"}
              </button>
              <button
                className="fz-btn fz-btn-cancel"
                onClick={() => setFormOpen(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
