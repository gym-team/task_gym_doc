import "@/styles/Track_hero.css";
export function ProgramsHero() {
  return (
    <>
      

      <section className="relative py-30 md:py-52 overflow-hidden" style={{ background: "#050505" }}>

        {/* Background Image */}
        <div className="ph-bg-img" />

        {/* Dark Overlay */}
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.70)" }} />

        {/* Green Gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(132,255,0,0.14) 0%, rgba(0,0,0,0.18) 50%, #050505 100%)" }} />

        {/* Drifting Grid */}
        <div className="ph-grid" />

        {/* Glow Orbs */}
        <div className="ph-glow-tl" />
        <div className="ph-glow-br" />

        {/* Scan Line */}
        <div className="ph-scan" />

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">

            {/* Eyebrow */}
            <div className="ph-eyebrow">
              <div className="ph-eyebrow-dot" />
              <span style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#84FF00", fontWeight: 700 }}>
                Training Programs
              </span>
            </div>

            {/* Heading */}
            <h1 className="ph-h1">
              TRACKS &amp;<br />
              <span className="ph-accent">PROGRAMS</span>
            </h1>

            {/* Subheading */}
            <p className="ph-sub">
              From high-intensity training to mindful yoga, discover programs
              designed to challenge, inspire, and transform. Over 100 weekly
              classes led by expert instructors.
            </p>

            {/* Stat Chips */}
            <div className="ph-stats">
              <div className="ph-stat">
                <span className="ph-stat-num">100+</span>
                <span className="ph-stat-label">Weekly classes</span>
              </div>
              <div className="ph-stat">
                <span className="ph-stat-num">20+</span>
                <span className="ph-stat-label">Expert instructors</span>
              </div>
              <div className="ph-stat">
                <span className="ph-stat-num">8</span>
                <span className="ph-stat-label">Program tracks</span>
              </div>
            </div>

            {/* Guarantee Pill */}
            <div className="ph-pill">
              <span style={{ color: "#84FF00", fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)" }}>
                All levels welcome &nbsp;•&nbsp; Beginner to advanced &nbsp;•&nbsp; New classes every week
              </span>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}