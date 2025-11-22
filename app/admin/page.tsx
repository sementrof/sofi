'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, FolderTree, Layers, Plus, Edit, Trash2, MessageSquare, AlertCircle, Database, HelpCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export default function AdminPage() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    collections: 0,
  })

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, products: data.length })))
      .catch(console.error)

    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, categories: data.length })))
      .catch(console.error)

    fetch(`${API_URL}/collections`)
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, collections: data.length })))
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Панель администратора</h1>
          <p className="text-muted-foreground">Управление содержимым сайта</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/admin/products"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">{stats.products}</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">Товары</h3>
            <p className="text-sm text-muted-foreground">Управление товарами</p>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <FolderTree className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">{stats.categories}</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">Категории</h3>
            <p className="text-sm text-muted-foreground">Управление категориями</p>
          </Link>

          <Link
            href="/admin/collections"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <Layers className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">{stats.collections}</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">Коллекции</h3>
            <p className="text-sm text-muted-foreground">Управление коллекциями</p>
          </Link>

          <Link
            href="/admin/contacts"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Контакты</h3>
            <p className="text-sm text-muted-foreground">Просмотр сообщений</p>
          </Link>

          <Link
            href="/admin/placeholders"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Заглушки</h3>
            <p className="text-sm text-muted-foreground">Управление заглушками страниц</p>
          </Link>

          <Link
            href="/admin/database"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">База данных</h3>
            <p className="text-sm text-muted-foreground">Дампы и восстановление</p>
          </Link>

          <Link
            href="/admin/faqs"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">FAQ</h3>
            <p className="text-sm text-muted-foreground">Часто задаваемые вопросы</p>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Быстрые действия</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-2 px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition"
            >
              <Plus className="w-5 h-5" />
              Добавить товар
            </Link>
            <Link
              href="/admin/categories/new"
              className="flex items-center gap-2 px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition"
            >
              <Plus className="w-5 h-5" />
              Добавить категорию
            </Link>
            <Link
              href="/admin/collections/new"
              className="flex items-center gap-2 px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition"
            >
              <Plus className="w-5 h-5" />
              Добавить коллекцию
            </Link>
            <Link
              href="/admin/placeholders/new"
              className="flex items-center gap-2 px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition"
            >
              <Plus className="w-5 h-5" />
              Добавить заглушку
            </Link>
            <Link
              href="/admin/faqs/new"
              className="flex items-center gap-2 px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition"
            >
              <Plus className="w-5 h-5" />
              Добавить вопрос FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

