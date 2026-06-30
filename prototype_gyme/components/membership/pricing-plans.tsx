"use client";

import { useEffect, useState } from "react";
import {
  getMemberships,
  getMyMembership,
  Membership,
  MembershipStatus,
} from "@/lib/membership";
import { Check, Zap } from "lucide-react";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { PaymentModal } from "@/components/membership/payment-modal";

type Props = {
  // اختياري: تستخدمه الصفحة الأم لو عايزة تعرف فورًا لما الاشتراك يتفعل
  onMembershipUpdate?: (membership: MembershipStatus) => void;
};

export function PricingPlans({ onMembershipUpdate }: Props = {}) {
  const [plans, setPlans] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // الباقة المختارة حاليًا عشان نفتح بيها المودال
  const [selectedPlan, setSelectedPlan] = useState<Membership | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // الاشتراك الحالي للمستخدم (لو موجود)
  const [currentMembership, setCurrentMembership] =
    useState<MembershipStatus | null>(null);

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
        const [plansData, membershipData] = await Promise.all([
          getMemberships(),
          getMyMembership(),
        ]);

        setPlans(plansData);
        setCurrentMembership(membershipData);
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
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.35 },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [plans]);

  function handleSubscribeClick(plan: Membership) {
    setSelectedPlan(plan);
    setModalOpen(true);
  }

  function handlePaymentSuccess(membership: MembershipStatus) {
    setCurrentMembership(membership);
    onMembershipUpdate?.(membership);
  }

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
            {[1, 2].map((i) => (
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
          {plans.map((plan) => {
            const popular = plan.name === "Standard";

            // الباقة دي هي نفس الباقة الفعالة عند المستخدم دلوقتي؟
            const isCurrentActivePlan =
              currentMembership?.isActive &&
              currentMembership.membershipPlanId === plan.id;

            const features =
              plan.description
                ?.split(",")
                .map((f) => f.trim())
                .filter(Boolean) || [];

            return (
              <div
                key={plan.id}
                className={`pricing-card ${
                  popular ? "popular" : ""
                } h-full flex`}
              >
                <div className="pricing-inner flex flex-col w-full p-8">
                  {popular && !isCurrentActivePlan && (
                    <div className="popular-badge">
                      <Zap size={14} />
                      MOST POPULAR
                    </div>
                  )}

                  {isCurrentActivePlan && (
                    <div className="popular-badge !bg-green-500 !text-black">
                      <Check size={14} />
                      YOUR CURRENT PLAN
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-extrabold text-white mb-4">
                      {plan.name}
                    </h3>

                    <div>
                      <span className="price">EGP{plan.price}</span>
                      <span className="period"> / {plan.title}</span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-grow">
                    {features.map((feature) => (
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