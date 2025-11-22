import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Товар не найден</h1>
          <p className="text-lg text-muted-foreground mb-8">
            К сожалению, запрашиваемый товар не существует или был удален.
          </p>
          <Link
            href="/catalog"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Вернуться в каталог
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

