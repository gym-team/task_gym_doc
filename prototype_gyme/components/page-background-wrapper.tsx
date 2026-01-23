"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface PageBackgroundWrapperProps {
  children: React.ReactNode
  backgroundImage?: string
  pageType?: "home" | "shop" | "blog" | "trainers" | "profile" | "dashboard"
}

export function PageBackgroundWrapper({
  children,
  backgroundImage,
  pageType = 'home',
}: PageBackgroundWrapperProps) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY * 0.5) // parallax effect - slows down background movement
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getBackgroundStyle = () => {
    const baseGradient = 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(10,10,10,0.95) 100%)'

    switch (pageType) {
      case 'shop':
        return {
          backgroundImage: `${baseGradient}, url(\'${backgroundImage || '/placeholder.svg}\')`,\
          backgroundAttachment: \'fixed',\
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      case 'blog':
        return {
          backgroundImage: \`linear-gradient(180deg, rgba(132,255,0,0.05) 0%, rgba(0,0,0,0.9) 100%), url(\'${backgroundImage || '/placeholder.svg}\')`,\
          backgroundAttachment: \'fixed',\
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      case 'trainers':
        return {
          backgroundImage: \`linear-gradient(135deg, rgba(255,107,0,0.05) 0%, rgba(0,0,0,0.95) 100%), url(\'${backgroundImage || '/placeholder.svg}\')`,\
          backgroundAttachment: \'fixed',\
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      case 'profile':
      case 'dashboard':
        return {
          backgroundImage: \`linear-gradient(180deg, rgba(0,217,255,0.05) 0%, rgba(0,0,0,0.9) 100%), url(\'${backgroundImage || '/placeholder.svg}\')`,\
          backgroundAttachment: \'fixed',\
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      default:
        return {
          backgroundImage: baseGradient,
        }
    }
  }

  return (
    <div
      className="min-h-screen bg-black relative"
      style={{
        ...getBackgroundStyle(),
        transform: \`translateY(${scrollY}px)`,
      }}\
    >children
    </div>
  )
}
