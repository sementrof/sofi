'use client'

import { Users, TrendingUp, Award } from 'lucide-react'
import Link from 'next/link'

export default function AboutSection() {
  const stats = [
    {
      icon: Users,
      value: '100+',
      label: 'Довольных клиентов',
      description: 'Отели по всему миру доверяют нам'
    },
    {
      icon: TrendingUp,
      value: '2+',
      label: 'Стран обслуживания',
      description: 'Международное присутствие'
    },
    {
      icon: Award,
      value: '1+',
      label: 'Лет опыта',
      description: 'В индустрии гостеприимства'
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            О SOFI
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Мы создаем премиальные мебельные решения для роскошных отелей и гостиничных комплексов по всему миру
          </p>
        </div>

        {/* Stats Grid - Centered */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">{stat.value}</div>
                  <div className="text-sm sm:text-base font-semibold text-foreground mb-1">{stat.label}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.description}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4 sm:space-y-6 text-center">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              Наша миссия
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4">
              Мы — <strong>SOFI (Sochi Furniture Interiors)</strong>, молодая компания из Сочи, которая выросла из простого стремления сделать оснащение гостевых домов удобным, надёжным и стильным. Наша миссия — помогать владельцам <strong>гостиниц, апартаментов и частных мини-отелей</strong> создавать комфортные и продуманные пространства для своих гостей.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4">
            Несмотря на то что <strong>SOFI</strong> только начинает свой путь, ми особенностей современы уже делаем ставку на качество, практичность и внимательное отношение к каждому клиенту. В нашем ассортименте — <strong>мебель для отелей, двери, сантехника, кровати, матрасы, подушки и одеяла</strong> по <strong>доступным ценам</strong>, а также решения для комфорта гостей, включая <strong>спрингбоксы и аксессуары для уютного интерьера</strong>.
            </p>
            <Link
              href="/about"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition"
            >
              Узнать больше
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

