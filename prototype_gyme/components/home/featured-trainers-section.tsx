"use client"

import Link from "next/link"
import { Star, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function FeaturedTrainersSection() {
  const [hoveredTrainer, setHoveredTrainer] = useState<string | null>(null)

  const trainers = [
    {
      id: "mike-johnson",
      name: "Mike Johnson",
      specialty: "Strength & Conditioning",
      image: "/male-trainer-strength.jpg",
      rating: 4.9,
      clients: 150,
      experience: "10+ years",
      certifications: ["NASM-CPT", "CSCS"],
    },
    {
      id: "sarah-williams",
      name: "Sarah Williams",
      specialty: "Yoga & Flexibility",
      image: "/female-trainer-yoga.jpg",
      rating: 4.8,
      clients: 200,
      experience: "8+ years",
      certifications: ["RYT-500", "ACE"],
    },
    {
      id: "david-chen",
      name: "David Chen",
      specialty: "HIIT & Cardio",
      image: "/male-trainer-cardio.jpg",
      rating: 4.9,
      clients: 180,
      experience: "12+ years",
      certifications: ["ACSM-CPT", "TRX"],
    },
  ]

  return (
    <section className="py-24 md:py-32 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-block mb-4 px-4 py-2 bg-[#84FF00]/10 border border-[#84FF00]/30 rounded-full">
              <span className="text-[#84FF00] text-sm font-bold uppercase tracking-wider">Expert Trainers</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight text-balance">
              Train with the best
            </h2>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed text-pretty">
              Our certified trainers are dedicated to helping you achieve your fitness goals with personalized guidance.
            </p>
          </div>
          <Link href="/trainers">
            <Button
              size="lg"
              className="bg-[#84FF00] text-black hover:bg-[#84FF00]/90 hover:scale-105 font-bold transition-all duration-300 group"
            >
              View All Trainers
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#84FF00]/50 hover:shadow-[0_0_30px_rgba(132,255,0,0.2)] transition-all duration-300 group cursor-pointer"
              onMouseEnter={() => setHoveredTrainer(trainer.id)}
              onMouseLeave={() => setHoveredTrainer(null)}
            >
              {/* Trainer Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
                <img
                  src={trainer.image || "/placeholder.svg"}
                  alt={trainer.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />
                  <span className="text-white font-bold text-sm">{trainer.rating}</span>
                </div>

                {/* Book Now Button - Shows on Hover */}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                    hoveredTrainer === trainer.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Link href={`/book-trainer?trainer=${trainer.id}`}>
                    <Button size="lg" className="bg-[#84FF00] text-black hover:bg-[#84FF00]/90 font-bold shadow-xl">
                      <Calendar className="h-5 w-5 mr-2" />
                      Book Now
                    </Button>
                  </Link>
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-black text-white mb-1">{trainer.name}</h3>
                  <p className="text-[#84FF00] font-bold text-sm mb-3">{trainer.specialty}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-300">
                    <span>{trainer.clients}+ clients</span>
                    <span>•</span>
                    <span>{trainer.experience}</span>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="p-5 bg-white/[0.02]">
                <div className="flex flex-wrap gap-2">
                  {trainer.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-3 py-1 bg-[#84FF00]/10 border border-[#84FF00]/30 rounded-full text-[#84FF00] text-xs font-bold"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
