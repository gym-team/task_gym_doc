"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Dumbbell, Flame, Swords, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/card-skeleton";

type Track = {
  id: number;
  name: string;
  description: string;
};

export default function ProgramCategories() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // =============================
  // FETCH
  // =============================
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Track`);
        const data = await res.json();
        setTracks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // =============================
  // CARD SCROLL ANIMATION
  // =============================
  useEffect(() => {
    if (!tracks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("card-visible");
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [tracks]);

  // =============================
  // LOADING STATE
  // =============================
  if (loading) {
    return (
      <section className="py-28 bg-black">
        <div className="container mx-auto px-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!tracks.length) return null;

  // =============================
  // MAIN UI
  // =============================
  return (
    <>
      {/* Inject animation styles once */}
      <style>{`
        .track-card {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.6s ease, transform 0.6s ease,
                      box-shadow 0.3s ease, translate 0.3s ease;
        }
        .track-card.card-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .track-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 10px 40px rgba(132, 255, 0, 0.25);
        }
      `}</style>

      <section id="programs-section" className="py-28">
        <div className="container mx-auto px-5">

          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4 tracking-tight">
              EXPLORE <span className="text-[#84FF00]">Tracks</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Elite training categories built for real results.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {tracks.map((track, i) => {
              const trackMap: Record<string, { image: string; icon: any; color: string }> = {
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

              const config = trackMap[track.name];
              const Icon = config?.icon ?? Dumbbell;
              const image = config?.image ?? "/placeholder.jpg";
              const color = config?.color ?? "text-white";

              return (
                <div
                  key={track.id}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  className="track-card group relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02]"
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={image}
                      alt={track.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute top-4 right-4">
                      <Icon className={`h-10 w-10 ${color}`} />
                    </div>
                  </div>

                  <div className="p-6 flex flex-col h-[260px]">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {track.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      {track.description}
                    </p>
                    <Link href={`/plans/${track.id}`} className="mt-auto">
                      <Button className="w-full bg-white text-black font-semibold hover:bg-[#84FF00]">
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
    </>
  );
}