"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ProgramsHero } from "@/components/programs/programs-hero";
import ProgramCategories from "@/components/programs/program-categories"


export default function ProgramsPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">

      {/* (1) صورة الخلفية */}
      <div className="fixed inset-0 -z-30">
        <img
          src="/view-gym-room-training-sports.jpg"
          className="w-full h-full object-cover"
          alt="background"
        />
      </div>

      {/* (2) طبقة تغميق ثابتة */}
      <div className="fixed inset-0 -z-20 bg-black/0" />

      {/* (3) دائرة الفتح حول الماوس */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 transition-all duration-300"
        style={{
          background: `radial-gradient(
            circle 350px at ${mousePos.x}px ${mousePos.y}px,
            rgba(0,0,0,0.25) 0%,
            rgba(0,0,0,0.75) 70%
          )`,
        }}
      ></div>

      {/* (4) محتوى الصفحة */}
      <Navigation />

      <main className="pt-16 relative z-10">
        <ProgramsHero />
        <ProgramCategories />
      </main>

      <Footer />
    </div>
  );
}
