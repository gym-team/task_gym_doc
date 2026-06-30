"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  X,
  Dumbbell,
  User,
  Calendar,
  Briefcase,
  MessageSquare,
  Zap,
  BarChart3,
  LogOut,
  ChefHat,
  Apple,
  ClipboardList,
  HeartPulse,
  LineChart,
  Users,
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  PackageSearch,
  Settings2,
  BadgeCheck,
  Home,
  UtensilsCrossed,
  PlayCircle,
  CircleUser,
  MessageCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type CurrentUser = {
  userId?: string
  email?: string
  fullName?: string
  role?: string
  traineeId?: number | null
  coachId?: number | null
  isTrainee?: boolean
  isCoach?: boolean
  isAdmin?: boolean
}

type NavItem = {
  href: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

function getStoredToken() {
  if (typeof window === "undefined") return null
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("authToken")
  )
}

function clearStoredToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
  localStorage.removeItem("accessToken")
  localStorage.removeItem("jwt")
  localStorage.removeItem("authToken")
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let alive = true

    async function loadCurrentUser() {
      try {
        const token = getStoredToken()

        if (!token) {
          if (alive) setUser(null)
          return
        }

        const response = await fetch(`${API_BASE}/api/Account/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          if (alive) setUser(null)
          return
        }

        const data = (await response.json()) as CurrentUser
        if (alive) setUser(data)
      } catch {
        if (alive) setUser(null)
      } finally {
        if (alive) setLoadingUser(false)
      }
    }

    loadCurrentUser()

    return () => {
      alive = false
    }
  }, [])

  const normalizedRole = useMemo(() => {
    const role = (user?.role ?? "").toLowerCase()
    if (user?.isAdmin || role.includes("admin")) return "admin"
    if (user?.isCoach || role.includes("coach")) return "coach"
    if (user?.isTrainee || role.includes("trainee")) return "trainee"
    return "guest"
  }, [user])

  const isLoggedIn = normalizedRole !== "guest"

  const publicLinks: NavItem[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/tracks", label: "Tracks", icon: PlayCircle },
    { href: "/program", label: "Programs", icon: BookOpen },
    { href: "/nutrition", label: "Nutrition", icon: UtensilsCrossed },
    { href: "/trainers", label: "Trainers", icon: Users },
    { href: "/membership", label: "Membership", icon: BadgeCheck },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
     { href: "/contacts", label: "Chat",icon: MessageCircle },
  ]

  const traineeLinks: NavItem[] = [
    { href: "/nutrition/enrollments", label: "My Nutrition", icon: HeartPulse },
    { href: "/payment", label: "Payment", icon: BadgeCheck },
  ]

  const coachLinks: NavItem[] = [
    { href: "/coach", label: "Coach Dashboard", icon: LayoutDashboard },
   
      { href: "/coach/profile", label: "Profile", icon: CircleUser },
  ]

  const adminLinks: NavItem[] = [
    { href: "/admin", label: "Admin Dashboard", icon: ShieldCheck },
    { href: "/admin/exercise", label: "Exercises", icon: ShieldCheck },
    { href: "/admin/profile", label: "Profile", icon: CircleUser},

  ]

  const accountLinks: NavItem[] = [
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/ai-assistant", label: "AI Assistant", icon: Zap },
  ]

  const roleLinks = useMemo(() => {
    if (normalizedRole === "coach") return coachLinks
    if (normalizedRole === "trainee") return traineeLinks
    if (normalizedRole === "admin") return adminLinks
    return []
  }, [normalizedRole])

  const roleLabel = useMemo(() => {
    if (normalizedRole === "admin") return "Admin"
    if (normalizedRole === "coach") return "Coach"
    if (normalizedRole === "trainee") return "Trainee"
    return "Guest"
  }, [normalizedRole])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    clearStoredToken()
    setUser(null)
    router.push("/login")
    router.refresh()
    setIsOpen(false)
  }

  const LinkItem = ({
    item,
    mobile = false,
    onClick,
  }: {
    item: NavItem
    mobile?: boolean
    onClick?: () => void
  }) => {
    const Icon = item.icon
    const active = isActive(item.href)

    if (mobile) {
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
            active ? "bg-white/5 text-[#84FF00]" : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          {Icon ? <Icon className="h-4 w-4" /> : null}
          {item.label}
        </Link>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className="relative px-3 py-2 text-sm font-medium transition-all duration-300 group"
      >
        <span
          className={`relative z-10 transition-colors duration-300 ${
            active ? "text-[#84FF00]" : "text-gray-400 group-hover:text-white"
          }`}
        >
          {item.label}
        </span>
        {active && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-[#84FF00] shadow-[0_0_10px_rgba(132,255,0,0.8)]" />
        )}
        <span className="absolute inset-0 rounded-lg bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>
    )
  }

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b border-white/10 transition-all duration-300 ${
        scrolled ? "bg-black/98 shadow-lg shadow-[#84FF00]/5 backdrop-blur-md" : "bg-black/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-[#84FF00] transition-colors duration-300 group-hover:rotate-12 group-hover:text-[#FF6B00]" />
            <span className="text-2xl font-black tracking-tight text-white">
              FIT
              <span className="text-[#84FF00] transition-colors duration-300 group-hover:text-[#FF6B00]">
                ZONE
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {publicLinks.map((item) => (
              <LinkItem key={item.href} item={item} />
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {isLoggedIn && (
              <Badge className="border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white">
                {roleLabel}
              </Badge>
            )}

            {roleLinks.length > 0 && (
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white transition-all duration-300 hover:bg-white/5 hover:text-[#84FF00]"
                >
                  {normalizedRole === "coach" && <ChefHat className="mr-2 h-4 w-4" />}
                  {normalizedRole === "trainee" && <HeartPulse className="mr-2 h-4 w-4" />}
                  {normalizedRole === "admin" && <ShieldCheck className="mr-2 h-4 w-4" />}
                  Dashboard
                </Button>

                <div className="invisible absolute right-0 top-full mt-2 w-64 translate-y-[-8px] rounded-xl border border-white/10 bg-black/95 opacity-0 shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="p-2">
                    {roleLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-400 transition-all duration-300 hover:bg-white/5 hover:text-[#84FF00]"
                      >
                        {item.icon ? <item.icon className="h-4 w-4" /> : null}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isLoggedIn ? (
              <>
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white transition-all duration-300 hover:bg-white/5 hover:text-[#84FF00]"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Button>

                  <div className="invisible absolute right-0 top-full mt-2 w-56 translate-y-[-8px] rounded-xl border border-white/10 bg-black/95 opacity-0 shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="p-2">
                      {accountLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-400 transition-all duration-300 hover:bg-white/5 hover:text-[#84FF00]"
                        >
                          {item.icon ? <item.icon className="h-4 w-4" /> : null}
                          {item.label}
                        </Link>
                      ))}

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-400 transition-all duration-300 hover:bg-white/5 hover:text-red-400"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {!loadingUser && (
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white transition-all duration-300 hover:bg-white/5 hover:text-[#84FF00]"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                )}
                <Link href="/membership">
                  <Button
                    size="sm"
                    className="bg-[#84FF00] font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-[#84FF00]/90 hover:shadow-[0_0_20px_rgba(132,255,0,0.5)]"
                  >
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white transition-colors duration-300 hover:text-[#84FF00] lg:hidden"
            aria-label="Toggle menu"
          >
            
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>


        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            isOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-white/10 py-4">
            <div className="flex flex-col gap-2">
              <div className="px-4 pb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Explore</p>
              </div>

              {publicLinks.map((item) => (
                <LinkItem key={item.href} item={item} mobile onClick={() => setIsOpen(false)} />
              ))}

              {isLoggedIn && roleLinks.length > 0 && (
                <div className="mt-3 border-t border-white/10 pt-4">
                  <div className="px-4 pb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {roleLabel} Area
                    </p>
                    <Badge className="border border-white/10 bg-white/5 text-[10px] text-white">
                      {roleLabel}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2">
                    {roleLinks.map((item) => (
                      <LinkItem key={item.href} item={item} mobile onClick={() => setIsOpen(false)} />
                    ))}
                  </div>
                </div>
              )}

              {isLoggedIn ? (
                <div className="mt-3 border-t border-white/10 pt-4">
                  <div className="px-4 pb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {accountLinks.map((item) => (
                      <LinkItem key={item.href} item={item} mobile onClick={() => setIsOpen(false)} />
                    ))}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition-all duration-300 hover:bg-white/5 hover:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 border-t border-white/10 pt-4">
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-white transition-all duration-300 hover:bg-white/5 hover:text-[#84FF00]"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/membership" onClick={() => setIsOpen(false)}>
                      <Button
                        size="sm"
                        className="w-full bg-[#84FF00] font-bold text-black transition-all duration-300 hover:bg-[#84FF00]/90 hover:shadow-[0_0_20px_rgba(132,255,0,0.5)]"
                      >
                        Join Now
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}