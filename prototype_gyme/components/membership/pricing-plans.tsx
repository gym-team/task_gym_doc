"use client";

import { useEffect, useState } from "react";
import { getMemberships, Membership } from "@/lib/membership";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import Link from "next/link";

export function PricingPlans() {
  const [plans, setPlans] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // =============================
  // FIX HYDRATION
  // =============================
  useEffect(() => {
    setMounted(true);
  }, []);

  // =============================
  // LOAD DATA
  // =============================
  useEffect(() => {
    if (!mounted) return;

    const loadData = async () => {
      try {
        const data = await getMemberships();
        setPlans(data);
      } catch (err) {
        console.error("Failed to load memberships", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted]);

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

  // =============================
  // PREVENT HYDRATION ERROR
  // =============================
  if (!mounted) {
    return null;
  }

  // =============================
  // LOADING STATE
  // =============================
  if (loading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {[1, 2].map(i => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // =============================
  // EMPTY STATE
  // =============================
  if (!plans.length) return null;

  // =============================
  // MAIN UI
  // =============================
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {plans.map(plan => {
            const popular = plan.name === "Standard";

            const features = plan.description
              ?.split(",")
              .map(f => f.trim())
              .filter(Boolean) || [];

            return (
              <div
                key={plan.id}
                className={`pricing-card ${
                  popular ? "popular" : ""
                } h-full flex`}
              >
                <div className="pricing-inner flex flex-col w-full p-8">

                  {popular && (
                    <div className="popular-badge">
                      <Zap size={14} />
                      MOST POPULAR
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-extrabold text-white mb-4">
                      {plan.name}
                    </h3>

                    <div>
                      <span className="price">${plan.price}</span>
                      <span className="period"> / {plan.title}</span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-grow">
                    {features.map(feature => (
                      <div
                        key={feature}
                        className="feature flex items-center gap-2"
                      >
                        <Check size={18} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

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