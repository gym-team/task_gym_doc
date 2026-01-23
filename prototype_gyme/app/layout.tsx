import type React from "react"
import { Montserrat, Poppins } from "next/font/google"
import "./globals.css"


const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
})

export const metadata = {
  title: "FitZone - Premium Gym & Fitness Platform",
  description: "Transform your body, elevate your mind. Join the ultimate fitness experience.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable} antialiased scroll-smooth`}>
      <body className="font-sans overflow-x-hidden">
        {children}
        
      </body>
    </html>
  )
}
