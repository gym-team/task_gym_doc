"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import { useTypingEffect } from "@/hooks/use-typing-effect"

export function HeroSection() {
  const [parallaxOffset, setParallaxOffset] = useState(0)
  const { displayedText } = useTypingEffect("TRANSFORM YOUR BODY", 80)

  useEffect(() => {
    const handleScroll = () => {
      setParallaxOffset(window.scrollY * 0.5)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{
            transform: `translateY(${parallaxOffset}px)`,
            transition: "transform 0.1s ease-out",
          }}
          poster="/modern-gym-interior-with-equipment-and-dramatic-li.jpg"
        >
          <source src="/gym-workout-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#84FF00]/10 via-transparent to-[#FF6B00]/10 animate-pulse" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight min-h-[120px] md:min-h-[150px]">
            <span className="text-white">{displayedText}</span>
            {displayedText.length < "TRANSFORM YOUR BODY".length && (
              <span className="inline-block w-2 h-16 md:h-24 lg:h-32 ml-2 bg-[#84FF00] animate-pulse" />
            )}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join the ultimate fitness experience. World-class equipment, expert trainers, and a community that pushes
            you to be your best.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/membership">
              <Button
                size="lg"
                className="bg-[#84FF00] text-black hover:bg-[#84FF00]/90 font-bold text-lg px-8 py-6 h-auto group"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-black font-bold text-lg px-8 py-6 h-auto group bg-transparent"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Tour
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-white/20">
            <div>
              <div className="text-3xl md:text-4xl font-black text-[#84FF00] mb-1">500+</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Members</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-[#FF6B00] mb-1">50+</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Trainers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-[#00D9FF] mb-1">100+</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Classes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  )
}
