import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { MembershipHero } from "@/components/membership/membership-hero"
import { PricingPlans } from "@/components/membership/pricing-plans"
import { MembershipBenefits } from "@/components/membership/membership-benefits"


export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="pt-16">
        <MembershipHero />
        <PricingPlans />
        <MembershipBenefits />
      
      </main>
      <Footer />
    </div>
  )
}
