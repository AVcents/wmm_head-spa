import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { generateSlots } from '@/lib/slots'
import { createBooking } from '@/lib/supabase/bookings'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendBookingEmails } from '@/lib/email'
import { invalidateSlotsCache } from '@/lib/data'

function errorJson(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

// GET /api/admin/manual-booking?action=slots&serviceId=X&variantId=Y&date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) return errorJson('Non autorisé', 401)

  const { searchParams } = req.nextUrl
  const action = searchParams.get('action')

  if (action !== 'slots') {
    return errorJson('Action invalide. Utiliser : slots')
  }

  try {
    const serviceId = searchParams.get('serviceId')
    const variantId = searchParams.get('variantId') ?? null
    const date      = searchParams.get('date')

    if (!serviceId || !date) {
      return errorJson('serviceId et date sont requis')
    }

    // Résoudre la durée depuis Supabase
    const supabase = createAdminClient()
    let duration: number | null = null

    if (variantId) {
      const { data } = await supabase
        .from('service_variants')
        .select('duration')
        .eq('id', variantId)
        .single()
      duration = data?.duration ?? null
    }

    if (duration === null) {
      const { data } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single()
      duration = data?.duration ?? null
    }

    if (!duration) {
      return errorJson('Durée introuvable pour ce service')
    }

    // adminMode = true → pas de filtre 24h
    const slots = await generateSlots(variantId ?? serviceId, duration, date, true)
    return NextResponse.json(slots)
  } catch (error) {
    console.error('[admin/manual-booking GET]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/admin/manual-booking — Créer une réservation manuelle (sans paiement Stripe)
export async function POST(req: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) return errorJson('Non autorisé', 401)

  try {
    const body = await req.json()

    const {
      serviceId,
      variantId,
      startsAt,
      endsAt,
      clientName,
      clientEmail,
      clientPhone,
      note,
      serviceName,
      variantName,
    } = body

    if (!serviceId || !startsAt || !endsAt || !clientName) {
      return errorJson('serviceId, startsAt, endsAt et clientName sont requis')
    }

    const duration = Math.round(
      (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000
    )

    // Récupérer le service_name depuis Supabase si non fourni
    let resolvedServiceName = serviceName ?? ''
    if (!resolvedServiceName) {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('services')
        .select('name')
        .eq('id', serviceId)
        .single()
      resolvedServiceName = data?.name ?? ''
    }

    // Construire les données en omettant les propriétés undefined
    const bookingData: Parameters<typeof createBooking>[0] = {
      service_id:   serviceId,
      starts_at:    startsAt,
      ends_at:      endsAt,
      duration,
      client_name:  clientName,
      client_email: clientEmail ?? '',
      payment_mode: 'in_person',
      booked_by:    'admin',
      service_name: resolvedServiceName,
    }

    if (variantId) bookingData.variant_id = variantId
    if (clientPhone) bookingData.client_phone = clientPhone
    if (note) {
      bookingData.client_message = note
      bookingData.note = note
    }
    if (variantName) bookingData.variant_name = variantName

    const booking = await createBooking(bookingData)

    // Invalider le cache slots
    const bookingDate = startsAt.slice(0, 10)
    invalidateSlotsCache(variantId ?? serviceId, bookingDate).catch(() => {})

    // Email de confirmation : toujours envoyer au salon, client uniquement si email fourni
    sendBookingEmails({
      clientName,
      clientEmail: clientEmail ?? '', // Vide si pas d'email client
      clientPhone: clientPhone ?? '',
      serviceName: resolvedServiceName,
      ...(variantName ? { variantLabel: variantName } : {}),
      date:      startsAt,
      duration,
      price:     0,
      bookingId: booking.id,
      sendToClient: !!clientEmail, // N'envoie au client que si email fourni
      ...(note ? { message: note } : {}),
    }).catch((err) => {
      console.error('[admin/manual-booking] Erreur email:', err)
    })

    return NextResponse.json({ bookingId: booking.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[admin/manual-booking POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
