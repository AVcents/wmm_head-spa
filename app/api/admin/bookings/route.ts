import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { createBooking } from '@/lib/hapio'
import { sendBookingEmails } from '@/lib/email'
import { invalidateSlotsCache } from '@/lib/data'

/**
 * POST /api/admin/bookings — Créer une réservation admin
 * Bypass du check 48h (réservation manuelle par l'admin).
 */
export async function POST(req: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()

    const {
      hapioServiceId,
      hapioLocationId,
      resourceId,
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

    if (!hapioServiceId || !hapioLocationId || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: 'hapioServiceId, hapioLocationId, startsAt et endsAt sont requis' },
        { status: 400 }
      )
    }

    const metadata: Record<string, string> = {}
    if (name) metadata['name'] = String(name)
    if (email) metadata['email'] = String(email)
    if (phone) metadata['phone'] = String(phone)
    if (message) metadata['message'] = String(message)
    if (serviceName) metadata['service_name'] = String(serviceName)
    if (variantName) metadata['variant_name'] = String(variantName)
    if (duration !== undefined) metadata['duration'] = String(duration)
    if (price !== undefined) metadata['price'] = String(price)
    metadata['admin_booking'] = 'true'

    const booking = await createBooking({
      serviceId: String(hapioServiceId),
      locationId: String(hapioLocationId),
      resourceId: resourceId ? String(resourceId) : undefined,
      startsAt: String(startsAt),
      endsAt: String(endsAt),
      metadata,
    })

    // Invalider le cache slots pour ce service et cette date
    const bookingDate = String(startsAt).slice(0, 10)
    invalidateSlotsCache(String(hapioServiceId), bookingDate).catch(() => {})

    // Envoyer emails de confirmation (non bloquant)
    if (email && name) {
      sendBookingEmails({
        clientName: String(name),
        clientEmail: String(email),
        clientPhone: phone ? String(phone) : '',
        serviceName: serviceName ? String(serviceName) : '',
        variantLabel: variantName ? String(variantName) : undefined,
        date: String(startsAt),
        duration: Number(duration ?? 0),
        price: Number(price ?? 0),
        message: message ? String(message) : undefined,
        bookingId: booking.id,
      }).catch((err) => {
        console.error('[Email] Erreur envoi email réservation admin:', err)
      })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Admin create booking error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur création réservation' },
      { status: 500 }
    )
  }
}
