'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  Check,
  Loader2,
  AlertCircle,
  Sun,
  Snowflake,
  Pencil,
  Trash2,
  Plus,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

// ---------- Types ----------

interface ScheduleHour {
  id: number
  template_id: string
  day_label: string
  hours: string
  sort_order: number
}

interface ScheduleTemplate {
  id: string
  label: string
  sort_order: number
  schedule_hours: ScheduleHour[]
}

interface EditRow {
  day_label: string
  hours: string
}

// ---------- Helpers ----------

/** Génère un ID slug depuis un label (ex: "Mon planning été" → "mon-planning-ete") */
function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const DEFAULT_ICON = Clock
const templateIcons: Record<string, typeof Sun> = {
  'semaine-impaire': Sun,
  'semaine-paire': Sun,
  'vacances-impaire': Snowflake,
  'vacances-paire': Snowflake,
}

const templateColors: Record<string, string> = {
  'semaine-impaire': 'from-primary-500 to-primary-600',
  'semaine-paire': 'from-secondary-500 to-secondary-600',
  'vacances-impaire': 'from-blue-500 to-blue-600',
  'vacances-paire': 'from-purple-500 to-purple-600',
}
const DEFAULT_COLOR = 'from-foreground-muted to-foreground-secondary'

const EXAMPLE_ROWS: EditRow[] = [
  { day_label: 'Lundi - Vendredi', hours: '09h00 - 12h00 / 13h00 - 19h00' },
  { day_label: 'Samedi', hours: '09h00 - 17h00' },
  { day_label: 'Dimanche', hours: 'Fermé' },
]

// ---------- Row editor sub-component ----------

function RowEditor({
  rows,
  onChange,
}: {
  rows: EditRow[]
  onChange: (rows: EditRow[]) => void
}) {
  const updateRow = (idx: number, field: keyof EditRow, value: string) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    onChange(next)
  }

  const addRow = () => onChange([...rows, { day_label: '', hours: '' }])

  const removeRow = (idx: number) => onChange(rows.filter((_, i) => i !== idx))

  return (
    <div className="space-y-2">
      {rows.map((row, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <input
            type="text"
            value={row.day_label}
            onChange={(e) => updateRow(idx, 'day_label', e.target.value)}
            placeholder="Lundi - Vendredi"
            className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-border bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            value={row.hours}
            onChange={(e) => updateRow(idx, 'hours', e.target.value)}
            placeholder="09h00 - 12h00 / 13h00 - 19h00"
            className="flex-[2] min-w-0 px-3 py-2 text-sm rounded-lg border border-border bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={() => removeRow(idx)}
            disabled={rows.length <= 1}
            className="p-2 rounded-lg text-foreground-muted hover:text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        <Plus className="h-4 w-4" />
        Ajouter une ligne
      </button>
    </div>
  )
}

// ---------- Main page ----------

export default function AdminHorairesPage() {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([])
  const [activeTemplateId, setActiveTemplateId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning'
  } | null>(null)

  // Confirm activate
  const [confirmTemplate, setConfirmTemplate] = useState<string | null>(null)

  // Edit modal
  const [editingTemplate, setEditingTemplate] = useState<ScheduleTemplate | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editRows, setEditRows] = useState<EditRow[]>([])
  const [savingEdit, setSavingEdit] = useState(false)

  // Create modal
  const [creating, setCreating] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newRows, setNewRows] = useState<EditRow[]>([...EXAMPLE_ROWS])
  const [savingNew, setSavingNew] = useState(false)

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // -------- Data fetch --------

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/schedule')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates)
        setActiveTemplateId(data.activeTemplateId)
      }
    } catch {
      showToast('Erreur de chargement', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  // -------- Toast --------

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' = 'success'
  ) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // -------- Activate template --------

  const confirmChange = async () => {
    if (!confirmTemplate) return
    setUpdating(confirmTemplate)
    setConfirmTemplate(null)

    try {
      const res = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: confirmTemplate }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.error ?? 'Erreur lors de la mise à jour', 'error')
        return
      }

      setActiveTemplateId(confirmTemplate)

      showToast('Horaires activés avec succès', 'success')
    } catch {
      showToast('Erreur de connexion', 'error')
    } finally {
      setUpdating(null)
    }
  }

  // -------- Edit template --------

  const openEditModal = (template: ScheduleTemplate) => {
    setEditingTemplate(template)
    setEditLabel(template.label)
    setEditRows(
      template.schedule_hours.length > 0
        ? template.schedule_hours.map((h) => ({
            day_label: h.day_label,
            hours: h.hours,
          }))
        : [{ day_label: '', hours: '' }]
    )
  }

  const handleSaveEdit = async () => {
    if (!editingTemplate) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/schedule/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editLabel,
          hours: editRows.map((r, i) => ({
            day_label: r.day_label,
            hours: r.hours,
            sort_order: i,
          })),
        }),
      })

      if (res.ok) {
        setEditingTemplate(null)
        await fetchSchedule()
        showToast('Planning mis à jour', 'success')
      } else {
        const data = await res.json()
        showToast(data.error ?? 'Erreur lors de la sauvegarde', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  // -------- Create template --------

  const openCreateModal = () => {
    setNewLabel('')
    setNewRows([...EXAMPLE_ROWS])
    setCreating(true)
  }

  const handleCreateTemplate = async () => {
    if (!newLabel.trim()) return
    setSavingNew(true)
    const id = slugify(newLabel)
    const sortOrder = Math.max(...templates.map((t) => t.sort_order), 0) + 1

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          label: newLabel.trim(),
          sortOrder,
          hours: newRows
            .filter((r) => r.day_label.trim())
            .map((r, i) => ({
              day_label: r.day_label,
              hours: r.hours,
              sort_order: i,
            })),
        }),
      })

      if (res.ok) {
        setCreating(false)
        await fetchSchedule()
        showToast('Nouveau planning créé', 'success')
      } else {
        const data = await res.json()
        showToast(data.error ?? 'Erreur lors de la création', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    } finally {
      setSavingNew(false)
    }
  }

  // -------- Delete template --------

  const handleDeleteTemplate = async () => {
    if (!confirmDelete) return
    setDeleting(confirmDelete)
    setConfirmDelete(null)

    try {
      const res = await fetch(`/api/schedule/${confirmDelete}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchSchedule()
        showToast('Planning supprimé', 'success')
      } else {
        const data = await res.json()
        showToast(data.error ?? 'Erreur lors de la suppression', 'error')
      }
    } catch {
      showToast('Erreur de connexion', 'error')
    } finally {
      setDeleting(null)
    }
  }

  // -------- Input class --------
  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all'

  // -------- Loading --------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // -------- Render --------
  return (
    <div className="max-w-4xl">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Gestion des horaires
          </h1>
          <p className="text-foreground-secondary">
            Créez des plannings, modifiez les horaires et activez celui de la semaine.
            Le changement est synchronisé avec le système de réservation.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nouveau planning
          </button>
        </div>
      </div>

      {/* Active template indicator */}
      <div className="mb-8 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-600">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-foreground-muted">Planning actif (affiché sur le site)</p>
            <p className="font-semibold text-foreground">
              {templates.find((t) => t.id === activeTemplateId)?.label ?? '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => {
          const isActive = template.id === activeTemplateId
          const isUpdating = updating === template.id
          const isDeleting = deleting === template.id
          const Icon = templateIcons[template.id] ?? DEFAULT_ICON
          const gradient = templateColors[template.id] ?? DEFAULT_COLOR

          return (
            <div
              key={template.id}
              className={`relative rounded-2xl border-2 transition-all ${
                isActive
                  ? 'border-primary-500 bg-surface shadow-lg'
                  : 'border-border bg-surface hover:border-primary-300 hover:shadow-md'
              }`}
            >
              {/* Active badge */}
              {isActive && (
                <div className="absolute -top-3 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-bold">
                  <Check className="h-3 w-3" />
                  ACTIF
                </div>
              )}

              {/* Edit + delete buttons */}
              <div className="absolute top-3 right-3 flex gap-1">
                <button
                  onClick={() => openEditModal(template)}
                  title="Modifier ce planning"
                  className="p-1.5 rounded-lg text-foreground-muted hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {!isActive && (
                  <button
                    onClick={() => setConfirmDelete(template.id)}
                    disabled={isDeleting}
                    title="Supprimer ce planning"
                    className="p-1.5 rounded-lg text-foreground-muted hover:text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              <div className="p-6 pt-5">
                {/* Template header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex-shrink-0`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-foreground leading-tight pr-10">
                    {template.label}
                  </h3>
                </div>

                {/* Hours preview */}
                <div className="space-y-2 mb-6 min-h-[48px]">
                  {template.schedule_hours.length > 0 ? (
                    template.schedule_hours.map((hour) => (
                      <div
                        key={hour.id}
                        className="flex justify-between items-center text-sm gap-2"
                      >
                        <span className="text-foreground-secondary shrink-0">{hour.day_label}</span>
                        <span
                          className={`font-medium text-right ${
                            hour.hours === 'Fermé'
                              ? 'text-foreground-muted'
                              : 'text-foreground'
                          }`}
                        >
                          {hour.hours}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-foreground-muted italic">Aucun horaire défini</p>
                  )}
                </div>

                {/* Activate button */}
                <button
                  onClick={() => {
                    if (!isActive && !isUpdating) setConfirmTemplate(template.id)
                  }}
                  disabled={isActive || isUpdating}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 cursor-default'
                      : isUpdating
                        ? 'bg-background text-foreground-muted cursor-wait'
                        : 'bg-background border border-border text-foreground hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 hover:text-primary-700 dark:hover:text-primary-400'
                  }`}
                >
                  {isActive ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4" />
                      Planning actif
                    </span>
                  ) : isUpdating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Activation...
                    </span>
                  ) : (
                    'Activer ce planning'
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* =========== MODAL : Confirm activate =========== */}
      {confirmTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">
                Activer ce planning ?
              </h3>
            </div>
            <p className="text-foreground-secondary mb-6">
              Les horaires affichés sur le site et les créneaux de réservation seront
              immédiatement remplacés par{' '}
              <strong className="text-foreground">
                {templates.find((t) => t.id === confirmTemplate)?.label}
              </strong>
              .
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTemplate(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-background transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmChange}
                className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
              >
                Activer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========== MODAL : Edit template =========== */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-semibold text-foreground">
                Modifier le planning
              </h3>
              <button
                onClick={() => setEditingTemplate(null)}
                className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Label */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Nom du planning
              </label>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className={inputClass}
                placeholder="ex: Semaine normale"
              />
            </div>

            {/* Rows */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  Horaires par jour
                </label>
                <span className="text-xs text-foreground-muted">
                  Jour &nbsp;|&nbsp; Horaires (ex : 09h00 - 12h00 / 13h00 - 19h00)
                </span>
              </div>
              <RowEditor rows={editRows} onChange={setEditRows} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingTemplate(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-background transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit || !editLabel.trim()}
                className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {savingEdit ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========== MODAL : Create template =========== */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-semibold text-foreground">
                Nouveau planning
              </h3>
              <button
                onClick={() => setCreating(false)}
                className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Label */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Nom du planning
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className={inputClass}
                placeholder="ex: Vacances d'été 2025"
              />
            </div>

            {/* Rows */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  Horaires par jour
                </label>
                <span className="text-xs text-foreground-muted">
                  Jour &nbsp;|&nbsp; Horaires
                </span>
              </div>
              <RowEditor rows={newRows} onChange={setNewRows} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCreating(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-background transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={savingNew || !newLabel.trim()}
                className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {savingNew ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer le planning'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========== MODAL : Confirm delete =========== */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                <Trash2 className="h-6 w-6 text-error" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground">
                Supprimer ce planning ?
              </h3>
            </div>
            <p className="text-foreground-secondary mb-6">
              Le planning{' '}
              <strong className="text-foreground">
                {templates.find((t) => t.id === confirmDelete)?.label}
              </strong>{' '}
              sera définitivement supprimé. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-background transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="flex-1 py-3 px-4 rounded-xl bg-error text-white font-medium hover:opacity-90 transition-opacity"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========== Toast =========== */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border max-w-sm ${
            toast.type === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : toast.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                : 'bg-error/10 border-error/20 text-error'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  )
}
