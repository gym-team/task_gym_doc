"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface PageBackgroundProps {
  type?: "home" | "shop" | "trainers" | "blog" | "dashboard"
  imageUrl?: string
}

export function PageBackground({ type = "home", imageUrl }: PageBackgroundProps) {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number }>>([])

  useEffect(() => {
    if (type === "dashboard") {
      // Generate floating particles for dashboard
      const newParticles = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
      }))
      setParticles(newParticles)
    }
  }, [type])

  const backgroundStyles: Record<string, React.CSSProperties> = {
    home: {
      backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(10,10,10,0.7) 100%), url('${imageUrl || "/placeholder.svg"}')`,
      backgroundAttachment: "fixed",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    shop: {
      backgroundImage: `linear-gradient(180deg, rgba(132,255,0,0.05) 0%, rgba(0,0,0,0.9) 100%), url('${imageUrl || "/placeholder.svg"}')`,
      backgroundAttachment: "fixed",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    trainers: {
      backgroundImage: `linear-gradient(135deg, rgba(255,107,0,0.05) 0%, rgba(0,0,0,0.95) 100%), url('${imageUrl || "/placeholder.svg"}')`,
      backgroundAttachment: "fixed",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    blog: {
      backgroundImage: `linear-gradient(180deg, rgba(0,217,255,0.05) 0%, rgba(0,0,0,0.9) 100%), url('${imageUrl || "/placeholder.svg"}')`,
      backgroundAttachment: "fixed",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    dashboard: {
      backgroundImage: `linear-gradient(135deg, rgba(132,255,0,0.03) 0%, rgba(0,0,0,0.95) 100%), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><pattern id="dots" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="2" fill="rgba(132,255,0,0.1)"/></pattern></defs><rect width="1200" height="600" fill="black"/><rect width="1200" height="600" fill="url(%23dots)"/></svg>')`,
      backgroundAttachment: "fixed",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
  }

  return (
    <>
      <div className="fixed inset-0 -z-10" style={backgroundStyles[type]} />

      {/* Particles for dashboard */}
      {type === "dashboard" &&
        particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              bottom: "-50px",
              width: "4px",
              height: "4px",
              backgroundColor: `hsl(84, 100%, 50%)`,
              borderRadius: "50%",
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
    </>
  )
}
