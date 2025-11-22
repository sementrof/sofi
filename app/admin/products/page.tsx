'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, ArrowLeft, Star } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface Product {
  id: number
  name: string
  category: string
  price: number
  rating: number
  reviews: number
  description: string
  image: string
  color: string
  dimensions: string
  material: string
  features: string[]
  featured?: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`)
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return

    try {
      const res = await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Ошибка при удалении товара')
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
            <h1 className="text-4xl font-serif font-bold text-foreground">Управление товарами</h1>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5" />
            Добавить товар
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Название</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Категория</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Цена</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Рейтинг</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Рекомендуемый</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm text-foreground">{product.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{product.price} ₽</td>
                    <td className="px-6 py-4 text-sm text-foreground">⭐ {product.rating}</td>
                    <td className="px-6 py-4 text-sm">
                      {product.featured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                          <Star className="w-3 h-3 fill-primary" />
                          Да
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Нет</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-primary hover:bg-primary/10 rounded transition"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded transition"
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
        </div>
      </div>
    </div>
  )
}

