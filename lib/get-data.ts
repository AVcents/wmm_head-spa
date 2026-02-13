/**
 * Public data fetching functions.
 * Tries Supabase first, falls back to static data if not configured.
 */
import type { Service } from '@/lib/services-data'
import {
  services as staticServices,
  categories,
  durationFilters,
  priceFilters,
} from '@/lib/services-data'

export { categories, durationFilters, priceFilters }

/** Fetch services — Supabase if available, static data as fallback */
export async function fetchServices(): Promise<Service[]> {
  // Check if Supabase is configured
  if (
    !process.env['NEXT_PUBLIC_SUPABASE_URL'] ||
    !process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
  ) {
    return staticServices
  }

  try {
    const { getServices } = await import('@/lib/data')
    const services = await getServices()
    return services.length > 0 ? services : staticServices
  } catch (error) {
    console.error('Supabase fetch failed, using static data:', error)
    return staticServices
  }
}

/** Fetch active schedule — Supabase if available, default fallback */
export async function fetchSchedule(): Promise<{
  label: string
  hours: { day: string; hours: string }[]
}> {
  const defaultSchedule = {
    label: 'Semaine impaire',
    hours: [
      { day: 'Lundi - Vendredi', hours: '9h00 - 12h00 / 13h00 - 19h00' },
      { day: 'Samedi', hours: 'Fermé' },
      { day: 'Dimanche', hours: 'Fermé' },
    ],
  }

  if (
    !process.env['NEXT_PUBLIC_SUPABASE_URL'] ||
    !process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
  ) {
    return defaultSchedule
  }

  try {
    const { getActiveSchedule } = await import('@/lib/data')
    const schedule = await getActiveSchedule()
    if (!schedule) return defaultSchedule

    return {
      label: schedule.template.label,
      hours: schedule.hours.map((h) => ({
        day: h.day_label,
        hours: h.hours,
      })),
    }
  } catch (error) {
    console.error('Schedule fetch failed, using default:', error)
    return defaultSchedule
  }
}
