import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-[#84FF00] to-[#00D9FF] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "url('/abstract-geometric-pattern.png')", backgroundSize: "100px 100px" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-black mb-6">
            READY TO START YOUR
            <br />
            TRANSFORMATION?
          </h2>
          <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
            Join thousands of members who have already transformed their lives. Your journey to a stronger, healthier
            you starts today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/membership">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-black/90 font-bold text-lg px-8 py-6 h-auto group"
              >
                View Membership Plans
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-black text-black hover:bg-black hover:text-white font-bold text-lg px-8 py-6 h-auto bg-transparent"
              >
                Contact
              </Button>
            </Link>
          </div>

          <p className="text-sm text-black/60 mt-6">No commitment required. Cancel anytime.</p>
        </div>
      </div>
    </section>
  )
}
