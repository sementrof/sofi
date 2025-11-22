'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface Collection {
  id: number
  name: string
  description: string
  image: string
  count: number
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${API_URL}/collections`)
      const data = await res.json()
      setCollections(data)
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту коллекцию?')) return

    try {
      const res = await fetch(`${API_URL}/admin/collections/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setCollections(collections.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      alert('Ошибка при удалении коллекции')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-2">
              <ArrowLeft className="w-4 h-4" />
              Назад к панели
            </Link>
            <h1 className="text-4xl font-serif font-bold text-foreground">Управление коллекциями</h1>
          </div>
          <Link
            href="/admin/collections/new"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5" />
            Добавить коллекцию
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div key={collection.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="h-48 bg-muted overflow-hidden">
                <img
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground">{collection.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/collections/${collection.id}/edit`}
                      className="p-2 text-primary hover:bg-primary/10 rounded transition"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(collection.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Товаров: {collection.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

