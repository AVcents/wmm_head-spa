'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, Check, Loader2, AlertCircle, Sun, Snowflake } from 'lucide-react'

interface ScheduleHour {
  id: number
  template_id: string
  day_label: string
  hours: string
  sort_order: number
}

interface ScheduleTemplate {
  id: string
  label: string
  sort_order: number
  schedule_hours: ScheduleHour[]
}

const templateIcons: Record<string, typeof Sun> = {
  'semaine-impaire': Sun,
  'semaine-paire': Sun,
  'vacances-impaire': Snowflake,
  'vacances-paire': Snowflake,
}

const templateColors: Record<string, string> = {
  'semaine-impaire': 'from-primary-500 to-primary-600',
  'semaine-paire': 'from-secondary-500 to-secondary-600',
  'vacances-impaire': 'from-blue-500 to-blue-600',
  'vacances-paire': 'from-purple-500 to-purple-600',
}

export default function AdminHorairesPage() {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([])
  const [activeTemplateId, setActiveTemplateId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [confirmTemplate, setConfirmTemplate] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/schedule')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates)
        setActiveTemplateId(data.activeTemplateId)
      }
    } catch {
      showToast('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleChangeTemplate = async (templateId: string) => {
    if (templateId === activeTemplateId) return

    setConfirmTemplate(templateId)
  }

  const confirmChange = async () => {
    if (!confirmTemplate) return

    setUpdating(confirmTemplate)
    setConfirmTemplate(null)

    try {
      const res = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: confirmTemplate }),
      })

      if (res.ok) {
        setActiveTemplateId(confirmTemplate)
        showToast('Horaires mis à jour avec succès', 'success')
      } else {
        showToast('Erreur lors de la mise à jour', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          Gestion des horaires
        </h1>
        <p className="text-foreground-secondary">
          Sélectionnez le créneau horaire à afficher sur le site.
          Le changement est immédiat.
        </p>
      </div>

      {/* Current active template */}
      <div className="mb-8 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-600">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-foreground-muted">Horaires actuellement affichés</p>
            <p className="font-semibold text-foreground">
              {templates.find((t) => t.id === activeTemplateId)?.label ?? '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => {
          const isActive = template.id === activeTemplateId
          const isUpdating = updating === template.id
          const Icon = templateIcons[template.id] ?? Clock
          const gradient = templateColors[template.id] ?? 'from-primary-500 to-primary-600'

          return (
            <div
              key={template.id}
              className={`relative rounded-2xl border-2 transition-all ${
                isActive
                  ? 'border-primary-500 bg-surface shadow-lg'
                  : 'border-border bg-surface hover:border-primary-300 hover:shadow-md'
              }`}
            >
              {/* Active badge */}
              {isActive && (
                <div className="absolute -top-3 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-bold">
                  <Check className="h-3 w-3" />
                  ACTIF
                </div>
              )}

              <div className="p-6">
                {/* Template header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${gradient}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-foreground">
                    {template.label}
                  </h3>
                </div>

                {/* Hours preview */}
                <div className="space-y-2 mb-6">
                  {template.schedule_hours.map((hour) => (
                    <div
                      key={hour.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-foreground-secondary">{hour.day_label}</span>
                      <span
                        className={`font-medium ${
                          hour.hours === 'Fermé'
                            ? 'text-foreground-muted'
                            : 'text-foreground'
                        }`}
                      >
                        {hour.hours}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action button */}
                <button
                  onClick={() => handleChangeTemplate(template.id)}
                  disabled={isActive || isUpdating}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 cursor-default'
                      : isUpdating
                        ? 'bg-background text-foreground-muted cursor-wait'
                        : 'bg-background border border-border text-foreground hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 hover:text-primary-700 dark:hover:text-primary-400'
                  }`}
                >
                  {isActive ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4" />
                      Horaires actuels
                    </span>
                  ) : isUpdating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mise à jour...
                    </span>
                  ) : (
                    'Appliquer ces horaires'
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Confirmation modal */}
      {confirmTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-warning/10">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">
                Confirmer le changement
              </h3>
            </div>

            <p className="text-foreground-secondary mb-6">
              Les horaires affichés sur le site seront immédiatement remplacés par
              <strong className="text-foreground">
                {' '}
                {templates.find((t) => t.id === confirmTemplate)?.label}
              </strong>
              . Continuer ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTemplate(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-background transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmChange}
                className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border ${
            toast.type === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-error/10 border-error/20 text-error'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  )
}
