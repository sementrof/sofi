import Header from '@/components/header'
import Hero from '@/components/hero'
import Categories from '@/components/categories'
import FeaturedProducts from '@/components/featured-products'
import Collections from '@/components/collections'
import AboutSection from '@/components/about-section'
import FAQ from '@/components/faq'
import Footer from '@/components/footer'
import SectionDivider from '@/components/section-divider'
import ChaosFacts from '@/components/chaos-facts'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <SectionDivider />
        <Categories />
        <SectionDivider />
        <FeaturedProducts />
        <ChaosFacts />
        <SectionDivider />
        <Collections />
        <SectionDivider />
        <AboutSection />
        <SectionDivider />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
