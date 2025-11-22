'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

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

interface Placeholder {
  id: number
  path: string
  title: string
  message: string
  is_active: boolean
  created_at: string
}

export default function PlaceholdersPage() {
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlaceholders()
  }, [])

  const fetchPlaceholders = async () => {
    try {
      setError(null)
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/admin/placeholders`)
      if (res.ok) {
        const data = await res.json()
        // Ensure we have an array, even if API returns null
        setPlaceholders(Array.isArray(data) ? data : [])
      } else {
        const errorText = await res.text().catch(() => 'Unknown error')
        console.error('Failed to fetch placeholders:', res.status, errorText)
        setPlaceholders([])
        setError(`Ошибка загрузки: ${res.status}`)
      }
    } catch (error) {
      console.error('Error fetching placeholders:', error)
      setPlaceholders([])
      setError('Не удалось загрузить заглушки. Проверьте, что backend запущен.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заглушку?')) return

    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/admin/placeholders/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setPlaceholders(placeholders.filter(p => p.id !== id))
      } else {
        alert('Ошибка при удалении заглушки')
      }
    } catch (error) {
      console.error('Error deleting placeholder:', error)
      alert('Ошибка при удалении заглушки')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-4">
            <ArrowLeft className="w-4 h-4" />
            Назад к панели
          </Link>
        </div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Заглушки страниц</h1>
            <p className="text-muted-foreground">Управление заглушками для страниц в разработке</p>
          </div>
        <Link
          href="/admin/placeholders/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Добавить заглушку
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {placeholders.length === 0 && !loading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">Заглушки не найдены</p>
          <Link
            href="/admin/placeholders/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Создать первую заглушку
          </Link>
        </div>
      ) : placeholders.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Путь</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Заголовок</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">Дата создания</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-foreground uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {placeholders.map((placeholder) => (
                <tr key={placeholder.id} className="hover:bg-muted/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm font-mono text-foreground bg-muted px-2 py-1 rounded">
                      {placeholder.path}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-foreground">{placeholder.title}</div>
                    {placeholder.message && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{placeholder.message}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {placeholder.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="w-3 h-3" />
                        Активна
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                        <XCircle className="w-3 h-3" />
                        Неактивна
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(placeholder.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/placeholders/${placeholder.id}/edit`}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(placeholder.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      </div>
    </div>
  )
}

