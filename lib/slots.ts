// ============================================
// lib/slots.ts
// Génération locale des créneaux disponibles
// Remplace entièrement Hapio getBookableSlots
// ============================================

import { createAdminClient } from '@/lib/supabase/admin'
import {
  parseHoursToHapioBlocks,
  getMondayOf,
  getAllScheduleTemplates,
  getActiveTemplateId,
  getPlanningOverrides,
  getCachedSlots,
  setCachedSlots,
} from '@/lib/data'
import type { PlanningOverrideRow, ScheduleTemplateWithHours } from '@/lib/supabase/types'

export interface Slot {
  starts_at: string  // ISO UTC
  ends_at: string    // ISO UTC
}

// ─── Helpers timezone Europe/Paris ─────────────────────────────

/**
 * Convertit une heure locale Paris (HH:MM, date YYYY-MM-DD) en ISO UTC.
 * Gère automatiquement CET (UTC+1) et CEST (UTC+2) via l'API Intl.
 */
function parisTimeToUTCIso(dateStr: string, timeStr: string): string {
  const [yearS, monthS, dayS] = dateStr.split('-')
  const [hourS, minuteS] = timeStr.split(':')
  const year = Number(yearS)
  const month = Number(monthS)
  const day = Number(dayS)
  const hour = Number(hourS)
  const minute = Number(minuteS)

  // Probe : on traite l'heure voulue comme si c'était UTC
  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))

  // On demande à Paris quelle heure il est à cet instant UTC
  const parisStr = probe.toLocaleString('sv-SE', { timeZone: 'Europe/Paris' })
  // sv-SE format: "YYYY-MM-DD HH:MM:SS"
  const parisTimePart = parisStr.split(' ')[1] ?? '00:00:00'
  const [pHourS, pMinuteS] = parisTimePart.split(':')
  const pHour = Number(pHourS)
  const pMinute = Number(pMinuteS)

  // Décalage = ce que Paris "lit" − ce que l'on voulait
  // (ex: CEST: Paris lit 11h pour un probe de 9h → diff = 2h)
  const diffMs = ((pHour * 60 + pMinute) - (hour * 60 + minute)) * 60_000

  return new Date(probe.getTime() - diffMs).toISOString()
}

/**
 * Retourne le jour de la semaine Paris (0=Dim, 1=Lun, ... 6=Sam)
 * pour une date YYYY-MM-DD, en évitant les décalages UTC.
 */
function getParisDayOfWeek(dateStr: string): number {
  // À midi UTC, la date locale Paris est toujours la même
  const d = new Date(`${dateStr}T12:00:00Z`)
  const dayStr = d.toLocaleString('en-US', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
  })
  const map: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  }
  return map[dayStr] ?? d.getUTCDay()
}

// ─── Résolution du planning ─────────────────────────────────────

type Block = { day_of_week: number; start_time: string; end_time: string }

function resolveWeekBlocks(
  monday: string,
  overrideMap: Map<string, PlanningOverrideRow>,
  templateMap: Map<string, ScheduleTemplateWithHours>,
  activeTemplate: ScheduleTemplateWithHours | undefined
): Block[] {
  const override = overrideMap.get(monday)

  if (override) {
    if (override.type === 'closed') return []
    if (override.type === 'template' && override.template_id) {
      const tpl = templateMap.get(override.template_id)
      if (tpl) return parseHoursToHapioBlocks(tpl.schedule_hours)
      console.warn(`[slots] Template "${override.template_id}" introuvable pour sem. ${monday}`)
    }
    if (override.type === 'custom' && override.custom_hours) {
      return parseHoursToHapioBlocks(override.custom_hours)
    }
  }

  if (!activeTemplate) return []
  return parseHoursToHapioBlocks(activeTemplate.schedule_hours)
}

// ─── Génération principale ─────────────────────────────────────

/**
 * Génère les créneaux disponibles pour un service/variant à une date donnée.
 *
 * @param cacheKey   Clé de cache = variantId si disponible, sinon serviceId
 * @param duration   Durée du soin en minutes
 * @param date       Date YYYY-MM-DD
 * @param adminMode  Si true, pas de filtre 24h minimum
 */
export async function generateSlots(
  cacheKey: string,
  duration: number,
  date: string,
  adminMode = false
): Promise<Slot[]> {
  // ── 1. Cache (uniquement en mode public) ──────────────────────
  if (!adminMode) {
    const cached = await getCachedSlots(cacheKey, date)
    if (cached) {
      return applyAdvanceFilter(
        cached.map(c => ({ starts_at: c.starts_at, ends_at: c.ends_at })),
        adminMode
      )
    }
  }

  // ── 2. Charger le planning depuis Supabase ────────────────────
  const supabase = createAdminClient()

  const [templates, activeTemplateId, overrides] = await Promise.all([
    getAllScheduleTemplates(),
    getActiveTemplateId(),
    getPlanningOverrides(),
  ])

  const templateMap = new Map(templates.map(t => [t.id, t]))
  const activeTemplate = templateMap.get(activeTemplateId)
  const overrideMap = new Map(overrides.map(o => [o.week_start, o]))

  // ── 2b. Récupérer le buffer_time du service ───────────────────
  let bufferTime = 0

  // Essayer d'abord de récupérer depuis service_variants
  const { data: variantData } = await supabase
    .from('service_variants')
    .select('service_id')
    .eq('id', cacheKey)
    .single()

  const serviceId = variantData?.service_id || cacheKey

  const { data: serviceData } = await supabase
    .from('services')
    .select('buffer_time')
    .eq('id', serviceId)
    .single()

  if (serviceData?.buffer_time) {
    bufferTime = serviceData.buffer_time
  }

  // Lundi de la semaine contenant cette date
  const monday = getMondayOf(new Date(date + 'T12:00:00Z'))
  const allBlocks = resolveWeekBlocks(monday, overrideMap, templateMap, activeTemplate)

  if (allBlocks.length === 0) return []

  // ── 3. Filtrer les blocs du jour concerné ─────────────────────
  const dayOfWeek = getParisDayOfWeek(date)
  const dayBlocks = allBlocks.filter(b => b.day_of_week === dayOfWeek)

  if (dayBlocks.length === 0) return []

  // ── 4. Réservations confirmées sur ce jour ────────────────────
  // On charge les bookings sur toute la journée Paris (UTC peut déborder de minuit)
  const { data: confirmedRows } = await supabase
    .from('bookings')
    .select('starts_at, ends_at, duration, service_id')
    .eq('status', 'confirmed')
    .gte('starts_at', `${date}T00:00:00Z`)
    .lt('starts_at', addDays(date, 1) + 'T00:00:00Z')

  // Pour chaque booking, on doit ajouter son buffer_time
  const bookingsWithBuffer = await Promise.all(
    (confirmedRows ?? []).map(async (b) => {
      const { data: bookingService } = await supabase
        .from('services')
        .select('buffer_time')
        .eq('id', b.service_id)
        .single()

      const bookingBuffer = bookingService?.buffer_time || 0
      const bStart = new Date(b.starts_at).getTime()
      const bEnd = new Date(b.ends_at).getTime()
      const bEndWithBuffer = bEnd + (bookingBuffer * 60_000)

      return { starts_at: b.starts_at, ends_at: new Date(bEndWithBuffer).toISOString() }
    })
  )

  // ── 5. Génération des créneaux ────────────────────────────────
  const allSlots: Slot[] = []
  const durationMs = duration * 60_000
  const totalDurationWithBuffer = (duration + bufferTime) * 60_000

  for (const block of dayBlocks) {
    const blockStartMs = new Date(parisTimeToUTCIso(date, block.start_time)).getTime()
    const blockEndMs = new Date(parisTimeToUTCIso(date, block.end_time)).getTime()

    let cursor = blockStartMs
    while (cursor + durationMs <= blockEndMs) {
      const slotStartMs = cursor
      const slotEndMs = cursor + durationMs
      const slotEndWithBufferMs = cursor + totalDurationWithBuffer

      // Vérifie qu'aucune réservation (avec buffer) ne chevauche ce créneau (avec buffer)
      const overlaps = bookingsWithBuffer.some(b => {
        const bStart = new Date(b.starts_at).getTime()
        const bEnd = new Date(b.ends_at).getTime()
        // Chevauchement : [slotStart, slotEndWithBuffer[ ∩ [bStart, bEnd[ ≠ ∅
        return slotStartMs < bEnd && slotEndWithBufferMs > bStart
      })

      if (!overlaps) {
        allSlots.push({
          starts_at: new Date(slotStartMs).toISOString(),
          ends_at: new Date(slotEndMs).toISOString(), // Sans le buffer dans le retour
        })
      }

      // Avancer du temps total (durée + buffer) pour espacer les créneaux
      cursor += totalDurationWithBuffer
    }
  }

  // ── 6. Mettre en cache (sans filtre 24h) ──────────────────────
  if (!adminMode) {
    await setCachedSlots(
      cacheKey,
      date,
      allSlots.map(s => ({ starts_at: s.starts_at, ends_at: s.ends_at }))
    )
  }

  return applyAdvanceFilter(allSlots, adminMode)
}

// ─── Helpers ───────────────────────────────────────────────────

/** Filtre les créneaux dans les 24h à venir (mode public uniquement) */
function applyAdvanceFilter(slots: Slot[], adminMode: boolean): Slot[] {
  if (adminMode) return slots
  const cutoff = Date.now() + 24 * 60 * 60 * 1000
  return slots.filter(s => new Date(s.starts_at).getTime() >= cutoff)
}

/** Ajoute N jours à une date YYYY-MM-DD */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]!
}
