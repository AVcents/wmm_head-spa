// ============================================
// lib/supabase/bookings.ts
// CRUD réservations — remplace Hapio createBooking / cancelBooking
// ============================================

import { createAdminClient } from '@/lib/supabase/admin'
import type { BookingRow } from '@/lib/supabase/types'

// ─── Types ──────────────────────────────────────────────────────

export interface CreateBookingData {
  service_id: string
  variant_id?: string | null
  starts_at: string   // ISO UTC
  ends_at: string     // ISO UTC
  duration: number    // minutes
  client_name: string
  client_email: string
  client_phone?: string
  client_message?: string
  payment_mode: 'hold' | 'direct' | 'gift_card' | 'in_person'
  payment_intent_id?: string
  gift_card_code?: string
  price?: number
  extras_json?: Array<{ name: string; price: number }>
  extras_total?: number
  promo_code?: string
  discount_amount?: number
  booked_by?: 'client' | 'admin'
  note?: string
  service_name: string
  variant_name?: string
}

// ─── Création ───────────────────────────────────────────────────

export async function createBooking(data: CreateBookingData): Promise<BookingRow> {
  const supabase = createAdminClient()

  const row: Record<string, unknown> = {
    service_id:       data.service_id,
    starts_at:        data.starts_at,
    ends_at:          data.ends_at,
    duration:         data.duration,
    status:           'confirmed',
    client_name:      data.client_name,
    client_email:     data.client_email,
    client_phone:     data.client_phone ?? '',
    payment_mode:     data.payment_mode,
    booked_by:        data.booked_by ?? 'client',
    service_name:     data.service_name,
  }

  if (data.variant_id)         row['variant_id']         = data.variant_id
  if (data.client_message)     row['client_message']     = data.client_message
  if (data.payment_intent_id)  row['payment_intent_id']  = data.payment_intent_id
  if (data.gift_card_code)     row['gift_card_code']     = data.gift_card_code
  if (data.price != null)      row['price']              = data.price
  if (data.extras_json?.length) row['extras_json']       = data.extras_json
  if (data.extras_total != null) row['extras_total']     = data.extras_total
  if (data.promo_code)         row['promo_code']         = data.promo_code
  if (data.discount_amount != null) row['discount_amount'] = data.discount_amount
  if (data.note)               row['note']               = data.note
  if (data.variant_name)       row['variant_name']       = data.variant_name

  const { data: created, error } = await supabase
    .from('bookings')
    .insert(row)
    .select()
    .single()

  if (error || !created) {
    throw new Error(error?.message ?? 'Erreur création réservation Supabase')
  }

  return created as BookingRow
}

// ─── Lecture ────────────────────────────────────────────────────

/** Réservations confirmées pour un jour donné (pour la génération de créneaux) */
export async function getConfirmedBookingsForDate(date: string): Promise<
  Array<{ starts_at: string; ends_at: string }>
> {
  const supabase = createAdminClient()
  const nextDay = addDays(date, 1)

  const { data, error } = await supabase
    .from('bookings')
    .select('starts_at, ends_at')
    .eq('status', 'confirmed')
    .gte('starts_at', `${date}T00:00:00Z`)
    .lt('starts_at', `${nextDay}T00:00:00Z`)

  if (error) {
    console.error('[bookings] getConfirmedBookingsForDate:', error)
    return []
  }

  return (data ?? []) as Array<{ starts_at: string; ends_at: string }>
}

/** Toutes les réservations (admin) avec filtres optionnels */
export async function getBookings(params?: {
  from?: string       // YYYY-MM-DD
  to?: string         // YYYY-MM-DD
  status?: string
  limit?: number
}): Promise<(BookingRow & { buffer_time?: number })[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('bookings')
    .select('*, services!inner(buffer_time)')
    .order('starts_at', { ascending: true })

  if (params?.status) {
    query = query.eq('status', params.status)
  }

  if (params?.from) {
    query = query.gte('starts_at', `${params.from}T00:00:00Z`)
  }

  if (params?.to) {
    // Inclure toute la journée de fin
    const nextDay = addDays(params.to, 1)
    query = query.lt('starts_at', `${nextDay}T00:00:00Z`)
  }

  if (params?.limit) {
    query = query.limit(params.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('[bookings] getBookings:', error)
    return []
  }

  // Flatten services.buffer_time to booking level
  return (data ?? []).map((row: unknown) => {
    const booking = row as BookingRow & { services?: { buffer_time?: number } }
    return {
      ...booking,
      buffer_time: booking.services?.buffer_time ?? 0,
      services: undefined, // Remove nested object
    }
  }) as (BookingRow & { buffer_time?: number })[]
}

/** Récupère une réservation par ID */
export async function getBookingById(id: string): Promise<BookingRow | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as BookingRow
}

/** Récupère une réservation par PaymentIntent Stripe */
export async function getBookingByPaymentIntent(paymentIntentId: string): Promise<BookingRow | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (error || !data) return null
  return data as BookingRow
}

// ─── Annulation ─────────────────────────────────────────────────

export async function cancelBooking(id: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('bookings')
    .update({
      status:       'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[bookings] cancelBooking:', error)
    return false
  }
  return true
}

// ─── Mise à jour statut ─────────────────────────────────────────

export async function updateBookingStatus(
  id: string,
  status: 'confirmed' | 'cancelled' | 'no_show'
): Promise<boolean> {
  const supabase = createAdminClient()

  const updates: Record<string, unknown> = { status }
  // Horodatage de sortie : cancelled_at sert aussi pour les no_show
  // (pas de colonne dédiée, on réutilise pour la traçabilité)
  if (status === 'cancelled' || status === 'no_show') {
    updates['cancelled_at'] = new Date().toISOString()
  }

  const { error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('[bookings] updateBookingStatus:', error)
    return false
  }
  return true
}

// ─── Helper ─────────────────────────────────────────────────────

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]!
}
