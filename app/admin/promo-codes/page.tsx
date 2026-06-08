'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Ticket,
  Percent,
  Euro,
  Calendar,
  Hash,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PromoCode {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_amount: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
}

type PromoFormData = Omit<PromoCode, 'id' | 'used_count'>

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDiscount(p: PromoCode): string {
  return p.discount_type === 'percentage'
    ? `−${Number(p.discount_value)}%`
    : `−${Number(p.discount_value).toFixed(2)}€`
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function isExpired(iso: string | null): boolean {
  return !!iso && new Date(iso) < new Date()
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const show = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }
  return { toast, show }
}

// ─── Modal de création / édition ───────────────────────────────────────────────

interface ModalProps {
  promo?: PromoCode
  onSave: (data: PromoFormData) => Promise<void>
  onClose: () => void
}

function PromoModal({ promo, onSave, onClose }: ModalProps) {
  const [code, setCode] = useState(promo?.code ?? '')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    promo?.discount_type ?? 'percentage'
  )
  const [discountValue, setDiscountValue] = useState(promo?.discount_value?.toString() ?? '')
  const [minAmount, setMinAmount] = useState(promo?.min_amount?.toString() ?? '0')
  const [maxUses, setMaxUses] = useState(promo?.max_uses?.toString() ?? '')
  const [expiresAt, setExpiresAt] = useState(promo?.expires_at ? promo.expires_at.slice(0, 10) : '')
  const [isActive, setIsActive] = useState(promo?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) { setError('Le code est obligatoire.'); return }
    const value = parseFloat(discountValue)
    if (isNaN(value) || value < 0) { setError('Valeur de remise invalide.'); return }
    if (discountType === 'percentage' && value > 100) { setError('Un pourcentage ne peut pas dépasser 100.'); return }
    const min = parseFloat(minAmount) || 0
    if (min < 0) { setError('Montant minimum invalide.'); return }
    let max: number | null = null
    if (maxUses.trim()) {
      max = parseInt(maxUses)
      if (isNaN(max) || max < 1) { setError('Nombre d\'utilisations invalide.'); return }
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: value,
        min_amount: min,
        max_uses: max,
        // Expiration en fin de journée pour rester valable tout le jour choisi
        expires_at: expiresAt ? `${expiresAt}T23:59:59` : null,
        is_active: isActive,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-border rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-serif font-semibold text-foreground">
            {promo ? 'Modifier le code promo' : 'Nouveau code promo'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-background transition-colors">
            <X className="h-5 w-5 text-foreground-muted" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {/* Code */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Code <span className="text-error">*</span></label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex : BIENVENUE10, PRINTEMPS20…"
              className={inputClass + ' font-mono tracking-wider'}
            />
          </div>

          {/* Type de remise */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Type de remise <span className="text-error">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDiscountType('percentage')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors text-sm font-medium ${
                  discountType === 'percentage'
                    ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300'
                    : 'border-border text-foreground-secondary hover:border-primary-300'
                }`}
              >
                <Percent className="h-4 w-4" /> Pourcentage
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('fixed')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors text-sm font-medium ${
                  discountType === 'fixed'
                    ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300'
                    : 'border-border text-foreground-secondary hover:border-primary-300'
                }`}
              >
                <Euro className="h-4 w-4" /> Montant fixe
              </button>
            </div>
          </div>

          {/* Valeur + Montant minimum */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Valeur <span className="text-error">*</span>
              </label>
              <div className="relative">
                {discountType === 'percentage'
                  ? <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                  : <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />}
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  min="0"
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  max={discountType === 'percentage' ? '100' : undefined}
                  placeholder={discountType === 'percentage' ? '20' : '10.00'}
                  className={inputClass + ' pl-9'}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Panier minimum
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className={inputClass + ' pl-9'}
                />
              </div>
            </div>
          </div>

          {/* Max usages + Expiration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Utilisations max <span className="text-xs text-foreground-muted">(vide = illimité)</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  min="1"
                  step="1"
                  placeholder="Illimité"
                  className={inputClass + ' pl-9'}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Expiration <span className="text-xs text-foreground-muted">(optionnel)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className={inputClass + ' pl-9'}
                />
              </div>
            </div>
          </div>

          {/* Actif */}
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${isActive ? 'border-primary-400 bg-primary-50/40 dark:bg-primary-900/10' : 'border-border bg-surface'}`}
            onClick={() => setIsActive((v) => !v)}
          >
            <div className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'border-primary-600 bg-primary-600' : 'border-foreground-muted'}`}>
              {isActive && <Check className="h-3 w-3 text-white" />}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground select-none">Code actif</p>
              <p className="text-xs text-foreground-muted select-none">Décochez pour désactiver le code sans le supprimer</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-border text-foreground hover:bg-background transition-colors font-medium"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page principale ────────────────────────────────────────────────────────────

export default function AdminPromoCodesPage() {
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<PromoCode | 'new' | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const { toast, show: showToast } = useToast()

  const fetchPromos = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/promo-codes')
      if (res.ok) setPromos(await res.json())
    } catch { showToast('Erreur de chargement', 'error') }
    finally { setLoading(false) }
  }, [showToast])

  useEffect(() => { void fetchPromos() }, [fetchPromos])

  const handleSave = async (data: PromoFormData) => {
    if (editing === 'new') {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Erreur création')
      setPromos((prev) => [result as PromoCode, ...prev])
      showToast('Code promo créé avec succès')
    } else if (editing) {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...data }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Erreur mise à jour')
      setPromos((prev) => prev.map((p) => (p.id === editing.id ? { ...editing, ...data } : p)))
      showToast('Code promo mis à jour')
    }
    setEditing(null)
  }

  const handleToggle = async (promo: PromoCode) => {
    const res = await fetch('/api/admin/promo-codes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: promo.id, is_active: !promo.is_active }),
    })
    if (res.ok) {
      setPromos((prev) => prev.map((p) => p.id === promo.id ? { ...p, is_active: !p.is_active } : p))
      showToast(promo.is_active ? 'Code désactivé' : 'Code activé')
    } else {
      showToast('Erreur lors de la mise à jour', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setPromos((prev) => prev.filter((p) => p.id !== id))
        showToast('Code promo supprimé')
      } else {
        showToast('Erreur lors de la suppression', 'error')
      }
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
    </div>
  )

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2 flex items-center gap-3">
            <Ticket className="h-8 w-8 text-primary-500" />
            Codes promo
          </h1>
          <p className="text-foreground-secondary">
            Créez des codes de réduction (en % ou en €) appliqués au total de la réservation.
            La remise est validée et calculée de façon sécurisée côté serveur.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shrink-0 ml-4"
        >
          <Plus className="h-4 w-4" />
          Nouveau code
        </button>
      </div>

      {/* Liste vide */}
      {promos.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <Ticket className="h-12 w-12 text-foreground-muted/30 mx-auto mb-4" />
          <p className="text-foreground-secondary text-lg mb-2">Aucun code promo</p>
          <p className="text-foreground-muted text-sm mb-6">
            Créez votre premier code de réduction.
          </p>
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Créer un code
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-3">
        {promos.map((promo) => {
          const expired = isExpired(promo.expires_at)
          const exhausted = promo.max_uses != null && promo.used_count >= promo.max_uses
          const inactive = !promo.is_active || expired || exhausted
          return (
            <div
              key={promo.id}
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                inactive ? 'border-border/50 bg-surface/50 opacity-60' : 'border-border bg-surface'
              }`}
            >
              {/* Indicateur */}
              <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${inactive ? 'bg-foreground-muted/40' : 'bg-success'}`} />

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-mono font-semibold tracking-wider text-foreground">{promo.code}</p>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {formatDiscount(promo)}
                  </span>
                  {promo.min_amount > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      dès {Number(promo.min_amount)}€
                    </span>
                  )}
                  {expired && (
                    <span className="text-xs px-2 py-1 rounded-full bg-error/10 text-error">Expiré</span>
                  )}
                  {exhausted && !expired && (
                    <span className="text-xs px-2 py-1 rounded-full bg-error/10 text-error">Épuisé</span>
                  )}
                  {!promo.is_active && !expired && !exhausted && (
                    <span className="text-xs px-2 py-1 rounded-full bg-foreground-muted/10 text-foreground-muted">Désactivé</span>
                  )}
                </div>
                <p className="text-xs text-foreground-muted mt-1.5 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {promo.used_count} / {promo.max_uses ?? '∞'} utilisé{promo.used_count > 1 ? 's' : ''}
                  </span>
                  {promo.expires_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Expire le {formatDate(promo.expires_at)}
                    </span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  title={promo.is_active ? 'Désactiver' : 'Activer'}
                  onClick={() => void handleToggle(promo)}
                  className="p-2 rounded-lg hover:bg-background transition-colors text-foreground-muted hover:text-foreground"
                >
                  {promo.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  title="Modifier"
                  onClick={() => setEditing(promo)}
                  className="p-2 rounded-lg hover:bg-background transition-colors text-foreground-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Supprimer"
                  onClick={() => setConfirmDeleteId(promo.id)}
                  disabled={deletingId === promo.id}
                  className="p-2 rounded-lg hover:bg-error/10 transition-colors text-foreground-muted hover:text-error"
                >
                  {deletingId === promo.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal création / édition */}
      {editing !== null && (
        <PromoModal
          {...(editing !== 'new' ? { promo: editing } : {})}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Modal confirmation suppression */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-error" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">Supprimer le code</h3>
            </div>
            <p className="text-foreground-secondary mb-6 text-sm">
              Cette action est irréversible. Le code promo sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleDelete(confirmDeleteId)}
                className="flex-1 py-3 rounded-xl bg-error text-white font-medium hover:bg-error/90 transition-colors"
              >
                Supprimer
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-background transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
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
