
import "@/styles/membership-hero.css"
export function MembershipHero() {
  return (
    <section
      className="relative min-h-screen overflow-hidden hero-bg hero-shadow"
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/3d-gym-equipment.jpg')] bg-cover bg-center scale-110 animate-bgSlow" />

      {/* Dark + Blur Layer (Controllable) */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Soft LED Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#84FF00]/20 blur-3xl rounded-full animate-floatSlow" />
      <div className="absolute bottom-20 -left-32 w-[400px] h-[400px] bg-[#84FF00]/10 blur-3xl rounded-full animate-pulseSlow" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-3xl px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 animate-glow">
            CHOOSE YOUR{" "}
            <span className="text-[#84FF00]">PLAN</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 animate-fadeUp">
            Flexible membership options designed to fit your lifestyle and fitness goals.
          </p>

          <div className="inline-flex items-center  animated-border-pill gap-2 bg-white/5 backdrop-blur-md border border-[#84FF00]/30 rounded-full px-6 py-3 shadow-[0_0_25px_rgba(132,255,0,0.3)] animate-fadeUp delay-200">
            <span className="text-[#84FF00] font-bold">✓</span>
            <span className="text-white text-sm">
              No commitment • Cancel anytime • 7-day money-back guarantee
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
