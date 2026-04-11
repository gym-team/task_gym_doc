
"use client";

import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
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
      {/* (1) الخلفية الأصلية */}
      <div className="fixed inset-0 -z-30">
        <img
          src="/view-gym-room-training-sports222.jpg"
          className="w-full h-full object-cover"
        />
      </div>

      {/* (2) طبقة تغميق أساسية — سواد 95% */}
      <div className="fixed inset-0 -z-20 bg-black/0" />

      {/* (3) منطقة فتح السواد (Spotlight من الماوس) */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 transition-all duration-300"
        style={{
          background: `radial-gradient(
            circle 350px at ${mousePos.x}px ${mousePos.y}px,
            rgba(0,0,0,0.25) 0%,    /* ← 30% تحت الماوس (أفتح) */
            rgba(0,0,0,0.85) 70%    /* ← 90% برا الدائرة */
          )`,
        }}
      ></div>

      {/* (4) الفورم */}
      <LoginForm />
    </div>
  );

}
