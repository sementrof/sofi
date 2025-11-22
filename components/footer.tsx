import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-primary-foreground py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-accent rounded-sm flex items-center justify-center">
                <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="14" width="18" height="6" rx="1"/>
                  <path d="M4 14V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/>
                  <path d="M8 20v-6"/>
                  <path d="M16 20v-6"/>
                  <path d="M12 8V4"/>
                </svg>
              </div>
              <span className="font-serif font-bold">SOFI</span>
            </div>
            <p className="text-sm text-primary-foreground/70">
              Премиальные мебельные решения для роскошных гостиничных пространств.
            </p>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="font-semibold">Продукция</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalog" className="text-primary-foreground/70 hover:text-primary-foreground transition">Каталог</Link></li>
              <li><Link href="/collections" className="text-primary-foreground/70 hover:text-primary-foreground transition">Коллекции</Link></li>
              <li><Link href="/new" className="text-primary-foreground/70 hover:text-primary-foreground transition">Новинки</Link></li>
              <li><Link href="/sale" className="text-primary-foreground/70 hover:text-primary-foreground transition">Распродажа</Link></li>
            </ul>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h4 className="font-semibold">Компания</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-primary-foreground/70 hover:text-primary-foreground transition">О нас</Link></li>
              <li><Link href="/portfolio" className="text-primary-foreground/70 hover:text-primary-foreground transition">Портфолио</Link></li>
              <li><Link href="/contact" className="text-primary-foreground/70 hover:text-primary-foreground transition">Контакты</Link></li>
              <li><Link href="/careers" className="text-primary-foreground/70 hover:text-primary-foreground transition">Карьера</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Правовая информация</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-primary-foreground/70 hover:text-primary-foreground transition">Политика конфиденциальности</Link></li>
              <li><Link href="/terms" className="text-primary-foreground/70 hover:text-primary-foreground transition">Условия использования</Link></li>
              <li><Link href="/shipping" className="text-primary-foreground/70 hover:text-primary-foreground transition">Информация о доставке</Link></li>
              <li><Link href="/returns" className="text-primary-foreground/70 hover:text-primary-foreground transition">Возвраты</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/20 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {currentYear} SOFI. Все права защищены.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
