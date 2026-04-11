import Link from "next/link";
import { Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// =============================
// TYPE مطابق للـ API
// =============================
export interface Trainer {
  id: number;
  fullName: string;
  about: string;
  yearsOfExperience: number;
  rating: number;
  price: number;
  photoUrl: string | null;
  programCount: number;
}

interface TrainerDetailProps {
  trainer: Trainer;
}

export function TrainerDetail({ trainer }: TrainerDetailProps) {
  return (
    <div className="bg-black">

      {/* HERO */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">

            {/* IMAGE */}
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border-4 border-[#84FF00]">
              <img
                src={trainer.photoUrl || "/default-trainer.png"}
                alt={trainer.fullName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* INFO */}
            <div>
              <h1 className="text-5xl font-black text-white mb-4">
                {trainer.fullName}
              </h1>

              {/* EXPERIENCE */}
              <div className="flex items-center gap-3 mb-4 text-gray-400">
                <Calendar className="h-5 w-5" />
                <span>{trainer.yearsOfExperience} years experience</span>
              </div>

              {/* RATING */}
              <div className="flex items-center gap-3 mb-6 text-gray-400">
                <Star className="h-5 w-5 text-yellow-400" />
                <span>{trainer.rating} rating</span>
              </div>

              {/* ABOUT */}
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {trainer.about}
              </p>

              {/* CTA */}
              <Link href={`/book-trainer?trainer=${trainer.id}`}>
                <Button className="bg-[#84FF00] text-black font-bold hover:bg-[#84FF00]/90">
                  Book Session - ${trainer.price}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-black text-white mb-6">
            About {trainer.fullName?.split(" ")[0]}
          </h2>

          <p className="text-gray-300 leading-relaxed">
            {trainer.about}
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-white/5">
        <div className="container mx-auto px-4 max-w-4xl grid md:grid-cols-3 gap-6 text-center">

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <p className="text-3xl font-bold text-[#84FF00]">
              {trainer.yearsOfExperience}
            </p>
            <p className="text-gray-400">Years Experience</p>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <p className="text-3xl font-bold text-[#84FF00]">
              {trainer.rating}
            </p>
            <p className="text-gray-400">Rating</p>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <p className="text-3xl font-bold text-[#84FF00]">
              {trainer.programCount}
            </p>
            <p className="text-gray-400">Programs</p>
          </div>

        </div>
      </section>

    </div>
  );
}