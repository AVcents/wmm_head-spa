'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  X,
  Check,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import type { BookingRow } from '@/lib/supabase/types'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LocalService {
  id: string
  name: string
  has_variants: boolean
  duration: number | null
  price: number | null
  is_active: boolean
  service_variants: Array<{
    id: string
    name: string
    hair_length: string
    hair_length_label: string
    duration: number
    price: number
  }>
}

interface ExtraOption {
  id: string
  name: string
  price: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const HOUR_START  = 8
const HOUR_END    = 20
const SLOT_MINUTES = 30
const SLOT_HEIGHT  = 52 // px per slot (30 min)
const TOTAL_SLOTS  = ((HOUR_END - HOUR_START) * 60) / SLOT_MINUTES
const DAY_LABELS   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(date: Date): string {
  // Retourner la date en format YYYY-MM-DD en heure locale (pas UTC)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function slotToTime(slotIndex: number): string {
  const totalMinutes = HOUR_START * 60 + slotIndex * SLOT_MINUTES
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function bookingTopPx(starts_at: string): number {
  // Convertir UTC vers heure locale (Europe/Paris)
  const d = new Date(starts_at)
  const parisTime = d.toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  const [hourStr, minuteStr] = parisTime.split(':')
  const hour = Number(hourStr)
  const minute = Number(minuteStr)
  const minutesFromStart = hour * 60 + minute - HOUR_START * 60
  return (minutesFromStart / SLOT_MINUTES) * SLOT_HEIGHT
}

function bookingHeightPx(starts_at: string, ends_at: string): number {
  const minutes = (new Date(ends_at).getTime() - new Date(starts_at).getTime()) / 60000
  return Math.max((minutes / SLOT_MINUTES) * SLOT_HEIGHT, SLOT_HEIGHT)
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AdminAgendaPage() {
  // Navigation
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(new Date()))

  // Data
  const [bookings, setBookings]         = useState<(BookingRow & { buffer_time?: number })[]>([])
  const [localServices, setLocalServices] = useState<LocalService[]>([])

  // UI state
  const [loading, setLoading]               = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [toast, setToast]                   = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Modal
  const [modal, setModal]                       = useState<{ date: string; time: string } | null>(null)
  const [modalServiceId, setModalServiceId]     = useState('')
  const [modalVariantId, setModalVariantId]     = useState('')
  const [modalExtraIds, setModalExtraIds]       = useState<string[]>([])
  const [modalExtras, setModalExtras]           = useState<ExtraOption[]>([])
  const [modalClientName, setModalClientName]   = useState('')
  const [modalClientEmail, setModalClientEmail] = useState('')
  const [modalClientPhone, setModalClientPhone] = useState('')
  const [modalClientMessage, setModalClientMessage] = useState('')
  const [submitting, setSubmitting]             = useState(false)

  // Derived
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Initial config load ────────────────────────────────────────────────────

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/services')
        if (!res.ok) throw new Error('Erreur de chargement des services')
        const services: LocalService[] = await res.json()
        setLocalServices(services)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur de configuration')
      } finally {
        setLoading(false)
      }
    }
    void loadConfig()
  }, [])

  // ── Load bookings for week ──────────────────────────────────────────────────

  const loadBookings = useCallback(async (start: Date) => {
    setLoadingBookings(true)
    try {
      const from = formatDate(start)
      const to   = formatDate(addDays(start, 6))
      const res  = await fetch(`/api/admin/bookings?from=${from}&to=${to}`)
      if (!res.ok) throw new Error()
      const data: (BookingRow & { buffer_time?: number })[] = await res.json()
      setBookings(data.filter((b) => b.status === 'confirmed'))
    } catch {
      // silencieux — on garde les anciennes données
    } finally {
      setLoadingBookings(false)
    }
  }, [])

  useEffect(() => {
    void loadBookings(weekStart)
  }, [weekStart, loadBookings])

  // ── Modal service change → load extras ────────────────────────────────────

  useEffect(() => {
    if (!modalServiceId) {
      setModalExtras([])
      setModalExtraIds([])
      return
    }
    fetch(`/api/extras?serviceId=${encodeURIComponent(modalServiceId)}`)
      .then((r) => r.json())
      .then((data: ExtraOption[]) => {
        setModalExtras(data)
        setModalExtraIds([])
      })
      .catch(() => {})
  }, [modalServiceId])

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openModal = (date: string, time: string) => {
    setModal({ date, time })
    setModalServiceId('')
    setModalVariantId('')
    setModalExtraIds([])
    setModalExtras([])
    setModalClientName('')
    setModalClientEmail('')
    setModalClientPhone('')
    setModalClientMessage('')
  }

  const closeModal = () => setModal(null)

  const selectedLocalService = localServices.find((s) => s.id === modalServiceId)
  const selectedVariant       = selectedLocalService?.service_variants.find((v) => v.id === modalVariantId)
  const duration              = selectedVariant?.duration ?? selectedLocalService?.duration ?? 60
  const price                 = selectedVariant?.price ?? selectedLocalService?.price ?? 0

  // ── Create booking ─────────────────────────────────────────────────────────

  const handleCreateBooking = async () => {
    if (!modal || !modalServiceId || !modalClientName || !modalClientEmail) return
    if (selectedLocalService?.has_variants && !modalVariantId) return

    setSubmitting(true)
    try {
      // On envoie juste la string "YYYY-MM-DDTHH:MM:00" côté serveur
      // Le serveur devra interpréter ça comme heure de Paris
      const startsAtLocal = `${modal.date}T${modal.time}:00`
      const [year, month, day] = modal.date.split('-').map(Number)
      const [hour, minute] = modal.time.split(':').map(Number)
      const localDate = new Date(year!, month! - 1, day!, hour!, minute!)
      const endsAtLocal = new Date(localDate.getTime() + duration * 60000)
      const endsAtStr = `${endsAtLocal.getFullYear()}-${String(endsAtLocal.getMonth() + 1).padStart(2, '0')}-${String(endsAtLocal.getDate()).padStart(2, '0')}T${String(endsAtLocal.getHours()).padStart(2, '0')}:${String(endsAtLocal.getMinutes()).padStart(2, '0')}:00`

      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId:   modalServiceId,
          variantId:   modalVariantId || undefined,
          startsAt:    startsAtLocal,
          endsAt:      endsAtStr,
          name:        modalClientName,
          email:       modalClientEmail,
          phone:       modalClientPhone || undefined,
          message:     modalClientMessage || undefined,
          serviceName: selectedLocalService?.name ?? '',
          variantName: selectedVariant?.hair_length_label || undefined,
          duration,
          price,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? 'Erreur lors de la création')
      }

      showToast('Réservation créée avec succès', 'success')
      closeModal()
      void loadBookings(weekStart)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erreur', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Cancel booking ─────────────────────────────────────────────────────────

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Annuler cette réservation ? Cette action est irréversible.')) return
    try {
      const res = await fetch('/api/booking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      if (!res.ok) throw new Error()
      showToast('Réservation annulée', 'success')
      void loadBookings(weekStart)
    } catch {
      showToast("Erreur lors de l'annulation", 'error')
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  const bookingsForDay = (day: Date) => {
    const dateStr = formatDate(day)
    // Filtrer les bookings qui tombent sur ce jour en heure locale Paris
    return bookings.filter((b) => {
      const d = new Date(b.starts_at)
      const parisDate = d.toLocaleDateString('fr-FR', {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).split('/').reverse().join('-') // DD/MM/YYYY → YYYY-MM-DD
      return parisDate === dateStr
    })
  }

  const formatWeekLabel = () => {
    const end        = addDays(weekStart, 6)
    const startLabel = weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    const endLabel   = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${startLabel} – ${endLabel}`
  }

  const isToday = (date: Date) => formatDate(date) === formatDate(new Date())

  // ── Render: Loading / Error ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-5 rounded-2xl bg-error/10 border border-error/20 text-error max-w-xl">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p>{error}</p>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Agenda</h1>
          <p className="text-foreground-secondary text-sm mt-1">
            Cliquez sur un créneau libre pour créer une réservation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => addDays(w, -7))}
            className="p-2 rounded-xl border border-border hover:bg-surface transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>

          <div className="text-center min-w-[180px]">
            <p className="text-sm font-semibold text-foreground">{formatWeekLabel()}</p>
            {loadingBookings && (
              <p className="text-xs text-foreground-muted flex items-center justify-center gap-1 mt-0.5">
                <Loader2 className="h-3 w-3 animate-spin" /> Chargement…
              </p>
            )}
          </div>

          <button
            onClick={() => setWeekStart((w) => addDays(w, 7))}
            className="p-2 rounded-xl border border-border hover:bg-surface transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>

          <button
            onClick={() => setWeekStart(getMondayOf(new Date()))}
            className="hidden sm:block px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-surface transition-colors"
          >
            Aujourd&apos;hui
          </button>
        </div>
      </div>

      {/* ── Calendar ── */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {/* Day headers */}
        <div className="flex border-b border-border">
          <div className="w-16 shrink-0 border-r border-border" />
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={`flex-1 p-3 text-center border-r border-border last:border-r-0 ${
                isToday(day) ? 'bg-primary-50/60 dark:bg-primary-900/10' : ''
              }`}
            >
              <p className="text-xs text-foreground-muted font-medium">{DAY_LABELS[i]}</p>
              <p className={`text-lg font-bold mt-0.5 ${
                isToday(day) ? 'text-primary-600 dark:text-primary-400' : 'text-foreground'
              }`}>
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Time grid — scrollable */}
        <div className="overflow-y-auto" style={{ maxHeight: '640px' }}>
          <div className="flex relative">
            {/* Time labels column */}
            <div className="w-16 shrink-0 border-r border-border">
              {Array.from({ length: TOTAL_SLOTS }, (_, i) => (
                <div
                  key={i}
                  className="flex items-start justify-end pr-2 pt-1 border-b border-border"
                  style={{ height: `${SLOT_HEIGHT}px` }}
                >
                  {i % 2 === 0 && (
                    <span className="text-xs text-foreground-muted font-mono">
                      {slotToTime(i)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIdx) => {
              const dateStr    = formatDate(day)
              const dayBookings = bookingsForDay(day)

              return (
                <div
                  key={dayIdx}
                  className={`flex-1 border-r border-border last:border-r-0 relative ${
                    isToday(day) ? 'bg-primary-50/10 dark:bg-primary-900/5' : ''
                  }`}
                >
                  {/* Clickable slot rows */}
                  {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
                    const time         = slotToTime(slotIdx)
                    // Créer la date en heure locale (pas UTC)
                    const [year, month, dayNum] = dateStr.split('-').map(Number)
                    const [hour, minute] = time.split(':').map(Number)
                    const slotDateTime = new Date(year!, month! - 1, dayNum!, hour!, minute!)
                    const isPast       = slotDateTime < new Date()
                    const isHourBorder = slotIdx % 2 === 0

                    return (
                      <div
                        key={slotIdx}
                        className={`border-b border-border transition-colors ${
                          isHourBorder ? 'border-border' : 'border-border/40'
                        } ${
                          isPast
                            ? 'bg-background/40 cursor-default'
                            : 'hover:bg-primary-50/40 dark:hover:bg-primary-900/10 cursor-pointer'
                        }`}
                        style={{ height: `${SLOT_HEIGHT}px` }}
                        onClick={() => { if (!isPast) openModal(dateStr, time) }}
                        title={isPast ? '' : `Réserver le ${day.toLocaleDateString('fr-FR')} à ${time}`}
                      />
                    )
                  })}

                  {/* Booking blocks — absolutely positioned */}
                  {dayBookings.map((booking) => {
                    const top    = bookingTopPx(booking.starts_at)
                    const height = bookingHeightPx(booking.starts_at, booking.ends_at)
                    const bufferTime = booking.buffer_time ?? 0
                    const bufferHeightPx = bufferTime > 0 ? (bufferTime / SLOT_MINUTES) * SLOT_HEIGHT : 0

                    if (top < 0 || top > TOTAL_SLOTS * SLOT_HEIGHT) return null

                    return (
                      <div key={booking.id}>
                        {/* Réservation principale */}
                        <div
                          className="absolute left-0.5 right-0.5 rounded-lg bg-primary-500 text-white px-2 py-1.5 overflow-hidden shadow-sm group cursor-default z-10"
                          style={{ top: `${top}px`, height: `${height - 2}px` }}
                        >
                          <p className="text-xs font-bold leading-tight">{formatTime(booking.starts_at)}</p>
                          <p className="text-xs truncate font-medium leading-tight mt-0.5">{booking.client_name}</p>
                          {height > SLOT_HEIGHT && (
                            <p className="text-xs truncate opacity-80 leading-tight">{booking.service_name}</p>
                          )}
                          {/* Cancel button on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleCancelBooking(booking.id)
                            }}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded bg-white/20 hover:bg-white/40"
                            title="Annuler la réservation"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Battement (bande grise) */}
                        {bufferTime > 0 && (
                          <div
                            className="absolute left-0.5 right-0.5 bg-slate-300/60 dark:bg-slate-600/40 border-l-2 border-primary-400 z-5"
                            style={{
                              top: `${top + height}px`,
                              height: `${bufferHeightPx}px`,
                            }}
                            title={`Battement : ${bufferTime} min`}
                          >
                            <p className="text-[10px] text-slate-600 dark:text-slate-300 px-1 pt-0.5 leading-tight opacity-70">
                              Battement {bufferTime}min
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 mt-4 text-xs text-foreground-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary-500" />
          Réservation confirmée
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Cliquez sur un créneau libre pour créer une réservation
        </span>
      </div>

      {/* ── Booking creation modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-serif font-semibold text-foreground">
                  Nouvelle réservation
                </h3>
                <p className="text-sm text-foreground-secondary mt-0.5">
                  {(() => {
                    const [year, month, day] = modal.date.split('-').map(Number)
                    const [hour, minute] = modal.time.split(':').map(Number)
                    const localDate = new Date(year!, month! - 1, day!, hour!, minute!)
                    return localDate.toLocaleDateString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long',
                    })
                  })()}{' '}à {modal.time}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-background transition-colors">
                <X className="h-5 w-5 text-foreground-muted" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Prestation *
                </label>
                <select
                  value={modalServiceId}
                  onChange={(e) => { setModalServiceId(e.target.value); setModalVariantId('') }}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choisir une prestation…</option>
                  {localServices
                    .filter((s) => s.is_active)
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
              </div>

              {/* Variant */}
              {selectedLocalService?.has_variants && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Option (longueur) *
                  </label>
                  <select
                    value={modalVariantId}
                    onChange={(e) => setModalVariantId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Choisir…</option>
                    {selectedLocalService.service_variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.hair_length_label} — {v.duration} min — {v.price}€
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Service info */}
              {selectedLocalService && (
                <div className="px-4 py-3 rounded-xl bg-background border border-border text-sm flex items-center gap-4 flex-wrap">
                  <span className="text-foreground-secondary">⏱ {duration} min</span>
                  <span className="text-foreground-secondary">💰 {price}€</span>
                </div>
              )}

              {/* Extras */}
              {modalExtras.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Extras</label>
                  <div className="space-y-2">
                    {modalExtras.map((extra) => (
                      <label
                        key={extra.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background cursor-pointer hover:border-primary-300 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={modalExtraIds.includes(extra.id)}
                          onChange={() =>
                            setModalExtraIds((prev) =>
                              prev.includes(extra.id)
                                ? prev.filter((x) => x !== extra.id)
                                : [...prev, extra.id]
                            )
                          }
                          className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
                        />
                        <span className="flex-1 text-sm text-foreground">{extra.name}</span>
                        <span className="text-sm font-bold text-primary-600">+{Number(extra.price).toFixed(2)}€</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Client info */}
              <div className="border-t border-border pt-5">
                <p className="text-sm font-semibold text-foreground mb-4">Informations client</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-foreground-muted mb-1">Nom complet *</label>
                    <input
                      type="text"
                      value={modalClientName}
                      onChange={(e) => setModalClientName(e.target.value)}
                      placeholder="Marie Dupont"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">Email *</label>
                    <input
                      type="email"
                      value={modalClientEmail}
                      onChange={(e) => setModalClientEmail(e.target.value)}
                      placeholder="marie@exemple.fr"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={modalClientPhone}
                      onChange={(e) => setModalClientPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-foreground-muted mb-1">Note interne (optionnel)</label>
                    <textarea
                      value={modalClientMessage}
                      onChange={(e) => setModalClientMessage(e.target.value)}
                      placeholder="Informations particulières, préférences…"
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-background transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateBooking}
                  disabled={
                    submitting ||
                    !modalServiceId ||
                    !modalClientName ||
                    !modalClientEmail ||
                    (selectedLocalService?.has_variants === true && !modalVariantId)
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Création…</>
                  ) : (
                    <><Plus className="h-4 w-4" />Créer la réservation</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border ${
          toast.type === 'success'
            ? 'bg-success/10 border-success/20 text-success'
            : 'bg-error/10 border-error/20 text-error'
        }`}>
          {toast.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
