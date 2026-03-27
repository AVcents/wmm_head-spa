'use client'

import { useState, useEffect } from 'react'
import { Clock, Loader2, AlertCircle } from 'lucide-react'
import type { Service } from '@/lib/services-data'

interface Slot {
  starts_at: string
  ends_at: string
}

interface Extra {
  id: string
  duration: number
}

interface Props {
  service: Service
  variantId: string | null
  date: string
  selectedExtras: Extra[]
  onSelect: (slot: { startsAt: string; endsAt: string }) => void
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateFr(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function SlotStep({ service, variantId, date, selectedExtras, onSelect }: Props) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSlots() {
      setLoading(true)
      setError(null)

      try {
        // Calculer la durée totale des extras
        const extrasDuration = selectedExtras.reduce((sum, extra) => sum + extra.duration, 0)

        // Appel direct avec les IDs Supabase — plus de matching Hapio
        const params = new URLSearchParams({
          action:    'slots',
          serviceId: service.id,
          date,
        })
        if (variantId) params.set('variantId', variantId)
        if (extrasDuration > 0) params.set('extrasDuration', extrasDuration.toString())

        const res = await fetch(`/api/booking?${params.toString()}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error((data as { error?: string }).error ?? 'Erreur lors du chargement des créneaux')
        }

        setSlots(
          (data as Array<{ starts_at: string; ends_at: string }>).map(s => ({
            starts_at: s.starts_at,
            ends_at:   s.ends_at,
          }))
        )
      } catch (err) {
        console.error('Slot fetch error:', err)
        setError('Impossible de charger les créneaux. Veuillez réessayer.')
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [service.id, variantId, date, selectedExtras])

  // Grouper par matin / après-midi
  const morningSlots   = slots.filter(s => new Date(s.starts_at).getHours() < 12)
  const afternoonSlots = slots.filter(s => new Date(s.starts_at).getHours() >= 12)

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
        Choisissez un créneau
      </h2>
      <p className="text-foreground-secondary mb-6 capitalize">
        {formatDateFr(date)}
      </p>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-3" />
          <p className="text-foreground-secondary text-sm">Chargement des disponibilités...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-error/10 border border-error/20 text-error">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && slots.length === 0 && (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 text-foreground-muted/40 mx-auto mb-4" />
          <p className="text-foreground-secondary text-lg mb-2">
            Aucun créneau disponible ce jour
          </p>
          <p className="text-foreground-muted text-sm">
            Essayez une autre date
          </p>
        </div>
      )}

      {!loading && !error && slots.length > 0 && (
        <div className="space-y-6">
          {morningSlots.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-3">
                Matin
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {morningSlots.map((slot) => (
                  <button
                    key={slot.starts_at}
                    onClick={() => onSelect({ startsAt: slot.starts_at, endsAt: slot.ends_at })}
                    className="px-4 py-3 rounded-xl border-2 border-border bg-surface text-foreground font-medium hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center"
                  >
                    {formatTime(slot.starts_at)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {afternoonSlots.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-3">
                Après-midi
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {afternoonSlots.map((slot) => (
                  <button
                    key={slot.starts_at}
                    onClick={() => onSelect({ startsAt: slot.starts_at, endsAt: slot.ends_at })}
                    className="px-4 py-3 rounded-xl border-2 border-border bg-surface text-foreground font-medium hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center"
                  >
                    {formatTime(slot.starts_at)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
