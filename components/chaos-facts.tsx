'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Award, TrendingUp, Heart, Zap, Star, Lightbulb, Palette } from 'lucide-react'

interface Fact {
  id: number
  text: string
  icon: any
  size: 'small' | 'medium' | 'large'
  rotation: number
  delay: number
}

const facts: Fact[] = [
  {
    id: 1,
    text: 'Матрас влияет на качество сна больше, чем площадь номера',
    icon: Award,
    size: 'medium',
    rotation: -3,
    delay: 0
  },
  
  {
    id: 3,
    text: 'Дизайн мебели влияет на оценку отеля на 40%',
    icon: Lightbulb,
    size: 'large',
    rotation: -2,
    delay: 0.2
  },
  {
    id: 4,
    text: 'Текстиль и детали интерьера формируют первое впечатление за 7 секунд',
    icon: TrendingUp,
    size: 'medium',
    rotation: 4,
    delay: 0.3
  },
  {
    id: 5,
    text: 'Комфортная кровать — главный критерий положительных отзывов',
    icon: Sparkles,
    size: 'small',
    rotation: -4,
    delay: 0.4
  },
  {
    id: 6,
    text: 'Гости запоминают интерьер на 60% лучше, чем услуги',
    icon: Heart,
    size: 'large',
    rotation: 3,
    delay: 0.5
  },
  {
    id: 7,
    text: 'Матрас влияет на качество сна больше, чем площадь номера',
    icon: Zap,
    size: 'small',
    rotation: -2,
    delay: 0.6
  },
  {
    id: 8,
    text: 'Мини-холодильник — маленькая деталь, но большой плюс в глазах гостей',
    icon: Palette,
    size: 'medium',
    rotation: 5,
    delay: 0.7
  }
]

export default function ChaosFacts() {
  const [visibleFacts, setVisibleFacts] = useState<Fact[]>([])

  useEffect(() => {
    // Показываем факты с задержкой для анимации
    facts.forEach((fact, index) => {
      setTimeout(() => {
        setVisibleFacts(prev => [...prev, fact])
      }, index * 100)
    })
  }, [])

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'w-48 h-32 md:w-56 md:h-36 text-sm'
      case 'medium':
        return 'w-56 h-40 md:w-64 md:h-44 text-base'
      case 'large':
        return 'w-64 h-48 md:w-72 md:h-52 text-lg'
      default:
        return 'w-56 h-40 md:w-64 md:h-44 text-base'
    }
  }

  return (
    <section className="py-12 md:py-16 relative overflow-hidden" style={{ backgroundColor: '#f0e7e0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[500px] lg:min-h-[600px]">
          {visibleFacts.map((fact, index) => {
            const Icon = fact.icon
            // Более элегантное позиционирование с учетом размера
            const baseX = (index * 23 + 15) % 75
            const baseY = (index * 37 + 20) % 65
            const offsetX = (index * 7) % 15 - 7 // Случайное смещение
            const offsetY = (index * 11) % 15 - 7
            
            // На мобильных устройствах ограничиваем позиционирование (будет применено через CSS)
            const x = Math.max(2, Math.min(75, baseX + offsetX))
            const y = Math.max(2, Math.min(60, baseY + offsetY))
            
            // Яркие, но мягкие оттенки primary цвета (цвет кнопки "изучить каталог")
            // Используем светлые, теплые оттенки коричневого для яркости без едкости
            const primaryShades = [
              { bg: 'rgba(179, 136, 118, 0.55)', border: 'rgba(139, 100, 85, 0.35)', text: 'rgba(60, 40, 30, 0.9)' }, // Светло-бежево-коричневый
              { bg: 'rgba(196, 154, 130, 0.60)', border: 'rgba(149, 110, 95, 0.38)', text: 'rgba(60, 40, 30, 0.92)' }, // Бежевый
              { bg: 'rgba(170, 125, 105, 0.58)', border: 'rgba(139, 100, 85, 0.36)', text: 'rgba(60, 40, 30, 0.88)' }, // Средне-бежевый
              { bg: 'rgba(189, 145, 123, 0.62)', border: 'rgba(149, 110, 95, 0.40)', text: 'rgba(60, 40, 30, 0.93)' }, // Светло-коричневый
              { bg: 'rgba(165, 120, 100, 0.56)', border: 'rgba(139, 100, 85, 0.34)', text: 'rgba(60, 40, 30, 0.87)' }, // Теплый бежевый
              { bg: 'rgba(182, 140, 120, 0.59)', border: 'rgba(149, 110, 95, 0.37)', text: 'rgba(60, 40, 30, 0.91)' }, // Мягкий коричневый
              { bg: 'rgba(175, 130, 110, 0.57)', border: 'rgba(139, 100, 85, 0.35)', text: 'rgba(60, 40, 30, 0.89)' }, // Светло-бежевый
              { bg: 'rgba(193, 150, 128, 0.61)', border: 'rgba(149, 110, 95, 0.39)', text: 'rgba(60, 40, 30, 0.94)' } // Яркий бежевый
            ]
            
            const shade = primaryShades[index % primaryShades.length]
            
            return (
              <div
                key={fact.id}
                className={`absolute chaos-fact-card ${getSizeClasses(fact.size)} border-2 rounded-2xl p-3 sm:p-4 md:p-5 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:z-50 cursor-pointer backdrop-blur-sm`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `rotate(${fact.rotation}deg)`,
                  animation: `fadeInUp 0.6s ease-out ${fact.delay}s both`,
                  zIndex: 10 + index,
                  backgroundColor: shade.bg,
                  borderColor: shade.border,
                  color: shade.text
                }}
              >
                <div className="flex flex-col h-full justify-between">
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: '#c4bfbb' }}
                  >
                    <Icon 
                      className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-foreground" 
                    />
                  </div>
                  <p className="font-semibold leading-tight text-xs md:text-sm lg:text-base">
                    {fact.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.8) rotate(var(--rotation, 0deg));
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(var(--rotation, 0deg));
          }
        }
        
        @media (max-width: 640px) {
          .chaos-fact-card {
            max-width: calc(50% - 0.5rem) !important;
            min-width: calc(50% - 0.5rem) !important;
            font-size: 0.7rem !important;
            padding: 0.75rem !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 768px) {
          .chaos-fact-card {
            max-width: calc(50% - 1rem) !important;
          }
        }
      `}</style>
    </section>
  )
}

