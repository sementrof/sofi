'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HelpCircle, Plus, Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

function getApiUrl() {
  if (typeof window !== 'undefined') {
    return API_URL
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://backend:8080/api'
}

interface FAQ {
  id: number
  question: string
  answer: string
  order: number
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFAQs = async () => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/faqs`)
      if (res.ok) {
        const data = await res.json()
        setFaqs(Array.isArray(data) ? data : [])
        setError(null)
      } else {
        const errorText = await res.text()
        console.error('Failed to fetch FAQs:', res.status, errorText)
        setFaqs([])
        setError(`Ошибка при загрузке FAQ: ${errorText || res.statusText}`)
      }
    } catch (error: any) {
      console.error('Error fetching FAQs:', error)
      setFaqs([])
      setError(`Ошибка при загрузке FAQ: ${error.message || 'Неизвестная ошибка'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFAQs()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      return
    }

    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/admin/faqs/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setFaqs(faqs.filter(faq => faq.id !== id))
      } else {
        alert('Ошибка при удалении вопроса')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert('Ошибка при удалении вопроса')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к панели
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground">FAQ</h1>
                <p className="text-muted-foreground">Управление часто задаваемыми вопросами</p>
              </div>
            </div>
            <Link
              href="/admin/faqs/new"
              className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Добавить вопрос
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {faqs.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Нет вопросов</h3>
            <p className="text-muted-foreground mb-6">Добавьте первый вопрос, чтобы начать</p>
            <Link
              href="/admin/faqs/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition"
            >
              <Plus className="w-5 h-5" />
              Добавить вопрос
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Порядок: {faq.order}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/faqs/${faq.id}/edit`}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-2 text-red-600 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

