'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface Product {
  id: number
  name: string
  category: string
  price: number
  rating: number
  image: string
  images?: string[]
}

function getImageUrl(image: string | undefined, images?: string[]): string {
  if (!image && (!images || images.length === 0)) return "/placeholder.svg"
  const img = images && images.length > 0 ? images[0] : image
  if (!img) return "/placeholder.svg"
  if (img.startsWith('/uploads/')) {
    const isDocker = API_URL.includes('backend:')
    const backendUrl = isDocker ? 'http://localhost:8080' : API_URL.replace('/api', '')
    return `${backendUrl}${img}`
  }
  return img
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products/featured`)
      const data = await res.json()
      setProducts(data.slice(0, 4)) // Limit to 4 products
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">Загрузка рекомендуемых товаров...</p>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null // Don't show section if no featured products
  }
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Рекомендуемые товары
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Тщательно отобранные изделия для требовательных отельеров
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const imageUrl = getImageUrl(product.image, product.images)
            return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative h-48 sm:h-56 md:h-64 bg-muted overflow-hidden">
                <img
                    src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <p className="text-xs sm:text-sm text-muted-foreground">{product.category}</p>
                <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-sm sm:text-base font-bold text-primary">{product.price} ₽</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-accent text-accent" />
                    <span className="text-xs text-muted-foreground">{product.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          )
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/catalog"
            className="inline-block px-8 py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition"
          >
            Посмотреть все товары
          </Link>
        </div>
      </div>
    </section>
  )
}
