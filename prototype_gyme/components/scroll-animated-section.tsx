"use client"

import { useScrollTrigger } from "@/hooks/use-scroll-trigger"
import type { ReactNode } from "react"

interface ScrollAnimatedSectionProps {
  children: ReactNode
  animation?: "fade-up" | "slide-left" | "slide-right" | "scale-in"
  delay?: number
}

export function ScrollAnimatedSection({ children, animation = "fade-up", delay = 0 }: ScrollAnimatedSectionProps) {
  const { ref, isVisible } = useScrollTrigger()

  const animationClasses = {
    "fade-up": "opacity-0 translate-y-10",
    "slide-left": "opacity-0 -translate-x-10",
    "slide-right": "opacity-0 translate-x-10",
    "scale-in": "opacity-0 scale-90",
  }

  const visibleClasses = {
    "fade-up": "opacity-100 translate-y-0",
    "slide-left": "opacity-100 translate-x-0",
    "slide-right": "opacity-100 translate-x-0",
    "scale-in": "opacity-100 scale-100",
  }

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? visibleClasses[animation] : animationClasses[animation]}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </section>
  )
}
