import { Shield, Clock, Users, Heart, Trophy, Smartphone } from "lucide-react"

export function MembershipBenefits() {
  const benefits = [
    {
      icon: Shield,
      title: "No Commitment",
      description: "Cancel anytime with no penalties or hidden fees. Your fitness, your terms.",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Train whenever it fits your schedule with round-the-clock facility access.",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join a motivating community of like-minded fitness enthusiasts.",
    },
    
    
    {
      icon: Smartphone,
      title: "Mobile App",
      description: "Book classes, track workouts, and connect with trainers from your phone.",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-black to-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            MEMBERSHIP <span className="text-[#84FF00]">BENEFITS</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Every membership comes with premium benefits designed to support your success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-[#84FF00]/50 transition-all duration-300"
            >
              <benefit.icon className="h-12 w-12 text-[#84FF00] mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
              <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
