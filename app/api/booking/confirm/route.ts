// ============================================
// app/api/booking/confirm/route.ts
// Confirmation de réservation après paiement Stripe ou bon cadeau
// Remplace createBooking Hapio par un insert Supabase
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createBooking, getBookingByPaymentIntent } from '@/lib/supabase/bookings'
import { invalidateSlotsCache } from '@/lib/data'
import { computeBookingTotal, applyPromoToTotal, incrementPromoUsage } from '@/lib/pricing'
import { sendBookingEmails } from '@/lib/email'

// ---------- Types ----------

interface ConfirmBody {
  paymentIntentId?: string
  giftCardCode?: string
  serviceId: string
  variantId?: string
  extraIds?: string[]
  promoCode?: string
  startsAt: string
  endsAt: string
  clientName: string
  clientEmail: string
  clientPhone: string
  message?: string
  serviceName: string
  variantName?: string
  price: number
  extras?: Array<{ name: string; price: number }>
  extrasTotal?: number
  paymentMode: 'hold' | 'direct' | 'gift_card'
}

// ---------- Route ----------

export async function POST(req: NextRequest) {
  try {
    const body: ConfirmBody = await req.json()

    // Validation de base
    if (
      !body.serviceId ||
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

    // Vérification délai 24h minimum (protection anti-bypass)
    const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000)
    if (new Date(body.startsAt) < cutoff) {
      return NextResponse.json(
        { error: 'Les réservations doivent être effectuées au moins 24h à l\'avance' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const supabase = createAdminClient()

    // ===========================
    // 0. Montant AUTORITAIRE recalculé serveur (jamais body.price)
    // ===========================

    const baseTotal = await computeBookingTotal({
      serviceId: body.serviceId,
      variantId: body.variantId ?? null,
      extraIds: Array.isArray(body.extraIds) ? body.extraIds : [],
    })

    let discountAmount = 0
    let appliedPromo: string | null = null
    if (body.promoCode && body.promoCode.trim()) {
      const promo = await applyPromoToTotal(body.promoCode, baseTotal)
      if (promo.valid) {
        discountAmount = promo.discountAmount
        appliedPromo = promo.code ?? null
      }
      // Si le code est devenu invalide entre le paiement et la confirmation,
      // on ne bloque pas la résa déjà payée : le contrôle pi.amount ci-dessous
      // garantit la cohérence avec ce qui a réellement été débité.
    }

    const netTotal = Math.round((baseTotal - discountAmount) * 100) / 100

    // ===========================
    // 1. Vérifier le paiement
    // ===========================

    if (body.paymentMode === 'hold' || body.paymentMode === 'direct') {
      if (!body.paymentIntentId) {
        return NextResponse.json(
          { error: 'PaymentIntent ID requis pour ce mode de paiement' },
          { status: 400 }
        )
      }

      const pi = await stripe.paymentIntents.retrieve(body.paymentIntentId)

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

      // Le montant Stripe doit correspondre au total net recalculé serveur.
      // Empêche toute manipulation du prix entre le wizard et la confirm.
      const expectedCents = Math.round(netTotal * 100)
      if (pi.amount !== expectedCents) {
        console.error(
          '[confirm] Prix incohérent — pi.amount:', pi.amount,
          '/ netTotal (cts):', expectedCents,
          '/ pi:', pi.id
        )
        return NextResponse.json(
          { error: 'Prix de réservation incohérent avec le paiement' },
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

      const { data: card, error: dbError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', body.giftCardCode.toUpperCase().trim())
        .single()

      if (dbError || !card || (card as { used: boolean }).used) {
        return NextResponse.json(
          { error: 'Bon cadeau invalide ou déjà utilisé' },
          { status: 400 }
        )
      }

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
    // 2. Durée calculée
    // ===========================

    const duration = Math.round(
      (new Date(body.endsAt).getTime() - new Date(body.startsAt).getTime()) / 60_000
    )

    // ===========================
    // 3. Idempotence : si le wizard est retry, ne pas dupliquer
    // ===========================

    if (body.paymentIntentId) {
      const existing = await getBookingByPaymentIntent(body.paymentIntentId)
      if (existing) {
        return NextResponse.json({ bookingId: existing.id })
      }
    }

    // ===========================
    // 4. Créer la réservation dans Supabase
    // ===========================

    // Construire les données en omettant les propriétés undefined
    const bookingData: Parameters<typeof createBooking>[0] = {
      service_id:   body.serviceId,
      starts_at:    body.startsAt,
      ends_at:      body.endsAt,
      duration,
      client_name:  body.clientName,
      client_email: body.clientEmail,
      client_phone: body.clientPhone,
      payment_mode: body.paymentMode,
      booked_by:    'client',
      service_name: body.serviceName,
      price:        netTotal,
    }

    if (body.variantId) bookingData.variant_id = body.variantId
    if (body.message) bookingData.client_message = body.message
    if (body.paymentIntentId) bookingData.payment_intent_id = body.paymentIntentId
    if (body.giftCardCode) bookingData.gift_card_code = body.giftCardCode
    if (body.extras?.length) bookingData.extras_json = body.extras
    if (body.extrasTotal !== undefined) bookingData.extras_total = body.extrasTotal
    if (body.variantName) bookingData.variant_name = body.variantName
    if (appliedPromo) {
      bookingData.promo_code = appliedPromo
      bookingData.discount_amount = discountAmount
    }

    const booking = await createBooking(bookingData)

    // Consommer le code promo (idempotent : on est passé après le check de
    // duplication par paymentIntentId, donc un retry ne ré-incrémente pas)
    if (appliedPromo) {
      await incrementPromoUsage(appliedPromo)
    }

    // ===========================
    // 4. Invalider le cache de créneaux
    // ===========================

    const bookingDate = body.startsAt.slice(0, 10)
    invalidateSlotsCache(body.variantId ?? body.serviceId, bookingDate).catch(() => {})

    // ===========================
    // 5. Marquer le bon cadeau comme utilisé
    // ===========================

    if (body.paymentMode === 'gift_card' && body.giftCardCode) {
      await supabase
        .from('gift_cards')
        .update({
          used:            true,
          used_at:         new Date().toISOString(),
          used_booking_id: booking.id,
        })
        .eq('code', body.giftCardCode.toUpperCase().trim())
    }

    // ===========================
    // 6. Envoyer les emails (non bloquant)
    // ===========================

    const emailData: Parameters<typeof sendBookingEmails>[0] = {
      clientName:  body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone,
      serviceName: body.serviceName,
      date:        body.startsAt,
      duration,
      price:       netTotal,
      bookingId:   booking.id,
    }
    if (body.variantName)    emailData.variantLabel = body.variantName
    if (body.message)        emailData.message      = body.message
    if (body.giftCardCode)   emailData.giftCardCode = body.giftCardCode
    if (body.extras?.length) emailData.extras       = body.extras

    sendBookingEmails(emailData).catch((err) => {
      console.error('[confirm] Erreur envoi email:', err)
    })

    return NextResponse.json({ bookingId: booking.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[confirm]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
