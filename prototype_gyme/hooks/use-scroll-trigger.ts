"use client"

import { useEffect, useRef, useState } from "react"

export function useScrollTrigger() {
  const ref = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Only observe once for performance
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.1,
        margin: "0px 0px -50px 0px", // trigger slightly before entering viewport
      },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return { ref, isVisible }
}
