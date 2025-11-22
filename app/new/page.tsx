'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import PlaceholderPage from '@/components/placeholder-page'

const newArrivals = [
  {
    id: 2,
    name: 'Современное кресло для гостиной',
    category: 'Мебель для сидения',
    price: 899,
    image: '/public/modern-lounge-chair.png',
    dateAdded: '2024-11-15',
    badge: 'Только что прибыло'
  },
  {
    id: 6,
    name: 'Современное акцентное кресло',
    category: 'Мебель для сидения',
    price: 749,
    image: '/public/modern-lounge-chair.png',
    dateAdded: '2024-11-10',
    badge: 'Новинка'
  },
  {
    id: 9,
    name: 'Роскошные две односпальные кровати',
    category: 'Кровати',
    price: 1599,
    image: '/public/luxury-king-bed-frame.jpg',
    dateAdded: '2024-11-08',
    badge: 'Новинка'
  },
]

export default function NewPage() {
  const [showPlaceholder, setShowPlaceholder] = useState<boolean | null>(null)

  useEffect(() => {
    checkPlaceholder()
  }, [])

  const checkPlaceholder = async () => {
    try {
      // Get API URL - in browser, always use localhost, in Docker use environment variable
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
      if (typeof window !== 'undefined' && apiUrl.includes('backend:')) {
        apiUrl = 'http://localhost:8080/api'
      }
      const res = await fetch(`${apiUrl}/placeholder/check?path=/new`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        setShowPlaceholder(data.exists === true)
      } else {
        setShowPlaceholder(false)
      }
    } catch (error) {
      console.error('Error checking placeholder:', error)
      setShowPlaceholder(false)
    }
  }

  if (showPlaceholder === null) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Загрузка...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (showPlaceholder) {
    return <PlaceholderPage path="/new" />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Новинки</h1>
          <p className="text-lg text-muted-foreground">
            Откройте для себя последние добавления в нашу премиальную коллекцию мебели
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newArrivals.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative h-64 bg-muted overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-4 right-4 z-10 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  {product.badge}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground">{product.category}</p>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="font-bold text-primary">{product.price} ₽</p>
                  <button className="px-3 py-1 text-xs font-medium border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition">
                    Посмотреть
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
