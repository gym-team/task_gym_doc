
import "@/styles/trainers-hero.css";
export function TrainersHero() {
  return (
    <section className="trainers-hero">

      {/* Background */}
      <div className="th-bg-img" />

      {/* Overlays */}
      <div className="th-overlay-dark" />
      <div className="th-overlay-gradient" />

      {/* Grid */}
      <div className="th-grid" />

      {/* Glow Effects */}
      <div className="th-glow-center" />
      <div className="th-glow-tl" />
      <div className="th-glow-br" />

      {/* Scan Line */}
      <div className="th-scanline" />

      {/* Noise Texture */}
      <div className="th-noise" />

      {/* Content */}
      <div className="th-content-wrapper">
        <div className="th-content">

          {/* Eyebrow */}
          <div className="th-eyebrow">
            <div className="th-eyebrow-dot" />

            <span className="th-eyebrow-text">
              Professional Fitness Coaches
            </span>
          </div>

          {/* Heading */}
          <h1 className="th-title">
            MEET OUR
            <br />

            <span className="th-accent">
              EXPERT TRAINERS
            </span>
          </h1>

          {/* Description */}
          <p className="th-subtitle">
            Our certified professionals are dedicated to helping you
            achieve your fitness goals. Each trainer brings unique
            expertise and passion to guide your transformation journey.
          </p>

        </div>
      </div>
    </section>
  );
}