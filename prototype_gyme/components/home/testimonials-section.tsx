"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Weight Loss Journey",
      image: "/fit-woman-smiling-in-gym.jpg",
      quote:
        "FitZone changed my life! I lost 40 pounds in 6 months with the help of amazing trainers and a supportive community. The personalized training plan made all the difference.",
      rating: 5,
      result: "-40 lbs in 6 months",
    },
    {
      name: "Mike Chen",
      role: "Strength Training",
      image: "/muscular-man-in-gym.jpg",
      quote:
        "The equipment is top-notch and the trainers really know their stuff. I've gained 15 pounds of muscle and feel stronger than ever. Best investment I've made in myself.",
      rating: 5,
      result: "+15 lbs muscle gain",
    },
    {
      name: "Emily Rodriguez",
      role: "Marathon Training",
      image: "/athletic-woman-running.jpg",
      quote:
        "Training for my first marathon seemed impossible until I joined FitZone. The cardio programs and nutrition guidance helped me cross the finish line in record time!",
      rating: 5,
      result: "Completed first marathon",
    },
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const current = testimonials[currentIndex]

  return (
    <section className="py-24 bg-gradient-to-b from-black to-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            SUCCESS <span className="text-[#84FF00]">STORIES</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real transformations from real members. Your success story starts here.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative h-64 md:h-auto overflow-hidden group">
                <img
                  src={current.image || "/placeholder.svg"}
                  alt={current.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent opacity-100 group-hover:opacity-70 transition-opacity duration-300" />
                <div className="absolute top-4 right-4 bg-[#84FF00] text-black px-4 py-2 rounded-full font-bold text-sm shadow-[0_0_15px_rgba(132,255,0,0.6)] group-hover:shadow-[0_0_25px_rgba(132,255,0,0.8)] transition-all duration-300">
                  {current.result}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex gap-1 mb-4">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-[#FF6B00] text-[#FF6B00]" />
                  ))}
                </div>

                <blockquote className="text-lg text-gray-300 mb-6 leading-relaxed italic">"{current.quote}"</blockquote>

                <div className="mb-8">
                  <div className="font-bold text-white text-xl">{current.name}</div>
                  <div className="text-[#84FF00] text-sm">{current.role}</div>
                </div>

                {/* Navigation */}
                <div className="flex gap-2">
                  <Button
                    onClick={prevTestimonial}
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={nextTestimonial}
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-2 ml-4">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentIndex ? "w-8 bg-[#84FF00]" : "w-2 bg-white/30"
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
