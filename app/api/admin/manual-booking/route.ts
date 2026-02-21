import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import {
  getLocations,
  getHapioServices,
  getBookableSlots,
  createBooking,
} from '@/lib/hapio'
import { sendBookingEmails } from '@/lib/email'

function errorJson(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

// GET /api/admin/manual-booking?action=locations|services|slots
export async function GET(req: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) return errorJson('Non autorisé', 401)

  const { searchParams } = req.nextUrl
  const action = searchParams.get('action')

  try {
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

      case 'slots': {
        const serviceId = searchParams.get('serviceId')
        const locationId = searchParams.get('locationId')
        const from = searchParams.get('from')
        const to = searchParams.get('to')

        if (!serviceId || !locationId || !from || !to) {
          return errorJson('serviceId, locationId, from et to sont requis')
        }

        const slots = await getBookableSlots({ serviceId, locationId, from, to })
        // NOTE : Pas de filtre 24h pour les réservations admin — Gwen peut réserver n'importe quand
        return NextResponse.json(slots)
      }

      default:
        return errorJson('Action invalide. Utiliser : locations, services, slots')
    }
  } catch (error) {
    console.error('[admin/manual-booking GET]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/admin/manual-booking — Créer une réservation manuelle (sans paiement)
export async function POST(req: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) return errorJson('Non autorisé', 401)

  try {
    const body = await req.json()

    const {
      serviceId,
      locationId,
      resourceId,
      startsAt,
      endsAt,
      clientName,
      clientEmail,
      clientPhone,
      note,
      serviceName,
    } = body

    if (!serviceId || !locationId || !startsAt || !endsAt || !clientName) {
      return errorJson('serviceId, locationId, startsAt, endsAt et clientName sont requis')
    }

    const duration = Math.round(
      (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000
    )

    const bookingParams: Parameters<typeof createBooking>[0] = {
      serviceId,
      locationId,
      startsAt,
      endsAt,
      metadata: {
        name: clientName,
        email: clientEmail ?? '',
        phone: clientPhone ?? '',
        message: note ?? '',
        service_name: serviceName ?? '',
        payment_mode: 'in_person',
        booked_by: 'admin',
        duration: String(duration),
        price: '0',
      },
    }
    if (resourceId) bookingParams.resourceId = resourceId

    const booking = await createBooking(bookingParams)

    // Email de confirmation uniquement si email fourni
    if (clientEmail) {
      sendBookingEmails({
        clientName,
        clientEmail,
        clientPhone: clientPhone ?? '',
        serviceName: serviceName ?? '',
        date: startsAt,
        duration,
        price: 0,
        bookingId: booking.id,
        ...(note ? { message: note } : {}),
      }).catch((err) => {
        console.error('[admin/manual-booking] Erreur email:', err)
      })
    }

    return NextResponse.json({ bookingId: booking.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[admin/manual-booking POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
