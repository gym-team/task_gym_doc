"use client";

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Target, Users, Award, Heart } from "lucide-react";
import { motion, type Variants } from "framer-motion";

/* ================== ANIMATIONS ================== */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <main className="pt-16">
        {/* ================== HERO + MISSION + VISION (ONE BACKGROUND) ================== */}
        <section className="relative overflow-hidden">
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/3d-gym-equipment.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/80" />

          <div className="relative z-10">
            {/* HERO */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="container mx-auto px-4 py-32 text-center"
            >
              <h1
                className="text-5xl md:text-7xl font-black text-white mb-6"
                style={{
                  textShadow:
                    "0 0 25px rgba(132,255,0,0.6), 0 0 60px rgba(132,255,0,0.4)",
                }}
              >
                ABOUT <span className="text-[#84FF00]">FITZONE</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                More than a gym. We're a community dedicated to transforming
                lives through fitness, nutrition, and unwavering support.
              </p>
            </motion.div>

            {/* MISSION & VISION */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="container mx-auto px-4 pb-32"
            >
              <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {/* Mission */}
                <motion.div
                  variants={fadeLeft}
                  className="bg-white/5 border border-white/10 rounded-2xl p-8
                  hover:shadow-[0_0_40px_rgba(132,255,0,0.4)]
                  transition-shadow duration-500"
                >
                  <Target className="h-12 w-12 text-[#84FF00] mb-4" />
                  <h2 className="text-3xl font-black text-white mb-4">
                    Our Mission
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    To empower individuals to achieve their fitness goals
                    through expert guidance, state-of-the-art facilities, and a
                    supportive community that celebrates every victory.
                  </p>
                </motion.div>

                {/* Vision */}
                <motion.div
                  variants={fadeRight}
                  className="bg-white/5 border border-white/10 rounded-2xl p-8
                  hover:shadow-[0_0_40px_rgba(255,107,0,0.4)]
                  transition-shadow duration-500"
                >
                  <Heart className="h-12 w-12 text-[#FF6B00] mb-4" />
                  <h2 className="text-3xl font-black text-white mb-4">
                    Our Vision
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    To be the leading fitness destination where people don’t
                    just work out—they transform their lives and inspire others.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================== STORY ================== */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-24 bg-gradient-to-b from-black to-[#0A0A0A]"
        >
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-4xl font-black text-white mb-8">Our Story</h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                FitZone was founded by fitness enthusiasts who believed that
                everyone deserves access to world-class training and support.
              </p>
              <p>
                What started as a small gym evolved into a thriving community
                helping thousands reach their goals.
              </p>
              <p>
                Today, FitZone stands as a symbol of transformation, discipline,
                and lasting results.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ================== VALUES ================== */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-20 bg-black"
        >
          <div className="container mx-auto px-4">
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-black text-white mb-12 text-center"
            >
              Our Values
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                { icon: Users, title: "Community", desc: "We grow stronger together." },
                { icon: Award, title: "Excellence", desc: "We never settle for less." },
                { icon: Heart, title: "Inclusivity", desc: "Everyone belongs here." },
                { icon: Target, title: "Results", desc: "Real goals. Real outcomes." },
              ].map((v, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="text-center bg-white/5 border border-white/10 rounded-xl p-6
                  hover:shadow-[0_0_35px_rgba(132,255,0,0.35)]
                  transition-all duration-500"
                >
                  <v.icon className="h-12 w-12 text-[#84FF00] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {v.title}
                  </h3>
                  <p className="text-gray-400">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ================== FACILITIES ================== */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-24 bg-gradient-to-b from-black to-[#0A0A0A]"
        >
          <div className="container mx-auto px-4">
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-black text-white mb-12 text-center"
            >
              WORLD-CLASS <span className="text-[#84FF00]">FACILITIES</span>
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { title: "Strength Zone", img: "/fitness-athlete.jpg" },
                { title: "Cardio Theater", img: "/blog-post-cardio.jpg" },
                { title: "Group Studios", img: "/blog-workout-recovery.jpg" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-white/5 border border-white/10 rounded-xl overflow-hidden
                  hover:shadow-[0_0_40px_rgba(132,255,0,0.4)]
                  transition-shadow duration-500"
                >
                  <img
                    src={f.img || "/placeholder.svg"}
                    alt={f.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white">{f.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
