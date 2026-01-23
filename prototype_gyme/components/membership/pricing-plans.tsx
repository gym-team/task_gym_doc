import { getMemberships } from "@/lib/membership"
import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export async function PricingPlans() {
  const plans = await getMemberships()

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map(plan => {
            // Build features from description (robust)
            const features = plan.description
              .split(",")
              .map(f => f.trim())
              .filter(Boolean)

            const popular = plan.name === "Standard"

            return (
              <div
                key={plan.id}
                className={`relative bg-white/5 border-2 ${
                  popular ? "border-[#84FF00]" : "border-[#FF6B00]"
                } rounded-2xl p-8 transition-all`}
              >
                {/* MOST POPULAR badge */}
                {popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-[#84FF00] text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {/* TITLE + PRICE (NO DESCRIPTION) */}
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-black text-white mb-4">
                    {plan.name}
                  </h3>

                  <div>
                    <span className="text-5xl font-black text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-400"> / {plan.title}</span>
                  </div>
                </div>

                {/* FEATURES */}
                <div className="space-y-4 mb-10">
                  {features.map(feature => (
                    <div key={feature} className="flex gap-3">
                      <Check className="h-5 w-5 text-[#84FF00]" />
                      <span className="text-gray-300 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link href="/contact">
                  <Button className="w-full font-bold bg-[#84FF00] text-black hover:bg-[#84FF00]/90">
                    Get Started
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
