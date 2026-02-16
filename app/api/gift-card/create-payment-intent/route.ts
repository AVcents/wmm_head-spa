import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export interface CreatePaymentIntentBody {
  amount: number          // montant total en euros (incl. frais livraison)
  serviceId?: string
  serviceName?: string
  hairLengthLabel?: string
  deliveryMethod?: string
  deliveryFee: number
  buyerEmail: string
  buyerFirstName: string
  buyerLastName: string
  buyerPhone?: string
  recipientEmail: string
  recipientFirstName: string
  recipientLastName: string
  recipientPhone?: string
  senderName?: string
  personalMessage?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: CreatePaymentIntentBody = await req.json()

    // Validation minimale
    if (!body.amount || body.amount < 1) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }
    if (!body.buyerEmail || !body.recipientEmail) {
      return NextResponse.json({ error: 'Email manquant' }, { status: 400 })
    }

    const stripe = getStripe()

    // Générer un code bon cadeau court
    const giftCardCode = `KH-${Date.now().toString(36).toUpperCase().slice(-6)}`

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(body.amount * 100), // en centimes
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      receipt_email: body.buyerEmail,
      metadata: {
        type: 'gift_card',
        giftCardCode,
        // Service
        serviceId: body.serviceId ?? '',
        serviceName: body.serviceName ?? 'Bon cadeau libre',
        hairLengthLabel: body.hairLengthLabel ?? '',
        // Montants
        giftAmount: String(body.amount - body.deliveryFee),
        deliveryFee: String(body.deliveryFee),
        deliveryMethod: body.deliveryMethod ?? 'digital',
        // Acheteur
        buyerEmail: body.buyerEmail,
        buyerFirstName: body.buyerFirstName,
        buyerLastName: body.buyerLastName,
        buyerPhone: body.buyerPhone ?? '',
        // Destinataire
        recipientEmail: body.recipientEmail,
        recipientFirstName: body.recipientFirstName,
        recipientLastName: body.recipientLastName,
        recipientPhone: body.recipientPhone ?? '',
        // Message
        senderName: body.senderName ?? '',
        // Tronquer le message si > 490 chars (limite Stripe: 500)
        personalMessage: (body.personalMessage ?? '').substring(0, 490),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[create-payment-intent]', message)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
