// ============================================
// Hapio API Client — Kalm Headspa
// ============================================

const HAPIO_BASE_URL = 'https://eu-central-1.hapio.net/v1'

function getApiKey(): string {
  const key = process.env['HAPIO_API_KEY']
  if (!key) throw new Error('HAPIO_API_KEY manquante dans .env.local')
  return key
}

async function hapioFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${HAPIO_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error')
    throw new Error(`Hapio API error ${res.status}: ${errorText}`)
  }

  // Handle 204 No Content (DELETE responses)
  if (res.status === 204) {
    return undefined as T
  }

  const json = await res.json()
  console.log(`[Hapio] ${options?.method ?? 'GET'} ${endpoint} →`, JSON.stringify(json).slice(0, 500))
  return json
}

/** Extract .data from Hapio single-item response, with fallback */
function extractData<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data
  }
  // Some endpoints return the object directly
  return response as T
}

// ============================================
// Types
// ============================================

export interface HapioLocation {
  id: string
  name: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  timezone?: string
}

export interface HapioService {
  id: string
  name: string
  description?: string
  duration?: number
  price?: number
  currency?: string
  location_id?: string
}

export interface HapioResource {
  id: string
  name: string
  description?: string
}

export interface HapioBookableSlot {
  starts_at: string
  ends_at: string
  buffer_starts_at?: string
  buffer_ends_at?: string
  resources?: { id: string; name: string }[]
}

export interface HapioBooking {
  id: string
  service_id: string
  resource_id?: string
  location_id: string
  starts_at: string
  ends_at: string
  status: string
  metadata?: Record<string, string>
  created_at?: string
  finalized_at?: string
  canceled_at?: string | null
}

/** A recurring schedule container attached to a resource */
export interface HapioRecurringSchedule {
  id: string
  resource_id?: string
}

/** A schedule block inside a recurring schedule (one day/time slot) */
export interface HapioScheduleBlock {
  id: string
  recurring_schedule_id?: string
  weekday: string | number  // Hapio retourne le nom du jour (ex: "monday")
  start_time: string
  end_time: string
}

/** Link between a resource and a service */
export interface HapioResourceService {
  id: string
  resource_id: string
  service_id: string
}

export interface HapioPaginatedResponse<T> {
  data: T[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// ============================================
// Locations
// ============================================

export async function getLocations(): Promise<HapioLocation[]> {
  const res = await hapioFetch<HapioPaginatedResponse<HapioLocation>>('/locations')
  return res.data
}

export async function createLocation(data: {
  name: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  time_zone?: string
  resource_selection_strategy?: string
}): Promise<HapioLocation> {
  const res = await hapioFetch<unknown>('/locations', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      time_zone: data.time_zone ?? 'Europe/Paris',
      resource_selection_strategy: data.resource_selection_strategy ?? 'equalize',
    }),
  })
  return extractData<HapioLocation>(res)
}

export async function deleteLocation(id: string): Promise<void> {
  await hapioFetch(`/locations/${id}`, { method: 'DELETE' })
}

// ============================================
// Services
// ============================================

export async function getHapioServices(locationId?: string): Promise<HapioService[]> {
  const query = locationId ? `?location_id=${locationId}` : ''
  const res = await hapioFetch<HapioPaginatedResponse<HapioService>>(`/services${query}`)
  return res.data
}

export async function createHapioService(data: {
  name: string
  description?: string
  duration: number // en minutes, sera converti en ISO 8601
  price?: number
  currency?: string
  location_id: string
  type?: string
}): Promise<HapioService> {
  // Hapio attend : type = "fixed" et duration en ISO 8601 (ex: "PT30M", "PT1H30M")
  const minutes = data.duration
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const isoDuration = hours > 0
    ? `PT${hours}H${mins > 0 ? `${mins}M` : ''}`
    : `PT${mins}M`

  const res = await hapioFetch<unknown>('/services', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      type: data.type ?? 'fixed',
      duration: isoDuration,
      bookable_interval: isoDuration, // IMPORTANT : intervalle = durée pour éviter chevauchements
    }),
  })
  return extractData<HapioService>(res)
}

export async function updateHapioService(
  serviceId: string,
  data: {
    bookable_interval?: string
  }
): Promise<HapioService> {
  const res = await hapioFetch<unknown>(`/services/${serviceId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return extractData<HapioService>(res)
}

export async function deleteHapioService(id: string): Promise<void> {
  await hapioFetch(`/services/${id}`, { method: 'DELETE' })
}

// ============================================
// Resources
// ============================================

export async function getResources(locationId?: string): Promise<HapioResource[]> {
  const query = locationId ? `?location_id=${locationId}` : ''
  const res = await hapioFetch<HapioPaginatedResponse<HapioResource>>(`/resources${query}`)
  return res.data
}

export async function createResource(data: {
  name: string
  description?: string
  location_id?: string
}): Promise<HapioResource> {
  const res = await hapioFetch<unknown>('/resources', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return extractData<HapioResource>(res)
}

export async function deleteResource(id: string): Promise<void> {
  await hapioFetch(`/resources/${id}`, { method: 'DELETE' })
}

export async function updateResource(
  resourceId: string,
  data: {
    max_simultaneous_bookings?: number | null
  }
): Promise<HapioResource> {
  const res = await hapioFetch<unknown>(`/resources/${resourceId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return extractData<HapioResource>(res)
}

// ============================================
// Resource-Service links
// ============================================

/** List services linked to a resource — returns array directly (not paginated) */
export async function getResourceServices(resourceId: string): Promise<HapioResourceService[]> {
  try {
    const res = await hapioFetch<HapioResourceService[]>(
      `/resources/${resourceId}/services`
    )
    return Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

/** Link a resource to a service — PUT /resources/{resource}/services/{service} (no body) */
export async function linkResourceToService(
  resourceId: string,
  serviceId: string
): Promise<HapioResourceService> {
  const res = await hapioFetch<unknown>(
    `/resources/${resourceId}/services/${serviceId}`,
    { method: 'PUT' }
  )
  return extractData<HapioResourceService>(res)
}

export async function unlinkResourceFromService(
  resourceId: string,
  serviceId: string
): Promise<void> {
  await hapioFetch(`/resources/${resourceId}/services/${serviceId}`, { method: 'DELETE' })
}

// ============================================
// Recurring Schedules
// ============================================

/** List recurring schedules for a resource */
export async function getRecurringSchedules(
  resourceId: string
): Promise<HapioRecurringSchedule[]> {
  const res = await hapioFetch<HapioPaginatedResponse<HapioRecurringSchedule>>(
    `/resources/${resourceId}/recurring-schedules`
  )
  return res.data
}

/** Create a recurring schedule container for a resource */
export async function createRecurringSchedule(
  resourceId: string,
  data: {
    location_id: string
    start_date: string   // YYYY-MM-DD
    end_date?: string    // YYYY-MM-DD, omit for open-ended
  }
): Promise<HapioRecurringSchedule> {
  const res = await hapioFetch<unknown>(`/resources/${resourceId}/recurring-schedules`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return extractData<HapioRecurringSchedule>(res)
}

/** Delete a recurring schedule (and all its blocks) */
export async function deleteRecurringSchedule(
  resourceId: string,
  recurringScheduleId: string
): Promise<void> {
  await hapioFetch(
    `/resources/${resourceId}/recurring-schedules/${recurringScheduleId}`,
    { method: 'DELETE' }
  )
}

// ============================================
// Schedule Blocks (nested under recurring schedules)
// ============================================

/** List schedule blocks for a recurring schedule */
export async function getScheduleBlocks(
  resourceId: string,
  recurringScheduleId: string
): Promise<HapioScheduleBlock[]> {
  const res = await hapioFetch<HapioPaginatedResponse<HapioScheduleBlock>>(
    `/resources/${resourceId}/recurring-schedules/${recurringScheduleId}/schedule-blocks`
  )
  return res.data
}

/** Normalise une heure au format H:i:s attendu par Hapio (ex: "09:00" → "09:00:00") */
function toHis(time: string): string {
  return time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time
}

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/** Convertit un numéro de jour (0=dim, 1=lun … 6=sam) en nom anglais lowercase */
function weekdayName(day: number): string {
  return WEEKDAY_NAMES[day] ?? String(day)
}

/** Add a schedule block (day + hours) to a recurring schedule */
export async function createScheduleBlock(
  resourceId: string,
  recurringScheduleId: string,
  data: { weekday: number; start_time: string; end_time: string }
): Promise<HapioScheduleBlock> {
  const res = await hapioFetch<unknown>(
    `/resources/${resourceId}/recurring-schedules/${recurringScheduleId}/schedule-blocks`,
    {
      method: 'POST',
      body: JSON.stringify({
        weekday: weekdayName(data.weekday),
        start_time: toHis(data.start_time),
        end_time: toHis(data.end_time),
      }),
    }
  )
  return extractData<HapioScheduleBlock>(res)
}

/** Delete a schedule block */
export async function deleteScheduleBlock(
  resourceId: string,
  recurringScheduleId: string,
  blockId: string
): Promise<void> {
  await hapioFetch(
    `/resources/${resourceId}/recurring-schedules/${recurringScheduleId}/schedule-blocks/${blockId}`,
    { method: 'DELETE' }
  )
}

// ============================================
// Bookable Slots
// ============================================

/** Convertit une date YYYY-MM-DD en ISO 8601 avec timezone Paris */
function toIso8601(date: string, endOfDay = false): string {
  // Si déjà au bon format (contient T et +), on renvoie tel quel
  if (date.includes('T') && (date.includes('+') || date.includes('Z'))) return date
  // Sinon, on ajoute l'heure et le timezone Europe/Paris
  const time = endOfDay ? 'T23:59:59' : 'T00:00:00'
  // Offset fixe +01:00 (Paris hiver) — suffisant pour Hapio
  return `${date.slice(0, 10)}${time}+01:00`
}

export async function getBookableSlots(params: {
  serviceId: string
  locationId: string
  from: string
  to: string
  resourceId?: string
}): Promise<HapioBookableSlot[]> {
  // Endpoint: GET /services/{serviceId}/bookable-slots
  // Hapio attend: location (pas location_id), from/to en ISO 8601 avec timezone
  const searchParams = new URLSearchParams({
    location: params.locationId,
    from: toIso8601(params.from),
    to: toIso8601(params.to, true),
  })
  if (params.resourceId) {
    searchParams.set('resource_id', params.resourceId)
  }

  const res = await hapioFetch<HapioPaginatedResponse<HapioBookableSlot>>(
    `/services/${params.serviceId}/bookable-slots?${searchParams.toString()}`
  )
  return res.data
}

// ============================================
// Bookings
// ============================================

export async function getBookings(params?: {
  locationId?: string
  from?: string
  to?: string
}): Promise<HapioBooking[]> {
  const searchParams = new URLSearchParams()
  if (params?.locationId) searchParams.set('location_id', params.locationId)
  // Hapio attend le format ISO 8601 avec timezone (Y-m-d\TH:i:sP)
  if (params?.from) searchParams.set('from', toIso8601(params.from))
  if (params?.to) searchParams.set('to', toIso8601(params.to, true))

  const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const res = await hapioFetch<HapioPaginatedResponse<HapioBooking>>(`/bookings${query}`)
  // Hapio retourne .data ou directement un tableau selon la version
  if (Array.isArray(res)) return res
  return res.data
}

export async function createBooking(params: {
  serviceId: string
  locationId: string
  resourceId?: string
  startsAt: string
  endsAt: string
  metadata?: Record<string, string>
}): Promise<HapioBooking> {
  const payload = {
    service_id: params.serviceId,
    location_id: params.locationId,
    ...(params.resourceId !== undefined ? { resource_id: params.resourceId } : {}),
    starts_at: params.startsAt,
    ends_at: params.endsAt,
    is_temporary: false, // Finaliser immédiatement la réservation
    metadata: params.metadata ?? {},
  }

  console.log('[Hapio] POST /bookings body:', JSON.stringify(payload))

  const res = await hapioFetch<unknown>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return extractData<HapioBooking>(res)
}

export async function getBooking(bookingId: string): Promise<HapioBooking> {
  const res = await hapioFetch<unknown>(`/bookings/${bookingId}`)
  return extractData<HapioBooking>(res)
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await hapioFetch(`/bookings/${bookingId}`, { method: 'DELETE' })
}
