"use client"

import Link from "next/link"
import { ShoppingCart, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ShopPreviewSection() {
  const featuredProducts = [
    {
      id: "whey-protein",
      name: "Premium Whey Protein",
      category: "Supplements",
      price: 49.99,
      image: "/whey-protein-powder.jpg",
      rating: 4.8,
      reviews: 234,
      description: "25g protein per serving, chocolate flavor",
      badge: "Best Seller",
    },
    {
      id: "resistance-bands",
      name: "Resistance Band Set",
      category: "Equipment",
      price: 24.99,
      image: "/resistance-bands.jpg",
      rating: 4.9,
      reviews: 312,
      description: "5 bands with varying resistance levels",
      badge: "Top Rated",
    },
    {
      id: "yoga-mat",
      name: "Premium Yoga Mat",
      category: "Equipment",
      price: 44.99,
      image: "/yoga-mat.jpg",
      rating: 4.8,
      reviews: 267,
      description: "Non-slip, extra thick cushioning",
      badge: "Popular",
    },
    {
      id: "gym-bag",
      name: "Gym Duffel Bag",
      category: "Accessories",
      price: 54.99,
      image: "/gym-bag.jpg",
      rating: 4.7,
      reviews: 223,
      description: "Spacious with shoe compartment",
      badge: "New",
    },
  ]

  return (
    <section className="py-24 md:py-32 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-block mb-4 px-4 py-2 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-full">
              <span className="text-[#FF6B00] text-sm font-bold uppercase tracking-wider">Shop</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight text-balance">
              Gear up for success
            </h2>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed text-pretty">
              Premium supplements, equipment, and apparel to fuel your fitness journey.
            </p>
          </div>
          <Link href="/shop">
            <Button
              size="lg"
              className="bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 hover:scale-105 font-bold transition-all duration-300 group"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-[#FF6B00]/50 hover:shadow-[0_0_30px_rgba(255,107,0,0.2)] transition-all duration-300 group cursor-pointer"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-white/5">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge */}
                <div className="absolute top-3 left-3 bg-[#FF6B00] text-white px-3 py-1 rounded-full text-xs font-bold">
                  {product.badge}
                </div>

                {/* Quick Add Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button size="sm" className="bg-white text-black hover:bg-white/90 font-bold">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="text-xs text-[#FF6B00] font-bold mb-2 uppercase tracking-wider">{product.category}</div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-[#FF6B00] transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#FF6B00] text-[#FF6B00]" />
                    <span className="text-sm font-bold text-white">{product.rating}</span>
                  </div>
                  <span className="text-xs text-gray-400">({product.reviews})</span>
                </div>

                {/* Price */}
                <div className="text-2xl font-black text-white group-hover:text-[#FF6B00] transition-colors duration-300">
                  ${product.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
