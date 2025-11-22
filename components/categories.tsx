'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface Category {
  id: number
  name: string
  description: string
  icon: string
  href: string
  image: string
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const isDocker = API_URL.includes('backend:')
  const backendUrl = isDocker ? 'http://localhost:8080' : API_URL.replace('/api', '')

  const getImageUrl = (image: string | undefined | null): string => {
    if (!image || image.trim() === '') {
      return '/img/screenshot-hero.jpg'
    }
    // If it's already a full URL, return as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }
    // If it's a path starting with /uploads/, prepend backend URL
    if (image.startsWith('/uploads/')) {
      return `${backendUrl}${image}`
    }
    // For other paths (like /img/...), return as is
    return image
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`)
      if (res.ok) {
        const data = await res.json()
        console.log('Categories loaded:', data)
        console.log('Backend URL:', backendUrl)
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">Загрузка категорий...</p>
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Просмотр по категориям
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Изучите нашу обширную коллекцию, организованную по типам помещений и категориям мебели
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href || '/catalog'}
              className="group relative h-56 sm:h-64 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <img
                src={getImageUrl(category.image)}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white">
                <h3 className="text-xl sm:text-2xl font-serif font-bold mb-1 sm:mb-2">{category.name}</h3>
                <p className="text-xs sm:text-sm text-white/90 line-clamp-2">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
