import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeBookingTotal, applyPromoToTotal } from '@/lib/pricing'

// ---------- Types ----------

interface CreateIntentBody {
  paymentMethod: 'hold' | 'direct' | 'gift_card'
  giftCardCode?: string
  serviceId: string       // ID Supabase du service
  variantId?: string | null
  extraIds?: string[]     // IDs des extras sélectionnés (prix relus en DB)
  promoCode?: string      // code promo éventuel
  clientName: string
  clientEmail: string
  // Infos booking (stockées dans metadata Stripe)
  startsAt: string
  endsAt: string
  serviceName: string
}

// ---------- Helpers ----------

function errorJson(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

// ---------- Route ----------

export async function POST(req: NextRequest) {
  try {
    const body: CreateIntentBody = await req.json()

    // Validation de base
    if (!body.paymentMethod) {
      return errorJson('Méthode de paiement requise')
    }
    if (!body.serviceId) {
      return errorJson('Prestation requise')
    }
    if (!body.clientName || !body.clientEmail) {
      return errorJson('Nom et email requis')
    }

    // ===========================
    // Montant AUTORITAIRE recalculé serveur (jamais le montant client)
    // ===========================
    const baseTotal = await computeBookingTotal({
      serviceId: body.serviceId,
      variantId: body.variantId ?? null,
      extraIds: Array.isArray(body.extraIds) ? body.extraIds : [],
    })

    // Application du code promo (si fourni). Si fourni mais invalide → erreur
    // explicite plutôt que de facturer le plein tarif en silence.
    let discountAmount = 0
    let appliedPromo: string | null = null
    if (body.promoCode && body.promoCode.trim()) {
      const promo = await applyPromoToTotal(body.promoCode, baseTotal)
      if (!promo.valid) {
        return errorJson(promo.error ?? 'Code promo invalide')
      }
      discountAmount = promo.discountAmount
      appliedPromo = promo.code ?? null
    }

    const amount = Math.round((baseTotal - discountAmount) * 100) / 100

    if (amount < 1) {
      return errorJson('Le montant à régler est trop faible pour un paiement en ligne. Contactez le salon.')
    }

    const stripe = getStripe()

    // Metadata commune
    const baseMeta: Record<string, string> = {
      clientName:  body.clientName,
      clientEmail: body.clientEmail,
      serviceName: body.serviceName,
      startsAt:    body.startsAt,
      endsAt:      body.endsAt,
      ...(appliedPromo ? { promoCode: appliedPromo, discount: String(discountAmount) } : {}),
    }

    // ===========================
    // Option 1 — Empreinte bancaire (hold)
    // Hold à 100% du prix pour laisser toute la marge à l'admin
    // (capture totale, pénalités 30%/80%, ou libération)
    // ===========================
    if (body.paymentMethod === 'hold') {
      const priceCents = Math.round(amount * 100)

      const customer = await stripe.customers.create({
        name:  body.clientName,
        email: body.clientEmail,
      })

      const paymentIntent = await stripe.paymentIntents.create({
        amount:   priceCents,
        currency: 'eur',
        customer: customer.id,
        capture_method: 'manual',
        automatic_payment_methods: { enabled: true },
        metadata: {
          ...baseMeta,
          type:       'reservation_hold',
          fullPrice:  String(priceCents),
          penalty30:  String(Math.round(amount * 0.30 * 100)),
          penalty80:  String(Math.round(amount * 0.80 * 100)),
        },
      })

      return NextResponse.json({
        clientSecret:    paymentIntent.client_secret ?? '',
        paymentIntentId: paymentIntent.id,
        paymentType:     'stripe',
        amount,
        discountAmount,
        appliedPromo,
      })
    }

    // ===========================
    // Option 2 — Paiement direct CB
    // ===========================
    if (body.paymentMethod === 'direct') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount:   Math.round(amount * 100),
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        receipt_email: body.clientEmail,
        metadata: {
          ...baseMeta,
          type:      'reservation_payment',
          fullPrice: String(amount),
        },
      })

      return NextResponse.json({
        clientSecret:    paymentIntent.client_secret ?? '',
        paymentIntentId: paymentIntent.id,
        paymentType:     'stripe',
        amount,
        discountAmount,
        appliedPromo,
      })
    }

    // ===========================
    // Option 3 — Bon cadeau
    // ===========================
    if (body.paymentMethod === 'gift_card') {
      if (!body.giftCardCode) {
        return errorJson('Code bon cadeau requis')
      }

      const supabase = createAdminClient()

      const { data: card, error: dbError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', body.giftCardCode.toUpperCase().trim())
        .single()

      if (dbError || !card) {
        return errorJson('Code bon cadeau invalide')
      }

      if ((card as { used: boolean }).used) {
        return errorJson('Ce bon cadeau a déjà été utilisé')
      }

      if (new Date((card as { expires_at: string }).expires_at) < new Date()) {
        return errorJson('Ce bon cadeau a expiré')
      }

      if (
        (card as { service_id: string | null }).service_id &&
        (card as { service_id: string }).service_id !== body.serviceId
      ) {
        return errorJson('Ce bon cadeau n\'est pas valable pour cette prestation')
      }

      const cardAmount = Number((card as { amount: number }).amount)

      // Cas 1 : le bon couvre tout (sur le montant remisé)
      if (cardAmount >= amount) {
        return NextResponse.json({
          paymentType:  'gift_card_full',
          giftCardValid: true,
          amount,
          discountAmount,
          appliedPromo,
        })
      }

      // Cas 2 : paiement partiel par CB
      const remaining = Math.round((amount - cardAmount) * 100) / 100
      const paymentIntent = await stripe.paymentIntents.create({
        amount:   Math.round(remaining * 100),
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        receipt_email: body.clientEmail,
        metadata: {
          ...baseMeta,
          type:            'reservation_payment_partial',
          giftCardCode:    body.giftCardCode,
          giftCardAmount:  String(cardAmount),
          fullPrice:       String(amount),
          remainingAmount: String(remaining),
        },
      })

      return NextResponse.json({
        clientSecret:    paymentIntent.client_secret ?? '',
        paymentIntentId: paymentIntent.id,
        paymentType:     'gift_card_partial',
        remainingAmount: remaining,
        giftCardValid:   true,
        amount,
        discountAmount,
        appliedPromo,
      })
    }

    return errorJson('Méthode de paiement invalide')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[create-intent]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
