"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 35 }).map((_, i) => ({
  id: i,
  size: Math.random() * 6 + 3,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 4,
  opacity: Math.random() * 0.5 + 0.2,
}));

export function PremiumGymBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black pointer-events-none">
      {/* Base Background */}
      <div className="absolute inset-0 bg-black" />

      {/* Top Dark Area */}
      <div className="absolute top-0 left-0 w-full h-[70px] bg-black z-[2]" />

      {/* Green + Orange Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#84FF00]/10 via-transparent to-[#FF6B00]/10" />

      {/* Strong Bottom Blend */}
      <div className="absolute inset-x-0 bottom-0 h-[260px] bg-gradient-to-b from-transparent via-black/80 to-black z-[5]" />

      {/* Hard Black Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[120px] bg-black z-[4]" />

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[420px] h-[420px] bg-[#84FF00]/10 blur-3xl rounded-full" />

      <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] bg-[#FF6B00]/10 blur-3xl rounded-full" />

      {/* Floating Particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${
            i % 5 === 0 ? "bg-[#FF6B00]" : "bg-[#84FF00]"
          }`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            boxShadow: i % 5 === 0 ? "0 0 12px #FF6B00" : "0 0 12px #84FF00",
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [
              particle.opacity * 0.5,
              particle.opacity,
              particle.opacity * 0.5,
            ],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}
