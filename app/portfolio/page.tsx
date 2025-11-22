'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import PlaceholderPage from '@/components/placeholder-page'
import { MapPin, Star } from 'lucide-react'

const projects = [
  {
    id: 1,
    name: 'Grand Plaza Hotel',
    location: 'New York, USA',
    image: '/placeholder.svg?key=proj1',
    description: 'Furnished 250-room luxury hotel with contemporary design',
    items: 'Beds, Seating, Dining Furniture',
    rating: 4.9,
  },
  {
    id: 2,
    name: 'Côte d\'Azur Resort',
    location: 'Cannes, France',
    image: '/placeholder.svg?key=proj2',
    description: 'Mediterranean-inspired boutique resort with 80 rooms',
    items: 'Resort Furniture, Decor, Accessories',
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Asia Pacific Tower',
    location: 'Singapore',
    image: '/placeholder.svg?key=proj3',
    description: 'Modern 5-star hotel with 500 guest rooms',
    items: 'Full Suite of Hospitality Furniture',
    rating: 4.9,
  },
  {
    id: 4,
    name: 'Desert Oasis Resort',
    location: 'Dubai, UAE',
    image: '/placeholder.svg?key=proj4',
    description: 'Luxury desert resort featuring 150 rooms',
    items: 'Premium Beds, Executive Seating',
    rating: 4.7,
  },
  {
    id: 5,
    name: 'Alpine Lodge',
    location: 'Swiss Alps',
    image: '/placeholder.svg?key=proj5',
    description: 'Boutique mountain hotel with rustic charm',
    items: 'Custom Furniture, Decor Elements',
    rating: 4.8,
  },
  {
    id: 6,
    name: 'Tokyo Metropolitan',
    location: 'Tokyo, Japan',
    image: '/placeholder.svg?key=proj6',
    description: 'Ultra-modern 600-room luxury hotel',
    items: 'Contemporary Furniture Suite',
    rating: 4.9,
  },
]

export default function PortfolioPage() {
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
      const res = await fetch(`${apiUrl}/placeholder/check?path=/portfolio`, {
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
    return <PlaceholderPage path="/portfolio" />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-muted to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground">
              Наше портфолио
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Изучите некоторые из наших самых престижных гостиничных проектов
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <div className="relative h-64 bg-muted overflow-hidden">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        {project.location}
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      {project.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Предоставленная мебель
                      </p>
                      <p className="text-sm text-foreground">{project.items}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="text-sm font-semibold text-foreground">
                          {project.rating}
                        </span>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition">
                        Подробнее
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
