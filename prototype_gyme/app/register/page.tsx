"use client";

import { useState, useEffect } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden pt-16">

      {/* (1) الخلفية */}
      <div className="fixed inset-0 -z-30">
        <img
          src="/view-gym-room-training-sports222.jpg"
          className="w-full h-full object-cover"
        />
      </div>

      {/* (2) طبقة تغميق أساسية */}
      <div className="fixed inset-0 -z-20 bg-black/0" />

      {/* (3) منطقة تخفيف السواد تحت الماوس */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 transition-all duration-300"
        style={{
          background: `radial-gradient(
            circle 350px at ${mousePos.x}px ${mousePos.y}px,
            rgba(0,0,0,0.25) 0%,     /* ← المنطقة تحت الماوس */
            rgba(0,0,0,0.85) 70%     /* ← بقية الشاشة */
          )`
        }}
      />

      {/* (4) الفورم */}
      <div className="relative z-10">
        <RegisterForm />
      </div>

    </div>
  );
}
