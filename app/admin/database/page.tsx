'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Database, Download, Upload, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

function getApiUrl() {
  if (typeof window !== 'undefined') {
    // Browser environment
    return API_URL
  }
  // Server environment - use internal Docker network URL
  return process.env.NEXT_PUBLIC_API_URL || 'http://backend:8080/api'
}

export default function DatabasePage() {
  const [creatingDump, setCreatingDump] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [dumpFile, setDumpFile] = useState<File | null>(null)

  const handleCreateDump = async () => {
    setCreatingDump(true)
    setMessage(null)

    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/admin/db/dump`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Дамп успешно создан: ${data.filename}. ${data.telegram_sent ? 'Отправлен в Telegram.' : ''}`,
        })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Ошибка при создании дампа',
        })
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `Ошибка: ${error.message || 'Неизвестная ошибка'}`,
      })
    } finally {
      setCreatingDump(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDumpFile(file)
      setMessage(null)
    }
  }

  const handleRestore = async () => {
    if (!dumpFile) {
      setMessage({
        type: 'error',
        text: 'Пожалуйста, выберите файл дампа',
      })
      return
    }

    if (!confirm('ВНИМАНИЕ! Восстановление дампа полностью заменит текущую базу данных. Продолжить?')) {
      return
    }

    setRestoring(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('dump', dumpFile)

      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/admin/db/restore`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: 'success',
          text: 'База данных успешно восстановлена из дампа',
        })
        setDumpFile(null)
        // Reset file input
        const fileInput = document.getElementById('dump-file') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Ошибка при восстановлении дампа',
        })
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: `Ошибка: ${error.message || 'Неизвестная ошибка'}`,
      })
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к панели
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-serif font-bold text-foreground">Управление базой данных</h1>
          </div>
          <p className="text-muted-foreground">Создание дампов и восстановление базы данных</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Create Dump Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Создать дамп базы данных</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Создаст резервную копию всей базы данных. Дамп будет автоматически отправлен в Telegram, если настроен бот.
            </p>
            <button
              onClick={handleCreateDump}
              disabled={creatingDump}
              className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {creatingDump ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Создание дампа...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Создать дамп
                </>
              )}
            </button>
          </div>

          {/* Restore Dump Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Восстановить из дампа</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              <strong className="text-red-600 dark:text-red-400">ВНИМАНИЕ:</strong> Восстановление полностью заменит
              текущую базу данных данными из дампа. Все текущие данные будут удалены.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="dump-file" className="block text-sm font-medium text-foreground mb-2">
                  Выберите файл дампа (.sql или .dump)
                </label>
                <input
                  id="dump-file"
                  type="file"
                  accept=".sql,.dump"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                  disabled={restoring}
                />
                {dumpFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Выбран файл: <strong>{dumpFile.name}</strong> ({(dumpFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <button
                onClick={handleRestore}
                disabled={restoring || !dumpFile}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {restoring ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Восстановление...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Восстановить базу данных
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-muted/30 border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Информация</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Дампы создаются в формате PostgreSQL (custom format)</li>
              <li>• Поддерживаются форматы .sql и .dump для восстановления</li>
              <li>• Для получения дампов через Telegram настройте переменные окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID</li>
              <li>• Рекомендуется создавать дампы регулярно для резервного копирования</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

