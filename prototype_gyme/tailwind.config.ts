// tailwind.config.ts
//
// Merge this `theme.extend` block into your existing tailwind.config.
// Only additive tokens are listed here — nothing here should override
// unrelated config already in your repo.

import type { Config } from "tailwindcss";

const config: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // Brand — brief section 2 "Color Palette"
        "brand-green": "#84FF00",
        "brand-orange": "#FF6B00",
        "brand-cyan": "#00D9FF",
        "bg-primary": "#050505",
        "bg-secondary": "#0A0A0A",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(to bottom, rgba(132,255,0,0.14), rgba(0,0,0,0.18), #050505)",
        "card-gradient":
          "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
      },
      borderRadius: {
        card: "24px",
      },
      boxShadow: {
        "card-hover": "0 10px 40px rgba(132,255,0,0.25)",
      },
      spacing: {
        "section-sm": "6rem", // py-24
        section: "7rem", // py-28
        "section-lg": "8rem", // py-32
      },
      transitionDuration: {
        card: "300ms",
      },
    },
  },
};

export default config;
