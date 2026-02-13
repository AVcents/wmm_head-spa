'use client'

import { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Gift,
  Loader2,
  Clock,
  Euro,
  Calendar,
} from 'lucide-react'
import type { BookingState } from '../reservation-content'

interface Props {
  booking: BookingState
  onConfirm: (
    clientInfo: {
      name: string
      email: string
      phone: string
      message?: string
      giftCardCode?: string
    },
    bookingId: string
  ) => void
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('fr-FR', {
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
    year: 'numeric',
  })
}

export function InfoStep({ booking, onConfirm }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [giftCardCode, setGiftCardCode] = useState('')
  const [useGiftCard, setUseGiftCard] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const variant = booking.variantId
    ? booking.service?.variants?.find((v) => v.id === booking.variantId)
    : null

  const price = variant?.price ?? booking.service?.price ?? 0
  const duration = variant?.duration ?? booking.service?.duration ?? 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Créer la réservation via notre API proxy
      if (!booking.hapioServiceId || !booking.hapioLocationId) {
        throw new Error('Configuration de réservation incomplète. Veuillez recommencer.')
      }

      console.log('[Réservation] Création avec:', {
        serviceId: booking.hapioServiceId,
        resourceId: booking.slot?.resourceId,
        startsAt: booking.slot?.startsAt,
      })

      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: booking.hapioServiceId,    // UUID Hapio (résolu dans slot-step)
          locationId: booking.hapioLocationId,  // UUID Hapio (résolu dans slot-step)
          startsAt: booking.slot?.startsAt,
          endsAt: booking.slot?.endsAt,
          resourceId: booking.slot?.resourceId,
          metadata: {
            name,
            email,
            phone,
            message: message || undefined,
            gift_card_code: giftCardCode || undefined,
            service_name: booking.service?.name ?? '',
            variant_name: variant?.hairLengthLabel ?? '',
            price: String(price),
            duration: String(duration),
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur lors de la réservation')
      }

      const data = await res.json()

      onConfirm(
        { name, email, phone, message, giftCardCode },
        data.id
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all'

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
        Vos coordonnées
      </h2>

      {/* Récapitulatif */}
      <div className="bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 rounded-2xl p-5 mb-8">
        <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-3">
          Récapitulatif
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary">Prestation</span>
            <span className="font-medium text-foreground">
              {booking.service?.name}
              {variant ? ` — ${variant.hairLengthLabel}` : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Date
            </span>
            <span className="font-medium text-foreground capitalize">
              {booking.date ? formatDateFr(booking.date) : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Heure
            </span>
            <span className="font-medium text-foreground">
              {booking.slot ? formatTime(booking.slot.startsAt) : ''}
            </span>
          </div>
          <div className="h-px bg-primary-200 dark:bg-primary-800/30 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Durée
            </span>
            <span className="font-medium text-foreground">{duration} min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary flex items-center gap-1.5">
              <Euro className="h-4 w-4" /> Prix
            </span>
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              {price}€
            </span>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <User className="h-4 w-4 text-foreground-muted" />
            Nom complet
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom et nom"
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
              <Mail className="h-4 w-4 text-foreground-muted" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
              <Phone className="h-4 w-4 text-foreground-muted" />
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <MessageSquare className="h-4 w-4 text-foreground-muted" />
            Message (optionnel)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Informations complémentaires, allergies..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Bon cadeau */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useGiftCard}
              onChange={(e) => setUseGiftCard(e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
            />
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Gift className="h-4 w-4 text-primary-600" />
              J&apos;ai un bon cadeau
            </span>
          </label>

          {useGiftCard && (
            <div className="mt-3">
              <input
                type="text"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                placeholder="Code du bon cadeau (ex: KALM-XXXX)"
                className={inputClass}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-primary-600 text-white font-semibold text-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-4"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Réservation en cours...
            </>
          ) : (
            'Confirmer la réservation'
          )}
        </button>
      </form>
    </div>
  )
}
