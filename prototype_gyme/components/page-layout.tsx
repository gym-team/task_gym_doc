"use client"

import type { ReactNode } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-black ${className}`}>
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
