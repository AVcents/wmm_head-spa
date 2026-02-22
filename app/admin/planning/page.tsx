'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Ban,
  Clock,
  Shuffle,
  Pencil,
  Check,
  CalendarDays,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduleHour { id: number; template_id: string; day_label: string; hours: string; sort_order: number }
interface ScheduleTemplate { id: string; label: string; sort_order: number; schedule_hours: ScheduleHour[] }
interface PlanningOverride {
  id: string; week_start: string; type: 'closed' | 'template' | 'custom'
  template_id: string | null
  custom_hours: Array<{ day_label: string; hours: string; sort_order: number }> | null
  label: string | null
}
interface WeekInfo { monday: string; sunday: string; startDate: Date; endDate: Date }
interface DaySlot { from: string; to: string }
interface DayConfig { dayName: string; date: Date; closed: boolean; slots: DaySlot[] }

type EditMode = 'default' | 'closed' | 'template' | 'custom'

// ─── Constantes ───────────────────────────────────────────────────────────────

const WEEKS_AHEAD = 18
const WEEK_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const FR_MONTHS_LONG = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
const FR_MONTHS_SHORT = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.']

// ─── Helpers date ─────────────────────────────────────────────────────────────

function getMondayDate(d: Date): Date {
  const r = new Date(d); r.setHours(0,0,0,0)
  const day = r.getDay(); const diff = day === 0 ? -6 : 1 - day
  r.setDate(r.getDate() + diff); return r
}
/** Formate en YYYY-MM-DD en heure LOCALE (pas UTC — évite le décalage de date en France) */
function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r }

function buildWeeks(): WeekInfo[] {
  const weeks: WeekInfo[] = []
  const start = getMondayDate(new Date())
  for (let i = 0; i < WEEKS_AHEAD; i++) {
    const monday = addDays(start, i * 7)
    const sunday = addDays(monday, 6)
    weeks.push({ monday: toYMD(monday), sunday: toYMD(sunday), startDate: monday, endDate: sunday })
  }
  return weeks
}

function formatWeekTitle(w: WeekInfo): string {
  const d1 = w.startDate.getDate(); const m1 = FR_MONTHS_SHORT[w.startDate.getMonth()]!
  const d2 = w.endDate.getDate(); const m2 = FR_MONTHS_LONG[w.endDate.getMonth()]!
  const y = w.endDate.getFullYear()
  if (w.startDate.getMonth() === w.endDate.getMonth()) return `${d1} – ${d2} ${m2} ${y}`
  return `${d1} ${m1} – ${d2} ${m2} ${y}`
}

function formatDayDate(d: Date): string {
  return `${d.getDate()} ${FR_MONTHS_SHORT[d.getMonth()]}`
}

// ─── Helpers heures ───────────────────────────────────────────────────────────

/** Détecte un jour fermé, insensible aux problèmes d'encodage UTF-8/Latin-1 */
function isFerme(hours: string): boolean {
  return /^ferm/i.test(hours.trim())
}

function parseSlots(hours: string): DaySlot[] {
  if (!hours || isFerme(hours)) return []
  return hours.split('/').map(s => s.trim()).flatMap(seg => {
    const m = seg.match(/(\d{1,2})h(\d{2})?[\s\-–]+(\d{1,2})h(\d{2})?/)
    if (!m) return []
    return [{ from: `${m[1]!.padStart(2,'0')}:${(m[2]??'00').padStart(2,'0')}`, to: `${m[3]!.padStart(2,'0')}:${(m[4]??'00').padStart(2,'0')}` }]
  })
}

function slotsToHours(slots: DaySlot[]): string {
  if (slots.length === 0) return 'Fermé'
  return slots.map(s => {
    const fh = s.from.split(':')[0]!.replace(/^0/, ''); const fm = s.from.split(':')[1]!
    const th = s.to.split(':')[0]!.replace(/^0/, ''); const tm = s.to.split(':')[1]!
    return `${fh}h${fm === '00' ? '' : fm}-${th}h${tm === '00' ? '' : tm}`
  }).join(' / ')
}

/** Étend les plages "Lundi - Vendredi" en map jour → heures */
function expandTemplateToMap(hours: ScheduleHour[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const h of hours) {
    const label = h.day_label.trim()
    if (label.includes(' - ')) {
      const [start, end] = label.split(' - ').map(d => d.trim())
      const si = WEEK_DAYS.indexOf(start!); const ei = WEEK_DAYS.indexOf(end!)
      if (si >= 0 && ei >= 0) for (let i = si; i <= ei; i++) map[WEEK_DAYS[i]!] = h.hours
    } else {
      const idx = WEEK_DAYS.indexOf(label)
      if (idx >= 0) map[label] = h.hours
    }
  }
  return map
}

function buildDayConfigs(hoursMap: Record<string, string>, weekMonday: Date): DayConfig[] {
  return WEEK_DAYS.map((day, i) => {
    const hours = hoursMap[day] ?? 'Fermé'
    const closed = !hours || isFerme(hours)
    const slots = closed ? [{ from: '09:00', to: '18:00' }] : parseSlots(hours)
    return { dayName: day, date: addDays(weekMonday, i), closed, slots }
  })
}

function buildClosedDays(weekMonday: Date): DayConfig[] {
  return WEEK_DAYS.map((day, i) => ({
    dayName: day, date: addDays(weekMonday, i), closed: true, slots: [{ from: '09:00', to: '18:00' }]
  }))
}

function dayConfigsToCustomHours(days: DayConfig[]): Array<{ day_label: string; hours: string; sort_order: number }> {
  return days.map((d, i) => ({
    day_label: d.dayName,
    hours: d.closed ? 'Fermé' : slotsToHours(d.slots),
    sort_order: i,
  }))
}

// ─── Composant plage horaire ──────────────────────────────────────────────────

const TIME_OPTIONS: string[] = []
for (let h = 7; h <= 22; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2,'0')}:00`)
  if (h < 22) TIME_OPTIONS.push(`${String(h).padStart(2,'0')}:30`)
}

function SlotInput({ slot, onUpdate, onRemove, canRemove }: {
  slot: DaySlot; onUpdate: (s: DaySlot) => void; onRemove: () => void; canRemove: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <select
        value={slot.from}
        onChange={e => onUpdate({ ...slot, from: e.target.value })}
        className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#8B6E4E] min-w-0"
      >
        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <span className="text-stone-400 text-sm shrink-0">—</span>
      <select
        value={slot.to}
        onChange={e => onUpdate({ ...slot, to: e.target.value })}
        className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#8B6E4E] min-w-0"
      >
        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      {canRemove && (
        <button onClick={onRemove} className="text-stone-300 hover:text-red-400 transition shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ─── Composant ligne jour ─────────────────────────────────────────────────────

function DayRow({ day, editable, onChange }: {
  day: DayConfig; editable: boolean; onChange?: (d: DayConfig) => void
}) {
  const isToday = toYMD(new Date()) === toYMD(day.date)

  function updateSlot(i: number, slot: DaySlot) {
    const slots = [...day.slots]; slots[i] = slot
    onChange?.({ ...day, slots })
  }
  function removeSlot(i: number) {
    const slots = day.slots.filter((_, j) => j !== i)
    onChange?.({ ...day, slots: slots.length > 0 ? slots : [{ from: '09:00', to: '18:00' }] })
  }
  function addPause() {
    if (day.slots.length === 0) return
    const last = day.slots[day.slots.length - 1]!
    const startMin = parseInt(last.from.split(':')[0]!) * 60 + parseInt(last.from.split(':')[1]!)
    const endMin = parseInt(last.to.split(':')[0]!) * 60 + parseInt(last.to.split(':')[1]!)
    if (endMin - startMin < 240) return // trop court (< 4h) pour une pause

    // Par défaut : pause 12h–14h si le créneau couvre cette plage
    let pStart = 720  // 12:00
    let pEnd = 840    // 14:00
    if (pStart < startMin + 30 || pEnd > endMin - 30) {
      // Sinon centrer la pause de 2h sur le milieu du créneau
      const mid = Math.round((startMin + endMin) / 2 / 30) * 30
      pStart = Math.max(startMin + 30, mid - 60)
      pEnd = Math.min(endMin - 30, mid + 60)
      if (pEnd <= pStart) return
    }

    const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    onChange?.({ ...day, slots: [
      ...day.slots.slice(0, -1),
      { from: last.from, to: fmt(pStart) },
      { from: fmt(pEnd), to: last.to },
    ]})
  }

  return (
    <div className={`flex items-start gap-4 px-4 py-3 rounded-xl border transition ${
      isToday ? 'border-amber-200 bg-amber-50/50' : 'border-stone-100 bg-white hover:bg-stone-50/50'
    }`}>
      {/* Jour + date */}
      <div className="w-28 shrink-0 pt-0.5">
        <div className={`text-sm font-semibold ${isToday ? 'text-amber-700' : 'text-stone-700'}`}>
          {day.dayName}
        </div>
        <div className="text-xs text-stone-400">{formatDayDate(day.date)}</div>
      </div>

      {/* Créneaux */}
      <div className="flex-1 min-w-0">
        {day.closed ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-500 text-sm">
              <Ban className="w-3.5 h-3.5" /> Fermé
            </span>
            {editable && (
              <button
                onClick={() => onChange?.({ ...day, closed: false })}
                className="text-xs text-[#8B6E4E] hover:underline"
              >
                Ouvrir
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {editable ? (
              <>
                {day.slots.map((slot, i) => (
                  <SlotInput
                    key={i}
                    slot={slot}
                    onUpdate={s => updateSlot(i, s)}
                    onRemove={() => removeSlot(i)}
                    canRemove={day.slots.length > 1}
                  />
                ))}
                <button
                  onClick={addPause}
                  className="flex items-center gap-1 text-xs text-[#8B6E4E] hover:underline mt-0.5 w-fit"
                >
                  <Plus className="w-3 h-3" /> Ajouter une pause
                </button>
              </>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {day.slots.map((slot, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8B6E4E]/10 text-[#8B6E4E] text-sm font-medium">
                    <Clock className="w-3 h-3" />
                    {slot.from} – {slot.to}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toggle fermé (mode édition) */}
      {editable && !day.closed && (
        <button
          onClick={() => onChange?.({ ...day, closed: true })}
          className="shrink-0 text-stone-300 hover:text-stone-500 transition mt-0.5"
          title="Marquer comme fermé"
        >
          <Ban className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PlanningPage() {
  const [loading, setLoading] = useState(true)
  const [overrides, setOverrides] = useState<PlanningOverride[]>([])
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([])
  const [activeTemplateId, setActiveTemplateId] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; msg: string } | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Navigation semaines
  const weeks = useMemo(() => buildWeeks(), [])
  const [weekIdx, setWeekIdx] = useState(0)
  const currentWeek = weeks[weekIdx]!

  // État édition semaine courante
  const [editMode, setEditMode] = useState<EditMode>('default')
  const [editTemplateId, setEditTemplateId] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [editDays, setEditDays] = useState<DayConfig[]>([])
  const [isDirty, setIsDirty] = useState(false)

  const overrideMap = useMemo(() => new Map(overrides.map(o => [o.week_start, o])), [overrides])

  // Chargement initial
  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/planning')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setOverrides(data.overrides ?? [])
      setTemplates(data.templates ?? [])
      setActiveTemplateId(data.activeTemplateId ?? '')
    } catch {
      showToast('error', 'Impossible de charger le planning')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Refs pour accéder aux dernières valeurs sans les mettre dans les deps
  const templatesRef = React.useRef(templates)
  const activeTemplateIdRef = React.useRef(activeTemplateId)
  useEffect(() => { templatesRef.current = templates }, [templates])
  useEffect(() => { activeTemplateIdRef.current = activeTemplateId }, [activeTemplateId])

  const initFromOverride = useCallback((override: PlanningOverride | undefined, week: WeekInfo) => {
    const tpls = templatesRef.current
    const activeTplId = activeTemplateIdRef.current

    if (!override) {
      setEditMode('default')
      setEditLabel('')
      setEditTemplateId('')
      const activeTpl = tpls.find(t => t.id === activeTplId)
      const map = activeTpl ? expandTemplateToMap(activeTpl.schedule_hours) : {}
      setEditDays(buildDayConfigs(map, week.startDate))
      return
    }
    setEditLabel(override.label ?? '')
    if (override.type === 'closed') {
      setEditMode('closed')
      setEditTemplateId('')
      setEditDays(buildClosedDays(week.startDate))
    } else if (override.type === 'template') {
      setEditMode('template')
      setEditTemplateId(override.template_id ?? '')
      const tpl = tpls.find(t => t.id === override.template_id)
      const map = tpl ? expandTemplateToMap(tpl.schedule_hours) : {}
      setEditDays(buildDayConfigs(map, week.startDate))
    } else {
      setEditMode('custom')
      setEditTemplateId('')
      const map: Record<string, string> = {}
      for (const h of override.custom_hours ?? []) map[h.day_label] = h.hours
      setEditDays(buildDayConfigs(map, week.startDate))
    }
  }, []) // stable — lit les valeurs via refs

  function getActiveTpl(): ScheduleTemplate | undefined {
    return templates.find(t => t.id === activeTemplateId)
  }

  // Initialise l'état d'édition quand on change de semaine ou recharge les données
  useEffect(() => {
    if (loading) return
    const override = overrideMap.get(currentWeek.monday)
    initFromOverride(override, currentWeek)
    setIsDirty(false)
  }, [weekIdx, loading, overrideMap, initFromOverride])

  // Changement de mode
  function handleModeChange(mode: EditMode) {
    if (mode === editMode) return
    setEditMode(mode)
    setIsDirty(true)

    if (mode === 'default') {
      const tpl = getActiveTpl()
      const map = tpl ? expandTemplateToMap(tpl.schedule_hours) : {}
      setEditDays(buildDayConfigs(map, currentWeek.startDate))
    } else if (mode === 'closed') {
      setEditDays(buildClosedDays(currentWeek.startDate))
    } else if (mode === 'template') {
      const tid = editTemplateId || activeTemplateId
      const tpl = templates.find(t => t.id === tid)
      const map = tpl ? expandTemplateToMap(tpl.schedule_hours) : {}
      setEditDays(buildDayConfigs(map, currentWeek.startDate))
    } else if (mode === 'custom') {
      // On part des jours actuellement affichés pour avoir un point de départ cohérent
      setEditDays(days => days.map(d => ({ ...d })))
    }
  }

  function handleTemplateChange(tid: string) {
    setEditTemplateId(tid)
    setIsDirty(true)
    const tpl = templates.find(t => t.id === tid)
    const map = tpl ? expandTemplateToMap(tpl.schedule_hours) : {}
    setEditDays(buildDayConfigs(map, currentWeek.startDate))
  }

  function updateDay(i: number, day: DayConfig) {
    setEditDays(prev => prev.map((d, j) => j === i ? day : d))
    setIsDirty(true)
  }

  // Toast
  function showToast(type: 'success' | 'error' | 'warning', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4500)
  }

  // Sync Hapio manuelle
  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/hapio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-schedule' }),
      })
      const data = await res.json()
      if (data.success) showToast('success', `Hapio sync OK — ${data.schedules ?? '?'} plages, ${data.apiCalls ?? '?'} appels API`)
      else showToast('error', data.error ?? 'Erreur de synchronisation')
    } catch { showToast('error', 'Erreur réseau') }
    finally { setSyncing(false) }
  }

  // Sauvegarde
  async function handleSave() {
    setSaving(true)
    try {
      if (editMode === 'default') {
        // Supprimer l'override → revenir au template actif
        const res = await fetch(`/api/planning?week_start=${currentWeek.monday}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          setOverrides(prev => prev.filter(o => o.week_start !== currentWeek.monday))
          setIsDirty(false)
          showToast('success', 'Semaine réinitialisée — pensez à synchroniser Hapio')
        } else showToast('error', data.error ?? 'Erreur')
      } else {
        // Créer/modifier un override
        const body: Record<string, unknown> = {
          week_start: currentWeek.monday,
          type: editMode,
          label: editLabel || null,
        }
        if (editMode === 'template') body['template_id'] = editTemplateId
        if (editMode === 'custom') body['custom_hours'] = dayConfigsToCustomHours(editDays)

        const res = await fetch('/api/planning', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (data.success) {
          await load()  // recharger les overrides pour refléter la sauvegarde
          setIsDirty(false)
          showToast('success', 'Planning enregistré — pensez à synchroniser Hapio')
        } else showToast('error', data.error ?? 'Erreur')
      }
    } catch { showToast('error', 'Erreur réseau') }
    finally { setSaving(false) }
  }

  // Navigation semaines
  function goToPrev() { if (weekIdx > 0) { setWeekIdx(i => i - 1) } }
  function goToNext() { if (weekIdx < weeks.length - 1) { setWeekIdx(i => i + 1) } }

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B6E4E]" />
      </div>
    )
  }

  const activeTemplateName = templates.find(t => t.id === activeTemplateId)?.label ?? activeTemplateId
  const currentOverride = overrideMap.get(currentWeek.monday)
  const isEditable = editMode === 'custom'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-[#8B6E4E]" />
          <h1 className="text-2xl font-semibold text-stone-800">Planning</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/horaires" className="text-sm text-stone-400 hover:text-stone-600 hidden sm:block">
            Templates
          </Link>
          <button
            onClick={handleSync} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition"
          >
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Sync Hapio
          </button>
        </div>
      </div>

      {/* ── Navigation semaine (slider) ── */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Header navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <button
            onClick={goToPrev} disabled={weekIdx === 0}
            className="p-2 rounded-xl hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>

          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <span className="font-semibold text-stone-800">{formatWeekTitle(currentWeek)}</span>
              {currentOverride && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  currentOverride.type === 'closed' ? 'bg-red-100 text-red-600' :
                  currentOverride.type === 'template' ? 'bg-indigo-100 text-indigo-600' :
                  'bg-violet-100 text-violet-600'
                }`}>
                  {currentOverride.label ?? (
                    currentOverride.type === 'closed' ? 'Fermé' :
                    currentOverride.type === 'template' ? 'Autre template' : 'Perso'
                  )}
                </span>
              )}
            </div>
            <div className="text-xs text-stone-400 mt-0.5">
              Semaine {weekIdx + 1} / {weeks.length}
            </div>
          </div>

          <button
            onClick={goToNext} disabled={weekIdx === weeks.length - 1}
            className="p-2 rounded-xl hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* ── Sélection du mode ── */}
        <div className="px-5 pt-4 pb-3 flex flex-wrap gap-2 border-b border-stone-100">
          {([
            { value: 'default', icon: <Clock className="w-3.5 h-3.5" />, label: activeTemplateName },
            { value: 'template', icon: <Shuffle className="w-3.5 h-3.5" />, label: 'Autre template' },
            { value: 'custom', icon: <Pencil className="w-3.5 h-3.5" />, label: 'Personnalisé' },
            { value: 'closed', icon: <Ban className="w-3.5 h-3.5" />, label: 'Fermé' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => handleModeChange(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                editMode === opt.value
                  ? 'bg-[#8B6E4E] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {/* ── Options selon le mode ── */}
        {editMode === 'template' && (
          <div className="px-5 py-3 border-b border-stone-100 flex items-center gap-3">
            <span className="text-sm text-stone-600 shrink-0">Template :</span>
            <select
              value={editTemplateId || activeTemplateId}
              onChange={e => handleTemplateChange(e.target.value)}
              className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#8B6E4E]"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.label}{t.id === activeTemplateId ? ' (actif)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {editMode !== 'default' && (
          <div className="px-5 py-3 border-b border-stone-100 flex items-center gap-3">
            <span className="text-sm text-stone-600 shrink-0">Libellé :</span>
            <input
              type="text"
              placeholder="ex: Vacances d'été, Fermeture…"
              value={editLabel}
              onChange={e => { setEditLabel(e.target.value); setIsDirty(true) }}
              className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#8B6E4E]"
            />
          </div>
        )}

        {/* ── Grille des jours ── */}
        <div className="px-4 py-3 space-y-2">
          {editMode === 'closed' ? (
            <div className="py-8 text-center">
              <Ban className="w-10 h-10 text-red-300 mx-auto mb-2" />
              <p className="text-stone-500 font-medium">Semaine fermée</p>
              <p className="text-sm text-stone-400">Aucune réservation ne sera possible</p>
            </div>
          ) : (
            editDays.map((day, i) => (
              <DayRow
                key={day.dayName}
                day={day}
                editable={isEditable}
                onChange={isEditable ? (d) => updateDay(i, d) : undefined}
              />
            ))
          )}
        </div>

        {/* ── Indicateur mini-calendrier semaines ── */}
        <div className="px-5 py-3 border-t border-stone-100">
          <div className="flex gap-1 justify-center flex-wrap">
            {weeks.map((w, i) => {
              const ov = overrideMap.get(w.monday)
              const isCurrent = i === weekIdx
              return (
                <button
                  key={w.monday}
                  onClick={() => setWeekIdx(i)}
                  title={formatWeekTitle(w)}
                  className={`w-5 h-5 rounded-full text-[9px] font-bold transition ${
                    isCurrent ? 'bg-[#8B6E4E] text-white' :
                    ov?.type === 'closed' ? 'bg-red-200 text-red-700 hover:bg-red-300' :
                    ov ? 'bg-indigo-200 text-indigo-700 hover:bg-indigo-300' :
                    'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Barre de sauvegarde ── */}
      <div className={`mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
        isDirty ? 'bg-white border-[#8B6E4E]/30 shadow-sm' : 'bg-transparent border-transparent'
      }`}>
        {isDirty ? (
          <>
            <p className="text-sm text-stone-500">Modifications non sauvegardées</p>
            <div className="flex gap-2">
              <button
                onClick={() => { initFromOverride(overrideMap.get(currentWeek.monday), currentWeek); setIsDirty(false) }}
                className="px-4 py-2 text-sm border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSave} disabled={saving || (editMode === 'template' && !editTemplateId)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#8B6E4E] text-white rounded-xl hover:bg-[#7a5e40] disabled:opacity-50 transition"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-stone-400 w-full text-center">
            {currentOverride
              ? 'Semaine avec configuration spéciale — cliquez sur un mode pour modifier'
              : `Template actif par défaut : ${activeTemplateName}`
            }
          </p>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm z-50 max-w-sm ${
          toast.type === 'success' ? 'bg-green-600 text-white' :
          toast.type === 'warning' ? 'bg-amber-500 text-white' :
          'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> :
           toast.type === 'warning' ? <AlertTriangle className="w-4 h-4 shrink-0" /> :
           <X className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
