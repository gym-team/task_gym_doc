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
  process.env.NEXT_PUBLIC_API_URL || "http://fitzonetrack931-1.runasp.net";

export function AllPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await fetch(`${API_URL}/api/Membership/Plans`);
        const data = await res.json();
        setPlans(data);
      } catch (error) {
        console.error("Error loading plans:", error);
      }
    }

    loadPlans();
  }, []);

  useEffect(() => {
    if (!plans.length) return;

    const cards = document.querySelectorAll(".pricing-card");

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

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [plans]);

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const typeClass =
              plan.name.toLowerCase() === "premium"
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
