"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { MembershipHero } from "@/components/membership/membership-hero";
import { PricingPlans } from "@/components/membership/pricing-plans";
import { AllPlans } from "@/components/membership/AllPlans";
import { MembershipBenefits } from "@/components/membership/membership-benefits";
import { MembershipStatusCard } from "@/components/membership/membership-status";
import { getMyMembership, MembershipStatus } from "@/lib/membership";

export default function MembershipPage() {
  const [showAllPlans, setShowAllPlans] = useState(false);

  // حالة الاشتراك على مستوى الصفحة كلها، عشان الكارد اللي فوق
  // يتحدث فورًا بعد نجاح الدفع من جوة PricingPlans أو AllPlans
  const [currentMembership, setCurrentMembership] =
    useState<MembershipStatus | null>(null);
  const [checkingMembership, setCheckingMembership] = useState(true);

  useEffect(() => {
    async function loadMembership() {
      try {
        const data = await getMyMembership();
        setCurrentMembership(data);
      } catch (err) {
        console.error("Failed to load current membership", err);
      } finally {
        setCheckingMembership(false);
      }
    }

    loadMembership();
  }, []);

  function handleMembershipUpdate(membership: MembershipStatus) {
    setCurrentMembership(membership);
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <main className="pt-16">
        <MembershipHero />

        {/* CURRENT MEMBERSHIP STATUS */}
        {!checkingMembership && currentMembership?.isActive && (
          <div className="pt-16 px-4">
            <MembershipStatusCard membership={currentMembership} />
          </div>
        )}

        {/* PLANS SECTION WITH BACKGROUND */}

        {/* Toggle Button */}
        <div className="flex justify-center my-12">
          <button
            onClick={() => setShowAllPlans((prev) => !prev)}
            className="
                  px-8 py-3 rounded-xl
                  font-bold tracking-wide
                  bg-black/40 backdrop-blur-md
                  border border-[#84FF00]/30
                  text-[#84FF00]
                  transition-all duration-300
                  hover:bg-[#84FF00]
                  hover:text-black
                  hover:shadow-[0_0_25px_rgba(132,255,0,0.45)]
                "
          >
            {showAllPlans ? "Show Main Plans" : "Get All Plans"}
          </button>
        </div>

        {/* Conditional Plans */}
        {showAllPlans ? (
          <AllPlans onMembershipUpdate={handleMembershipUpdate} />
        ) : (
          <PricingPlans onMembershipUpdate={handleMembershipUpdate} />
        )}

        <MembershipBenefits />
      </main>

      <Footer />
    </div>
  );
}