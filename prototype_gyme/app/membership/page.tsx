"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { MembershipHero } from "@/components/membership/membership-hero";
import { PricingPlans } from "@/components/membership/pricing-plans";
import { AllPlans } from "@/components/membership/AllPlans";
import { MembershipBenefits } from "@/components/membership/membership-benefits";
import { Button } from "@/components/ui/button";

export default function MembershipPage() {
  const [showAllPlans, setShowAllPlans] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <main className="pt-16">
        <MembershipHero />

        {/* 🔥 TOGGLE BUTTON */}
        <div className="flex justify-center my-12">
  <button
    onClick={() => setShowAllPlans(prev => !prev)}
    className="led-toggle"
  >
    {showAllPlans ? "Show Main Plans" : "Get All Plans"}
  </button>
</div>

        {/* 🔥 CONDITIONAL RENDER */}
        {showAllPlans ? <AllPlans /> : <PricingPlans />}

        <MembershipBenefits />
      </main>

      <Footer />
    </div>
  );
}
