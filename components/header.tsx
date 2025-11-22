'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="14" width="18" height="6" rx="1"/>
                <path d="M4 14V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/>
                <path d="M8 20v-6"/>
                <path d="M16 20v-6"/>
                <path d="M12 8V4"/>
              </svg>
            </div>
            <span className="hidden sm:inline font-serif text-xl font-semibold text-foreground">SOFI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/catalog" className="text-sm font-medium text-foreground hover:text-primary transition">
              Каталог
            </Link>
            <Link href="/collections" className="text-sm font-medium text-foreground hover:text-primary transition">
              Коллекции
            </Link>
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition">
              О нас
            </Link>
            <Link href="/contact" className="text-sm font-medium text-foreground hover:text-primary transition">
              Контакты
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 border-t border-border">
            <Link href="/catalog" className="block px-4 py-2 text-sm text-foreground hover:bg-muted">
              Каталог
            </Link>
            <Link href="/collections" className="block px-4 py-2 text-sm text-foreground hover:bg-muted">
              Коллекции
            </Link>
            <Link href="/about" className="block px-4 py-2 text-sm text-foreground hover:bg-muted">
              О нас
            </Link>
            <Link href="/contact" className="block px-4 py-2 text-sm text-foreground hover:bg-muted">
              Контакты
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
