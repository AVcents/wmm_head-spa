import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import type {
  ServiceRow,
  ServiceVariantRow,
  ScheduleConfigRow,
  ScheduleTemplateRow,
  ScheduleHourRow,
  ScheduleTemplateWithHours,
} from '@/lib/supabase/types'
import type { Service } from '@/lib/services-data'

// ============================================
// PUBLIC DATA (read-only, anon key)
// ============================================

/** Fetch all active services with their variants */
export async function getServices(): Promise<Service[]> {
  const supabase = await createServerSupabaseClient()

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
  const supabase = await createServerSupabaseClient()

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

/**
 * Parse les horaires du template actif pour Hapio
 * Format attendu : "09h-12h / 13h-19h" ou "Fermé"
 * Retourne un tableau de { day_of_week, start_time, end_time }
 */
export async function getActiveScheduleForHapio(): Promise<
  Array<{ day_of_week: number; start_time: string; end_time: string }>
> {
  const schedule = await getActiveSchedule()
  if (!schedule) return []

  const blocks: Array<{ day_of_week: number; start_time: string; end_time: string }> = []

  // Mapping jours français → numéro (0=dim, 1=lun, ..., 6=sam)
  const dayMapping: Record<string, number> = {
    'Dimanche': 0,
    'Lundi': 1,
    'Mardi': 2,
    'Mercredi': 3,
    'Jeudi': 4,
    'Vendredi': 5,
    'Samedi': 6,
  }

  for (const hour of schedule.hours) {
    if (hour.hours === 'Fermé' || !hour.hours) continue

    // Handle day ranges like "Lundi - Vendredi" or single days like "Lundi"
    const daysToProcess: number[] = []

    if (hour.day_label.includes(' - ')) {
      // It's a range like "Lundi - Vendredi"
      const parts = hour.day_label.split(' - ').map(d => d.trim())
      const startDay = parts[0]
      const endDay = parts[1]

      if (startDay && endDay) {
        const startNum = dayMapping[startDay]
        const endNum = dayMapping[endDay]

        if (startNum !== undefined && endNum !== undefined) {
          // Add all days in range (inclusive)
          for (let i = startNum; i <= endNum; i++) {
            daysToProcess.push(i)
          }
        }
      }
    } else {
      // Single day like "Lundi"
      const dayNum = dayMapping[hour.day_label]
      if (dayNum !== undefined) {
        daysToProcess.push(dayNum)
      }
    }

    // Parse "09h-12h / 13h-19h" → plusieurs blocks
    const segments = hour.hours.split('/')
    for (const segment of segments) {
      const match = segment.trim().match(/(\d{1,2})h(\d{2})?[\s-]+(\d{1,2})h(\d{2})?/)
      if (!match) continue

      const startH = match[1]!.padStart(2, '0')
      const startM = (match[2] ?? '00').padStart(2, '0')
      const endH = match[3]!.padStart(2, '0')
      const endM = (match[4] ?? '00').padStart(2, '0')

      // Create a block for each day in the range
      for (const dayNum of daysToProcess) {
        blocks.push({
          day_of_week: dayNum,
          start_time: `${startH}:${startM}`,
          end_time: `${endH}:${endM}`,
        })
      }
    }
  }

  return blocks
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
