// ============================================
// Synchronisation planning Supabase → Hapio
// ============================================
// Stratégie OPTIMISÉE pour économiser les tokens API :
//   1. Calculer les blocs semaine par semaine (override ou template actif)
//   2. FUSIONNER les semaines consécutives avec les mêmes horaires
//      → au lieu de 18 schedules, on en crée ~3-5
//   3. Supprimer les anciens + créer les nouveaux
//
// Exemple : 18 semaines avec 1 semaine de vacances au milieu
//   → 3 schedules : sem.1-7 (normal), sem.8 (fermé=rien), sem.9-18 (normal)
//   → ~30 appels API au lieu de ~200

import {
  getLocations,
  getResources,
  getRecurringSchedules,
  deleteRecurringSchedule,
  createRecurringSchedule,
  createScheduleBlock,
} from '@/lib/hapio'
import {
  getAllScheduleTemplates,
  getActiveTemplateId,
  getPlanningOverrides,
  parseHoursToHapioBlocks,
  getNextWeekMondays,
  getSundayOf,
} from '@/lib/data'
import type { ScheduleTemplateWithHours, PlanningOverrideRow } from '@/lib/supabase/types'

const WEEKS_AHEAD = 18

// ─── Types internes ──────────────────────────────────────────

type HapioBlock = { day_of_week: number; start_time: string; end_time: string }

interface MergedRange {
  startMonday: string
  endSunday: string
  blocks: HapioBlock[]
  weekCount: number
  _sig: string  // signature des blocs pour fusion
}

// ─── Fonction principale ─────────────────────────────────────

export async function syncPlanningToHapio(weeksAhead = WEEKS_AHEAD): Promise<{
  deleted: number
  created: number
  schedules: number
  apiCalls: number
}> {
  let apiCalls = 0

  console.log(`[sync-planning] Démarrage sync optimisée (${weeksAhead} semaines)`)

  // 1. Récupérer la location et la ressource Hapio (2 appels)
  const locations = await getLocations(); apiCalls++
  const location = locations[0]
  if (!location) throw new Error('Aucune location configurée dans Hapio')

  const resources = await getResources(location.id); apiCalls++
  const resource = resources[0]
  if (!resource) throw new Error('Aucune ressource configurée dans Hapio')

  // 2. Charger les données Supabase (0 appels Hapio — c'est Supabase)
  const [templates, activeTemplateId, overrides] = await Promise.all([
    getAllScheduleTemplates(),
    getActiveTemplateId(),
    getPlanningOverrides(),
  ])

  const templateMap = new Map<string, ScheduleTemplateWithHours>(
    templates.map(t => [t.id, t])
  )
  const activeTemplate = templateMap.get(activeTemplateId)
  if (!activeTemplate) {
    console.warn(`[sync-planning] Template actif "${activeTemplateId}" introuvable`)
  }
  const overrideMap = new Map<string, PlanningOverrideRow>(
    overrides.map(o => [o.week_start, o])
  )

  // 3. Calculer les blocs pour chaque semaine + fusionner les semaines identiques
  const mergedRanges = buildMergedRanges(weeksAhead, overrideMap, templateMap, activeTemplate)
  console.log(`[sync-planning] ${weeksAhead} semaines → ${mergedRanges.length} plages fusionnées`)

  // 4. Supprimer les recurring schedules existants (1 GET + N DELETEs)
  const existingRS = await getRecurringSchedules(resource.id); apiCalls++
  let deleted = 0
  for (const rs of existingRS) {
    try {
      await deleteRecurringSchedule(resource.id, rs.id); apiCalls++
      deleted++
    } catch (err) {
      console.warn(`[sync-planning] Impossible de supprimer RS ${rs.id}:`, err)
    }
  }
  console.log(`[sync-planning] ${deleted} anciens schedules supprimés (${apiCalls} appels)`)

  // 5. Créer les nouvelles plages fusionnées
  let createdBlocks = 0

  for (const range of mergedRanges) {
    try {
      const rs = await createRecurringSchedule(resource.id, {
        location_id: location.id,
        start_date: range.startMonday,
        end_date: range.endSunday,
      }); apiCalls++

      for (const block of range.blocks) {
        try {
          await createScheduleBlock(resource.id, rs.id, {
            weekday: block.day_of_week,
            start_time: block.start_time,
            end_time: block.end_time,
          }); apiCalls++
          createdBlocks++
        } catch (err) {
          console.error(`[sync-planning] Bloc ${block.day_of_week} ${block.start_time}:`, err)
        }
      }

      console.log(`[sync-planning] Plage ${range.startMonday}→${range.endSunday} (${range.weekCount} sem.) → ${range.blocks.length} blocs`)
    } catch (err) {
      console.error(`[sync-planning] Impossible de créer RS pour ${range.startMonday}→${range.endSunday}:`, err)
    }
  }

  console.log(`[sync-planning] Terminé — ${mergedRanges.length} schedules, ${createdBlocks} blocs, ${apiCalls} appels API total`)
  return { deleted, created: createdBlocks, schedules: mergedRanges.length, apiCalls }
}

// ─── Fusion des semaines identiques ──────────────────────────

function buildMergedRanges(
  weeksAhead: number,
  overrideMap: Map<string, PlanningOverrideRow>,
  templateMap: Map<string, ScheduleTemplateWithHours>,
  activeTemplate: ScheduleTemplateWithHours | undefined
): MergedRange[] {
  const mondays = getNextWeekMondays(weeksAhead)
  const ranges: MergedRange[] = []
  let current: MergedRange | null = null

  for (const monday of mondays) {
    const blocks = resolveWeekBlocks(monday, overrideMap, templateMap, activeTemplate)

    // Semaine fermée (pas de blocs) → couper la plage en cours
    if (blocks.length === 0) {
      if (current) { ranges.push(current); current = null }
      continue
    }

    // Sérialiser les blocs pour comparaison rapide
    const signature = blocksSignature(blocks)

    if (current && current._sig === signature) {
      // Mêmes horaires → étendre la plage existante
      current.endSunday = getSundayOf(monday)
      current.weekCount++
    } else {
      // Horaires différents → nouvelle plage
      if (current) ranges.push(current)
      current = {
        startMonday: monday,
        endSunday: getSundayOf(monday),
        blocks,
        weekCount: 1,
        _sig: signature,
      }
    }
  }

  if (current) ranges.push(current)
  return ranges
}

/** Signature d'un ensemble de blocs (pour détecter les semaines identiques) */
function blocksSignature(blocks: HapioBlock[]): string {
  return blocks
    .slice()
    .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
    .map(b => `${b.day_of_week}:${b.start_time}-${b.end_time}`)
    .join('|')
}

// ─── Résoudre les blocs d'une semaine ────────────────────────

function resolveWeekBlocks(
  monday: string,
  overrideMap: Map<string, PlanningOverrideRow>,
  templateMap: Map<string, ScheduleTemplateWithHours>,
  activeTemplate: ScheduleTemplateWithHours | undefined
): HapioBlock[] {
  const override = overrideMap.get(monday)

  if (override) {
    if (override.type === 'closed') return []
    if (override.type === 'template' && override.template_id) {
      const tpl = templateMap.get(override.template_id)
      if (tpl) return parseHoursToHapioBlocks(tpl.schedule_hours)
      console.warn(`[sync-planning] Template "${override.template_id}" introuvable pour sem. ${monday}`)
    }
    if (override.type === 'custom' && override.custom_hours) {
      return parseHoursToHapioBlocks(override.custom_hours)
    }
  }

  if (!activeTemplate) return []
  return parseHoursToHapioBlocks(activeTemplate.schedule_hours)
}

// ─── Compatibilité ascendante ────────────────────────────────

/** @deprecated Utiliser syncPlanningToHapio() */
export async function syncActiveScheduleToHapio(): Promise<{
  deleted: number
  created: number
}> {
  const result = await syncPlanningToHapio()
  return { deleted: result.deleted, created: result.created }
}
