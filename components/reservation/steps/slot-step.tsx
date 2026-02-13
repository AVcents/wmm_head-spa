'use client'

import { useState, useEffect } from 'react'
import { Clock, Loader2, AlertCircle } from 'lucide-react'
import type { Service } from '@/lib/services-data'

interface Slot {
  startsAt: string
  endsAt: string
  resourceId?: string
}

interface Props {
  service: Service
  variantId: string | null
  date: string
  onSelect: (
    slot: { startsAt: string; endsAt: string; resourceId?: string },
    hapioServiceId: string,
    hapioLocationId: string
  ) => void
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

// Normalise une chaîne pour la comparaison : minuscules + sans accents
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Matching robuste entre nom local et nom Hapio
function matchServiceName(localName: string, hapioName: string): boolean {
  const local = normalize(localName)
  const hapio = normalize(hapioName)
  // Correspondance exacte ou inclusion croisée sur le premier mot significatif
  const localWord = local.split(' ')[0] ?? ''
  const hapioWord = hapio.split(' ')[0] ?? ''
  return (
    local === hapio ||
    hapio.includes(local) ||
    local.includes(hapio) ||
    (localWord.length > 2 && hapio.startsWith(localWord)) ||
    (hapioWord.length > 2 && local.startsWith(hapioWord))
  )
}

export function SlotStep({ service, variantId, date, onSelect }: Props) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // IDs Hapio résolus, stockés ici pour être passés à onSelect
  const [resolvedHapioServiceId, setResolvedHapioServiceId] = useState<string>('')
  const [resolvedHapioLocationId, setResolvedHapioLocationId] = useState<string>('')

  useEffect(() => {
    async function fetchSlots() {
      setLoading(true)
      setError(null)

      try {
        // 1. Récupérer la location Hapio
        const locRes = await fetch('/api/booking?action=locations')
        const locations = await locRes.json()

        if (!locations.length) {
          setError('Aucun lieu configuré. Contactez le salon.')
          return
        }

        const locationId: string = locations[0].id

        // 2. Récupérer les services Hapio
        const svcRes = await fetch(`/api/booking?action=services&locationId=${locationId}`)
        const hapioServices: { id: string; name: string }[] = await svcRes.json()

        if (!hapioServices.length) {
          setError('Aucune prestation configurée dans le système de réservation.')
          return
        }

        // 3. Matching : variant exact en priorité, sinon prestation par nom
        const selectedVariant = variantId
          ? service.variants?.find((v) => v.id === variantId) ?? null
          : null

        // Essai 1 : correspondance exacte (normalisée) avec le nom du variant
        let matchedService: { id: string; name: string } | null | undefined = null
        if (selectedVariant) {
          const variantNorm = normalize(selectedVariant.name)
          matchedService = hapioServices.find((hs) => normalize(hs.name) === variantNorm) ?? null
        }

        // Essai 2 : fallback par nom de prestation (matching flou)
        if (!matchedService) {
          matchedService =
            hapioServices.find((hs) => matchServiceName(service.name, hs.name)) ??
            hapioServices[0] ??
            null
        }

        if (!matchedService) {
          setError('Prestation non configurée dans le système de réservation.')
          return
        }

        // Stocker les IDs résolus
        setResolvedHapioServiceId(matchedService.id)
        setResolvedHapioLocationId(locationId)

        console.log('[Slots] Service Hapio utilisé:', matchedService.name, '→', matchedService.id)

        // 4. Récupérer les créneaux avec les vrais IDs Hapio
        const slotsRes = await fetch(
          `/api/booking?action=slots&serviceId=${matchedService.id}&locationId=${locationId}&from=${date}&to=${date}`
        )

        if (!slotsRes.ok) {
          throw new Error('Erreur lors du chargement des créneaux')
        }

        const slotsData = await slotsRes.json()
        setSlots(
          slotsData.map((s: { starts_at: string; ends_at: string; resources?: { id: string }[] }) => ({
            startsAt: s.starts_at,
            endsAt: s.ends_at,
            resourceId: s.resources?.[0]?.id,
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
  }, [service, variantId, date])

  // Grouper les créneaux par matin / après-midi
  const morningSlots = slots.filter((s) => {
    const hour = new Date(s.startsAt).getHours()
    return hour < 12
  })
  const afternoonSlots = slots.filter((s) => {
    const hour = new Date(s.startsAt).getHours()
    return hour >= 12
  })

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
                    key={slot.startsAt}
                    onClick={() => onSelect(slot, resolvedHapioServiceId, resolvedHapioLocationId)}
                    className="px-4 py-3 rounded-xl border-2 border-border bg-surface text-foreground font-medium hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center"
                  >
                    {formatTime(slot.startsAt)}
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
                    key={slot.startsAt}
                    onClick={() => onSelect(slot, resolvedHapioServiceId, resolvedHapioLocationId)}
                    className="px-4 py-3 rounded-xl border-2 border-border bg-surface text-foreground font-medium hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center"
                  >
                    {formatTime(slot.startsAt)}
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
