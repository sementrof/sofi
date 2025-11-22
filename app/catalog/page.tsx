'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Filter, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface Product {
  id: number
  name: string
  category: string
  price: number
  rating: number
  image: string
  images?: string[]
  color: string
}


function ProductCard({ product }: { product: Product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const isDocker = API_URL.includes('backend:')
  const backendUrl = isDocker ? 'http://localhost:8080' : API_URL.replace('/api', '')

  const getImageUrl = (img: string) => {
    if (img?.startsWith('/uploads/')) {
      return `${backendUrl}${img}`
    }
    return img || "/placeholder.svg"
  }

  // Get images array or use single image
  const images = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image] : [])

  const hasMultipleImages = images.length > 1

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
    >
      <div className="relative h-64 bg-muted overflow-hidden">
        {images.length > 0 && (
          <>
            <img
              src={getImageUrl(images[currentImageIndex])}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  aria-label="Предыдущее изображение"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  aria-label="Следующее изображение"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition ${
                        idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <h3 className="font-semibold text-foreground group-hover:text-primary transition line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="font-bold text-primary">{product.price} ₽</p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">⭐ {product.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

interface Category {
  id: number
  name: string
  description: string
  icon: string
  href: string
  image: string
}

export default function CatalogPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`)
      const data = await res.json()
      setAllProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Get categories from DB, fallback to product categories if DB categories are empty
  const availableCategories = categories.length > 0
    ? ['Все', ...categories.map(c => c.name)]
    : ['Все', ...Array.from(new Set(allProducts.map(p => p.category)))]

  // Filter products
  let filtered = allProducts.filter(product => {
    if (selectedCategory !== 'Все' && product.category !== selectedCategory) return false
    return true
  })

  // Sort products
  if (sortBy === 'price-low') {
    filtered = [...filtered].sort((a, b) => a.price - b.price)
  } else if (sortBy === 'price-high') {
    filtered = [...filtered].sort((a, b) => b.price - a.price)
  } else if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Каталог мебели</h1>
          <p className="text-muted-foreground">Откройте для себя нашу полную коллекцию премиальной мебели для отелей</p>
        </div>

        {/* Mobile Filters Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-card border border-border rounded-lg font-semibold text-foreground hover:bg-muted transition"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Фильтры
            </div>
            <ChevronDown className={`w-4 h-4 transition ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters - Desktop & Mobile */}
          <div className={`lg:block space-y-6 bg-card border border-border p-6 rounded-lg h-fit lg:sticky lg:top-20 ${showFilters ? 'block' : 'hidden'}`}>
            <div>
              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Категория</h3>
                  <div className="space-y-2">
                    {availableCategories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat}
                          onChange={() => setSelectedCategory(cat)}
                          className="accent-primary"
                        />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition">
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset Filters */}
                {selectedCategory !== 'Все' && (
                  <button
                    onClick={() => {
                      setSelectedCategory('Все')
                    }}
                    className="w-full px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted transition flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Сбросить фильтры
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Загрузка товаров...</p>
              </div>
            ) : (
              <>
            {/* Sort and Count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <p className="text-sm text-muted-foreground">
                    Показано {filtered.length} товаров
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="featured">Рекомендуемые</option>
                <option value="price-low">Цена: по возрастанию</option>
                <option value="price-high">Цена: по убыванию</option>
                <option value="rating">Высший рейтинг</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.length > 0 ? (
                filtered.map((product) => (
                      <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-3 py-12 text-center">
                  <p className="text-muted-foreground">Нет товаров, соответствующих вашим фильтрам</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('Все')
                    }}
                    className="mt-4 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition"
                  >
                    Очистить фильтры
                  </button>
                </div>
              )}
            </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
