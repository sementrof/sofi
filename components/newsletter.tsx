'use client'

import { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-4">
            <Mail className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground">
            Будьте в курсе
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Подпишитесь на нашу рассылку, чтобы получать новинки коллекций, тренды дизайна и эксклюзивные предложения.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-8">
            <input
              type="email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {subscribed ? 'Спасибо!' : 'Подписаться'}
              {!subscribed && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-sm text-primary-foreground/60">
            Мы уважаем вашу конфиденциальность. Отписаться можно в любое время.
          </p>
        </div>
      </div>
    </section>
  )
}
