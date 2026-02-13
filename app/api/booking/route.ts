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

        if (!serviceId || !locationId || !from || !to) {
          return NextResponse.json(
            { error: 'serviceId, locationId, from et to sont requis' },
            { status: 400 }
          )
        }

        const slots = await getBookableSlots({
          serviceId,
          locationId,
          from,
          to,
          ...(resourceId !== undefined ? { resourceId } : {}),
        })
        return NextResponse.json(slots)
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

    const booking = await createBooking({
      serviceId,
      locationId,
      resourceId,
      startsAt,
      endsAt,
      metadata,
    })

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
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel booking error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur annulation' },
      { status: 500 }
    )
  }
}
