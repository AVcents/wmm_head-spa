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
  Euro,
  Sparkles,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Extra {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  is_active: boolean
  sort_order: number
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
  extra?: Extra
  onSave: (data: Omit<Extra, 'id'>) => Promise<void>
  onClose: () => void
}

function ExtraModal({ extra, onSave, onClose }: ModalProps) {
  const [name, setName] = useState(extra?.name ?? '')
  const [description, setDescription] = useState(extra?.description ?? '')
  const [price, setPrice] = useState(extra?.price?.toString() ?? '')
  const [duration, setDuration] = useState(extra?.duration?.toString() ?? '0')
  const [isActive, setIsActive] = useState(extra?.is_active ?? true)
  const [sortOrder, setSortOrder] = useState(extra?.sort_order?.toString() ?? '0')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price) { setError('Nom et prix sont obligatoires.'); return }
    const p = parseFloat(price)
    if (isNaN(p) || p < 0) { setError('Prix invalide.'); return }
    const d = parseInt(duration)
    if (isNaN(d) || d < 0) { setError('Durée invalide.'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        price: p,
        duration: d,
        is_active: isActive,
        sort_order: parseInt(sortOrder) || 0,
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
      <div className="bg-surface border border-border rounded-2xl p-8 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-serif font-semibold text-foreground">
            {extra ? 'Modifier l\'extra' : 'Nouvel extra'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-background transition-colors">
            <X className="h-5 w-5 text-foreground-muted" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {/* Nom */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Nom <span className="text-error">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Huile premium, Massage du cuir chevelu…" className={inputClass} />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Description <span className="text-xs text-foreground-muted">(optionnel)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Courte description visible par le client"
              rows={2}
              className={inputClass + ' resize-none'}
            />
          </div>

          {/* Durée */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Durée supplémentaire <span className="text-xs text-foreground-muted">(en minutes)</span>
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="0"
              step="5"
              placeholder="15"
              className={inputClass}
            />
            <p className="text-xs text-foreground-muted mt-1">
              Temps ajouté à la prestation de base (ex: 15 min pour un massage additionnel)
            </p>
          </div>

          {/* Prix + Ordre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Prix (€) <span className="text-error">*</span></label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="10.00"
                  className={inputClass + ' pl-9'}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Ordre d'affichage</label>
              <div className="relative">
                <GripVertical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  min="0"
                  placeholder="0"
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
              <p className="text-sm font-medium text-foreground select-none">Visible par les clients</p>
              <p className="text-xs text-foreground-muted select-none">Décochez pour masquer temporairement cet extra</p>
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

export default function AdminExtrasPage() {
  const [extras, setExtras] = useState<Extra[]>([])
  const [loading, setLoading] = useState(true)
  const [editingExtra, setEditingExtra] = useState<Extra | 'new' | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const { toast, show: showToast } = useToast()

  const fetchExtras = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/extras')
      if (res.ok) setExtras(await res.json())
    } catch { showToast('Erreur de chargement', 'error') }
    finally { setLoading(false) }
  }, [showToast])

  useEffect(() => { void fetchExtras() }, [fetchExtras])

  const handleSave = async (data: Omit<Extra, 'id'>) => {
    if (editingExtra === 'new') {
      const res = await fetch('/api/admin/extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Erreur création')
      setExtras((prev) => [...prev, result as Extra].sort((a, b) => a.sort_order - b.sort_order))
      showToast('Extra créé avec succès')
    } else if (editingExtra) {
      const res = await fetch('/api/admin/extras', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingExtra.id, ...data }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Erreur mise à jour')
      setExtras((prev) =>
        prev.map((e) => (e.id === editingExtra.id ? { ...editingExtra, ...data } : e))
          .sort((a, b) => a.sort_order - b.sort_order)
      )
      showToast('Extra mis à jour')
    }
    setEditingExtra(null)
  }

  const handleToggle = async (extra: Extra) => {
    const res = await fetch('/api/admin/extras', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: extra.id, is_active: !extra.is_active }),
    })
    if (res.ok) {
      setExtras((prev) => prev.map((e) => e.id === extra.id ? { ...e, is_active: !e.is_active } : e))
      showToast(extra.is_active ? 'Extra masqué' : 'Extra activé')
    } else {
      showToast('Erreur lors de la mise à jour', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch('/api/admin/extras', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setExtras((prev) => prev.filter((e) => e.id !== id))
        showToast('Extra supprimé')
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
            <Sparkles className="h-8 w-8 text-primary-500" />
            Extras
          </h1>
          <p className="text-foreground-secondary">
            Options supplémentaires proposées aux clients lors de la réservation.
            Chaque extra a un tarif qui s'ajoute au prix de la prestation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditingExtra('new')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shrink-0 ml-4"
        >
          <Plus className="h-4 w-4" />
          Nouvel extra
        </button>
      </div>

      {/* Liste vide */}
      {extras.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <Sparkles className="h-12 w-12 text-foreground-muted/30 mx-auto mb-4" />
          <p className="text-foreground-secondary text-lg mb-2">Aucun extra configuré</p>
          <p className="text-foreground-muted text-sm mb-6">
            Créez vos premiers extras pour les proposer aux clients.
          </p>
          <button
            type="button"
            onClick={() => setEditingExtra('new')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Créer un extra
          </button>
        </div>
      )}

      {/* Cards extras */}
      <div className="space-y-3">
        {extras.map((extra) => (
          <div
            key={extra.id}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
              extra.is_active ? 'border-border bg-surface' : 'border-border/50 bg-surface/50 opacity-60'
            }`}
          >
            {/* Indicateur actif */}
            <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${extra.is_active ? 'bg-success' : 'bg-foreground-muted/40'}`} />

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <p className="font-medium text-foreground">{extra.name}</p>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  +{Number(extra.price).toFixed(2)}€
                </span>
                {extra.duration > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                    +{extra.duration} min
                  </span>
                )}
              </div>
              {extra.description && (
                <p className="text-sm text-foreground-secondary mt-0.5 truncate">{extra.description}</p>
              )}
              <p className="text-xs text-foreground-muted mt-1">Ordre : {extra.sort_order}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Toggle actif */}
              <button
                type="button"
                title={extra.is_active ? 'Masquer' : 'Activer'}
                onClick={() => void handleToggle(extra)}
                className="p-2 rounded-lg hover:bg-background transition-colors text-foreground-muted hover:text-foreground"
              >
                {extra.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>

              {/* Modifier */}
              <button
                type="button"
                title="Modifier"
                onClick={() => setEditingExtra(extra)}
                className="p-2 rounded-lg hover:bg-background transition-colors text-foreground-muted hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>

              {/* Supprimer */}
              <button
                type="button"
                title="Supprimer"
                onClick={() => setConfirmDeleteId(extra.id)}
                disabled={deletingId === extra.id}
                className="p-2 rounded-lg hover:bg-error/10 transition-colors text-foreground-muted hover:text-error"
              >
                {deletingId === extra.id
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal création / édition */}
      {editingExtra !== null && (
        <ExtraModal
          {...(editingExtra !== 'new' ? { extra: editingExtra } : {})}
          onSave={handleSave}
          onClose={() => setEditingExtra(null)}
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
              <h3 className="text-xl font-serif font-semibold text-foreground">Supprimer l'extra</h3>
            </div>
            <p className="text-foreground-secondary mb-6 text-sm">
              Cette action est irréversible. L'extra sera définitivement supprimé.
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
