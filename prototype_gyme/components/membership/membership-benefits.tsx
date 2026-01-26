"use client"

import { Shield, Clock, Users, Smartphone } from "lucide-react"
import "@/styles/membership-benefits.css"

export function MembershipBenefits() {
  const benefits = [
    {
      icon: Shield,
      title: "No Commitment",
      description:
        "Cancel anytime with no penalties or hidden fees. Your fitness, your terms.",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description:
        "Train whenever it fits your schedule with round-the-clock facility access.",
    },
    {
      icon: Users,
      title: "Community Support",
      description:
        "Join a motivating community of like-minded fitness enthusiasts.",
    },
    {
      icon: Smartphone,
      title: "Mobile App",
      description:
        "Book classes, track workouts, and connect with trainers from your phone.",
    },
  ]

  /* نكرر الداتا علشان الحركة تبقى لا نهائية */
  const loopedBenefits = [...benefits, ...benefits]

  return (
    <section className="benefits-section">
      <div className="container mx-auto px-4">
        {/* TITLE */}
        <div className="benefits-header">
          <h2>
            MEMBERSHIP <span>BENEFITS</span>
          </h2>
          <p>
            Every membership comes with premium benefits designed to support
            your success.
          </p>
        </div>

        {/* SLIDER */}
        <div className="benefits-slider">
          <div className="benefits-track">
            {loopedBenefits.map((benefit, index) => (
              <div className="benefit-card" key={index}>
                <benefit.icon className="icon" />
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
