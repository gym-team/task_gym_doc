"use client"

import { motion } from "framer-motion"

const cells = Array.from({ length: 36 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 60 + Math.random() * 40,
  duration: 2 + Math.random() * 3,
  delay: Math.random() * 2,
  color: i % 2 === 0 ? "#84FF00" : "#FF6B00",
}))

export function HexGymBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black perspective-[1200px]">

      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />

      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-[#84FF00]/10 blur-3xl rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-[#FF6B00]/10 blur-3xl rounded-full" />

      {/* Hex Cells */}
      {cells.map((cell) => (
        <motion.div
          key={cell.id}
          className="absolute"
          style={{
            left: `${cell.x}%`,
            top: `${cell.y}%`,
          }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, 6, -6, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: cell.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: cell.delay,
          }}
        >
          <div
            style={{
              width: cell.size,
              height: cell.size,
              clipPath:
                "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
              border: `1px solid ${cell.color}33`,
              background: `${cell.color}10`,
              boxShadow: `
                0 0 20px ${cell.color}22,
                inset 0 0 20px ${cell.color}11
              `,
              backdropFilter: "blur(4px)",
            }}
          />
        </motion.div>
      ))}

      {/* Moving Light Sweep */}
      <motion.div
        className="absolute inset-y-0 -left-1/4 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl"
        animate={{ x: ["0%", "250%"] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}