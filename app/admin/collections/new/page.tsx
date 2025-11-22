'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface Product {
  id: number
  name: string
  category: string
  price: number
  image: string
}

export default function NewCollectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  })

  useEffect(() => {
    fetchAllProducts()
  }, [])

  const fetchAllProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`)
      if (res.ok) {
        const data = await res.json()
        setAllProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB')
      return
    }

    setUploading(true)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        body: formDataUpload,
      })

      if (res.ok) {
        const data = await res.json()
        // Save only the path in DB, not full URL
        const imagePath = data.url
        // Use localhost for browser access, backend hostname for Docker (for preview only)
        const isDocker = API_URL.includes('backend:')
        const backendUrl = isDocker ? 'http://localhost:8080' : API_URL.replace('/api', '')
        setFormData(prev => ({ ...prev, image: imagePath }))
        setImagePreview(`${backendUrl}${imagePath}`)
      } else {
        alert('Ошибка при загрузке изображения')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Ошибка при загрузке изображения')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const collection = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
      }

      const res = await fetch(`${API_URL}/admin/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collection),
      })

      if (res.ok) {
        const newCollection = await res.json()
        // Add products to collection
        if (selectedProducts.length > 0) {
          for (const productId of selectedProducts) {
            await fetch(`${API_URL}/admin/collections/${newCollection.id}/products`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ product_id: productId }),
            })
          }
        }
        router.push('/admin/collections')
      } else {
        alert('Ошибка при создании коллекции')
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      alert('Ошибка при создании коллекции')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/admin/collections" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-6">
          <ArrowLeft className="w-4 h-4" />
          Назад к коллекциям
        </Link>

        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Новая коллекция</h1>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Название *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Описание *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Изображение *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              required={!formData.image}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 disabled:opacity-50"
            />
            {uploading && <p className="text-sm text-muted-foreground mt-2">Загрузка...</p>}
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Превью"
                  className="max-w-xs h-48 object-cover rounded-lg border border-border"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Выберите товары для коллекции ({selectedProducts.length})
            </label>
            <div className="max-h-64 overflow-y-auto border border-border rounded-lg p-4 space-y-2">
              {allProducts.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="w-4 h-4 accent-primary"
                  />
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category} • {product.price} ₽</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <Link
              href="/admin/collections"
              className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition"
            >
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

