import Link from "next/link"
import { Dumbbell, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <Dumbbell className="h-8 w-8 text-[#84FF00] group-hover:text-[#FF6B00] transition-colors" />
              <span className="text-2xl font-black text-white">
                FIT<span className="text-[#84FF00]">ZONE</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Transform your body, elevate your mind. Join the ultimate fitness experience.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#84FF00] hover:bg-white/10 hover:border-[#84FF00]/30 transition-all"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#84FF00] hover:bg-white/10 hover:border-[#84FF00]/30 transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#84FF00] hover:bg-white/10 hover:border-[#84FF00]/30 transition-all"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#84FF00] hover:bg-white/10 hover:border-[#84FF00]/30 transition-all"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-[#84FF00] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/trainers" className="text-sm text-gray-400 hover:text-[#84FF00] transition-colors">
                  Our Trainers
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-sm text-gray-400 hover:text-[#84FF00] transition-colors">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-400 hover:text-[#84FF00] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/membership" className="text-sm text-gray-400 hover:text-[#84FF00] transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-sm text-gray-400 hover:text-[#84FF00] transition-colors">
                  Personal Training
                </Link>
              </li>
             
              <li>
                <Link href="/shop" className="text-sm text-gray-400 hover:text-[#84FF00] transition-colors">
                  Shop
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>123 Fitness Street</li>
              <li>New York, NY 10001</li>
              <li className="pt-2">
                <a href="tel:+1234567890" className="hover:text-[#84FF00] transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li>
                <a href="mailto:info@fitzone.com" className="hover:text-[#84FF00] transition-colors">
                  info@fitzone.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-12 border-t border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-black text-white mb-3">Stay Updated</h3>
            <p className="text-gray-400 mb-6">
              Subscribe to our newsletter for fitness tips, exclusive offers, and updates.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#84FF00]/50 focus:ring-2 focus:ring-[#84FF00]/20 transition-all"
                required
              />
              <Button
                type="submit"
                className="bg-[#84FF00] text-black hover:bg-[#84FF00]/90 hover:scale-105 font-bold px-8 transition-all duration-300"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} FitZone. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-[#84FF00] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#84FF00] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
