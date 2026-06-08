import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

/** Client public (anon key, no cookies needed — public reads only) */
function createPublicClient() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
  )
}
import type {
  ServiceRow,
  ServiceVariantRow,
  ScheduleConfigRow,
  ScheduleTemplateRow,
  ScheduleHourRow,
  ScheduleTemplateWithHours,
  ExtraRow,
  PlanningOverrideRow,
  ServiceExtraRow,
  PromoCodeRow,
} from '@/lib/supabase/types'
import { randomUUID } from 'crypto'
import type { Service } from '@/lib/services-data'

// ============================================
// PUBLIC DATA (read-only, anon key)
// ============================================

/** Fetch all active services with their variants */
export async function getServices(): Promise<Service[]> {
  const supabase = createPublicClient()

  const { data: services, error } = await supabase
    .from('services')
    .select('*, service_variants(*)')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return (services as (ServiceRow & { service_variants: ServiceVariantRow[] })[]).map(
    (s) => mapServiceRowToService(s)
  )
}

/** Fetch active schedule template with hours */
export async function getActiveSchedule(): Promise<{
  template: ScheduleTemplateRow
  hours: ScheduleHourRow[]
} | null> {
  const supabase = createPublicClient()

  // Get active template ID
  const { data: config, error: configError } = await supabase
    .from('schedule_config')
    .select('*')
    .eq('id', 1)
    .single()

  if (configError || !config) {
    console.error('Error fetching schedule config:', configError)
    return null
  }

  // Get template with hours
  const { data: template, error: templateError } = await supabase
    .from('schedule_templates')
    .select('*, schedule_hours(*)')
    .eq('id', (config as ScheduleConfigRow).active_template)
    .single()

  if (templateError || !template) {
    console.error('Error fetching schedule template:', templateError)
    return null
  }

  const t = template as ScheduleTemplateWithHours
  return {
    template: { id: t.id, label: t.label, sort_order: t.sort_order },
    hours: t.schedule_hours.sort((a, b) => a.sort_order - b.sort_order),
  }
}

/** Fetch active extras (public) */
export async function getExtras(): Promise<ExtraRow[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('extras')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) { console.error('Error fetching extras:', error); return [] }
  return (data ?? []) as ExtraRow[]
}

// ============================================
// ADMIN DATA (service_role key, bypasses RLS)
// ============================================

/** Fetch all services (including inactive) for admin */
export async function getServicesAdmin(): Promise<
  (ServiceRow & { service_variants: ServiceVariantRow[] })[]
> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('services')
    .select('*, service_variants(*)')
    .order('sort_order')

  if (error) {
    console.error('Error fetching admin services:', error)
    return []
  }

  return data ?? []
}

/** Update a service */
export async function updateService(
  id: string,
  updates: Partial<Omit<ServiceRow, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating service:', error)
    return false
  }
  return true
}

/** Create a service */
export async function createService(
  service: Omit<ServiceRow, 'created_at' | 'updated_at' | 'service_variants'>
): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('services').insert(service)
  if (error) {
    console.error('Error creating service:', error)
    return false
  }
  return true
}

/** Delete a service */
export async function deleteService(id: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) {
    console.error('Error deleting service:', error)
    return false
  }
  return true
}

/** Create/update/delete variants for a service */
export async function upsertVariants(
  serviceId: string,
  variants: Omit<ServiceVariantRow, 'created_at'>[]
): Promise<boolean> {
  const supabase = createAdminClient()

  // Delete existing variants
  await supabase.from('service_variants').delete().eq('service_id', serviceId)

  if (variants.length === 0) return true

  // Insert new variants
  const { error } = await supabase.from('service_variants').insert(variants)
  if (error) {
    console.error('Error upserting variants:', error)
    return false
  }
  return true
}

/** Fetch all extras (including inactive) for admin */
export async function getExtrasAdmin(): Promise<ExtraRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('extras')
    .select('*')
    .order('sort_order')
  if (error) { console.error('Error fetching extras admin:', error); return [] }
  return (data ?? []) as ExtraRow[]
}

/** Create an extra */
export async function createExtra(
  extra: Omit<ExtraRow, 'id' | 'created_at' | 'updated_at'>
): Promise<ExtraRow | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('extras').insert(extra).select().single()
  if (error) { console.error('Error creating extra:', error); return null }
  return data as ExtraRow
}

/** Update an extra */
export async function updateExtra(
  id: string,
  updates: Partial<Omit<ExtraRow, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('extras').update(updates).eq('id', id)
  if (error) { console.error('Error updating extra:', error); return false }
  return true
}

/** Delete an extra */
export async function deleteExtra(id: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('extras').delete().eq('id', id)
  if (error) { console.error('Error deleting extra:', error); return false }
  return true
}

// ============================================
// PROMO CODES (admin — service_role)
// ============================================

/** Liste tous les codes promo (admin) */
export async function getPromoCodesAdmin(): Promise<PromoCodeRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('Error fetching promo codes:', error); return [] }
  return (data ?? []) as PromoCodeRow[]
}

/** Crée un code promo. Renvoie la ligne créée ou null (ex: code déjà pris). */
export async function createPromoCode(
  input: Omit<PromoCodeRow, 'id' | 'used_count' | 'created_at' | 'updated_at'>
): Promise<PromoCodeRow | null> {
  const supabase = createAdminClient()
  const row = {
    id: randomUUID(),
    code: input.code.trim().toUpperCase(),
    discount_type: input.discount_type,
    discount_value: input.discount_value,
    min_amount: input.min_amount,
    max_uses: input.max_uses,
    expires_at: input.expires_at,
    is_active: input.is_active,
    used_count: 0,
  }
  const { data, error } = await supabase
    .from('promo_codes')
    .insert(row)
    .select()
    .single()
  if (error) { console.error('Error creating promo code:', error.message); return null }
  return data as PromoCodeRow
}

/** Met à jour un code promo */
export async function updatePromoCode(
  id: string,
  updates: Partial<Omit<PromoCodeRow, 'id' | 'used_count' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  const supabase = createAdminClient()
  const clean: Record<string, unknown> = {}
  if (updates.code != null) clean['code'] = String(updates.code).trim().toUpperCase()
  if (updates.discount_type != null) clean['discount_type'] = updates.discount_type
  if (updates.discount_value != null) clean['discount_value'] = Number(updates.discount_value)
  if (updates.min_amount != null) clean['min_amount'] = Number(updates.min_amount)
  if (updates.max_uses !== undefined) clean['max_uses'] = updates.max_uses
  if (updates.expires_at !== undefined) clean['expires_at'] = updates.expires_at
  if (updates.is_active != null) clean['is_active'] = Boolean(updates.is_active)
  const { error } = await supabase.from('promo_codes').update(clean).eq('id', id)
  if (error) { console.error('Error updating promo code:', error.message); return false }
  return true
}

/** Supprime un code promo */
export async function deletePromoCode(id: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('promo_codes').delete().eq('id', id)
  if (error) { console.error('Error deleting promo code:', error); return false }
  return true
}

/** Get all schedule templates with hours */
export async function getAllScheduleTemplates(): Promise<ScheduleTemplateWithHours[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('schedule_templates')
    .select('*, schedule_hours(*)')
    .order('sort_order')

  if (error) {
    console.error('Error fetching templates:', error)
    return []
  }

  return (data ?? []).map((t: ScheduleTemplateWithHours) => ({
    ...t,
    schedule_hours: t.schedule_hours.sort((a, b) => a.sort_order - b.sort_order),
  }))
}

/** Get active template ID */
export async function getActiveTemplateId(): Promise<string> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('schedule_config')
    .select('active_template')
    .eq('id', 1)
    .single()

  if (error || !data) return 'semaine-impaire'
  return (data as ScheduleConfigRow).active_template
}

/** Set active schedule template */
export async function setActiveTemplate(templateId: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('schedule_config')
    .update({ active_template: templateId })
    .eq('id', 1)

  if (error) {
    console.error('Error setting active template:', error)
    return false
  }
  return true
}

// ============================================
// SCHEDULE PARSING FOR HAPIO
// ============================================

// Mapping jours français → numéro (0=dim, 1=lun, ..., 6=sam)
const DAY_MAPPING: Record<string, number> = {
  'Dimanche': 0,
  'Lundi': 1,
  'Mardi': 2,
  'Mercredi': 3,
  'Jeudi': 4,
  'Vendredi': 5,
  'Samedi': 6,
}

/**
 * Parse des lignes d'horaires (format "09h-12h / 13h-19h" ou "Fermé")
 * en blocs Hapio {day_of_week, start_time, end_time}.
 * Supports jours uniques ("Lundi") et plages ("Lundi - Vendredi").
 */
export function parseHoursToHapioBlocks(
  hours: Array<{ day_label: string; hours: string; sort_order?: number }>
): Array<{ day_of_week: number; start_time: string; end_time: string }> {
  const blocks: Array<{ day_of_week: number; start_time: string; end_time: string }> = []

  for (const hour of hours) {
    // Insensible aux variations d'encodage : "Fermé", "FermÃ©", etc.
    if (!hour.hours || /^ferm/i.test(hour.hours.trim())) continue

    const daysToProcess: number[] = []

    if (hour.day_label.includes(' - ')) {
      const parts = hour.day_label.split(' - ').map(d => d.trim())
      const startDay = parts[0]
      const endDay = parts[1]
      if (startDay && endDay) {
        const startNum = DAY_MAPPING[startDay]
        const endNum = DAY_MAPPING[endDay]
        if (startNum !== undefined && endNum !== undefined) {
          for (let i = startNum; i <= endNum; i++) daysToProcess.push(i)
        }
      }
    } else {
      const dayNum = DAY_MAPPING[hour.day_label]
      if (dayNum !== undefined) daysToProcess.push(dayNum)
    }

    // Parse "09h-12h / 13h-19h" → plusieurs segments
    const segments = hour.hours.split('/')
    for (const segment of segments) {
      const match = segment.trim().match(/(\d{1,2})h(\d{2})?[\s-]+(\d{1,2})h(\d{2})?/)
      if (!match) continue
      const startH = match[1]!.padStart(2, '0')
      const startM = (match[2] ?? '00').padStart(2, '0')
      const endH = match[3]!.padStart(2, '0')
      const endM = (match[4] ?? '00').padStart(2, '0')
      for (const dayNum of daysToProcess) {
        blocks.push({ day_of_week: dayNum, start_time: `${startH}:${startM}`, end_time: `${endH}:${endM}` })
      }
    }
  }

  return blocks
}

/**
 * Parse les horaires du template actif pour Hapio
 * @deprecated Utiliser parseHoursToHapioBlocks + getAllScheduleTemplates directement
 */
export async function getActiveScheduleForHapio(): Promise<
  Array<{ day_of_week: number; start_time: string; end_time: string }>
> {
  const schedule = await getActiveSchedule()
  if (!schedule) return []
  return parseHoursToHapioBlocks(schedule.hours)
}

// ============================================
// PLANNING OVERRIDES (admin — calendrier)
// ============================================

/** Récupère tous les overrides à partir d'aujourd'hui (+ passés récents) */
export async function getPlanningOverrides(
  from?: string  // YYYY-MM-DD, défaut = lundi de la semaine courante - 1 semaine
): Promise<PlanningOverrideRow[]> {
  const supabase = createAdminClient()
  const startFrom = from ?? getMondayOf(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('planning_overrides')
    .select('*')
    .gte('week_start', startFrom)
    .order('week_start')

  if (error) { console.error('Error fetching planning overrides:', error); return [] }
  return (data ?? []) as PlanningOverrideRow[]
}

/** Crée ou met à jour un override pour une semaine donnée */
export async function upsertPlanningOverride(
  override: Omit<PlanningOverrideRow, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('planning_overrides')
    .upsert({ ...override, updated_at: new Date().toISOString() }, { onConflict: 'week_start' })
  if (error) { console.error('Error upserting planning override:', error); return false }
  return true
}

/** Supprime un override (la semaine reviendra au template actif) */
export async function deletePlanningOverride(weekStart: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('planning_overrides')
    .delete()
    .eq('week_start', weekStart)
  if (error) { console.error('Error deleting planning override:', error); return false }
  return true
}

// ============================================
// HELPERS CALENDRIER
// ============================================

/** Helper : formater une Date en YYYY-MM-DD UTC */
function utcYMD(d: Date): string {
  return d.toISOString().split('T')[0]!
}

/** Retourne le lundi d'une semaine donnée (YYYY-MM-DD) — méthodes UTC pour éviter les décalages timezone */
export function getMondayOf(date: Date | number): string {
  const d = new Date(date)
  const day = d.getUTCDay() // 0=dim en UTC
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  return utcYMD(d)
}

/** Retourne le dimanche d'une semaine donnée à partir du lundi (YYYY-MM-DD) */
export function getSundayOf(mondayStr: string): string {
  const d = new Date(mondayStr + 'T00:00:00Z') // forcer UTC
  d.setUTCDate(d.getUTCDate() + 6)
  return utcYMD(d)
}

/** Génère la liste des lundis pour les N prochaines semaines */
export function getNextWeekMondays(weeksAhead: number, fromDate?: Date): string[] {
  const mondays: string[] = []
  const startMonday = getMondayOf(fromDate ?? new Date())
  const d = new Date(startMonday + 'T00:00:00Z') // forcer UTC
  for (let i = 0; i < weeksAhead; i++) {
    mondays.push(utcYMD(d))
    d.setUTCDate(d.getUTCDate() + 7)
  }
  return mondays
}

// ============================================
// SCHEDULE TEMPLATE CRUD (admin)
// ============================================

/** Remplace les heures d'un template (supprime tout et réinsère) */
export async function updateScheduleHours(
  templateId: string,
  hours: Array<{ day_label: string; hours: string; sort_order: number }>
): Promise<boolean> {
  const supabase = createAdminClient()

  // Supprimer toutes les lignes existantes pour ce template
  const { error: deleteError } = await supabase
    .from('schedule_hours')
    .delete()
    .eq('template_id', templateId)

  if (deleteError) {
    console.error('Error deleting schedule hours:', deleteError)
    return false
  }

  if (hours.length === 0) return true

  // Insérer les nouvelles lignes
  const rows = hours.map((h) => ({ ...h, template_id: templateId }))
  const { error: insertError } = await supabase.from('schedule_hours').insert(rows)

  if (insertError) {
    console.error('Error inserting schedule hours:', insertError)
    return false
  }

  return true
}

/** Renomme un template */
export async function updateScheduleTemplateMeta(
  id: string,
  label: string
): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('schedule_templates')
    .update({ label })
    .eq('id', id)
  if (error) { console.error('Error updating template meta:', error); return false }
  return true
}

/** Crée un nouveau template avec ses heures */
export async function createScheduleTemplate(
  id: string,
  label: string,
  sortOrder: number,
  hours: Array<{ day_label: string; hours: string; sort_order: number }>
): Promise<boolean> {
  const supabase = createAdminClient()

  // Insérer le template
  const { error: tplError } = await supabase
    .from('schedule_templates')
    .insert({ id, label, sort_order: sortOrder })

  if (tplError) {
    console.error('Error creating schedule template:', tplError)
    return false
  }

  if (hours.length === 0) return true

  // Insérer les heures
  const rows = hours.map((h) => ({ ...h, template_id: id }))
  const { error: hoursError } = await supabase.from('schedule_hours').insert(rows)

  if (hoursError) {
    console.error('Error inserting hours for new template:', hoursError)
    return false
  }

  return true
}

/** Supprime un template et ses heures */
export async function deleteScheduleTemplate(id: string): Promise<boolean> {
  const supabase = createAdminClient()

  // Supprimer les heures d'abord
  await supabase.from('schedule_hours').delete().eq('template_id', id)

  // Supprimer le template
  const { error } = await supabase.from('schedule_templates').delete().eq('id', id)
  if (error) { console.error('Error deleting schedule template:', error); return false }
  return true
}

// ============================================
// SERVICE EXTRAS (prestation ↔ extras)
// ============================================

/** Retourne les IDs des extras liés à une prestation (public) */
export async function getExtraIdsForService(serviceId: string): Promise<string[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('service_extras')
    .select('extra_id')
    .eq('service_id', serviceId)
    .order('sort_order')
  if (error) { console.error('Error fetching service extras:', error); return [] }
  return (data ?? []).map((r: { extra_id: string }) => r.extra_id)
}

/** Retourne les extras actifs liés à une prestation (public) */
export async function getExtrasForService(serviceId: string): Promise<ExtraRow[]> {
  const supabase = createPublicClient()
  // Join via sous-requête : récupère extras dont l'id est dans service_extras pour ce service
  const extraIds = await getExtraIdsForService(serviceId)
  if (extraIds.length === 0) return []
  const { data, error } = await supabase
    .from('extras')
    .select('*')
    .in('id', extraIds)
    .eq('is_active', true)
  if (error) { console.error('Error fetching extras for service:', error); return [] }
  // Respecter l'ordre défini dans service_extras
  return (data ?? []).sort(
    (a: ExtraRow, b: ExtraRow) => extraIds.indexOf(a.id) - extraIds.indexOf(b.id)
  ) as ExtraRow[]
}

/** Admin : récupère les liaisons extras pour une prestation */
export async function getServiceExtrasAdmin(serviceId: string): Promise<ServiceExtraRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('service_extras')
    .select('*')
    .eq('service_id', serviceId)
    .order('sort_order')
  if (error) { console.error('Error fetching service extras admin:', error); return [] }
  return (data ?? []) as ServiceExtraRow[]
}

/** Admin : définit les extras d'une prestation (remplace tout) */
export async function setServiceExtras(
  serviceId: string,
  extraIds: string[]
): Promise<boolean> {
  const supabase = createAdminClient()
  // Supprimer les liaisons existantes
  const { error: delError } = await supabase
    .from('service_extras')
    .delete()
    .eq('service_id', serviceId)
  if (delError) { console.error('Error deleting service extras:', delError); return false }
  if (extraIds.length === 0) return true
  // Insérer les nouvelles liaisons
  const rows = extraIds.map((extra_id, i) => ({ service_id: serviceId, extra_id, sort_order: i }))
  const { error: insError } = await supabase.from('service_extras').insert(rows)
  if (insError) { console.error('Error inserting service extras:', insError); return false }
  return true
}

// ============================================
// SLOTS CACHE (économie API Hapio)
// TTL : 30 min — invalider à chaque booking créé/annulé
// ============================================

const CACHE_TTL_MINUTES = 30

export interface CachedSlot {
  starts_at: string
  ends_at: string
  resources?: { id: string; name: string }[]
}

/** Lit le cache des créneaux pour un service + une date */
export async function getCachedSlots(
  serviceId: string,
  date: string
): Promise<CachedSlot[] | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('slots_cache')
      .select('slots, cached_at')
      .eq('service_id', serviceId)
      .eq('date', date)
      .single()
    if (error || !data) return null
    // Vérifier TTL
    const age = Date.now() - new Date((data as { cached_at: string }).cached_at).getTime()
    if (age > CACHE_TTL_MINUTES * 60 * 1000) return null // expiré
    return (data as { slots: CachedSlot[] }).slots
  } catch {
    return null
  }
}

/** Stocke les créneaux en cache pour un service + une date */
export async function setCachedSlots(
  serviceId: string,
  date: string,
  slots: CachedSlot[]
): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase
      .from('slots_cache')
      .upsert(
        { service_id: serviceId, date, slots: slots as unknown[], cached_at: new Date().toISOString() },
        { onConflict: 'service_id,date' }
      )
  } catch (e) {
    console.error('Error setting slots cache:', e)
  }
}

/** Invalide le cache pour un service + une date (appelé après booking créé/annulé) */
export async function invalidateSlotsCache(
  serviceId: string,
  date: string
): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase
      .from('slots_cache')
      .delete()
      .eq('service_id', serviceId)
      .eq('date', date)
  } catch (e) {
    console.error('Error invalidating slots cache:', e)
  }
}

/** Invalide tout le cache (après modification du planning) */
export async function invalidateAllSlotsCache(): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.from('slots_cache').delete().gte('id', '00000000-0000-0000-0000-000000000000')
  } catch (e) {
    console.error('Error invalidating all slots cache:', e)
  }
}

// ============================================
// HELPERS
// ============================================

function mapServiceRowToService(
  row: ServiceRow & { service_variants: ServiceVariantRow[] }
): Service {
  const base: Service = {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    hasVariants: row.has_variants,
  }

  if (row.has_variants && row.service_variants) {
    base.variants = row.service_variants
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({
        id: v.id,
        name: v.name,
        hairLength: v.hair_length,
        hairLengthLabel: v.hair_length_label,
        duration: v.duration,
        price: Number(v.price),
        ...(v.description != null ? { description: v.description } : {}),
      }))
  } else {
    if (row.duration != null) base.duration = row.duration
    if (row.price != null) base.price = Number(row.price)
    if (row.hair_length != null) base.hairLength = row.hair_length
  }

  return base
}
