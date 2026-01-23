export function MembershipHero() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0A0A0A] to-black" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
            CHOOSE YOUR <span className="text-[#84FF00]">PLAN</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed mb-8">
            Flexible membership options designed to fit your lifestyle and fitness goals. All plans include access to
            our world-class facilities and expert support.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#84FF00]/10 border border-[#84FF00]/30 rounded-full px-6 py-3">
            <span className="text-[#84FF00] font-bold">✓</span>
            <span className="text-white text-sm">No commitment • Cancel anytime • 7-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </section>
  )
}
