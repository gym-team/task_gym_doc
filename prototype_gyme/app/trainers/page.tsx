import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { TrainersGrid } from "@/components/trainers/trainers-grid"
import { TrainersHero } from "@/components/trainers/trainers-hero"

export default function TrainersPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="pt-16">
        <TrainersHero />
        <TrainersGrid />
      </main>
      <Footer />
    </div>
  )
}
