import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createBooking } from '@/lib/hapio'
import { sendBookingEmails } from '@/lib/email'

// ---------- Types ----------

interface ConfirmBody {
  paymentIntentId?: string
  giftCardCode?: string
  hapioServiceId: string
  hapioLocationId: string
  startsAt: string
  endsAt: string
  resourceId?: string
  clientName: string
  clientEmail: string
  clientPhone: string
  message?: string
  serviceName: string
  variantName?: string
  price: number
  paymentMode: 'hold' | 'direct' | 'gift_card'
}

// ---------- Route ----------

export async function POST(req: NextRequest) {
  try {
    const body: ConfirmBody = await req.json()

    // Validation de base
    if (
      !body.hapioServiceId ||
      !body.hapioLocationId ||
      !body.startsAt ||
      !body.endsAt ||
      !body.clientName ||
      !body.clientEmail ||
      !body.clientPhone
    ) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const supabase = createAdminClient()

    // ===========================
    // 1. Vérifier le paiement
    // ===========================

    if (body.paymentMode === 'hold' || body.paymentMode === 'direct') {
      // Pour hold et direct, vérifier le PaymentIntent
      if (!body.paymentIntentId) {
        return NextResponse.json(
          { error: 'PaymentIntent ID requis pour ce mode de paiement' },
          { status: 400 }
        )
      }

      const pi = await stripe.paymentIntents.retrieve(body.paymentIntentId)

      // hold → requires_capture (authorization successful)
      // direct → succeeded (payment completed)
      if (body.paymentMode === 'hold' && pi.status !== 'requires_capture') {
        return NextResponse.json(
          { error: `Empreinte bancaire non confirmée (status: ${pi.status})` },
          { status: 400 }
        )
      }

      if (body.paymentMode === 'direct' && pi.status !== 'succeeded') {
        return NextResponse.json(
          { error: `Paiement non confirmé (status: ${pi.status})` },
          { status: 400 }
        )
      }
    }

    if (body.paymentMode === 'gift_card') {
      if (!body.giftCardCode) {
        return NextResponse.json(
          { error: 'Code bon cadeau requis' },
          { status: 400 }
        )
      }

      // Re-vérifier le bon cadeau (protection serveur)
      const { data: card, error: dbError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', body.giftCardCode.toUpperCase().trim())
        .single()

      if (dbError || !card || card.used) {
        return NextResponse.json(
          { error: 'Bon cadeau invalide ou déjà utilisé' },
          { status: 400 }
        )
      }

      // Si paiement partiel, vérifier le PI aussi
      if (body.paymentIntentId) {
        const pi = await stripe.paymentIntents.retrieve(body.paymentIntentId)
        if (pi.status !== 'succeeded') {
          return NextResponse.json(
            { error: `Paiement complémentaire non confirmé (status: ${pi.status})` },
            { status: 400 }
          )
        }
      }
    }

    // ===========================
    // 2. Créer la réservation Hapio
    // ===========================

    const duration = body.endsAt && body.startsAt
      ? Math.round(
          (new Date(body.endsAt).getTime() - new Date(body.startsAt).getTime()) /
            60000
        )
      : 0

    const bookingParams: Parameters<typeof createBooking>[0] = {
      serviceId: body.hapioServiceId,
      locationId: body.hapioLocationId,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      metadata: {
        name: body.clientName,
        email: body.clientEmail,
        phone: body.clientPhone,
        message: body.message ?? '',
        service_name: body.serviceName,
        variant_name: body.variantName ?? '',
        price: String(body.price),
        duration: String(duration),
        payment_mode: body.paymentMode,
        payment_intent_id: body.paymentIntentId ?? '',
        gift_card_code: body.giftCardCode ?? '',
      },
    }
    if (body.resourceId) {
      bookingParams.resourceId = body.resourceId
    }

    const booking = await createBooking(bookingParams)

    // ===========================
    // 3. Marquer le bon cadeau comme utilisé
    // ===========================

    if (body.paymentMode === 'gift_card' && body.giftCardCode) {
      await supabase
        .from('gift_cards')
        .update({
          used: true,
          used_at: new Date().toISOString(),
          used_booking_id: booking.id,
        })
        .eq('code', body.giftCardCode.toUpperCase().trim())
    }

    // ===========================
    // 4. Envoyer les emails de confirmation (non bloquant)
    // ===========================

    const emailData: Parameters<typeof sendBookingEmails>[0] = {
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone,
      serviceName: body.serviceName,
      date: body.startsAt,
      duration,
      price: body.price,
      bookingId: booking.id,
    }
    if (body.variantName) emailData.variantLabel = body.variantName
    if (body.message) emailData.message = body.message
    if (body.giftCardCode) emailData.giftCardCode = body.giftCardCode

    sendBookingEmails(emailData).catch((err) => {
      console.error('[confirm] Erreur envoi email réservation:', err)
    })

    return NextResponse.json({ bookingId: booking.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[confirm]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
