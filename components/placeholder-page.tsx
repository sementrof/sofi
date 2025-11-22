'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'

// Get API URL - in browser, always use localhost, in Docker use environment variable
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: check if we're in Docker (backend:8080) and convert to localhost
    const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
    if (envUrl.includes('backend:')) {
      return 'http://localhost:8080/api'
    }
    return envUrl
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
}

interface PlaceholderData {
  title: string
  message: string
}

export default function PlaceholderPage({ path }: { path: string }) {
  const [placeholder, setPlaceholder] = useState<PlaceholderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkPlaceholder()
  }, [path])

  const checkPlaceholder = async () => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/placeholder/check?path=${encodeURIComponent(path)}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.exists === true && data.placeholder) {
          setPlaceholder({
            title: data.placeholder.title,
            message: data.placeholder.message || 'Мы работаем над этой страницей. Скоро она будет доступна!',
          })
        } else {
          setPlaceholder(null)
        }
      } else {
        setPlaceholder(null)
      }
    } catch (error) {
      console.error('Error checking placeholder:', error)
      setPlaceholder(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Загрузка...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!placeholder) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Загрузка...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center min-h-[60vh] py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              {placeholder.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {placeholder.message}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition"
            >
              <Home className="w-4 h-4" />
              На главную
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

