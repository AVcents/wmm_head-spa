import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { createBooking, getBookings } from '@/lib/supabase/bookings'
import { sendBookingEmails } from '@/lib/email'
import { invalidateSlotsCache } from '@/lib/data'
import { parisTimeToUTCIso } from '@/lib/slots'

/**
 * GET /api/admin/bookings — Lister les réservations
 * Query params optionnels : from, to (YYYY-MM-DD), status, limit
 */
export async function GET(req: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { searchParams } = req.nextUrl

    // Construire l'objet de paramètres en omettant les valeurs undefined
    const params: {
      from?: string
      to?: string
      status?: string
      limit?: number
    } = {}

    const fromParam = searchParams.get('from')
    if (fromParam) params.from = fromParam

    const toParam = searchParams.get('to')
    if (toParam) params.to = toParam

    const statusParam = searchParams.get('status')
    if (statusParam) params.status = statusParam

    const limitParam = searchParams.get('limit')
    if (limitParam) params.limit = Number(limitParam)

    const bookings = await getBookings(params)
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('[admin/bookings GET]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/bookings — Créer une réservation admin
 * Bypass du check 24h (réservation manuelle par l'admin).
 */
export async function POST(req: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()

    const {
      serviceId,
      variantId,
      startsAt,
      endsAt,
      name,
      email,
      phone,
      message,
      serviceName,
      variantName,
      duration,
      price,
    } = body

    if (!serviceId || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: 'serviceId, startsAt et endsAt sont requis' },
        { status: 400 }
      )
    }

    // Convertir les heures locales Paris en UTC
    // startsAt et endsAt sont au format "YYYY-MM-DDTHH:MM:SS"
    const startsAtParts = String(startsAt).match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
    const endsAtParts = String(endsAt).match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)

    if (!startsAtParts || !endsAtParts) {
      return NextResponse.json(
        { error: 'Format de date invalide. Attendu: YYYY-MM-DDTHH:MM:SS' },
        { status: 400 }
      )
    }

    const startsAtDate = `${startsAtParts[1]}-${startsAtParts[2]}-${startsAtParts[3]}`
    const startsAtTime = `${startsAtParts[4]}:${startsAtParts[5]}`
    const endsAtDate = `${endsAtParts[1]}-${endsAtParts[2]}-${endsAtParts[3]}`
    const endsAtTime = `${endsAtParts[4]}:${endsAtParts[5]}`

    const startsAtUTC = parisTimeToUTCIso(startsAtDate, startsAtTime)
    const endsAtUTC = parisTimeToUTCIso(endsAtDate, endsAtTime)

    const resolvedDuration = duration
      ? Number(duration)
      : Math.round((new Date(endsAtUTC).getTime() - new Date(startsAtUTC).getTime()) / 60000)

    // Construire les données de réservation en omettant les propriétés undefined
    const bookingData: Parameters<typeof createBooking>[0] = {
      service_id:   String(serviceId),
      starts_at:    startsAtUTC,
      ends_at:      endsAtUTC,
      duration:     resolvedDuration,
      client_name:  name ? String(name) : 'Admin',
      client_email: email ? String(email) : '',
      payment_mode: 'in_person',
      booked_by:    'admin',
      service_name: serviceName ? String(serviceName) : '',
    }

    if (variantId) bookingData.variant_id = String(variantId)
    if (phone) bookingData.client_phone = String(phone)
    if (message) bookingData.client_message = String(message)
    if (price !== undefined) bookingData.price = Number(price)
    if (variantName) bookingData.variant_name = String(variantName)

    const booking = await createBooking(bookingData)

    // Invalider le cache slots pour ce service/variant et cette date
    const bookingDate = String(startsAt).slice(0, 10)
    invalidateSlotsCache(variantId ? String(variantId) : String(serviceId), bookingDate).catch(() => {})

    // Envoyer emails de confirmation (non bloquant)
    if (email && name) {
      sendBookingEmails({
        clientName:   String(name),
        clientEmail:  String(email),
        clientPhone:  phone ? String(phone) : '',
        serviceName:  serviceName ? String(serviceName) : '',
        ...(variantName ? { variantLabel: String(variantName) } : {}),
        date:         startsAtUTC,
        duration:     resolvedDuration,
        price:        Number(price ?? 0),
        ...(message ? { message: String(message) } : {}),
        bookingId:    booking.id,
      }).catch((err) => {
        console.error('[Email] Erreur envoi email réservation admin:', err)
      })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('[admin/bookings POST]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur création réservation' },
      { status: 500 }
    )
  }
}
