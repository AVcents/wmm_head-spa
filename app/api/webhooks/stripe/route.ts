import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { sendGiftCardEmails } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBookingByPaymentIntent, updateBookingStatus } from '@/lib/supabase/bookings'
import { incrementPromoUsage } from '@/lib/pricing'
import type { GiftCardEmailData } from '@/lib/email'

// Désactiver le body parsing automatique — Stripe a besoin du raw body pour vérifier la signature
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET']

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ─── Bons cadeaux : envoi email + persistance ─────────────────────
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const meta = pi.metadata ?? {}

    if (meta['type'] !== 'gift_card') {
      return NextResponse.json({ received: true })
    }

    // Idempotence : si un bon cadeau existe déjà pour ce PaymentIntent,
    // on a déjà traité cet event (Stripe peut retry)
    try {
      const supabase = createAdminClient()
      const { data: existing } = await supabase
        .from('gift_cards')
        .select('id')
        .eq('payment_intent_id', pi.id)
        .maybeSingle()
      if (existing) {
        console.log('[webhook] Gift card déjà créée pour PI', pi.id, '— skip')
        return NextResponse.json({ received: true })
      }
    } catch (err) {
      console.error('[webhook] idempotence check failed:', err)
      // En cas d'erreur, on continue plutôt que de bloquer
    }

    try {
      const giftAmount = parseFloat(meta['giftAmount'] ?? '0')
      const deliveryFee = parseFloat(meta['deliveryFee'] ?? '0')
      const totalAmount = giftAmount + deliveryFee
      const deliveryMethod = (meta['deliveryMethod'] as 'digital' | 'physical') ?? 'digital'

      // Parser les extras depuis les metadata (format compact [{n,p}])
      let extras: Array<{ name: string; price: number }> = []
      try {
        const raw = JSON.parse(meta['extras'] ?? '[]') as Array<{ n?: string; p?: number }>
        extras = (Array.isArray(raw) ? raw : [])
          .filter((e) => e && e.n)
          .map((e) => ({ name: String(e.n), price: Number(e.p ?? 0) }))
      } catch {
        extras = []
      }

      // Reconstituer l'adresse de livraison (papier uniquement)
      const hasShipping = deliveryMethod === 'physical' && Boolean(meta['shippingStreet'])
      const shippingAddress = hasShipping
        ? {
            street: meta['shippingStreet'] ?? '',
            city: meta['shippingCity'] ?? '',
            postalCode: meta['shippingPostalCode'] ?? '',
            country: meta['shippingCountry'] ?? '',
          }
        : undefined
      const shippingTo = (meta['shippingTo'] as 'recipient' | 'buyer') || undefined

      const data: GiftCardEmailData = {
        giftCardCode: meta['giftCardCode'] ?? '',
        paymentIntentId: pi.id,
        // Acheteur
        buyerEmail: meta['buyerEmail'] ?? '',
        buyerFirstName: meta['buyerFirstName'] ?? '',
        buyerLastName: meta['buyerLastName'] ?? '',
        ...(meta['buyerPhone'] ? { buyerPhone: meta['buyerPhone'] } : {}),
        // Destinataire
        recipientEmail: meta['recipientEmail'] ?? '',
        recipientFirstName: meta['recipientFirstName'] ?? '',
        recipientLastName: meta['recipientLastName'] ?? '',
        ...(meta['recipientPhone'] ? { recipientPhone: meta['recipientPhone'] } : {}),
        // Service
        serviceName: meta['serviceName'] ?? 'Bon cadeau libre',
        ...(meta['hairLengthLabel'] ? { hairLengthLabel: meta['hairLengthLabel'] } : {}),
        // Extras
        ...(extras.length ? { extras } : {}),
        // Montants
        giftAmount,
        deliveryFee,
        totalAmount,
        deliveryMethod,
        // Livraison papier
        ...(shippingTo ? { shippingTo } : {}),
        ...(shippingAddress ? { shippingAddress } : {}),
        // Message
        ...(meta['senderName'] ? { senderName: meta['senderName'] } : {}),
        ...(meta['personalMessage'] ? { personalMessage: meta['personalMessage'] } : {}),
      }

      await sendGiftCardEmails(data)
      console.log('[webhook] Gift card emails sent:', data.giftCardCode)

      // Persister le bon cadeau dans Supabase pour utilisation ultérieure
      try {
        const supabase = createAdminClient()
        const serviceId = meta['serviceId'] || null
        await supabase.from('gift_cards').insert({
          code: meta['giftCardCode'] ?? '',
          service_id: serviceId && serviceId.length > 0 ? serviceId : null,
          service_name: meta['serviceName'] ?? null,
          hair_length_label: meta['hairLengthLabel'] || null,
          amount: giftAmount,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          delivery_method: deliveryMethod,
          payment_intent_id: pi.id,
          // Acheteur
          buyer_email: meta['buyerEmail'] || null,
          buyer_first_name: meta['buyerFirstName'] || null,
          buyer_last_name: meta['buyerLastName'] || null,
          buyer_phone: meta['buyerPhone'] || null,
          // Destinataire
          recipient_email: meta['recipientEmail'] || null,
          recipient_first_name: meta['recipientFirstName'] || null,
          recipient_last_name: meta['recipientLastName'] || null,
          recipient_phone: meta['recipientPhone'] || null,
          // Extras + message
          extras: extras.length ? extras : null,
          sender_name: meta['senderName'] || null,
          personal_message: meta['personalMessage'] || null,
          // Livraison papier
          shipping_to: shippingTo ?? null,
          shipping_street: shippingAddress?.street ?? null,
          shipping_city: shippingAddress?.city ?? null,
          shipping_postal_code: shippingAddress?.postalCode ?? null,
          shipping_country: shippingAddress?.country ?? null,
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        console.log('[webhook] Gift card saved to Supabase:', meta['giftCardCode'])

        // Consommer le code promo éventuel (idempotent : on n'arrive ici
        // qu'une fois par PaymentIntent grâce au check d'existence en amont)
        const promoCode = meta['promoCode']
        if (promoCode && promoCode.trim()) {
          await incrementPromoUsage(promoCode)
          console.log('[webhook] Promo consommé (gift card):', promoCode)
        }
      } catch (dbErr) {
        console.error('[webhook] Failed to save gift card to Supabase:', dbErr)
        // Ne pas bloquer — l'email a déjà été envoyé
      }
    } catch (err) {
      console.error('[webhook] Failed to send emails:', err)
      // Retourner 500 pour que Stripe réessaie
      return NextResponse.json({ error: 'Email sending failed' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
  }

  // ─── Empreintes bancaires : synchroniser l'état Supabase ──────────
  // Cas : PaymentIntent annulé côté Stripe (timeout 7j, cancel manuel, etc.)
  if (event.type === 'payment_intent.canceled') {
    const pi = event.data.object
    try {
      const booking = await getBookingByPaymentIntent(pi.id)
      if (booking && booking.status === 'confirmed') {
        await updateBookingStatus(booking.id, 'cancelled')
        console.log('[webhook] Booking cancelled (PI canceled):', booking.id)
      }
    } catch (err) {
      console.error('[webhook] Failed to sync canceled PI:', err)
    }
    return NextResponse.json({ received: true })
  }

  // Cas : paiement échoué (3DS refusé après coup, carte refusée, etc.)
  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    try {
      const booking = await getBookingByPaymentIntent(pi.id)
      if (booking && booking.status === 'confirmed') {
        await updateBookingStatus(booking.id, 'cancelled')
        console.warn('[webhook] Booking cancelled (payment failed):', booking.id, pi.last_payment_error?.message)
      }
    } catch (err) {
      console.error('[webhook] Failed to sync failed PI:', err)
    }
    return NextResponse.json({ received: true })
  }

  return NextResponse.json({ received: true })
}
