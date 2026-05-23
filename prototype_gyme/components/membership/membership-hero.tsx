"use client";

import { useEffect, useRef } from "react";
// app/layout.tsx

import "@/styles/membership-hero.css";

export function MembershipHero() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div");

      p.className = "particle";

      const size = 2 + Math.random() * 3;
      const dur = 4 + Math.random() * 7;
      const delay = Math.random() * 8;

      Object.assign(p.style, {
        left: Math.random() * 100 + "%",
        bottom: Math.random() * 30 + "%",
        width: size + "px",
        height: size + "px",
        animationDuration: dur + "s",
        animationDelay: delay + "s",
      });

      container.appendChild(p);
    }
  }, []);

  return (
    <section className="membership-hero">
      {/* Background Image */}
      <div className="mh-bg-img" />

      {/* Overlays */}
      <div className="mh-overlay-dark" />
      <div className="mh-overlay-gradient" />

      {/* Grid */}
      <div className="mh-grid" />

      {/* Glow Effects */}
      <div className="mh-glow-center" />
      <div className="mh-glow-tl" />
      <div className="mh-glow-br" />

      {/* Particles */}
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Scan Line */}
      <div className="mh-scanline" />

      {/* Content */}
      <div className="mh-content-wrapper">
        <div className="mh-content">

          {/* Eyebrow */}
          <div className="mh-eyebrow">
            <div className="mh-eyebrow-dot" />

            <span className="mh-eyebrow-text">
              Membership Plans
            </span>
          </div>

          {/* Heading */}
          <h1 className="mh-h1">
            CHOOSE YOUR
            <br />
            <span className="mh-accent">PLAN</span>
          </h1>

          {/* Subheading */}
          <p className="mh-sub">
            Flexible membership options designed to fit your
            lifestyle and fitness goals.
          </p>

          {/* Buttons */}
          <div className="mh-cta-row">
            <button className="mh-btn-primary">
              GET STARTED TODAY
            </button>

            <button className="mh-btn-ghost">
              COMPARE PLANS
            </button>
          </div>

          {/* Pill */}
          <div className="mh-pill">
            <span className="mh-pill-check">✓</span>

            <span className="mh-pill-text">
              No commitment • Cancel anytime • 7-day money-back guarantee
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}