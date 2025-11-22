import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Shield, RotateCcw } from 'lucide-react'
import { notFound } from 'next/navigation'
import ProductImageCarousel from '@/components/product-image-carousel'

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
  images?: string[]
  color: string
  dimensions: string
  material: string
  features: string[]
}

async function getProduct(id: number): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      return null
    }
    return await res.json()
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      return []
    }
    return await res.json()
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

function getImageUrl(image: string | undefined): string {
  if (!image) return "/placeholder.svg"
  if (image.startsWith('/uploads/')) {
    const isDocker = API_URL.includes('backend:')
    const backendUrl = isDocker ? 'http://localhost:8080' : API_URL.replace('/api', '')
    return `${backendUrl}${image}`
  }
  return image
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = parseInt(id)
  
  if (isNaN(productId)) {
    notFound()
  }

  const product = await getProduct(productId)
  
  if (!product) {
    notFound()
  }

  // Get related products (other products from the same category, excluding current)
  const allProducts = await getProducts()
  const relatedProducts = allProducts
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, 3)

  // If no related products in same category, get any other products
  const finalRelatedProducts = relatedProducts.length > 0 
    ? relatedProducts 
    : allProducts.filter(p => p.id !== productId).slice(0, 3)

  // Build specifications from product data
  const specifications: Record<string, string> = {
    'Размеры': product.dimensions || 'Не указано',
    'Материал': product.material || 'Не указано',
    'Цвет': product.color || 'Не указано',
    }

  // Get images array or use single image
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => getImageUrl(img))
    : (product.image ? [getImageUrl(product.image)] : [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition">Главная</Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/catalog" className="text-muted-foreground hover:text-foreground transition">Каталог</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Image Gallery */}
          <ProductImageCarousel images={images} productName={product.name} />

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-accent">⭐ {product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviews} отзывов)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">{product.price} ₽</p>
              <p className="text-sm sm:text-base text-muted-foreground">В наличии</p>
            </div>

            <p className="text-base sm:text-lg text-foreground leading-relaxed">{product.description}</p>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4 py-4 sm:py-6 border-y border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Размеры</p>
                <p className="font-semibold text-foreground">{product.dimensions || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Материал</p>
                <p className="font-semibold text-foreground">{product.material || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Цвет</p>
                <p className="font-semibold text-foreground">{product.color || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Категория</p>
                <p className="font-semibold text-foreground">{product.category}</p>
              </div>
            </div>

            {/* Features List */}
            {product.features && product.features.length > 0 && (
            <div>
                <h3 className="font-semibold text-foreground mb-4">Ключевые особенности</h3>
              <ul className="space-y-3">
                {product.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="flex flex-col items-center text-center">
                <Shield className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm font-semibold text-foreground">Гарантия качества</p>
                <p className="text-xs text-muted-foreground">Премиальное качество</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm font-semibold text-foreground">Возврат 30 дней</p>
                <p className="text-xs text-muted-foreground">Легкий возврат</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-4 sm:mb-6">Характеристики</h2>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{key}</p>
                <p className="text-sm sm:text-base font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {finalRelatedProducts.length > 0 && (
        <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-4 sm:mb-6">Вам также может понравиться</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {finalRelatedProducts.map((related) => {
                const relatedImageUrl = getImageUrl(related.image)
                return (
              <Link
                key={related.id}
                href={`/products/${related.id}`}
                className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  <img
                        src={relatedImageUrl}
                    alt={related.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition mb-1 sm:mb-2 line-clamp-2">
                    {related.name}
                  </h3>
                  <p className="text-sm sm:text-base font-bold text-primary">{related.price} ₽</p>
                </div>
              </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
