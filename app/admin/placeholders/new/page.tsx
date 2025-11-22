'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

// Get API URL - in browser, always use localhost, in Docker use environment variable
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
    if (envUrl.includes('backend:')) {
      return 'http://localhost:8080/api'
    }
    return envUrl
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
}

export default function NewPlaceholderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    path: '',
    title: 'Упс, данная страница в разработке',
    message: 'Мы работаем над этой страницей. Скоро она будет доступна!',
    is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/admin/placeholders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/admin/placeholders')
      } else {
        const error = await res.text()
        alert(`Ошибка при создании заглушки: ${error}`)
      }
    } catch (error) {
      console.error('Error creating placeholder:', error)
      alert('Ошибка при создании заглушки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/admin/placeholders" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-6">
          <ArrowLeft className="w-4 h-4" />
          Назад к списку заглушек
        </Link>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-8">Создать заглушку</h1>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Путь страницы <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              placeholder="/new или /portfolio"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Укажите путь страницы, для которой нужно показать заглушку (например: /new, /portfolio, /sale)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Заголовок <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Сообщение
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-foreground cursor-pointer">
              Активна (заглушка будет отображаться на указанном пути)
            </label>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Создание...' : 'Создать заглушку'}
            </button>
            <Link
              href="/admin/placeholders"
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

