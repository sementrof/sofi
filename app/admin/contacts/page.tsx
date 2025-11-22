'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2, Mail, Phone, User, MessageSquare } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface Contact {
  id: number
  name: string
  email: string
  phone: string
  message: string
  created_at: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/contacts`)
      const data = await res.json()
      setContacts(data)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот контакт?')) {
      return
    }

    try {
      const res = await fetch(`${API_URL}/admin/contacts/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setContacts(contacts.filter(c => c.id !== id))
      } else {
        alert('Ошибка при удалении контакта')
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Ошибка при удалении контакта')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
        <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-6">
          <ArrowLeft className="w-4 h-4" />
          Назад в админ-панель
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Контакты</h1>
            <p className="text-muted-foreground">
              Всего сообщений: {contacts.length}
            </p>
          </div>
        </div>

        {contacts.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Нет сообщений</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 text-foreground">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <span className="font-semibold">{contact.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:text-primary transition"
                        >
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <a
                            href={`tel:${contact.phone}`}
                            className="hover:text-primary transition"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {formatDate(contact.created_at)}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-foreground whitespace-pre-wrap">{contact.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition"
                    title="Удалить"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

