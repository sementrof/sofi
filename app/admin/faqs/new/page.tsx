'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

function getApiUrl() {
  if (typeof window !== 'undefined') {
    return API_URL
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://backend:8080/api'
}

export default function NewFAQPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/admin/faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/admin/faqs')
      } else {
        const error = await res.text()
        alert(`Ошибка при создании вопроса: ${error}`)
      }
    } catch (error: any) {
      alert(`Ошибка при создании вопроса: ${error.message || 'Неизвестная ошибка'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/admin/faqs"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к FAQ
        </Link>

        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Добавить вопрос</h1>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-foreground mb-2">
              Вопрос *
            </label>
            <input
              type="text"
              id="question"
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Введите вопрос"
            />
          </div>

          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-foreground mb-2">
              Ответ *
            </label>
            <textarea
              id="answer"
              required
              rows={6}
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Введите ответ"
            />
          </div>

          <div>
            <label htmlFor="order" className="block text-sm font-medium text-foreground mb-2">
              Порядок отображения
            </label>
            <input
              type="number"
              id="order"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0"
            />
            <p className="mt-1 text-sm text-muted-foreground">Вопросы сортируются по этому полю (меньше = выше)</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Создание...
                </>
              ) : (
                'Создать вопрос'
              )}
            </button>
            <Link
              href="/admin/faqs"
              className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition"
            >
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

