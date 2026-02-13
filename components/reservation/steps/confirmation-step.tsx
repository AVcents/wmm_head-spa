'use client'

import { CheckCircle, Calendar, Clock, Mail, Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { BookingState } from '../reservation-content'

interface Props {
  booking: BookingState
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

export function ConfirmationStep({ booking }: Props) {
  const variant = booking.variantId
    ? booking.service?.variants?.find((v) => v.id === booking.variantId)
    : null

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
      </div>

      <h2 className="text-3xl font-serif font-bold text-foreground mb-3">
        Réservation confirmée !
      </h2>
      <p className="text-foreground-secondary text-lg mb-8">
        Un email de confirmation a été envoyé à{' '}
        <strong className="text-foreground">{booking.clientInfo?.email}</strong>
      </p>

      {/* Récapitulatif */}
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-md mx-auto text-left mb-8">
        <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-4">
          Votre rendez-vous
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-lg font-serif font-semibold text-foreground">
              {booking.service?.name}
            </p>
            {variant && (
              <p className="text-sm text-foreground-secondary">
                {variant.hairLengthLabel}
              </p>
            )}
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary-600" />
            <span className="text-foreground capitalize">
              {booking.date ? formatDateFr(booking.date) : ''}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary-600" />
            <span className="text-foreground">
              {booking.slot ? formatTime(booking.slot.startsAt) : ''}
            </span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-foreground-muted" />
            <span className="text-sm text-foreground-secondary">
              {booking.clientInfo?.email}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-foreground-muted" />
            <span className="text-sm text-foreground-secondary">
              {booking.clientInfo?.phone}
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
      >
        Retour à l&apos;accueil
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
