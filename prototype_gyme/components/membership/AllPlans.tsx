"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import "@/styles/pricing-plans.css";

interface Plan {
  id: number;
  name: string;
  price: number;
  title: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://fitzonetrack931-1.runasp.net";

export function AllPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // =========================
  // FIX HYDRATION
  // =========================
  useEffect(() => {
    setMounted(true);
  }, []);

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    if (!mounted) return;

    async function loadPlans() {
      try {
        const res = await fetch(
          `${API_URL}/api/Membership/Plans`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch plans");
        }

        const data = await res.json();

        setPlans(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading plans:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, [mounted]);

  // =========================
  // SCROLL ANIMATION
  // =========================
  useEffect(() => {
    if (!plans.length) return;

    const cards =
      document.querySelectorAll(".pricing-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.3 }
    );

    cards.forEach((card) =>
      observer.observe(card)
    );

    return () => observer.disconnect();
  }, [plans]);

  // =========================
  // PREVENT HYDRATION ERROR
  // =========================
  if (!mounted) return null;

  // =========================
  // LOADING UI
  // =========================
  if (loading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[420px] rounded-3xl border border-white/10 bg-white/5 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // =========================
  // EMPTY STATE
  // =========================
  if (!plans.length) return null;

  // =========================
  // MAIN UI
  // =========================
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const typeClass =
              plan.name?.toLowerCase() === "premium"
                ? "premium"
                : "standard";

            const popular =
              plan.name === "Premium" &&
              plan.title === "1 Year";

            return (
              <div
                key={plan.id}
                className={`pricing-card ${typeClass} ${
                  popular ? "popular" : ""
                }`}
              >
                <div className="pricing-inner flex flex-col">

                  {popular && (
                    <div className="popular-badge">
                      MOST VALUE
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {plan.name}
                    </h3>

                    <div>
                      <span className="price">
                        ${plan.price}
                      </span>

                      <span className="period">
                        {" "} / {plan.title}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div className="feature">
                      <Check size={18} />
                      Full System Access
                    </div>

                    <div className="feature">
                      <Check size={18} />
                      All Core Features
                    </div>
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

export default AllPlans;