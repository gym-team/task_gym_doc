"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

import PlanCard from "@/components/plans/plan-card";
import Filters from "@/components/plans/filters";
import Pagination from "@/components/plans/pagination";
import { PremiumGymBackground } from "@/components/PremiumGymBackground";

export default function PlansPage() {
  const params = useParams();
  const trackId = Number(params?.trackId);

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    level: "",
    goal: "",
  });

  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setPageIndex(1);
  }, [filters]);

  useEffect(() => {
    if (!trackId) return;

    async function fetchPlans() {
      setLoading(true);

      try {
        const query = new URLSearchParams({
          TrackID: String(trackId),
          PageIndex: String(pageIndex),
          PageSize: "6",
          ...(filters.level && { Level: filters.level }),
          ...(filters.goal && { Goal: filters.goal }),
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/Program?${query}`
        );

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        setPlans(data?.data || []);
        setTotalPages(Math.ceil(data.totalCount / data.pageSize));
      } catch (err) {
        console.error(err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, [trackId, filters, pageIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />

        <section className="pt-16 min-h-screen flex items-center justify-center">
          <p className="text-white text-lg">Loading plans...</p>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="pt-16">
        {/* HERO */}
        <section className="relative h-[65vh] overflow-hidden flex items-center justify-center">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="/vecteezy_modern-neon-lit-gym-interior-featuring-treadmills-and_62263172.mp4"
              type="video/mp4"
            />
          </video>

          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#84FF00]/20 via-transparent to-[#84FF00]/10" />

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-10 text-center px-4"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-5xl md:text-7xl font-black mb-6"
            >
              EXPLORE{" "}
              <span className="text-[#84FF00] drop-shadow-[0_0_25px_#84FF00]">
                ELITE PLANS
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto"
            >
              Elite training programs crafted to transform your physique,
              maximize performance, and deliver real results.
            </motion.p>
          </motion.div>

          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
        </section>

        {/* PLANS SECTION */}
        <section
  className="
    relative overflow-hidden
    bg-[linear-gradient(180deg,#050505_0%,#081006_30%,rgba(132,255,0,0.08)_100%)]
  "
>
  <PremiumGymBackground />

  {/* Extra Overlay */}
  <div className="absolute inset-0 bg-black/40 z-[1]" />

  {/* Top Black Blend */}
  <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black via-black/90 to-transparent z-[2]" />

  {/* Bottom Blend */}
  <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black to-transparent z-[2]" />

  <div className="relative z-10 container mx-auto px-5 py-20">
    <Filters filters={filters} setFilters={setFilters} />

    <div className="flex flex-wrap justify-center gap-8 mt-12">
      {plans.length === 0 && (
        <p className="text-gray-400 text-center w-full">
          No plans available
        </p>
      )}

      {plans.map((plan, i) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="
            w-full
            sm:w-[calc(50%-1rem)]
            lg:w-[calc(33.333%-1.5rem)]
            max-w-sm
          "
        >
          <PlanCard plan={plan} trackId={trackId} />
        </motion.div>
      ))}
    </div>

    {plans.length > 0 && (
      <div className="mt-14">
        <Pagination
          pageIndex={pageIndex}
          totalPages={totalPages}
          setPageIndex={setPageIndex}
        />
      </div>
    )}
  </div>
</section>
      </main>

      <Footer />
    </div>
  );
}