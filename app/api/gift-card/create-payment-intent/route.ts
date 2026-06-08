import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { applyPromoToTotal, incrementPromoUsage } from '@/lib/pricing'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendGiftCardEmails } from '@/lib/email'
import { GIFT_CARD_EXPIRY_DAYS } from '@/lib/gift-card'
import type { GiftCardExtra, ShippingAddress } from '@/lib/gift-card'
import type { GiftCardEmailData } from '@/lib/email'

export interface CreatePaymentIntentBody {
  amount: number          // montant total en euros (incl. frais livraison)
  promoCode?: string      // code promo éventuel (remise sur le montant payé)
  finalize?: boolean      // true = créer le bon cadeau gratuit (montant à 0)
  serviceId?: string
  serviceName?: string
  hairLengthLabel?: string
  deliveryMethod?: string
  deliveryFee: number
  extras?: GiftCardExtra[]
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
  shippingAddress?: ShippingAddress
  shippingTo?: 'recipient' | 'buyer'
}

/** Convertit un nom de pays courant en code ISO alpha-2 pour le champ shipping Stripe. */
function countryToISO(country?: string): string | undefined {
  if (!country) return undefined
  const c = country.trim().toLowerCase()
  const map: Record<string, string> = {
    france: 'FR', fr: 'FR',
    belgique: 'BE', belgium: 'BE', be: 'BE',
    suisse: 'CH', switzerland: 'CH', ch: 'CH',
    luxembourg: 'LU', lu: 'LU',
    monaco: 'MC', mc: 'MC',
  }
  if (map[c]) return map[c]
  // Déjà un code ISO 2 lettres ?
  if (/^[a-z]{2}$/.test(c)) return c.toUpperCase()
  return undefined
}

export async function POST(req: NextRequest) {
  try {
    const body: CreatePaymentIntentBody = await req.json()

    // Validation minimale
    if (!body.amount || body.amount < 1) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }
    if (!body.buyerEmail) {
      return NextResponse.json({ error: 'Email acheteur manquant' }, { status: 400 })
    }
    // L'email destinataire n'est requis que pour l'envoi numérique.
    if (body.deliveryMethod !== 'physical' && !body.recipientEmail) {
      return NextResponse.json({ error: 'Email destinataire manquant' }, { status: 400 })
    }

    // ===========================
    // Code promo — validation et remise calculées SERVEUR.
    // La remise s'applique sur le montant payé par l'acheteur ; la valeur
    // faciale du bon (giftAmount) reste pleine pour le destinataire.
    // ===========================
    let discount = 0
    let appliedPromo: string | null = null
    if (body.promoCode && body.promoCode.trim()) {
      const promo = await applyPromoToTotal(body.promoCode, body.amount)
      if (!promo.valid) {
        return NextResponse.json(
          { error: promo.error ?? 'Code promo invalide' },
          { status: 400 }
        )
      }
      discount = promo.discountAmount
      appliedPromo = promo.code ?? null
    }

    const chargeAmount = Math.round((body.amount - discount) * 100) / 100

    // Générer un code bon cadeau court
    const giftCardCode = `KH-${Date.now().toString(36).toUpperCase().slice(-6)}`

    // Éléments communs aux deux chemins (payant / gratuit)
    const extras = Array.isArray(body.extras) ? body.extras : []
    const isPhysical = body.deliveryMethod === 'physical'
    const ship = body.shippingAddress
    const shipCountryISO = ship ? countryToISO(ship.country) : undefined
    const giftAmount = Math.round((body.amount - body.deliveryFee) * 100) / 100

    // ===========================
    // Bon cadeau 100% offert par le code promo → pas de Stripe.
    // ===========================
    if (chargeAmount === 0) {
      // Aperçu (clic "Appliquer") : on ne crée encore rien.
      if (!body.finalize) {
        return NextResponse.json({ free: true, amount: 0, discountAmount: discount, appliedPromo })
      }
      // Confirmation : créer le bon cadeau + emails + consommer le promo.
      const emailData: GiftCardEmailData = {
        giftCardCode,
        paymentIntentId: '',
        buyerEmail: body.buyerEmail,
        buyerFirstName: body.buyerFirstName,
        buyerLastName: body.buyerLastName,
        ...(body.buyerPhone ? { buyerPhone: body.buyerPhone } : {}),
        recipientEmail: body.recipientEmail ?? '',
        recipientFirstName: body.recipientFirstName,
        recipientLastName: body.recipientLastName,
        ...(body.recipientPhone ? { recipientPhone: body.recipientPhone } : {}),
        serviceName: body.serviceName ?? 'Bon cadeau libre',
        ...(body.hairLengthLabel ? { hairLengthLabel: body.hairLengthLabel } : {}),
        ...(extras.length ? { extras: extras.map((e) => ({ name: e.name, price: Number(e.price) })) } : {}),
        giftAmount,
        deliveryFee: body.deliveryFee,
        totalAmount: giftAmount + body.deliveryFee,
        deliveryMethod: isPhysical ? 'physical' : 'digital',
        ...(isPhysical && body.shippingTo ? { shippingTo: body.shippingTo } : {}),
        ...(isPhysical && ship ? { shippingAddress: ship } : {}),
        ...(body.senderName ? { senderName: body.senderName } : {}),
        ...(body.personalMessage ? { personalMessage: body.personalMessage.substring(0, 490) } : {}),
      }

      try {
        const supabase = createAdminClient()
        await supabase.from('gift_cards').insert({
          code: giftCardCode,
          service_id: body.serviceId && body.serviceId.length > 0 ? body.serviceId : null,
          service_name: body.serviceName ?? null,
          hair_length_label: body.hairLengthLabel || null,
          amount: giftAmount,
          delivery_fee: body.deliveryFee,
          total_amount: giftAmount + body.deliveryFee,
          delivery_method: isPhysical ? 'physical' : 'digital',
          payment_intent_id: null,
          buyer_email: body.buyerEmail || null,
          buyer_first_name: body.buyerFirstName || null,
          buyer_last_name: body.buyerLastName || null,
          buyer_phone: body.buyerPhone || null,
          recipient_email: body.recipientEmail || null,
          recipient_first_name: body.recipientFirstName || null,
          recipient_last_name: body.recipientLastName || null,
          recipient_phone: body.recipientPhone || null,
          extras: extras.length ? extras : null,
          sender_name: body.senderName || null,
          personal_message: body.personalMessage || null,
          shipping_to: isPhysical ? body.shippingTo ?? 'recipient' : null,
          shipping_street: isPhysical && ship ? ship.street : null,
          shipping_city: isPhysical && ship ? ship.city : null,
          shipping_postal_code: isPhysical && ship ? ship.postalCode : null,
          shipping_country: isPhysical && ship ? ship.country : null,
          expires_at: new Date(Date.now() + GIFT_CARD_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        })
        await sendGiftCardEmails(emailData)
        if (appliedPromo) await incrementPromoUsage(appliedPromo)
      } catch (e) {
        console.error('[create-payment-intent] finalize free gift card:', e)
        return NextResponse.json({ error: 'Erreur lors de la création du bon cadeau' }, { status: 500 })
      }

      return NextResponse.json({
        free: true, success: true, giftCardCode, amount: 0, discountAmount: discount, appliedPromo,
      })
    }

    if (chargeAmount < 1) {
      return NextResponse.json(
        { error: 'Le montant à régler est trop faible pour un paiement en ligne.' },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    // Sérialiser les extras de façon compacte pour les metadata (limite 500 car.)
    const extrasMeta = JSON.stringify(
      extras.map((e) => ({ n: e.name, p: Number(e.price) }))
    ).slice(0, 490)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(chargeAmount * 100), // en centimes (montant remisé payé)
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      receipt_email: body.buyerEmail,
      // Adresse de livraison native Stripe (visible dans le dashboard) — best effort
      ...(isPhysical && ship
        ? {
            shipping: {
              name:
                body.shippingTo === 'buyer'
                  ? `${body.buyerFirstName} ${body.buyerLastName}`.trim()
                  : `${body.recipientFirstName} ${body.recipientLastName}`.trim(),
              address: {
                line1: ship.street,
                city: ship.city,
                postal_code: ship.postalCode,
                ...(shipCountryISO ? { country: shipCountryISO } : {}),
              },
            },
          }
        : {}),
      metadata: {
        type: 'gift_card',
        giftCardCode,
        // Service
        serviceId: body.serviceId ?? '',
        serviceName: body.serviceName ?? 'Bon cadeau libre',
        hairLengthLabel: body.hairLengthLabel ?? '',
        // Extras
        extras: extrasMeta,
        // Montants — giftAmount = valeur faciale PLEINE (non remisée)
        giftAmount: String(body.amount - body.deliveryFee),
        deliveryFee: String(body.deliveryFee),
        deliveryMethod: body.deliveryMethod ?? 'digital',
        // Code promo / remise (sur le montant payé uniquement)
        promoCode: appliedPromo ?? '',
        discount: String(discount),
        // Acheteur
        buyerEmail: body.buyerEmail,
        buyerFirstName: body.buyerFirstName,
        buyerLastName: body.buyerLastName,
        buyerPhone: body.buyerPhone ?? '',
        // Destinataire
        recipientEmail: body.recipientEmail ?? '',
        recipientFirstName: body.recipientFirstName,
        recipientLastName: body.recipientLastName,
        recipientPhone: body.recipientPhone ?? '',
        // Livraison papier
        shippingTo: isPhysical ? body.shippingTo ?? 'recipient' : '',
        shippingStreet: isPhysical && ship ? ship.street : '',
        shippingCity: isPhysical && ship ? ship.city : '',
        shippingPostalCode: isPhysical && ship ? ship.postalCode : '',
        shippingCountry: isPhysical && ship ? ship.country : '',
        // Message
        senderName: body.senderName ?? '',
        // Tronquer le message si > 490 chars (limite Stripe: 500)
        personalMessage: (body.personalMessage ?? '').substring(0, 490),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: chargeAmount,
      discountAmount: discount,
      appliedPromo,
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
