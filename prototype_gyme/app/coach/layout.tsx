"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import "./coach.css";
import { Navigation } from "@/components/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Apple,
  CalendarRange,
  SlidersHorizontal,
  Dumbbell,
  FolderKanban,
} from "lucide-react";

const navLinks = [
  { href: "/coach", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coach/checkins", label: "Check-Ins", icon: ClipboardCheck },
  { href: "/coach/foods", label: "Foods", icon: Apple },
  { href: "/coach/plans", label: "Plans", icon: CalendarRange },
  { href: "/coach/program/exercise", label: "Exercises", icon: Dumbbell },
  { href: "/coach/program", label: "Programs", icon: FolderKanban },
];

function isLinkActive(pathname: string, href: string) {
  if (href === "/coach") return pathname === "/coach";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CoachTabs() {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [pathname]);

  return (
    <div className="coach-tabs-shell">
      <div className="coach-tabs-glow" aria-hidden="true" />

      <nav aria-label="Coach sections" className="coach-tabs-track">
        {navLinks.map((link, index) => {
          const active = isLinkActive(pathname, link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              ref={active ? activeRef : undefined}
              aria-current={active ? "page" : undefined}
              className={`coach-tab-pill ${active ? "coach-tab-pill--active" : ""}`}
              style={{ "--stagger-index": index } as React.CSSProperties}
            >
              <span className="coach-tab-pill__sheen" aria-hidden="true" />
              <Icon className="h-4 w-4" strokeWidth={2.25} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function CoachLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#84FF00]/30 bg-[#84FF00]/10 text-[#84FF00] shadow-[0_0_30px_rgba(132,255,0,0.18)]">
                  ⚡
                </div>
                <div>
                  <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white lg:text-base">
                    FITZONE Coach
                  </h1>
                  <p className="text-[11px] text-white/45 lg:text-xs">
                    Elite Fitness Platform
                  </p>
                </div>
              </div>

              <div className="rounded-full border border-[#84FF00]/20 bg-[#84FF00]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#84FF00]">
                Responsive Layout
              </div>
            </div>

            {/* Original navbar — unchanged, sits on top */}
            <div className="overflow-x-auto pb-1">
              <div className="min-w-max">
                <Navigation />
              </div>
            </div>

            {/* Section tabs — replaces the old vertical sidebar */}
            <CoachTabs />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}