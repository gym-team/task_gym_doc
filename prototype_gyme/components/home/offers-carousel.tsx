"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"

const offers = [
  {
    id: 1,
    title: "New Year Special",
    description: "Get 50% off on annual memberships",
    cta: "Claim Offer",
    link: "/membership",
    gradient: "from-[#84FF00] to-[#00D9FF]",
  },
  {
    id: 2,
    title: "Personal Training Package",
    description: "5 sessions with expert trainers for $199",
    cta: "Book Now",
    link: "/book-trainer",
    gradient: "from-[#FF6B00] to-[#FF0080]",
  },
  {
    id: 3,
    title: "Premium Supplements",
    description: "Buy 2 Get 1 Free on all protein products",
    cta: "Shop Now",
    link: "/shop",
    gradient: "from-[#00D9FF] to-[#84FF00]",
  },
]

export function OffersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % offers.length)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-black to-zinc-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#84FF00]/10 border border-[#84FF00]/30 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#84FF00]" />
            <span className="text-[#84FF00] text-sm font-bold uppercase tracking-wider">Limited Time Offers</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Exclusive <span className="text-[#84FF00]">Deals</span>
          </h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {offers.map((offer) => (
                <div key={offer.id} className="min-w-full px-2">
                  <div className={`relative bg-gradient-to-br ${offer.gradient} p-1 rounded-2xl`}>
                    <div className="bg-black rounded-xl p-8 md:p-12">
                      <h3 className="text-3xl md:text-4xl font-black text-white mb-4">{offer.title}</h3>
                      <p className="text-lg text-gray-300 mb-8">{offer.description}</p>
                      <Link href={offer.link}>
                        <Button
                          size="lg"
                          className="bg-white text-black hover:bg-gray-100 font-bold px-8 py-6 h-auto rounded-lg transition-all duration-300 hover:scale-105"
                        >
                          {offer.cta}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full p-3 transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full p-3 transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false)
                  setCurrentIndex(index)
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-[#84FF00]" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
