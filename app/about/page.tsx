import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Award, Users, Globe } from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { icon: Users, label: 'Довольных клиентов', value: '100+' },
    { icon: Globe, label: 'Стран обслуживания', value: '2+' },
    { icon: Award, label: 'Лет опыта', value: '1+' },
  ]


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/img/123.jpg"
              alt="О SOFI"
              className="w-full h-full object-cover"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50 dark:bg-black/60"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white">
              О SOFI
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Два десятилетия совершенства в премиальной мебели для отелей и гостиничных решениях
            </p>
          </div>
        </section>

        {/* Stats Section - Centered */}
        <section className="py-12 sm:py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon
                  return (
                    <div key={idx} className="text-center space-y-2 sm:space-y-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                      </div>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Company Story */}
        <section className="py-12 sm:py-16 md:py-24 bg-card">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                <h2 className="text-4xl font-serif font-bold text-foreground">
                  Наша история
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                Мы — молодая компания из Сочи, которая выросла из простого стремления сделать оснащение гостевых домов удобным, надёжным и доступным. Наша миссия — помочь владельцам гостиниц, апартаментов и частных мини-отелей создавать комфортные пространства для своих гостей.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                Несмотря на то что мы только начинаем свой путь, мы уже сделали ставку на качество, практичность и внимательное отношение к каждому клиенту. В нашем ассортименте — сантехника, двери, матрасы, унитазы и кровати, подобранные с учётом реальных потребностей местного рынка и особенностей современной индустрии гостеприимства.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                Мы стремимся стать вашим надёжным партнёром, предлагая решения, которые сочетают функциональность, долговечность и современный стиль. Каждый товар мы выбираем так, словно оснащаем собственный гостевой дом — с заботой о комфорте и доверии.
                </p>
                <Link
                  href="/contact"
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition mt-4"
                >
                  Связаться с нами
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-serif font-bold text-foreground text-center mb-12">
              Наши ценности
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-card border border-border rounded-lg">
                <h3 className="text-2xl font-serif font-bold text-foreground">Качество</h3>
                <p className="text-muted-foreground">
                  
                </p>
              </div>
              <div className="space-y-4 p-6 bg-card border border-border rounded-lg">
                <h3 className="text-2xl font-serif font-bold text-foreground">Устойчивость</h3>
                <p className="text-muted-foreground">
                 
                </p>
              </div>
              <div className="space-y-4 p-6 bg-card border border-border rounded-lg">
                <h3 className="text-2xl font-serif font-bold text-foreground">Инновации</h3>
                <p className="text-muted-foreground">
                  
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
