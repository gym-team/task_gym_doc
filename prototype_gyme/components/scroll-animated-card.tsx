"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import type { ReactNode } from "react"

interface ScrollAnimatedCardProps {
  children: ReactNode
  animation?: "fade-up" | "slide-left" | "slide-right" | "scale-in"
  delay?: number
}

export function ScrollAnimatedCard({ children, animation = "fade-up", delay = 0 }: ScrollAnimatedCardProps) {
  const { ref, isVisible } = useScrollAnimation()

  const animationClass = {
    "fade-up": "animate-fade-in-up",
    "slide-left": "animate-slide-in-left",
    "slide-right": "animate-slide-in-right",
    "scale-in": "animate-scale-in",
  }[animation]

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ${isVisible ? animationClass : "opacity-0"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
