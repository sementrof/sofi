'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface InteriorImage {
  id: number
  image: string
  title?: string
  description?: string
}

// Примеры интерьеров - можно будет загружать из API
const defaultInteriors: InteriorImage[] = [
  {
    id: 1,
    image: '/img/screenshot-hero.jpg',
    title: 'Роскошный отель',
    description: 'Премиальная мебель для гостиничных номеров'
  },
  {
    id: 2,
    image: '/img/screenshot-hero.jpg',
    title: 'Современный интерьер',
    description: 'Элегантные решения для ресторанов'
  },
  {
    id: 3,
    image: '/img/screenshot-hero.jpg',
    title: 'Классический стиль',
    description: 'Вневременная элегантность'
  },
  {
    id: 4,
    image: '/img/screenshot-hero.jpg',
    title: 'Минималистичный дизайн',
    description: 'Чистые линии и комфорт'
  },
  {
    id: 5,
    image: '/img/screenshot-hero.jpg',
    title: 'Премиальный курорт',
    description: 'Роскошь и уют'
  }
]

export default function InteriorsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [interiors] = useState<InteriorImage[]>(defaultInteriors)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % interiors.length)
    }, 5000) // Автопрокрутка каждые 5 секунд

    return () => clearInterval(interval)
  }, [isAutoPlaying, interiors.length])

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollPosition = currentIndex * (100 / interiors.length)
      scrollContainerRef.current.scrollTo({
        left: (scrollContainerRef.current.scrollWidth / interiors.length) * currentIndex,
        behavior: 'smooth'
      })
    }
  }, [currentIndex, interiors.length])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + interiors.length) % interiors.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % interiors.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            Интерьеры
          </h2>
          <p className="text-muted-foreground">
            Реализованные проекты с нашей мебелью
          </p>
        </div>

        <div className="relative overflow-hidden">
          {/* Carousel Container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory scrollbar-hide"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {interiors.map((interior, index) => (
              <div
                key={interior.id}
                className="min-w-full snap-center"
              >
                <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden group">
                  <img
                    src={interior.image}
                    alt={interior.title || `Интерьер ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Content overlay */}
                  {interior.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-1 sm:mb-2">
                        {interior.title}
                      </h3>
                      {interior.description && (
                        <p className="text-white/90 text-sm sm:text-base md:text-lg">
                          {interior.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-black transition z-10"
            aria-label="Предыдущий слайд"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-black transition z-10"
            aria-label="Следующий слайд"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {interiors.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

