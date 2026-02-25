'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Loader2,
  AlertCircle,
  Check,
  Clock,
  Calendar,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  CreditCard,
  User,
  Scissors,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react'
import type { BookingRow } from '@/lib/supabase/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateFr(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function todayIso() {
  return new Date().toISOString().split('T')[0]!
}

function plusDaysIso(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().split('T')[0]!
}

const PAYMENT_LABELS: Record<string, string> = {
  hold:       'Empreinte',
  direct:     'Carte',
  gift_card:  'Bon cadeau',
  in_person:  'Sur place',
}

const STATUS_LABELS: Record<string, string> = {
  confirmed:  'Confirmée',
  cancelled:  'Annulée',
  no_show:    'No-show',
}

const STATUS_CLASSES: Record<string, string> = {
  confirmed: 'text-success bg-success/10 border border-success/20',
  cancelled: 'text-error bg-error/10 border border-error/20',
  no_show:   'text-warning bg-warning/10 border border-warning/20',
}

// ─── Composant détail d'une réservation ───────────────────────────────────────

function BookingDetail({ booking, onClose, onCancel }: {
  booking: BookingRow
  onClose: () => void
  onCancel: () => void
}) {
  const rowClass   = 'flex items-start justify-between py-2.5 border-b border-border last:border-0'
  const labelClass = 'text-sm text-foreground-secondary flex items-center gap-1.5 min-w-0 shrink-0 w-36'
  const valueClass = 'text-sm font-medium text-foreground text-right'

  return (
    <div className="bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-semibold text-foreground">Détail réservation</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-surface rounded-lg transition-colors">
          <X className="h-4 w-4 text-foreground-muted" />
        </button>
      </div>

      <div>
        <div className={rowClass}>
          <span className={labelClass}><Scissors className="h-4 w-4" />Prestation</span>
          <span className={valueClass}>
            {booking.service_name}
            {booking.variant_name ? ` – ${booking.variant_name}` : ''}
          </span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}><Calendar className="h-4 w-4" />Date</span>
          <span className={valueClass + ' capitalize'}>{formatDateFr(booking.starts_at)}</span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}><Clock className="h-4 w-4" />Heure</span>
          <span className={valueClass}>{formatTime(booking.starts_at)} → {formatTime(booking.ends_at)}</span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}><User className="h-4 w-4" />Client</span>
          <span className={valueClass}>{booking.client_name}</span>
        </div>
        {booking.client_phone && (
          <div className={rowClass}>
            <span className={labelClass}><Phone className="h-4 w-4" />Téléphone</span>
            <span className={valueClass}>{booking.client_phone}</span>
          </div>
        )}
        {booking.client_email && (
          <div className={rowClass}>
            <span className={labelClass}><Mail className="h-4 w-4" />Email</span>
            <span className={valueClass}>{booking.client_email}</span>
          </div>
        )}
        <div className={rowClass}>
          <span className={labelClass}><CreditCard className="h-4 w-4" />Paiement</span>
          <span className={valueClass}>
            {PAYMENT_LABELS[booking.payment_mode] ?? booking.payment_mode}
            {booking.price != null ? ` — ${booking.price}€` : ''}
          </span>
        </div>
        {(booking.extras_json ?? []).length > 0 && (
          <div className={rowClass}>
            <span className={labelClass}>Options</span>
            <span className={valueClass + ' text-left'}>
              {(booking.extras_json ?? []).map(e => `${e.name} (+${e.price}€)`).join(', ')}
            </span>
          </div>
        )}
        {booking.client_message && (
          <div className={rowClass}>
            <span className={labelClass}><MessageSquare className="h-4 w-4" />Message</span>
            <span className={valueClass}>{booking.client_message}</span>
          </div>
        )}
        {booking.note && (
          <div className={rowClass}>
            <span className={labelClass}>Note admin</span>
            <span className={valueClass}>{booking.note}</span>
          </div>
        )}
        <div className={rowClass}>
          <span className={labelClass}>Statut</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASSES[booking.status] ?? ''}`}>
            {STATUS_LABELS[booking.status] ?? booking.status}
          </span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}>Réf.</span>
          <span className="font-mono text-xs bg-surface border border-border px-2 py-0.5 rounded">{booking.id.slice(0, 8)}</span>
        </div>
      </div>

      {booking.status === 'confirmed' && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-5 flex items-center gap-2 text-sm text-error border border-error/20 hover:bg-error/10 px-4 py-2 rounded-xl transition-colors"
        >
          <X className="h-4 w-4" />
          Annuler cette réservation
        </button>
      )}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

type Filter = 'upcoming' | 'past' | 'all'

export default function AdminReservationsPage() {
  const [bookings, setBookings]     = useState<BookingRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<Filter>('upcoming')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [toast, setToast]           = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchBookings = useCallback(async (f: Filter = filter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (f === 'upcoming') params.set('from', todayIso())
      if (f === 'past') {
        params.set('from', plusDaysIso(-180))
        params.set('to', todayIso())
      }
      const res = await fetch(`/api/admin/bookings?${params.toString()}`)
      if (!res.ok) throw new Error('Erreur chargement')
      const data: BookingRow[] = await res.json()
      // Trier : upcoming → asc, autres → desc
      const sorted = [...data].sort((a, b) => {
        const diff = new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        return f === 'past' ? -diff : diff
      })
      setBookings(sorted)
    } catch {
      showToast('Impossible de charger les réservations', 'error')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { void fetchBookings(filter) }, [filter, fetchBookings])

  const handleCancel = async (id: string) => {
    setCancelling(id)
    try {
      const res = await fetch(`/api/booking`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id }),
      })
      if (!res.ok) throw new Error('Erreur annulation')
      showToast('Réservation annulée', 'success')
      setExpandedId(null)
      void fetchBookings(filter)
    } catch {
      showToast('Impossible d\'annuler la réservation', 'error')
    } finally {
      setCancelling(null)
    }
  }

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Réservations
          </h1>
          <p className="text-foreground-secondary">
            {loading ? '…' : `${confirmedCount} réservation${confirmedCount > 1 ? 's' : ''} confirmée${confirmedCount > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => void fetchBookings(filter)}
          className="p-3 rounded-xl border border-border hover:bg-background transition-colors text-foreground-muted"
          title="Rafraîchir"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 mb-6">
        {(['upcoming', 'past', 'all'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-surface border border-border text-foreground-secondary hover:border-primary-300'
            }`}
          >
            {f === 'upcoming' ? 'À venir' : f === 'past' ? 'Passées' : 'Toutes'}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 text-foreground-muted">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Aucune réservation</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => {
            const isExpanded = expandedId === b.id
            return (
              <div key={b.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                  className="w-full text-left px-5 py-4 hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Date + heure */}
                      <div className="shrink-0 text-center w-14">
                        <p className="text-xs text-foreground-muted capitalize">
                          {new Date(b.starts_at).toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </p>
                        <p className="text-lg font-bold text-foreground leading-none">
                          {new Date(b.starts_at).getDate()}
                        </p>
                        <p className="text-xs text-foreground-muted capitalize">
                          {new Date(b.starts_at).toLocaleDateString('fr-FR', { month: 'short' })}
                        </p>
                      </div>

                      <div className="h-10 w-px bg-border shrink-0" />

                      {/* Infos */}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {b.client_name}
                        </p>
                        <p className="text-sm text-foreground-secondary truncate">
                          {b.service_name}
                          {b.variant_name ? ` – ${b.variant_name}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:flex items-center gap-1 text-sm text-foreground-muted">
                        <Clock className="h-3 w-3" />
                        {formatTime(b.starts_at)}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASSES[b.status] ?? ''}`}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4 text-foreground-muted" />
                        : <ChevronDown className="h-4 w-4 text-foreground-muted" />
                      }
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5">
                    <BookingDetail
                      booking={b}
                      onClose={() => setExpandedId(null)}
                      onCancel={() => {
                        if (cancelling) return
                        void handleCancel(b.id)
                      }}
                    />
                    {cancelling === b.id && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-foreground-secondary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Annulation en cours…
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border ${
          toast.type === 'success'
            ? 'bg-success/10 border-success/20 text-success'
            : 'bg-error/10 border-error/20 text-error'
        }`}>
          {toast.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  )
}
