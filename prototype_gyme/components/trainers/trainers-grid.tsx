"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

// =============================
// TYPE
// =============================
type Coach = {
  id: number;
  fullName: string;
  about: string;
  yearsOfExperience: number;
  rating: number;
  price: number;
  photoUrl: string | null;
  programCount: number;
};

export function TrainersGrid() {
  const [trainers, setTrainers] = useState<Coach[]>([]);

  // =============================
  // FETCH FROM API
  // =============================
  useEffect(() => {
    async function loadCoaches() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/Coach`
        );
        const data = await res.json();
        setTrainers(data);
      } catch (err) {
        console.error("Failed to load coaches", err);
      }
    }

    loadCoaches();
  }, []);

  if (!trainers.length) return null;

  return (
    <section className="py-16 bg-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-[#84FF00]/50 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(132,255,0,0.2)]"
            >
              {/* IMAGE */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={
                    trainer.photoUrl
                      ? trainer.photoUrl
                      : "/default-trainer.png" // 👈 fallback image
                  }
                  alt={trainer.fullName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent group-hover:from-black/90 group-hover:via-black/50 transition-all duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-[#84FF00]/15 to-transparent" />

                {/* SOCIAL (static زي ما هو) */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <a className="bg-white/10 backdrop-blur-sm p-2 rounded-full hover:bg-[#84FF00] hover:text-black transition-all duration-300">
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a className="bg-white/10 backdrop-blur-sm p-2 rounded-full hover:bg-[#84FF00] hover:text-black transition-all duration-300">
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a className="bg-white/10 backdrop-blur-sm p-2 rounded-full hover:bg-[#84FF00] hover:text-black transition-all duration-300">
                    <Facebook className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* INFO */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {trainer.fullName}
                </h3>

                <p className="text-[#84FF00] font-medium mb-3">
                  {trainer.yearsOfExperience} years experience
                </p>

                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {trainer.about}
                </p>

                {/* EXTRA INFO بدل certifications */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full">
                    ⭐ {trainer.rating}
                  </span>
                  <span className="bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full">
                    💰 ${trainer.price}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-sm text-gray-400">
                    {trainer.programCount} programs
                  </span>

                  <Link href={`/trainers/${trainer.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#84FF00] text-[#84FF00] hover:bg-[#84FF00] hover:text-black bg-transparent"
                    >
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}