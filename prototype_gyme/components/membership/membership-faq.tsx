"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function MembershipFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "Can I cancel my membership anytime?",
      answer:
        "Yes! All our memberships are month-to-month with no long-term contracts. You can cancel anytime with no penalties or cancellation fees. Just give us 30 days notice.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "We offer a 7-day money-back guarantee on all memberships. Try us out for a week, and if you're not satisfied, we'll refund your first month's payment in full.",
    },
    {
      question: "Can I freeze my membership?",
      answer:
        "Yes, you can freeze your membership for up to 3 months per year for medical reasons, travel, or other circumstances. Just contact our member services team.",
    },
    {
      question: "Are there any hidden fees?",
      answer:
        "No hidden fees! The price you see is what you pay. There's a one-time $25 enrollment fee for new members, but no annual fees or surprise charges.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer:
        "You can change your membership level at any time. Upgrades take effect immediately, while downgrades take effect at the start of your next billing cycle.",
    },
    {
      question: "What if I'm traveling? Can I access other locations?",
      answer:
        "Standard and Premium members get access to our partner gyms nationwide. Check our app for participating locations near you.",
    },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              FREQUENTLY ASKED <span className="text-[#84FF00]">QUESTIONS</span>
            </h2>
            <p className="text-xl text-gray-400">Got questions? We've got answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-[#84FF00]/50 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-bold text-white pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#84FF00] flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <a href="/contact" className="text-[#84FF00] font-bold hover:underline">
              Contact our team →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
