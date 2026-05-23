"use client";

import type React from "react";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/* ================== ANIMATION VARIANTS ================== */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeDown: Variants = {
  hidden: { opacity: 0, y: -50 },
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

/* ================== PAGE ================== */

export default function ContactPage() {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <main className="pt-16">
        {/* ================== HERO ================== */}
        {/* ================== HERO ================== */}
        <section className="relative py-32 overflow-hidden isolate">
          {/* Background Image */}
      {/* Background Image */}
<div
  className="absolute inset-0 bg-cover bg-center scale-105"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')",
  }}
/>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/75" />

          {/* Green Gradient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(132,255,0,0.18),transparent_45%)]" />

          {/* Bottom Fade */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black" />

          {/* Animated Blur Circles */}
          <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-[#84FF00]/10 rounded-full blur-3xl" />

          <div className="absolute bottom-[-140px] right-[-100px] w-[320px] h-[320px] bg-[#84FF00]/10 rounded-full blur-3xl" />

          {/* Grid Effect */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
        linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
      `,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.h1
              variants={fadeDown}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
              style={{
                textShadow:
                  "0 0 25px rgba(132,255,0,0.6), 0 0 60px rgba(132,255,0,0.35)",
              }}
            >
              GET IN <span className="text-[#84FF00]">TOUCH</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Have questions? Want to schedule a tour? We're here to help you
              start your fitness journey.
            </motion.p>
          </div>
        </section>

        {/* ================== CONTENT ================== */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
              {/* ================== INFO + MAP ================== */}
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.h2
                  variants={fadeLeft}
                  className="text-3xl font-black text-white mb-8"
                >
                  Contact Information
                </motion.h2>

                <div className="space-y-6">
                  <motion.div variants={fadeLeft} className="flex gap-4">
                    <div className="bg-[#84FF00]/10 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-[#84FF00]" />
                    </div>
                    <p className="text-gray-400">GYM Location – Cairo, Egypt</p>
                  </motion.div>

                  <motion.div variants={fadeLeft} className="flex gap-4">
                    <div className="bg-[#84FF00]/10 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-[#84FF00]" />
                    </div>
                    <p className="text-gray-400">+20 1010083896</p>
                  </motion.div>

                  <motion.div variants={fadeLeft} className="flex gap-4">
                    <div className="bg-[#84FF00]/10 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-[#84FF00]" />
                    </div>
                    <p className="text-gray-400">info@gym.com</p>
                  </motion.div>

                  <motion.div variants={fadeLeft} className="flex gap-4">
                    <div className="bg-[#84FF00]/10 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-[#84FF00]" />
                    </div>
                    <p className="text-gray-400">Daily: 6:00 AM – 12:00 AM</p>
                  </motion.div>
                </div>

                {/* 🗺️ MAP */}
                <motion.div
                  variants={fadeUp}
                  className="mt-10 aspect-video rounded-xl overflow-hidden border border-white/10"
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1848.919017867605!2d30.696311879766146!3d30.76566320301864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f63ab0a29a1291%3A0x5bafb4a11dc339a3!2zUU04VytIRlHYjCDYqNmK2KjYp9mG2Iwg2YXYsdmD2LIg2YPZiNmFINit2YXYp9iv2KnYjCDZhdit2KfZgdi42Kkg2KfZhNio2K3Zitix2KkgNTc2NDYwNw!5e1!3m2!1sar!2seg!4v1769741146738!5m2!1sar!2seg"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                </motion.div>
              </motion.div>

              {/* ================== FORM ================== */}
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.h2
                  variants={fadeRight}
                  className="text-3xl font-black text-white mb-8"
                >
                  Send Us a Message
                </motion.h2>

                <motion.form
                  onSubmit={handleSubmit}
                  variants={stagger}
                  className="space-y-6"
                >
                  <motion.input
                    variants={fadeUp}
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#84FF00]"
                    required
                  />

                  <motion.input
                    variants={fadeUp}
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#84FF00]"
                    required
                  />

                  <motion.input
                    variants={fadeUp}
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#84FF00]"
                  />

                  <motion.textarea
                    variants={fadeUp}
                    placeholder="Message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none resize-none focus:border-[#84FF00]"
                    required
                  />

                  <motion.div variants={fadeUp}>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-[#84FF00] text-black font-bold hover:bg-[#84FF00]/90"
                    >
                      Send Message
                    </Button>
                  </motion.div>
                </motion.form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
