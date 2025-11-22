'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

interface FAQItem {
  id: number
  question: string
  answer: string
  order: number
}

function getApiUrl() {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://backend:8080/api'
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const apiUrl = getApiUrl()
        const res = await fetch(`${apiUrl}/faqs`, { 
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (res.ok) {
          const data = await res.json()
          // Сортируем FAQ по полю order, затем по id
          const sortedFaqs = Array.isArray(data) 
            ? data.sort((a: FAQItem, b: FAQItem) => {
                if (a.order !== b.order) {
                  return a.order - b.order
                }
                return a.id - b.id
              })
            : []
          setFaqs(sortedFaqs)
        } else {
          console.error('Failed to fetch FAQs:', res.status, res.statusText)
          setFaqs([])
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error)
        setFaqs([])
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">Загрузка вопросов...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-3 sm:mb-4">
            <HelpCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4">
            Часто задаваемые вопросы
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Найдите ответы на популярные вопросы о наших услугах и продукции
          </p>
        </div>

        {faqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Вопросы пока не добавлены</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left gap-3 sm:gap-4 hover:bg-muted/50 transition"
                >
                  <span className="text-sm sm:text-base font-semibold text-foreground pr-2 sm:pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-0">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
            Не нашли ответ на свой вопрос?
          </p>
          <a
            href="/contact"
            className="inline-block px-5 sm:px-6 py-2 sm:py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition text-sm sm:text-base"
          >
            Свяжитесь с нами
          </a>
        </div>
      </div>
    </section>
  )
}

