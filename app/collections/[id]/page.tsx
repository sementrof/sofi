import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface Product {
  id: number
  name: string
  price: number
  image: string
  images?: string[]
}

interface Collection {
  id: number
  name: string
  description: string
  image: string
  count: number
  products: Product[]
}

function getImageUrl(image: string | undefined, images?: string[]): string {
  if (!image && (!images || images.length === 0)) return "/placeholder.svg"
  const img = images && images.length > 0 ? images[0] : image
  if (!img) return "/placeholder.svg"
  if (img.startsWith('/uploads/')) {
    const isDocker = API_URL.includes('backend:')
    const backendUrl = isDocker ? 'http://localhost:8080' : API_URL.replace('/api', '')
    return `${backendUrl}${img}`
  }
  return img
}

async function getCollection(id: number): Promise<Collection | null> {
  try {
    const res = await fetch(`${API_URL}/collections/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const collectionId = parseInt(id)
  
  if (isNaN(collectionId)) {
    notFound()
  }

  const collection = await getCollection(collectionId)
  
  if (!collection) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] bg-muted overflow-hidden flex items-center justify-center w-full">
          <img
            src={getImageUrl(collection.image)}
            alt={collection.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center space-y-3 sm:space-y-4 text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold px-2">{collection.name}</h1>
              <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4">{collection.description}</p>
            </div>
          </div>
        </section>

        {/* Products in Collection */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-8 sm:mb-12 text-center">
              Товары в коллекции
            </h2>
            {collection.products && collection.products.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                  {collection.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="relative h-48 sm:h-56 md:h-64 bg-muted overflow-hidden">
                        <img
                          src={getImageUrl(product.image, product.images)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-base sm:text-lg font-bold text-primary">{product.price} ₽</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">В этой коллекции пока нет товаров</p>
              </div>
            )}
            <div className="text-center">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-8 py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-primary-foreground transition"
              >
                Изучить полный каталог
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
