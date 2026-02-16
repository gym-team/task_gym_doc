"use client";

import { useEffect, useState } from "react";
import { getMemberships, Membership } from "@/lib/membership";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import "@/styles/pricing-plans.css";

export function PricingPlans() {
  const [plans, setPlans] = useState<Membership[]>([]);

  // =============================
  // LOAD DATA FROM API
  // =============================
  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await getMemberships();
        setPlans(data);
      } catch (err) {
        console.error("Failed to load memberships", err);
      }
    }

    loadPlans();
  }, []);

  // =============================
  // SCROLL ANIMATION
  // =============================
  useEffect(() => {
    if (!plans.length) return;

    const cards = document.querySelectorAll(".pricing-card");

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.35 }
    );

    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [plans]);

  if (!plans.length) return null;

  return (
  <section className="py-24 bg-black">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {plans.map(plan => {
          const popular = plan.name === "Standard";
          const features = plan.description
            .split(",")
            .map(f => f.trim())
            .filter(Boolean);

          return (
            <div
              key={plan.id}
              className={`pricing-card ${popular ? "popular" : ""} h-full flex`}
            >
              <div className="pricing-inner flex flex-col w-full p-8">
                
                {/* MOST POPULAR BADGE */}
                {popular && (
                  <div className="popular-badge">
                    <Zap size={14} />
                    MOST POPULAR
                  </div>
                )}

                {/* TITLE + PRICE */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-extrabold text-white mb-4">
                    {plan.name}
                  </h3>

                  <div>
                    <span className="price">${plan.price}</span>
                    <span className="period"> / {plan.title}</span>
                  </div>
                </div>

                {/* FEATURES */}
                <div className="space-y-4 flex-grow">
                  {features.map(feature => (
                    <div key={feature} className="feature flex items-center gap-2">
                      <Check size={18} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <Link href="/contact">
                    <Button className="cta-btn w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

}
