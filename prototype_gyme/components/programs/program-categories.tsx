"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dumbbell, Flame, Swords, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

// =============================
type Track = {
  id: number;
  name: string;
  description: string;
};

export default function ProgramCategories() {
  const [tracks, setTracks] = useState<Track[]>([]);
const [visible, setVisible] = useState(true);

  // =============================
  // FETCH
  // =============================
  useEffect(() => {
    async function loadTracks() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/Track`
      );
      const data = await res.json();
      setTracks(data);
    }
    loadTracks();
  }, []);

  // =============================
  // SECTION ANIMATION TRIGGER
  // =============================
  useEffect(() => {
    const section = document.getElementById("programs-section");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (section) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // =============================
  // MAPPING
  // =============================
  const trackMap: Record<
    string,
    { image: string; icon: any; color: string }
  > = {
    "Strength & Hypertrophy": {
      image: "/strength-training-class.jpg",
      icon: Dumbbell,
      color: "text-[#84FF00]",
    },
    Conditioning: {
      image: "/cardio-hiit-class.jpg",
      icon: Flame,
      color: "text-[#FF6B00]",
    },
    "Functional Fitness": {
      image: "/crossfit-class.jpg",
      icon: Swords,
      color: "text-[#84FF00]",
    },
    "Mobility & Recovery": {
      image: "/wellness-class.jpg",
      icon: Heart,
      color: "text-[#00D9FF]",
    },
  };

  if (!tracks.length) return null;

  return (
    <section id="programs-section" className="py-28 bg-black">
      <div className="container  mx-auto px-5 mx-7">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-white mb-4 tracking-tight">
            EXPLORE <span className="text-[#84FF00]">PROGRAMS</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Elite training categories built for real results.
          </p>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {tracks.map((track, i) => {
            const config = trackMap[track.name];

            const Icon = config?.icon || Dumbbell;
            const image = config?.image || "/placeholder.jpg";
            const color = config?.color || "text-white";

            return (
              <div
                key={track.id}
                className={`group relative rounded-2xl overflow-hidden border border-white/10 
                bg-gradient-to-b from-white/5 to-white/[0.02]
                transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(132,255,0,0.25)]
                
                ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{
                  transitionDelay: `${i * 120}ms`,
                }}
              >
                {/* IMAGE */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={image}
                    alt={track.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition" />

                  {/* ICON */}
                  <div className="absolute top-4 right-4">
                    <Icon className={`h-10 w-10 ${color}`} />
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6 flex flex-col h-[260px]">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {track.name}
                  </h3>

                  <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                    {track.description}
                  </p>

                  {/* BUTTON */}
                  <Link href={`/programs/${track.id}`} className="mt-auto">
                    <Button
                      className="w-full bg-white text-black font-semibold 
                      hover:bg-[#84FF00] transition-all duration-300"
                    >
                      Start Training
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}