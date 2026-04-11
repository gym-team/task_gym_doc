import { Dumbbell, Apple, MessageCircle, Users, Globe, ShoppingBag } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Dumbbell,
      title: "Exercises",
      description: "Explore a variety of guided exercises tailored to all fitness levels.",
      color: "text-[#84FF00]",
      image: "/sport-lifestyle-fitness-male-training.jpg",
    },
    {
      icon: Apple,
      title: "Nutrition Plans",
      description: "Get personalized meal plans designed to match your fitness goals.",
      color: "text-[#FF6B00]",
      image: "/healthy-meal-prep.jpg",
    },
    {
      icon: MessageCircle,
      title: "Chatbot",
      description: "AI-powered assistant to guide you through workouts  , diet plans and  answer your questions.",
      color: "text-[#00D9FF]",
      image: "/195.jpg",
    },
    {
      icon: Users,
      title: "Expert Trainers",
      description: "Certified professionals ready to help you achieve your best shape.",
      color: "text-[#84FF00]",
      image: "/personal-trainer-coaching.jpg",
    },
    {
      icon: Globe,
      title: "Community",
      description: "Join a strong fitness community and connect with other athletes.",
      color: "text-[#FF6B00]",
      image: "/group-fitness-class.jpg",
    },
    {
      icon: ShoppingBag,
      title: "Check our Sales Product",
      description: "Explore our exclusive fitness products, supplements, and accessories.",
      color: "text-[#00D9FF]",
      image: "/OLS5860.jpg",
    },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            WHY CHOOSE <span className="text-[#84FF00]">FITZONE</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to transform your fitness journey in one premium facility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-[#84FF00]/50 hover:shadow-[0_10px_40px_rgba(132,255,0,0.15)] hover:-translate-y-2 transition-all duration-500 group cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
                />

                {/* 🎯 FIXED OVERLAY — prevents shaking on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none will-change-auto transform-none" />

                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/80 backdrop-blur-sm p-3 rounded-lg">
                    <feature.icon
                      className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#84FF00] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
