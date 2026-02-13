'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Loader2,
  Check,
  AlertCircle,
  MapPin,
  User,
  Scissors,
  Clock,
  Calendar,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  Layers,
  Settings,
} from 'lucide-react'
import { services as localServices } from '@/lib/services-data'

// Liste de tous les variants à synchroniser dans Hapio (avec leur durée exacte)
const VARIANT_SERVICES = localServices
  .filter((s) => s.hasVariants && s.variants && s.variants.length > 0)
  .flatMap((s) =>
    (s.variants ?? []).map((v) => ({
      name: v.name,
      duration: v.duration,
      description: v.hairLengthLabel,
    }))
  )

interface HapioStatus {
  location: { id: string; name: string; address?: string; city?: string } | null
  services: { id: string; name: string; duration?: number }[]
  resources: { id: string; name: string }[]
  schedules: { id: string; weekday: string | number; start_time: string; end_time: string }[]
  linkedServices?: { service_id: string; resource_id: string }[]
  configured: boolean
}

interface Booking {
  id: string
  service_id: string
  starts_at: string
  ends_at: string
  status: string
  metadata?: Record<string, string>
}

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const DAYS_EN_TO_FR: Record<string, string> = {
  sunday: 'Dimanche', monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
  thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi',
}
function weekdayFr(w: string | number): string {
  if (typeof w === 'string') return DAYS_EN_TO_FR[w.toLowerCase()] ?? w
  return DAYS_FR[w] ?? String(w)
}

// Prestations par défaut à synchroniser avec Hapio
const DEFAULT_SERVICES = [
  { name: 'Sérénité', description: 'Soin enfant', duration: 30 },
  { name: 'Paisible 45 minutes', description: 'Soin relaxant du cuir chevelu', duration: 45 },
  { name: 'Relaxante 60 minutes', description: 'Soin profond pour une relaxation complète', duration: 60 },
  { name: 'Décontractante 75 minutes', description: 'Soin intensif pour dénouer les tensions', duration: 75 },
  { name: 'Eclat 45 minutes', description: 'Soin spécifique cuir chevelu chauve/rasé', duration: 45 },
  { name: 'Revitalisant 105 minutes', description: 'Soin premium complet', duration: 105 },
  { name: 'Libérateur 60 minutes (Body)', description: 'Massage complet du corps', duration: 60 },
]

// Horaires semaine impaire par défaut (Lun-Ven 9h-12h / 13h-19h)
const DEFAULT_SCHEDULES = [
  { day_of_week: 1, start_time: '09:00', end_time: '12:00' },
  { day_of_week: 1, start_time: '13:00', end_time: '19:00' },
  { day_of_week: 2, start_time: '09:00', end_time: '12:00' },
  { day_of_week: 2, start_time: '13:00', end_time: '19:00' },
  { day_of_week: 3, start_time: '09:00', end_time: '12:00' },
  { day_of_week: 3, start_time: '13:00', end_time: '19:00' },
  { day_of_week: 4, start_time: '09:00', end_time: '12:00' },
  { day_of_week: 4, start_time: '13:00', end_time: '19:00' },
  { day_of_week: 5, start_time: '09:00', end_time: '12:00' },
  { day_of_week: 5, start_time: '13:00', end_time: '19:00' },
]

export default function AdminReservationsPage() {
  const [status, setStatus] = useState<HapioStatus | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [setupLoading, setSetupLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showBookings, setShowBookings] = useState(false)
  const [addServiceForm, setAddServiceForm] = useState(false)
  const [newService, setNewService] = useState({ name: '', description: '', duration: 60 })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/hapio?action=status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch {
      showToast('Erreur de connexion à Hapio', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBookings = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      const res = await fetch(`/api/admin/hapio?action=bookings&from=${today}&to=${nextMonth}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      }
    } catch {
      showToast('Erreur chargement réservations', 'error')
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // ============================================
  // CONFIGURATION INITIALE
  // ============================================
  const handleSetup = async () => {
    setSetupLoading(true)
    try {
      const res = await fetch('/api/admin/hapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup',
          locationName: 'Kalm Headspa',
          locationAddress: 'Vecoux',
          locationCity: 'Vecoux',
          locationPostalCode: '88200',
          resourceName: 'Gwenaëlle',
          services: DEFAULT_SERVICES,
          schedules: DEFAULT_SCHEDULES,
        }),
      })

      if (res.ok) {
        showToast('Configuration Hapio terminée !', 'success')
        await fetchStatus()
      } else {
        const data = await res.json()
        showToast(data.error || 'Erreur de configuration', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    } finally {
      setSetupLoading(false)
    }
  }

  // ============================================
  // CRÉER LES HORAIRES PAR DÉFAUT
  // ============================================
  const handleCreateSchedules = async () => {
    setSetupLoading(true)
    try {
      const res = await fetch('/api/admin/hapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-schedules' }),
      })
      if (res.ok) {
        showToast('Horaires créés avec succès !', 'success')
        await fetchStatus()
      } else {
        const data = await res.json()
        showToast(data.error || 'Erreur lors de la création des horaires', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    } finally {
      setSetupLoading(false)
    }
  }

  // ============================================
  // SYNCHRONISER LES VARIANTES DANS HAPIO
  // ============================================
  const handleSyncVariants = async () => {
    setSetupLoading(true)
    try {
      const res = await fetch('/api/admin/hapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-variants', variants: VARIANT_SERVICES }),
      })
      if (res.ok) {
        const data = await res.json()
        const created = (data.results as { status: string }[]).filter((r) => r.status === 'created').length
        const skipped = (data.results as { status: string }[]).filter((r) => r.status === 'already_exists').length
        showToast(
          created > 0
            ? `${created} variant(s) créé(s) dans Hapio (${skipped} déjà existant(s))`
            : `Tous les variants sont déjà synchronisés (${skipped})`,
          'success'
        )
        await fetchStatus()
      } else {
        const data = await res.json()
        showToast(data.error || 'Erreur sync variantes', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    } finally {
      setSetupLoading(false)
    }
  }

  // ============================================
  // CORRIGER LES INTERVALLES DE RÉSERVATION
  // ============================================
  const handleFixIntervals = async () => {
    setSetupLoading(true)
    try {
      const res = await fetch('/api/admin/hapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fix-intervals' }),
      })
      if (res.ok) {
        const data = await res.json()
        const fixed = (data.results as { status: string }[]).filter((r) => r.status === 'fixed').length
        showToast(
          fixed > 0
            ? `${fixed} prestation(s) corrigée(s) — les créneaux se bloqueront correctement maintenant !`
            : 'Tous les intervalles sont déjà corrects',
          'success'
        )
        await fetchStatus()
      } else {
        const data = await res.json()
        showToast(data.error || 'Erreur correction intervalles', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    } finally {
      setSetupLoading(false)
    }
  }

  // ============================================
  // LIER LES SERVICES À LA RESSOURCE
  // ============================================
  const handleLinkServices = async () => {
    setSetupLoading(true)
    try {
      const res = await fetch('/api/admin/hapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'link-services' }),
      })
      if (res.ok) {
        const data = await res.json()
        const linked = (data.results as { status: string }[]).filter((r) => r.status === 'linked').length
        showToast(`${linked} prestation(s) liée(s) à Gwenaëlle !`, 'success')
        await fetchStatus()
      } else {
        const data = await res.json()
        showToast(data.error || 'Erreur lors de la liaison', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    } finally {
      setSetupLoading(false)
    }
  }

  // ============================================
  // AJOUTER UNE PRESTATION
  // ============================================
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/hapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-service',
          ...newService,
        }),
      })

      if (res.ok) {
        showToast('Prestation ajoutée à Hapio', 'success')
        setNewService({ name: '', description: '', duration: 60 })
        setAddServiceForm(false)
        await fetchStatus()
      } else {
        const data = await res.json()
        showToast(data.error || 'Erreur', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    }
  }

  // ============================================
  // SUPPRIMER UNE PRESTATION
  // ============================================
  const handleDeleteService = async (serviceId: string) => {
    try {
      const res = await fetch('/api/admin/hapio', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-service', serviceId }),
      })

      if (res.ok) {
        showToast('Prestation supprimée', 'success')
        await fetchStatus()
      }
    } catch {
      showToast('Erreur', 'error')
    }
  }

  // ============================================
  // ANNULER UNE RÉSERVATION
  // ============================================
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch('/api/admin/hapio', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel-booking', bookingId }),
      })

      if (res.ok) {
        showToast('Réservation annulée', 'success')
        await fetchBookings()
      }
    } catch {
      showToast('Erreur', 'error')
    }
  }

  // ============================================
  // SYNCHRONISER LES HORAIRES SUPABASE → HAPIO
  // ============================================
  const handleSyncSchedule = async () => {
    setSetupLoading(true)
    try {
      const res = await fetch('/api/admin/hapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-schedule' }),
      })

      if (res.ok) {
        const data = await res.json()
        showToast(
          `Horaires synchronisés ! ${data.deleted} ancien(s) créneaux supprimés, ${data.created} nouveau(x) créneaux créés`,
          'success'
        )
        await fetchStatus()
      } else {
        const data = await res.json()
        showToast(data.error || 'Erreur de synchronisation', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    } finally {
      setSetupLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  const isConfigured = status?.configured

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Réservations
          </h1>
          <p className="text-foreground-secondary">
            Gestion du système de réservation en ligne (Hapio)
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="p-3 rounded-xl border border-border hover:bg-background transition-colors text-foreground-muted"
          title="Rafraîchir"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* ============================================ */}
      {/* PAS ENCORE CONFIGURÉ */}
      {/* ============================================ */}
      {!isConfigured && (
        <div className="bg-surface border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Zap className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
            Configurer les réservations
          </h2>
          <p className="text-foreground-secondary mb-6 max-w-lg mx-auto">
            En un clic, on crée le lieu (Kalm Headspa — Vecoux), la praticienne (Gwenaëlle),
            toutes les prestations et les horaires de la semaine impaire.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background">
              <MapPin className="h-5 w-5 text-primary-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Lieu</p>
                <p className="text-xs text-foreground-muted">Vecoux 88200</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background">
              <User className="h-5 w-5 text-primary-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Praticienne</p>
                <p className="text-xs text-foreground-muted">Gwenaëlle</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background">
              <Scissors className="h-5 w-5 text-primary-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Prestations</p>
                <p className="text-xs text-foreground-muted">{DEFAULT_SERVICES.length} soins</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSetup}
            disabled={setupLoading}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-600 text-white font-semibold text-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {setupLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Configuration en cours...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Configurer maintenant
              </>
            )}
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* CONFIGURÉ — DASHBOARD */}
      {/* ============================================ */}
      {isConfigured && status && (
        <div className="space-y-6">
          {/* Statut */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Lieu</p>
                  <p className="text-xs text-foreground-muted">{status.location?.name}</p>
                </div>
              </div>
              <p className="text-xs text-foreground-muted">
                {status.location?.address} — {status.location?.city}
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Praticienne</p>
                  <p className="text-xs text-foreground-muted">{status.resources[0]?.name}</p>
                </div>
              </div>
              <p className="text-xs text-foreground-muted">
                {status.schedules.length} créneaux horaires
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Scissors className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Prestations</p>
                  <p className="text-xs text-foreground-muted">{status.services.length} actives</p>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des services Hapio */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold text-foreground">
                Prestations sur Hapio
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFixIntervals}
                  disabled={setupLoading}
                  title="Corrige les intervalles de réservation pour bloquer correctement les créneaux après une réservation"
                  className="flex items-center gap-1.5 text-sm text-success hover:text-success/80 font-medium disabled:opacity-50"
                >
                  {setupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                  Fix intervalles
                </button>
                <button
                  onClick={handleSyncVariants}
                  disabled={setupLoading}
                  title="Crée un service Hapio pour chaque variant (longueur de cheveux) avec la bonne durée"
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                >
                  {setupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                  Sync variantes
                </button>
                <button
                  onClick={() => setAddServiceForm(!addServiceForm)}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </button>
              </div>
            </div>

            {/* Alerte : services non liés à Gwenaëlle */}
            {(status.linkedServices ?? []).length < status.services.length && (
              <div className="mb-4 flex items-center justify-between gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Liaisons manquantes
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {(status.linkedServices ?? []).length}/{status.services.length} prestations liées à Gwenaëlle — sans ça, aucun créneau n&apos;est disponible
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLinkServices}
                  disabled={setupLoading}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
                >
                  {setupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Lier maintenant
                </button>
              </div>
            )}

            {addServiceForm && (
              <form onSubmit={handleAddService} className="mb-4 p-4 rounded-xl bg-background border border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Nom"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Durée (min)"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) || 60 })}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {status.services.map((svc) => (
                <div
                  key={svc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-background"
                >
                  <div className="flex items-center gap-3">
                    <Scissors className="h-4 w-4 text-foreground-muted" />
                    <span className="text-sm font-medium text-foreground">{svc.name}</span>
                    {svc.duration && (
                      <span className="flex items-center gap-1 text-xs text-foreground-muted">
                        <Clock className="h-3 w-3" />
                        {svc.duration} min
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteService(svc.id)}
                    className="p-1.5 rounded-lg hover:bg-error/10 text-foreground-muted hover:text-error transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Horaires de la ressource */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold text-foreground">
                Horaires de {status.resources[0]?.name}
              </h2>
              <div className="flex items-center gap-2">
                {status.schedules.length > 0 && (
                  <button
                    onClick={handleSyncSchedule}
                    disabled={setupLoading}
                    title="Synchronise les horaires du template actif (admin/horaires) vers Hapio"
                    className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                  >
                    {setupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Sync horaires
                  </button>
                )}
                {status.schedules.length === 0 && (
                  <button
                    onClick={handleCreateSchedules}
                    disabled={setupLoading}
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {setupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Créer les horaires par défaut
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {status.schedules.length === 0 && (
                <p className="text-sm text-foreground-muted text-center py-4">
                  Aucun créneau horaire configuré
                </p>
              )}
              {status.schedules
                .sort((a, b) => String(a.weekday).localeCompare(String(b.weekday)) || a.start_time.localeCompare(b.start_time))
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-foreground-muted" />
                      <span className="text-sm font-medium text-foreground w-24">
                        {weekdayFr(s.weekday)}
                      </span>
                      <span className="text-sm text-foreground-secondary">
                        {s.start_time.slice(0, 5)} — {s.end_time.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Réservations à venir */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <button
              onClick={() => {
                setShowBookings(!showBookings)
                if (!showBookings) fetchBookings()
              }}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-lg font-serif font-semibold text-foreground">
                Réservations à venir
              </h2>
              {showBookings ? (
                <ChevronUp className="h-5 w-5 text-foreground-muted" />
              ) : (
                <ChevronDown className="h-5 w-5 text-foreground-muted" />
              )}
            </button>

            {showBookings && (
              <div className="mt-4 space-y-2">
                {bookings.length === 0 && (
                  <p className="text-sm text-foreground-muted text-center py-8">
                    Aucune réservation pour les 30 prochains jours
                  </p>
                )}
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-background"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {b.metadata?.['name'] ?? 'Client'} — {b.metadata?.['service_name'] ?? 'Prestation'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-foreground-muted mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(b.starts_at).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(b.starts_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {b.metadata?.['phone'] && (
                          <span>{b.metadata['phone']}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-error border border-error/20 hover:bg-error/10 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border ${
            toast.type === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-error/10 border-error/20 text-error'
          }`}
        >
          {toast.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  )
}
