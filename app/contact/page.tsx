'use client'

import { useState } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Phone, Mail, MapPin, Send } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', phone: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError('Ошибка при отправке формы. Попробуйте еще раз.')
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('Ошибка при отправке формы. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Имя *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ваше имя"
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Номер телефона
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+7 (999) 123-45-67"
          className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Сообщение *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Ваше сообщение..."
          rows={6}
          className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          required
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        {loading ? 'Отправка...' : 'Отправить сообщение'}
      </button>

      {submitted && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 text-center font-medium">
          Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.
        </div>
      )}
    </form>
  )
}

export default function ContactPage() {

  const contactInfo = [
    {
      icon: Phone,
      title: 'Телефон',
      content: '+1 (555) 123-4567',
      subtext: 'Пн-Пт, 9:00-18:00 EST'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'sales@sofi.ru',
      subtext: 'Ответ в течение 24 часов'
    },
    {
      icon: MapPin,
      title: 'Адрес',
      content: '123 Design Avenue',
      subtext: 'Нью-Йорк, NY 10001, США'
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-to-b from-muted to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground">
              Свяжитесь с нами
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Есть вопросы? Наша команда готова помочь вам найти идеальное мебельное решение.
            </p>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-12 sm:py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 lg:p-12">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 sm:mb-8 text-center">
                Форма обратной связи
              </h2>

              <ContactForm />
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
              {contactInfo.map((info, idx) => {
                const Icon = info.icon
                return (
                  <div
                    key={idx}
                    className="bg-card border border-border rounded-lg p-6 text-center space-y-3 hover:shadow-lg transition"
                  >
                    <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{info.title}</h3>
                    <p className="font-medium text-primary">{info.content}</p>
                    <p className="text-sm text-muted-foreground">{info.subtext}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
