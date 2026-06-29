// components/coach/coach-hero.tsx
"use client";

import type { ReactNode } from "react";

export interface CoachHeroStat {
  label: string;
  value: string | number;
}

export interface CoachHeroProps {
  eyebrow?: string;
  title: ReactNode;
  /** The word(s) inside `title` that should render in brand green should already be wrapped by the caller, e.g. <span className="text-brand-green">PLANS</span> */
  description?: string;
  imageUrl?: string;
  statusPill?: string;
  stats?: CoachHeroStat[];
  cta?: ReactNode;
}

/**
 * Full-width hero used at the top of every major coach page.
 * Implements: background image, dark overlay, green gradient overlay,
 * floating glow, animated grid, scan line, stat chips, CTA/status pill.
 * (Brief section 2, "Hero Pattern".)
 */
export function CoachHero({
  eyebrow,
  title,
  description,
  imageUrl,
  statusPill,
  stats,
  cta,
}: CoachHeroProps) {
  return (
    <section className="coach-hero py-section-lg">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="coach-hero__image" />
      )}
      <div className="coach-hero__overlay" />
      <div className="coach-hero__gradient" />
      <div className="coach-hero__grid" />
      <div className="coach-hero__scanline" />
      <div
        className="coach-hero__glow"
        style={{ top: "-120px", left: "-120px" }}
      />
      <div
        className="coach-hero__glow"
        style={{ bottom: "-160px", right: "-100px" }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {statusPill && (
          <span className="mb-6 inline-flex items-center rounded-full border border-brand-green/40 bg-brand-green/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-green">
            {statusPill}
          </span>
        )}
        {eyebrow && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-4xl font-extrabold uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-xl text-base text-white/75 sm:text-lg">
            {description}
          </p>
        )}
        {cta && <div className="mt-10">{cta}</div>}
        {stats && stats.length > 0 && (
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="coach-stat">
                <div className="coach-stat__value">{stat.value}</div>
                <div className="coach-stat__label">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
