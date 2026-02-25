'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Loader2,
  AlertCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  CalendarPlus,
  Scissors,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupabaseService {
  id: string
  name: string
  category: string
  description: string
  has_variants: boolean
  duration: number | null
  price: number | null
  is_active: boolean
  service_variants: {
    id: string
    name: string
    hair_length_label: string
    duration: number
    price: number
  }[]
}

interface SelectedService {
  serviceId: string
  variantId: string | null
  serviceName: string
  variantName: string | null
}

interface Slot {
  startsAt: string
  endsAt: string
}

interface ClientInfo {
  name: string
  phone: string
  email: string
  note: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateFr(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const CATEGORY_LABELS: Record<string, string> = {
  'headspa-japonais': 'Head Spa Japonais',
  'headspa-holistique': 'Head Spa Holistique',
  'massage': 'Massage',
}

// ─── Étape 1 : Prestation + Date ─────────────────────────────────────────────

function Step1({
  onNext,
}: {
  onNext: (selected: SelectedService, date: string) => void
}) {
  const [services, setServices] = useState<SupabaseService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [date, setDate] = useState(todayIso())

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/services')
        if (!res.ok) throw new Error('Erreur chargement services')
        const data: SupabaseService[] = await res.json()
        setServices(data.filter(s => s.is_active))
      } catch {
        setError('Impossible de charger les prestations.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-3" />
      <p className="text-foreground-secondary text-sm">Chargement des prestations…</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 p-5 rounded-2xl bg-error/10 border border-error/20 text-error">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <p className="text-sm">{error}</p>
    </div>
  )

  const selectedSupa = services.find(s => s.id === selectedServiceId)
  const needsVariant = !!(selectedSupa?.has_variants && (selectedSupa.service_variants?.length ?? 0) > 0)
  const canContinue = !!selectedSupa && !!date && (!needsVariant || !!selectedVariantId)

  const handleNext = () => {
    if (!canContinue || !selectedSupa) return
    let serviceName = selectedSupa.name
    let variantName: string | null = null

    if (needsVariant && selectedVariantId) {
      const v = selectedSupa.service_variants.find(v => v.id === selectedVariantId)
      if (v) {
        serviceName = `${selectedSupa.name} – ${v.hair_length_label}`
        variantName = v.hair_length_label
      }
    }

    onNext(
      { serviceId: selectedSupa.id, variantId: selectedVariantId, serviceName, variantName },
      date
    )
  }

  const byCategory = services.reduce<Record<string, SupabaseService[]>>((acc, s) => {
    const cat = s.category || 'autre'
    if (!acc[cat]) acc[cat] = []
    acc[cat]!.push(s)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {/* Prestation */}
      <div>
        <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary-500" />
          Prestation
        </h2>

        <div className="space-y-6">
          {Object.entries(byCategory).map(([category, svcs]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[category] ?? category}
              </h3>
              <div className="space-y-2">
                {svcs.map((svc) => {
                  const isSelected = selectedServiceId === svc.id
                  return (
                    <div key={svc.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedServiceId(svc.id)
                          setSelectedVariantId(null)
                        }}
                        className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
                            : 'border-border bg-surface hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{svc.name}</p>
                            <p className="text-xs text-foreground-muted mt-0.5 line-clamp-1">{svc.description}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            {svc.has_variants ? (
                              <span className="text-sm text-foreground-secondary">
                                {Math.min(...svc.service_variants.map(v => v.price))}€ – {Math.max(...svc.service_variants.map(v => v.price))}€
                              </span>
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-foreground-muted flex items-center gap-1">
                                  <Clock className="h-3 w-3" />{svc.duration}min
                                </span>
                                <span className="font-bold text-primary-600 dark:text-primary-400">{svc.price}€</span>
                              </div>
                            )}
                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Variantes si sélectionné et has_variants */}
                      {isSelected && svc.has_variants && svc.service_variants.length > 0 && (
                        <div className="ml-4 mt-2 space-y-1.5">
                          {svc.service_variants.map((v) => {
                            const isVarSelected = selectedVariantId === v.id
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => setSelectedVariantId(v.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                                  isVarSelected
                                    ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10'
                                    : 'border-border bg-background hover:border-primary-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-foreground">{v.hair_length_label}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-foreground-muted flex items-center gap-1">
                                      <Clock className="h-3 w-3" />{v.duration}min
                                    </span>
                                    <span className="font-bold text-primary-600 dark:text-primary-400">{v.price}€</span>
                                    {isVarSelected && (
                                      <div className="h-4 w-4 rounded-full bg-primary-600 flex items-center justify-center">
                                        <Check className="h-2.5 w-2.5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-500" />
          Date
        </h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full sm:w-72 px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />
        <p className="text-xs text-foreground-muted mt-2">
          Réservation admin — pas de restriction de délai minimum
        </p>
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!canContinue}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-40 transition-colors"
      >
        Choisir un créneau
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// ─── Étape 2 : Créneau horaire ────────────────────────────────────────────────

function Step2({
  selected,
  date,
  onSelect,
  onBack,
}: {
  selected: SelectedService
  date: string
  onSelect: (slot: Slot) => void
  onBack: () => void
}) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSlots = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ action: 'slots', serviceId: selected.serviceId, date })
      if (selected.variantId) params.set('variantId', selected.variantId)

      const res = await fetch(`/api/admin/manual-booking?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error((data as { error?: string }).error ?? 'Erreur lors du chargement des créneaux')
      }
      const data: { starts_at: string; ends_at: string }[] = await res.json()
      setSlots(data.map(s => ({ startsAt: s.starts_at, endsAt: s.ends_at })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les créneaux.')
    } finally {
      setLoading(false)
    }
  }, [selected.serviceId, selected.variantId, date])

  useEffect(() => { void fetchSlots() }, [fetchSlots])

  const morningSlots   = slots.filter((s) => new Date(s.startsAt).getHours() < 12)
  const afternoonSlots = slots.filter((s) => new Date(s.startsAt).getHours() >= 12)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground mb-1">Créneau disponible</h2>
        <p className="text-sm text-foreground-secondary capitalize">
          {selected.serviceName} · {formatDateFr(date)}
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-3" />
          <p className="text-foreground-secondary text-sm">Chargement des disponibilités…</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-error/10 border border-error/20 text-error">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => void fetchSlots()} className="ml-auto text-xs underline">Réessayer</button>
        </div>
      )}

      {!loading && !error && slots.length === 0 && (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 text-foreground-muted/40 mx-auto mb-4" />
          <p className="text-foreground-secondary text-lg mb-2">Aucun créneau disponible ce jour</p>
          <p className="text-foreground-muted text-sm">Essayez une autre date</p>
        </div>
      )}

      {!loading && !error && slots.length > 0 && (
        <div className="space-y-6">
          {morningSlots.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Matin</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {morningSlots.map((slot) => (
                  <button
                    key={slot.startsAt}
                    type="button"
                    onClick={() => onSelect(slot)}
                    className="px-4 py-3 rounded-xl border-2 border-border bg-surface text-foreground font-medium hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center text-sm"
                  >
                    {formatTime(slot.startsAt)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {afternoonSlots.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Après-midi</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {afternoonSlots.map((slot) => (
                  <button
                    key={slot.startsAt}
                    type="button"
                    onClick={() => onSelect(slot)}
                    className="px-4 py-3 rounded-xl border-2 border-border bg-surface text-foreground font-medium hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center text-sm"
                  >
                    {formatTime(slot.startsAt)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour
      </button>
    </div>
  )
}

// ─── Étape 3 : Infos client ───────────────────────────────────────────────────

function Step3({
  onNext,
  onBack,
}: {
  onNext: (info: ClientInfo) => void
  onBack: () => void
}) {
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote]   = useState('')

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm'

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-foreground mb-1">Informations client</h2>
        <p className="text-sm text-foreground-secondary">Seul le nom est obligatoire.</p>
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <User className="h-4 w-4 text-primary-500" />
            Nom du client <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom Nom"
            className={inputClass}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <Phone className="h-4 w-4 text-primary-500" />
            Téléphone <span className="text-xs text-foreground-muted">(optionnel)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 12 34 56 78"
            className={inputClass}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <Mail className="h-4 w-4 text-primary-500" />
            Email <span className="text-xs text-foreground-muted">(optionnel — pour envoyer une confirmation)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@email.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <MessageSquare className="h-4 w-4 text-primary-500" />
            Note interne <span className="text-xs text-foreground-muted">(optionnel)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Allergies, préférences, contexte…"
            rows={3}
            className={inputClass + ' resize-none'}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => name.trim() && onNext({ name: name.trim(), phone, email, note })}
          disabled={!name.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-40 transition-colors"
        >
          Voir le récapitulatif
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </button>
      </div>
    </div>
  )
}

// ─── Étape 4 : Récap + Confirmation ──────────────────────────────────────────

function Step4({
  selected,
  date,
  slot,
  client,
  onBack,
  onSuccess,
}: {
  selected: SelectedService
  date: string
  slot: Slot
  client: ClientInfo
  onBack: () => void
  onSuccess: (bookingId: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const confirm = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/manual-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId:   selected.serviceId,
          variantId:   selected.variantId ?? undefined,
          startsAt:    slot.startsAt,
          endsAt:      slot.endsAt,
          clientName:  client.name,
          clientEmail: client.email  || undefined,
          clientPhone: client.phone  || undefined,
          note:        client.note   || undefined,
          serviceName: selected.serviceName,
          variantName: selected.variantName ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Erreur lors de la création')
      onSuccess(data.bookingId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const rowClass   = 'flex items-start justify-between py-2.5 border-b border-border last:border-0'
  const labelClass = 'text-sm text-foreground-secondary'
  const valueClass = 'text-sm font-medium text-foreground text-right max-w-xs'

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-foreground mb-1">Récapitulatif</h2>
        <p className="text-sm text-foreground-secondary">Vérifiez les informations avant de confirmer.</p>
      </div>

      <div className="bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 rounded-2xl p-6 max-w-md">
        <div className={rowClass}>
          <span className={labelClass}>Prestation</span>
          <span className={valueClass}>{selected.serviceName}</span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}>Date</span>
          <span className={valueClass + ' capitalize'}>{formatDateFr(date)}</span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}>Heure</span>
          <span className={valueClass}>{formatTime(slot.startsAt)} → {formatTime(slot.endsAt)}</span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}>Client</span>
          <span className={valueClass}>{client.name}</span>
        </div>
        {client.phone && (
          <div className={rowClass}>
            <span className={labelClass}>Téléphone</span>
            <span className={valueClass}>{client.phone}</span>
          </div>
        )}
        {client.email && (
          <div className={rowClass}>
            <span className={labelClass}>Email</span>
            <span className={valueClass}>{client.email}</span>
          </div>
        )}
        {client.note && (
          <div className={rowClass}>
            <span className={labelClass}>Note</span>
            <span className={valueClass}>{client.note}</span>
          </div>
        )}
        <div className={rowClass}>
          <span className={labelClass}>Paiement</span>
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">Sur place</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm max-w-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => void confirm()}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Création en cours…</>
          ) : (
            <><Check className="h-4 w-4" />Confirmer la réservation</>
          )}
        </button>
        {!loading && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3 | 4 | 'success'

const STEP_LABELS = ['Prestation & date', 'Créneau', 'Client', 'Confirmation']

export default function AdminManualBookingPage() {
  const [step, setStep]         = useState<WizardStep>(1)
  const [selected, setSelected] = useState<SelectedService | null>(null)
  const [date, setDate]         = useState('')
  const [slot, setSlot]         = useState<Slot | null>(null)
  const [client, setClient]     = useState<ClientInfo | null>(null)
  const [bookingId, setBookingId] = useState('')

  const reset = () => {
    setStep(1)
    setSelected(null)
    setDate('')
    setSlot(null)
    setClient(null)
    setBookingId('')
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2 flex items-center gap-3">
          <CalendarPlus className="h-8 w-8 text-primary-500" />
          Réservation manuelle
        </h1>
        <p className="text-foreground-secondary">
          Créez une réservation pour un client directement depuis l&apos;espace admin. Paiement encaissé sur place.
        </p>
      </div>

      {/* Succès */}
      {step === 'success' && (
        <div className="text-center py-16 space-y-6">
          <div className="flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
              Réservation créée !
            </h2>
            <p className="text-foreground-secondary text-sm">
              Réf. : <span className="font-mono text-xs bg-surface border border-border px-2 py-1 rounded">{bookingId}</span>
            </p>
            {client?.email && (
              <p className="text-foreground-muted text-sm mt-2">
                Un email de confirmation a été envoyé à {client.email}.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            <CalendarPlus className="h-4 w-4" />
            Nouvelle réservation
          </button>
        </div>
      )}

      {/* Stepper */}
      {step !== 'success' && (
        <>
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
            {STEP_LABELS.map((label, idx) => {
              const n = (idx + 1) as 1 | 2 | 3 | 4
              const isDone   = typeof step === 'number' && step > n
              const isActive = step === n
              return (
                <div key={n} className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isDone
                        ? 'bg-primary-600 text-white'
                        : isActive
                          ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900/40'
                          : 'bg-surface border-2 border-border text-foreground-muted'
                    }`}>
                      {isDone ? <Check className="h-4 w-4" /> : n}
                    </div>
                    <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-foreground' : 'text-foreground-muted'}`}>
                      {label}
                    </span>
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-foreground-muted/40 shrink-0 mx-1" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 lg:p-8">
            {step === 1 && (
              <Step1
                onNext={(sel, d) => {
                  setSelected(sel)
                  setDate(d)
                  setStep(2)
                }}
              />
            )}

            {step === 2 && selected && (
              <Step2
                selected={selected}
                date={date}
                onSelect={(s) => {
                  setSlot(s)
                  setStep(3)
                }}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <Step3
                onNext={(info) => {
                  setClient(info)
                  setStep(4)
                }}
                onBack={() => setStep(2)}
              />
            )}

            {step === 4 && selected && slot && client && (
              <Step4
                selected={selected}
                date={date}
                slot={slot}
                client={client}
                onBack={() => setStep(3)}
                onSuccess={(id) => {
                  setBookingId(id)
                  setStep('success')
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
