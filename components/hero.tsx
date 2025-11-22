import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/screenshot-hero.jpg"
          alt="Роскошная мебель для отелей"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight text-balance">
            Мебель и аксессуары для удобства ваших номеров
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
            Преобразите интерьер с помощью нашего широкого ассортимента мебели, сантехники и аксессуаров для уюта: предметы для комнат, оборудование и аксессуары для ванной, двери, решения для уборки и поддержания комфорта, текстиль и постельные принадлежности.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition"
              >
                Изучить каталог
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 hover:border-white/50 transition"
              >
                Комерческое предложение
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
