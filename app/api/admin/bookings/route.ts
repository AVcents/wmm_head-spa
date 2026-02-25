import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { createBooking, getBookings } from '@/lib/supabase/bookings'
import { sendBookingEmails } from '@/lib/email'
import { invalidateSlotsCache } from '@/lib/data'

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

    const resolvedDuration = duration
      ? Number(duration)
      : Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000)

    const booking = await createBooking({
      service_id:     String(serviceId),
      variant_id:     variantId ? String(variantId) : null,
      starts_at:      String(startsAt),
      ends_at:        String(endsAt),
      duration:       resolvedDuration,
      client_name:    name    ? String(name)    : 'Admin',
      client_email:   email   ? String(email)   : '',
      client_phone:   phone   ? String(phone)   : '',
      client_message: message ? String(message) : undefined,
      payment_mode:   'in_person',
      booked_by:      'admin',
      price:          price !== undefined ? Number(price) : undefined,
      service_name:   serviceName  ? String(serviceName)  : '',
      variant_name:   variantName  ? String(variantName)  : undefined,
    })

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
        date:         String(startsAt),
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
