import { NextRequest, NextResponse } from 'next/server'
import {
  getLocations,
  getHapioServices,
  getBookableSlots,
  getResources,
  createBooking,
  cancelBooking,
} from '@/lib/hapio'
import { sendBookingEmails } from '@/lib/email'
import { getCachedSlots, setCachedSlots, invalidateSlotsCache } from '@/lib/data'

// GET /api/booking?action=locations|services|slots|resources
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const action = searchParams.get('action')

    switch (action) {
      case 'locations': {
        const locations = await getLocations()
        return NextResponse.json(locations)
      }

      case 'services': {
        const locationId = searchParams.get('locationId') ?? undefined
        const services = await getHapioServices(locationId)
        return NextResponse.json(services)
      }

      case 'resources': {
        const locationId = searchParams.get('locationId') ?? undefined
        const resources = await getResources(locationId)
        return NextResponse.json(resources)
      }

      case 'slots': {
        const serviceId = searchParams.get('serviceId')
        const locationId = searchParams.get('locationId')
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const resourceId = searchParams.get('resourceId') ?? undefined
        const noCache = searchParams.get('noCache') === 'true'

        if (!serviceId || !locationId || !from || !to) {
          return NextResponse.json(
            { error: 'serviceId, locationId, from et to sont requis' },
            { status: 400 }
          )
        }

        // ── Cache (si from === to = une seule date, on cache par date) ──────────
        const isSingleDay = from === to
        if (isSingleDay && !noCache) {
          const cached = await getCachedSlots(serviceId, from)
          if (cached !== null) {
            // Filtrer 48h depuis le cache
            const cutoff = new Date(Date.now() + 48 * 60 * 60 * 1000)
            return NextResponse.json(cached.filter((s) => new Date(s.starts_at) > cutoff))
          }
        }

        // ── Appel Hapio ─────────────────────────────────────────────────────────
        const slots = await getBookableSlots({
          serviceId,
          locationId,
          from,
          to,
          ...(resourceId !== undefined ? { resourceId } : {}),
        })

        // Stocker en cache si requête journée unique
        if (isSingleDay && !noCache) {
          await setCachedSlots(serviceId, from, slots)
        }

        // Filtrer les créneaux dans les prochaines 48h (minimum 2 jours d'avance)
        const cutoff = new Date(Date.now() + 48 * 60 * 60 * 1000)
        const filteredSlots = slots.filter(
          (s: { starts_at: string }) => new Date(s.starts_at) > cutoff
        )
        return NextResponse.json(filteredSlots)
      }

      default:
        return NextResponse.json(
          { error: 'Action invalide. Utiliser: locations, services, slots, resources' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/booking — Créer une réservation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      serviceId,
      locationId,
      resourceId,
      startsAt,
      endsAt,
      metadata,
    } = body

    if (!serviceId || !locationId || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: 'serviceId, locationId, startsAt et endsAt sont requis' },
        { status: 400 }
      )
    }

    // Vérification délai 48h minimum (2 jours)
    const cutoff = new Date(Date.now() + 48 * 60 * 60 * 1000)
    if (new Date(startsAt) < cutoff) {
      return NextResponse.json(
        { error: 'Les réservations doivent être effectuées au moins 48h à l\'avance' },
        { status: 400 }
      )
    }

    const booking = await createBooking({
      serviceId,
      locationId,
      resourceId,
      startsAt,
      endsAt,
      metadata,
    })

    // Invalider le cache pour ce service + cette date
    const bookingDate = startsAt.slice(0, 10)
    invalidateSlotsCache(serviceId, bookingDate).catch(() => {})

    // Envoi des emails de confirmation (non bloquant)
    if (metadata?.email && metadata?.name) {
      sendBookingEmails({
        clientName: metadata.name,
        clientEmail: metadata.email,
        clientPhone: metadata.phone ?? '',
        serviceName: metadata.service_name ?? '',
        variantLabel: metadata.variant_name || undefined,
        date: startsAt,
        duration: Number(metadata.duration ?? 0),
        price: Number(metadata.price ?? 0),
        message: metadata.message || undefined,
        giftCardCode: metadata.gift_card_code || undefined,
        bookingId: booking.id,
      }).catch((err) => {
        console.error('[Email] Erreur envoi email réservation:', err)
      })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur création réservation' },
      { status: 500 }
    )
  }
}

// DELETE /api/booking — Annuler une réservation
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId requis' },
        { status: 400 }
      )
    }

    await cancelBooking(bookingId)

    // Invalider le cache si on connait le service et la date
    const { serviceId: svcId, date: bookingDate } = body
    if (svcId && bookingDate) {
      invalidateSlotsCache(String(svcId), String(bookingDate)).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel booking error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur annulation' },
      { status: 500 }
    )
  }
}
