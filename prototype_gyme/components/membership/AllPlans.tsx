"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import "@/styles/pricing-plans.css";
import {
  getMyMembership,
  Membership as MembershipType,
  MembershipStatus,
} from "@/lib/membership";
import { PaymentModal } from "@/components/membership/payment-modal";

interface Plan {
  id: number;
  name: string;
  price: number;
  title: string;
  description?: string;
}

type Props = {
  onMembershipUpdate?: (membership: MembershipStatus) => void;
};

// نفس البيز يورل المستخدم في باقي الموقع
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function AllPlans({ onMembershipUpdate }: Props = {}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState<MembershipType | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const [currentMembership, setCurrentMembership] =
    useState<MembershipStatus | null>(null);

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
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") ||
              localStorage.getItem("accessToken")
            : null;

        const [res, membershipData] = await Promise.all([
          fetch(`${API_URL}/api/Membership/Plans`, {
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }),
          getMyMembership(),
        ]);

        if (!res.ok) {
          throw new Error("Failed to fetch plans");
        }

        const data = await res.json();

        setPlans(Array.isArray(data) ? data : []);
        setCurrentMembership(membershipData);
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

    const cards = document.querySelectorAll(".pricing-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.3 },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [plans]);

  function handleSubscribeClick(plan: Plan) {
    // الـ PaymentModal بيحتاج Membership type كامل، فبنحوله هنا
    setSelectedPlan({
      id: plan.id,
      name: plan.name,
      title: plan.title,
      price: plan.price,
      description: plan.description || "",
    });
    setModalOpen(true);
  }

  function handlePaymentSuccess(membership: MembershipStatus) {
    setCurrentMembership(membership);
    onMembershipUpdate?.(membership);
  }

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
              plan.name?.toLowerCase() === "premium" ? "premium" : "standard";

            const popular =
              plan.name === "Premium" && plan.title === "1 Year";

            const isCurrentActivePlan =
              currentMembership?.isActive &&
              currentMembership.membershipPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`pricing-card ${typeClass} ${
                  popular ? "popular" : ""
                }`}
              >
                <div className="pricing-inner flex flex-col">
                  {popular && !isCurrentActivePlan && (
                    <div className="popular-badge">MOST VALUE</div>
                  )}

                  {isCurrentActivePlan && (
                    <div className="popular-badge !bg-green-500 !text-black">
                      <Check size={14} />
                      YOUR CURRENT PLAN
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {plan.name}
                    </h3>

                    <div>
                      <span className="price">EGP{plan.price}</span>
                      <span className="period"> / {plan.title}</span>
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
                    <button
                      onClick={() => handleSubscribeClick(plan)}
                      disabled={isCurrentActivePlan}
                      className={`cta-btn w-full h-12 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                        isCurrentActivePlan
                          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                          : "bg-[#84FF00] text-black hover:scale-[1.02]"
                      }`}
                    >
                      {isCurrentActivePlan ? "Active" : "Subscribe"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PaymentModal
        open={modalOpen}
        plan={selectedPlan}
        onClose={() => setModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </section>
  );
}

export default AllPlans;