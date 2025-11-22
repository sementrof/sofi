'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface Collection {
  id: number
  name: string
  description: string
  image: string
  count: number
}

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  const isDocker = API_URL.includes('backend:')
  const backendUrl = isDocker ? 'http://localhost:8080' : API_URL.replace('/api', '')

  const getImageUrl = (image: string | undefined | null): string => {
    if (!image || image.trim() === '') {
      return '/placeholder.svg'
    }
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }
    if (image.startsWith('/uploads/')) {
      return `${backendUrl}${image}`
    }
    return image
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${API_URL}/collections`)
      if (res.ok) {
        const data = await res.json()
        setCollections(data)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">Загрузка коллекций...</p>
          </div>
        </div>
      </section>
    )
  }

  if (collections.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-12 text-center">
          Тщательно подобранные коллекции
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="group relative h-64 sm:h-72 md:h-80 rounded-xl overflow-hidden"
            >
              <img
                src={getImageUrl(collection.image)}
                alt={collection.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white">
                <h3 className="text-xl sm:text-2xl font-serif font-bold mb-1 sm:mb-2">{collection.name}</h3>
                <p className="text-xs sm:text-sm text-white/90 mb-2 sm:mb-4 line-clamp-2">{collection.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{collection.count} товаров</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
