import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

// ---------- Types ----------

interface CreateIntentBody {
  paymentMethod: 'hold' | 'direct' | 'gift_card'
  amount: number // prix en €
  giftCardCode?: string
  serviceId: string // service local ID (pour valider le bon)
  clientName: string
  clientEmail: string
  // Infos booking (stockées dans metadata Stripe)
  hapioServiceId: string
  hapioLocationId: string
  startsAt: string
  endsAt: string
  resourceId?: string
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
    if (!body.paymentMethod || !body.amount || body.amount < 1) {
      return errorJson('Méthode de paiement et montant requis')
    }

    if (!body.clientName || !body.clientEmail) {
      return errorJson('Nom et email requis')
    }

    const stripe = getStripe()

    // Metadata commune
    const baseMeta: Record<string, string> = {
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      serviceName: body.serviceName,
      hapioServiceId: body.hapioServiceId,
      hapioLocationId: body.hapioLocationId,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
    }
    if (body.resourceId) {
      baseMeta['resourceId'] = body.resourceId
    }

    // ===========================
    // Option 1 — Empreinte bancaire (hold)
    // ===========================
    if (body.paymentMethod === 'hold') {
      const holdAmount = Math.round(body.amount * 0.80 * 100) // 80% en centimes

      const customer = await stripe.customers.create({
        name: body.clientName,
        email: body.clientEmail,
      })

      const paymentIntent = await stripe.paymentIntents.create({
        amount: holdAmount,
        currency: 'eur',
        customer: customer.id,
        capture_method: 'manual',
        automatic_payment_methods: { enabled: true },
        metadata: {
          ...baseMeta,
          type: 'reservation_hold',
          fullPrice: String(body.amount),
          penalty30: String(Math.round(body.amount * 0.30 * 100)),
          penalty80: String(holdAmount),
        },
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret ?? '',
        paymentIntentId: paymentIntent.id,
        paymentType: 'stripe',
      })
    }

    // ===========================
    // Option 2 — Paiement direct CB
    // ===========================
    if (body.paymentMethod === 'direct') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(body.amount * 100),
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        receipt_email: body.clientEmail,
        metadata: {
          ...baseMeta,
          type: 'reservation_payment',
          fullPrice: String(body.amount),
        },
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret ?? '',
        paymentIntentId: paymentIntent.id,
        paymentType: 'stripe',
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

      // Vérifier que le bon n'est pas déjà utilisé
      if (card.used) {
        return errorJson('Ce bon cadeau a déjà été utilisé')
      }

      // Vérifier l'expiration
      if (new Date(card.expires_at) < new Date()) {
        return errorJson('Ce bon cadeau a expiré')
      }

      // Vérifier la correspondance du service (si le bon est lié à un service)
      if (card.service_id && card.service_id !== body.serviceId) {
        return errorJson('Ce bon cadeau n\'est pas valable pour cette prestation')
      }

      const cardAmount = Number(card.amount)

      // Cas 1 : le bon couvre tout
      if (cardAmount >= body.amount) {
        return NextResponse.json({
          paymentType: 'gift_card_full',
          giftCardValid: true,
        })
      }

      // Cas 2 : le bon ne couvre pas tout → paiement partiel par CB
      const remaining = body.amount - cardAmount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(remaining * 100),
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        receipt_email: body.clientEmail,
        metadata: {
          ...baseMeta,
          type: 'reservation_payment_partial',
          giftCardCode: body.giftCardCode,
          giftCardAmount: String(cardAmount),
          fullPrice: String(body.amount),
          remainingAmount: String(remaining),
        },
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret ?? '',
        paymentIntentId: paymentIntent.id,
        paymentType: 'gift_card_partial',
        remainingAmount: remaining,
        giftCardValid: true,
      })
    }

    return errorJson('Méthode de paiement invalide')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[create-intent]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
