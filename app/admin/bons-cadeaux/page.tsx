'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Gift,
  Mail,
  Package,
  Loader2,
  Check,
  Truck,
  AlertCircle,
  Copy,
  Search,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface GiftCard {
  id: string
  code: string
  service_name: string | null
  hair_length_label: string | null
  amount: number
  delivery_fee: number
  total_amount: number | null
  delivery_method: 'digital' | 'physical'
  buyer_email: string | null
  buyer_first_name: string | null
  buyer_last_name: string | null
  buyer_phone: string | null
  recipient_email: string | null
  recipient_first_name: string | null
  recipient_last_name: string | null
  recipient_phone: string | null
  extras: Array<{ name: string; price: number }> | null
  sender_name: string | null
  personal_message: string | null
  shipping_to: 'recipient' | 'buyer' | null
  shipping_street: string | null
  shipping_city: string | null
  shipping_postal_code: string | null
  shipping_country: string | null
  shipped_at: string | null
  used: boolean
  used_at: string | null
  expires_at: string
  created_at: string
}

type Filter = 'all' | 'physical' | 'digital'

// ─── Toast ─────────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const show = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }
  return { toast, show }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function euro(v: number | null | undefined): string {
  const n = Number(v ?? 0)
  return Number.isInteger(n) ? `${n} €` : `${n.toFixed(2).replace('.', ',')} €`
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { toast, show } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/gift-cards')
      if (!res.ok) throw new Error('Erreur de chargement')
      const data: GiftCard[] = await res.json()
      setCards(data)
    } catch {
      setError('Impossible de charger les bons cadeaux.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const toggleShipped = async (card: GiftCard) => {
    setUpdatingId(card.id)
    const shipped = !card.shipped_at
    try {
      const res = await fetch('/api/admin/gift-cards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: card.id, shipped }),
      })
      if (!res.ok) throw new Error()
      const updated: GiftCard = await res.json()
      setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, shipped_at: updated.shipped_at } : c)))
      show(shipped ? 'Bon marqué comme expédié' : 'Expédition annulée')
    } catch {
      show('Erreur lors de la mise à jour', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const copyCode = (code: string) => {
    void navigator.clipboard.writeText(code)
    show(`Code ${code} copié`)
  }

  const filtered = cards
    .filter((c) => (filter === 'all' ? true : c.delivery_method === filter))
    .filter((c) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        c.code.toLowerCase().includes(q) ||
        `${c.buyer_first_name ?? ''} ${c.buyer_last_name ?? ''}`.toLowerCase().includes(q) ||
        `${c.recipient_first_name ?? ''} ${c.recipient_last_name ?? ''}`.toLowerCase().includes(q)
      )
    })

  const toShipCount = cards.filter((c) => c.delivery_method === 'physical' && !c.shipped_at).length
  const totalRevenue = cards.reduce((s, c) => s + Number(c.total_amount ?? c.amount ?? 0), 0)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-primary-600 text-white'
              : 'bg-error text-white'
          }`}
        >
          {toast.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-900/30">
            <Gift className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Bons cadeaux</h1>
        </div>
        <p className="text-foreground-secondary">
          Suivi des bons cadeaux vendus et des expéditions papier.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide mb-1">Total vendus</p>
          <p className="text-2xl font-bold text-foreground">{cards.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide mb-1">À expédier</p>
          <p className={`text-2xl font-bold ${toShipCount > 0 ? 'text-primary-600' : 'text-foreground'}`}>
            {toShipCount}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide mb-1">Chiffre encaissé</p>
          <p className="text-2xl font-bold text-foreground">{euro(totalRevenue)}</p>
        </div>
      </div>

      {/* Filtres + recherche */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          {([
            ['all', 'Tous'],
            ['physical', 'Papier'],
            ['digital', 'Numériques'],
          ] as [Filter, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface border border-border text-foreground-secondary hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (code, acheteur, destinataire)…"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
      </div>

      {/* Liste */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-3" />
          <p className="text-foreground-secondary text-sm">Chargement…</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-xl bg-error/10 border border-error/20 text-error">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20">
          <Gift className="h-10 w-10 text-foreground-muted/30 mx-auto mb-3" />
          <p className="text-foreground-secondary text-sm">Aucun bon cadeau pour ce filtre.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((card) => {
            const isPhysical = card.delivery_method === 'physical'
            const isShipped = Boolean(card.shipped_at)
            return (
              <div
                key={card.id}
                className="p-5 sm:p-6 rounded-2xl bg-surface border border-border"
              >
                {/* En-tête carte */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isPhysical ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-background'
                      }`}
                    >
                      {isPhysical ? (
                        <Package className="h-5 w-5 text-primary-600" />
                      ) : (
                        <Mail className="h-5 w-5 text-foreground-secondary" />
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => copyCode(card.code)}
                        className="flex items-center gap-1.5 font-bold text-foreground hover:text-primary-600 transition-colors"
                        title="Copier le code"
                      >
                        {card.code}
                        <Copy className="h-3.5 w-3.5 opacity-50" />
                      </button>
                      <p className="text-xs text-foreground-secondary">
                        {formatDate(card.created_at)} · {isPhysical ? 'Papier' : 'Numérique'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-600">{euro(card.total_amount ?? card.amount)}</p>
                    {Number(card.delivery_fee) > 0 && (
                      <p className="text-xs text-foreground-secondary">
                        dont {euro(card.delivery_fee)} de livraison
                      </p>
                    )}
                  </div>
                </div>

                {/* Détails */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide mb-1">
                      Prestation
                    </p>
                    <p className="text-foreground">
                      {card.service_name ?? 'Bon cadeau libre'}
                      {card.hair_length_label ? ` — ${card.hair_length_label}` : ''}
                    </p>
                    {card.extras && card.extras.length > 0 && (
                      <p className="text-foreground-secondary mt-0.5">
                        + {card.extras.map((e) => e.name).join(', ')}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide mb-1">
                      Acheteur
                    </p>
                    {card.buyer_first_name || card.buyer_last_name || card.buyer_email ? (
                      <>
                        <p className="text-foreground">
                          {card.buyer_first_name} {card.buyer_last_name}
                        </p>
                        {card.buyer_email && (
                          <p className="text-foreground-secondary">{card.buyer_email}</p>
                        )}
                        {card.buyer_phone && (
                          <p className="text-foreground-secondary">{card.buyer_phone}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-foreground-muted/70 italic text-xs">
                        Non enregistré (bon antérieur à la mise à jour)
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide mb-1">
                      Destinataire
                    </p>
                    {card.recipient_first_name || card.recipient_last_name || card.recipient_email ? (
                      <>
                        <p className="text-foreground">
                          {card.recipient_first_name} {card.recipient_last_name}
                        </p>
                        {card.recipient_email && (
                          <p className="text-foreground-secondary">{card.recipient_email}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-foreground-muted/70 italic text-xs">
                        Non enregistré (bon antérieur à la mise à jour)
                      </p>
                    )}
                  </div>

                  {isPhysical && card.shipping_street && (
                    <div>
                      <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide mb-1">
                        Adresse d&apos;expédition
                      </p>
                      <p className="text-foreground">{card.shipping_street}</p>
                      <p className="text-foreground">
                        {card.shipping_postal_code} {card.shipping_city}
                      </p>
                      <p className="text-foreground-secondary">{card.shipping_country}</p>
                      {card.shipping_to === 'buyer' && (
                        <p className="text-foreground-secondary italic mt-0.5">Remis en main propre par l&apos;acheteur</p>
                      )}
                    </div>
                  )}
                </div>

                {card.personal_message && (
                  <div className="mt-4 p-3 rounded-lg bg-background border border-border">
                    <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide mb-1">
                      Message {card.sender_name ? `— de ${card.sender_name}` : ''}
                    </p>
                    <p className="text-sm text-foreground italic">“{card.personal_message}”</p>
                  </div>
                )}

                {/* Action expédition (papier uniquement) */}
                {isPhysical && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
                    {isShipped ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600">
                        <Check className="h-4 w-4" />
                        Expédié le {formatDate(card.shipped_at!)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground-secondary">
                        <Truck className="h-4 w-4" />
                        En attente d&apos;expédition
                      </span>
                    )}
                    <button
                      onClick={() => toggleShipped(card)}
                      disabled={updatingId === card.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                        isShipped
                          ? 'bg-surface border border-border text-foreground-secondary hover:text-foreground'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {updatingId === card.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isShipped ? (
                        'Annuler l’expédition'
                      ) : (
                        'Marquer comme expédié'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
