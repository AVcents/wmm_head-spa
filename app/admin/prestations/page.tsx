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
  ChevronDown,
  ChevronUp,
  Euro,
  Clock,
  GripVertical,
} from 'lucide-react'
import { CustomSelect } from '@/components/ui/custom-select'

interface Variant {
  id: string
  service_id: string
  name: string
  hair_length: string
  hair_length_label: string
  duration: number
  price: number
  description: string | null
  sort_order: number
}

interface ServiceData {
  id: string
  name: string
  category: string
  description: string
  has_variants: boolean
  duration: number | null
  price: number | null
  hair_length: string | null
  sort_order: number
  is_active: boolean
  service_variants: Variant[]
}

const CATEGORIES = [
  { value: 'headspa-japonais', label: 'Head Spa Japonais' },
  { value: 'headspa-holistique', label: 'Head Spa Holistique' },
  { value: 'massage', label: 'Massage' },
]

const HAIR_LENGTHS = [
  { value: 'courts', label: 'Cheveux courts (au dessus d\'épaule)' },
  { value: 'mi-longs', label: 'Cheveux mi-longs (en dessous d\'épaule)' },
  { value: 'longs', label: 'Cheveux longs (milieu du dos)' },
  { value: 'rases', label: 'Cheveux rasés/très courts' },
  { value: 'enfant', label: 'Enfant' },
  { value: 'body', label: 'Corps/Body' },
]

export default function AdminPrestationsPage() {
  const [services, setServices] = useState<ServiceData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data)
      }
    } catch {
      showToast('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (service: ServiceData) => {
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: service.id,
          name: service.name,
          category: service.category,
          description: service.description,
          has_variants: service.has_variants,
          duration: service.has_variants ? null : service.duration,
          price: service.has_variants ? null : service.price,
          hair_length: service.has_variants ? null : service.hair_length,
          is_active: service.is_active,
          sort_order: service.sort_order,
          variants: service.has_variants
            ? service.service_variants.map((v, i) => ({
                id: v.id,
                service_id: service.id,
                name: v.name,
                hair_length: v.hair_length,
                hair_length_label: v.hair_length_label,
                duration: v.duration,
                price: v.price,
                description: v.description,
                sort_order: i,
              }))
            : [],
        }),
      })

      if (res.ok) {
        showToast('Prestation mise à jour', 'success')
        setEditingId(null)
        fetchServices()
      } else {
        showToast('Erreur lors de la sauvegarde', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    }
  }

  const handleCreate = async (service: ServiceData) => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: service.id,
          name: service.name,
          category: service.category,
          description: service.description,
          has_variants: service.has_variants,
          duration: service.has_variants ? null : service.duration,
          price: service.has_variants ? null : service.price,
          hair_length: service.has_variants ? null : service.hair_length,
          is_active: service.is_active,
          sort_order: services.length + 1,
          variants: service.has_variants
            ? service.service_variants.map((v, i) => ({
                id: v.id,
                service_id: service.id,
                name: v.name,
                hair_length: v.hair_length,
                hair_length_label: v.hair_length_label,
                duration: v.duration,
                price: v.price,
                description: v.description,
                sort_order: i,
              }))
            : [],
        }),
      })

      if (res.ok) {
        showToast('Prestation créée', 'success')
        setShowNewForm(false)
        fetchServices()
      } else {
        showToast('Erreur lors de la création', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        showToast('Prestation supprimée', 'success')
        setDeleteConfirm(null)
        fetchServices()
      } else {
        showToast('Erreur lors de la suppression', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Gestion des prestations
          </h1>
          <p className="text-foreground-secondary">
            {services.length} prestation{services.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Ajouter
        </button>
      </div>

      {/* New service form */}
      {showNewForm && (
        <div className="mb-6">
          <ServiceForm
            onSave={handleCreate}
            onCancel={() => setShowNewForm(false)}
          />
        </div>
      )}

      {/* Services list */}
      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`bg-surface border rounded-2xl transition-all ${
              !service.is_active
                ? 'border-border/50 opacity-60'
                : 'border-border'
            }`}
          >
            {editingId === service.id ? (
              <div className="p-6">
                <ServiceForm
                  initialData={service}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <>
                {/* Service header */}
                <div className="flex items-center gap-4 p-5">
                  <div className="text-foreground-muted cursor-grab">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-serif font-semibold text-foreground truncate">
                        {service.name}
                      </h3>
                      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                        {CATEGORIES.find((c) => c.value === service.category)?.label}
                      </span>
                      {!service.is_active && (
                        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-foreground-muted/20 text-foreground-muted">
                          Masqué
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-secondary truncate">
                      {service.description}
                    </p>
                  </div>

                  {/* Price display */}
                  <div className="text-right shrink-0">
                    {service.has_variants ? (
                      <div className="text-sm text-foreground-secondary">
                        {service.service_variants.length > 0 && (
                          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {Math.min(...service.service_variants.map((v) => v.price))}€ -{' '}
                            {Math.max(...service.service_variants.map((v) => v.price))}€
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm text-foreground-secondary">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {service.duration} min
                        </span>
                        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {service.price}€
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {service.has_variants && (
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === service.id ? null : service.id)
                        }
                        className="p-2 rounded-lg hover:bg-background transition-colors text-foreground-muted"
                      >
                        {expandedId === service.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setEditingId(service.id)}
                      className="p-2 rounded-lg hover:bg-background transition-colors text-foreground-muted hover:text-primary-600"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(service.id)}
                      className="p-2 rounded-lg hover:bg-background transition-colors text-foreground-muted hover:text-error"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Expanded variants */}
                {expandedId === service.id && service.service_variants.length > 0 && (
                  <div className="px-5 pb-5 border-t border-border pt-4">
                    <div className="space-y-2">
                      {service.service_variants.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background"
                        >
                          <div>
                            <span className="text-sm font-medium text-foreground">
                              {v.hair_length_label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-foreground-secondary flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {v.duration} min
                            </span>
                            <span className="font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                              <Euro className="h-3.5 w-3.5" />
                              {v.price}€
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-error/10">
                <Trash2 className="h-6 w-6 text-error" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">
                Supprimer la prestation
              </h3>
            </div>
            <p className="text-foreground-secondary mb-6">
              Supprimer <strong className="text-foreground">{services.find((s) => s.id === deleteConfirm)?.name}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-background transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 px-4 rounded-xl bg-error text-white font-medium hover:bg-error/90 transition-colors"
              >
                Supprimer
              </button>
            </div>
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
          {toast.type === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// SERVICE FORM COMPONENT
// ============================================

function ServiceForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: ServiceData
  onSave: (data: ServiceData) => void
  onCancel: () => void
}) {
  const isNew = !initialData

  const [form, setForm] = useState<ServiceData>(
    initialData ?? {
      id: '',
      name: '',
      category: 'headspa-japonais',
      description: '',
      has_variants: false,
      duration: 60,
      price: 50,
      hair_length: null,
      sort_order: 0,
      is_active: true,
      service_variants: [],
    }
  )

  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Auto-generate ID from name if new
    const data = {
      ...form,
      id: isNew
        ? form.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        : form.id,
    }

    await onSave(data)
    setSaving(false)
  }

  const addVariant = () => {
    const newVariant: Variant = {
      id: `${form.id || 'new'}-${Date.now()}`,
      service_id: form.id,
      name: `${form.name} - Courts`,
      hair_length: 'courts',
      hair_length_label: 'Cheveux courts (au dessus d\'épaule)',
      duration: form.duration ?? 60,
      price: 50,
      description: null,
      sort_order: form.service_variants.length,
    }
    setForm({ ...form, service_variants: [...form.service_variants, newVariant] })
  }

  const updateVariant = (index: number, updates: Partial<Variant>) => {
    const variants = [...form.service_variants]
    const current = variants[index]
    if (!current) return
    variants[index] = { ...current, ...updates }

    // Auto-update hair_length_label when hair_length changes
    if (updates.hair_length) {
      const hl = HAIR_LENGTHS.find((h) => h.value === updates.hair_length)
      const v = variants[index]
      if (hl && v) v.hair_length_label = hl.label
    }

    setForm({ ...form, service_variants: variants })
  }

  const removeVariant = (index: number) => {
    setForm({
      ...form,
      service_variants: form.service_variants.filter((_, i) => i !== index),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-background rounded-xl p-6 border border-border">
      <h3 className="text-lg font-serif font-semibold text-foreground mb-6">
        {isNew ? 'Nouvelle prestation' : `Modifier : ${form.name}`}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nom</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <CustomSelect
            label="Catégorie"
            value={form.category}
            onChange={(val) => setForm({ ...form, category: val })}
            options={CATEGORIES}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            required
          />
        </div>

        {/* Has variants toggle */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.has_variants}
              onChange={(e) =>
                setForm({ ...form, has_variants: e.target.checked })
              }
              className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-foreground">
              Prix variable selon longueur de cheveux
            </span>
          </label>
        </div>

        {/* Simple price/duration (no variants) */}
        {!form.has_variants && (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Durée (minutes)
              </label>
              <input
                type="number"
                value={form.duration ?? ''}
                onChange={(e) =>
                  setForm({ ...form, duration: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Prix (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.price ?? ''}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Type de cheveux (optionnel)
              </label>
              <input
                type="text"
                value={form.hair_length ?? ''}
                onChange={(e) =>
                  setForm({ ...form, hair_length: e.target.value || null })
                }
                placeholder="Ex: Enfant, Massage corps..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </>
        )}
      </div>

      {/* Variants */}
      {form.has_variants && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground">Variantes de prix</h4>
            <button
              type="button"
              onClick={addVariant}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          <div className="space-y-3">
            {form.service_variants.map((variant, index) => (
              <div
                key={variant.id}
                className="grid grid-cols-[1fr_100px_100px_40px] gap-3 items-end p-3 rounded-lg bg-surface border border-border"
              >
                <div>
                  <CustomSelect
                    label="Type"
                    value={variant.hair_length}
                    onChange={(val) =>
                      updateVariant(index, { hair_length: val })
                    }
                    options={HAIR_LENGTHS}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-foreground-muted mb-1">Durée</label>
                  <input
                    type="number"
                    value={variant.duration}
                    onChange={(e) =>
                      updateVariant(index, {
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-foreground-muted mb-1">Prix €</label>
                  <input
                    type="number"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(index, {
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="p-2 rounded-lg hover:bg-error/10 text-foreground-muted hover:text-error transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-foreground">
            Visible sur le site
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-background transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isNew ? 'Créer' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
