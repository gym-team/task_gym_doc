"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Dumbbell, User, Calendar, Briefcase, MessageSquare, Zap, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/trainers", label: "Trainers" },
    { href: "/membership", label: "Membership" },
    { href: "/programs", label: "Programs" },
    { href: "/shop", label: "Shop" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  const actionLinks = [
    { href: "/book-trainer", label: "Book Trainer", icon: Calendar },
    { href: "/apply-trainer", label: "Apply as Trainer", icon: Briefcase },
  ]

  const userLinks = [
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/ai-assistant", label: "AI Assistant", icon: Zap },
    { href: "/chat/1", label: "Trainer Chat", icon: MessageSquare },
    { href: "/trainer/dashboard", label: "Trainer Dashboard", icon: BarChart3 },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/98 backdrop-blur-md shadow-lg shadow-[#84FF00]/5" : "bg-black/95 backdrop-blur-sm"
      } border-b border-white/10`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Dumbbell className="h-8 w-8 text-[#84FF00] group-hover:text-[#FF6B00] transition-colors duration-300 group-hover:rotate-12" />
            <span className="text-2xl font-black tracking-tight text-white">
              FIT<span className="text-[#84FF00] group-hover:text-[#FF6B00] transition-colors duration-300">ZONE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium transition-all duration-300 group"
              >
                <span
                  className={`relative z-10 transition-colors duration-300 ${
                    isActive(link.href) ? "text-[#84FF00]" : "text-gray-400 group-hover:text-white"
                  }`}
                >
                  {link.label}
                </span>
                {/* Active indicator with glow */}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#84FF00] rounded-full shadow-[0_0_10px_rgba(132,255,0,0.8)]" />
                )}
                {/* Hover effect */}
                <span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-[#84FF00] hover:bg-white/5 font-medium transition-all duration-300"
              >
                Dashboard
              </Button>
              <div className="absolute top-full right-0 mt-2 w-56 bg-black/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                {userLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-[#84FF00] hover:bg-white/5 transition-all duration-300 first:rounded-t-xl last:rounded-b-xl group/item"
                  >
                    <link.icon className="h-4 w-4 group-hover/item:scale-110 transition-transform duration-300" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-[#84FF00] hover:bg-white/5 font-medium transition-all duration-300"
              >
                Quick Actions
              </Button>
              <div className="absolute top-full right-0 mt-2 w-56 bg-black/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                {actionLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-[#84FF00] hover:bg-white/5 transition-all duration-300 first:rounded-t-xl last:rounded-b-xl group/item"
                  >
                    <link.icon className="h-4 w-4 group-hover/item:scale-110 transition-transform duration-300" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-[#84FF00] hover:bg-white/5 transition-all duration-300"
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
            <Link href="/membership">
              <Button
                size="sm"
                className="bg-[#84FF00] text-black hover:bg-[#84FF00]/90 font-bold hover:shadow-[0_0_20px_rgba(132,255,0,0.5)] transition-all duration-300 hover:scale-105"
              >
                Join Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-white hover:text-[#84FF00] transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 border-t border-white/10">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive(link.href)
                      ? "text-[#84FF00] bg-white/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-white/10 pt-4 mt-2 space-y-2">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dashboard</p>
                {userLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-400 hover:text-[#84FF00] hover:bg-white/5 rounded-lg transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 mt-2 space-y-2">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick Actions</p>
                {actionLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-400 hover:text-[#84FF00] hover:bg-white/5 rounded-lg transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-white/10 mt-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-white hover:text-[#84FF00] justify-start hover:bg-white/5 transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/membership" onClick={() => setIsOpen(false)}>
                  <Button
                    size="sm"
                    className="w-full bg-[#84FF00] text-black hover:bg-[#84FF00]/90 font-bold hover:shadow-[0_0_20px_rgba(132,255,0,0.5)] transition-all duration-300"
                  >
                    Join Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
