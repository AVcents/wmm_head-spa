import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { sendGiftCardEmails } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBookingByPaymentIntent, updateBookingStatus } from '@/lib/supabase/bookings'
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
        // Service
        serviceName: meta['serviceName'] ?? 'Bon cadeau libre',
        ...(meta['hairLengthLabel'] ? { hairLengthLabel: meta['hairLengthLabel'] } : {}),
        // Montants
        giftAmount,
        deliveryFee,
        totalAmount,
        deliveryMethod: (meta['deliveryMethod'] as 'digital' | 'physical') ?? 'digital',
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
          amount: giftAmount,
          payment_intent_id: pi.id,
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        console.log('[webhook] Gift card saved to Supabase:', meta['giftCardCode'])
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
