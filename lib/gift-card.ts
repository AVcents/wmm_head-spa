// ============================================
// Bon cadeau — logique partagée (montants, frais, types)
// ============================================
//
// Source unique de vérité pour les calculs du tunnel bon cadeau.
// Évite la duplication des constantes (frais de livraison) et garantit
// que l'UI, l'API et les emails calculent le même total.

/** Frais de livraison pour un bon cadeau papier (en euros). */
export const GIFT_CARD_DELIVERY_FEE = 5

/** Limite de caractères du message personnalisé (alignée sur la limite metadata Stripe). */
export const GIFT_CARD_MESSAGE_MAX = 490

/** Délai d'expiration d'un bon cadeau (en jours). */
export const GIFT_CARD_EXPIRY_DAYS = 365

/** Extra sélectionné sur un bon cadeau (forme minimale, sans durée). */
export interface GiftCardExtra {
  id: string
  name: string
  price: number
}

/** Adresse postale pour la livraison papier. */
export interface ShippingAddress {
  street: string
  city: string
  postalCode: string
  country: string
}

/** Somme des extras sélectionnés. */
export function extrasTotal(extras?: GiftCardExtra[] | null): number {
  if (!extras || extras.length === 0) return 0
  return extras.reduce((sum, e) => sum + Number(e.price || 0), 0)
}

/** Frais de livraison selon la méthode choisie. */
export function deliveryFeeFor(deliveryMethod?: string | null): number {
  return deliveryMethod === 'physical' ? GIFT_CARD_DELIVERY_FEE : 0
}

/**
 * Montant du bon (valeur utilisable par le destinataire) =
 * prix de la prestation + extras. N'inclut PAS les frais de livraison.
 */
export function giftAmountOf(input: { amount?: number | null; extras?: GiftCardExtra[] | null }): number {
  return Number(input.amount || 0) + extrasTotal(input.extras)
}

/**
 * Total à régler = montant du bon + frais de livraison.
 */
export function giftTotalOf(input: {
  amount?: number | null
  extras?: GiftCardExtra[] | null
  deliveryMethod?: string | null
}): number {
  return giftAmountOf(input) + deliveryFeeFor(input.deliveryMethod)
}

/**
 * Sous-ensemble structurel des données du tunnel bon cadeau nécessaires
 * pour construire le body de l'API create-payment-intent. Découple lib/
 * du composant GiftCardData (qui est structurellement compatible).
 */
export interface GiftIntentInput {
  serviceId?: string
  serviceName?: string
  hairLengthLabel?: string
  deliveryMethod?: 'digital' | 'physical'
  amount?: number
  extras?: GiftCardExtra[]
  buyerEmail?: string
  buyerFirstName?: string
  buyerLastName?: string
  buyerPhone?: string
  recipientEmail?: string
  recipientFirstName?: string
  recipientLastName?: string
  recipientPhone?: string
  senderName?: string
  personalMessage?: string
  shippingAddress?: ShippingAddress
  shippingTo?: 'recipient' | 'buyer'
}

/**
 * Construit le corps de requête pour /api/gift-card/create-payment-intent.
 * Source unique utilisée par l'étape Récapitulatif et l'étape Paiement
 * (cette dernière le réutilise pour recréer le PI quand un code promo
 * est appliqué). Le code promo éventuel est ajouté par l'appelant.
 */
export function buildGiftIntentBody(data: GiftIntentInput): Record<string, unknown> {
  const deliveryFee = deliveryFeeFor(data.deliveryMethod)
  const body: Record<string, unknown> = {
    amount: giftTotalOf(data),
    serviceId: data.serviceId ?? '',
    serviceName: data.serviceName ?? 'Bon cadeau libre',
    hairLengthLabel: data.hairLengthLabel ?? '',
    deliveryMethod: data.deliveryMethod ?? 'digital',
    deliveryFee,
    extras: data.extras ?? [],
    buyerEmail: data.buyerEmail ?? '',
    buyerFirstName: data.buyerFirstName ?? '',
    buyerLastName: data.buyerLastName ?? '',
    buyerPhone: data.buyerPhone ?? '',
    recipientEmail: data.recipientEmail ?? '',
    recipientFirstName: data.recipientFirstName ?? '',
    recipientLastName: data.recipientLastName ?? '',
    recipientPhone: data.recipientPhone ?? '',
    senderName: data.senderName ?? '',
    personalMessage: data.personalMessage ?? '',
  }
  if (data.deliveryMethod === 'physical' && data.shippingAddress) {
    body['shippingAddress'] = data.shippingAddress
    body['shippingTo'] = data.shippingTo ?? 'recipient'
  }
  return body
}

/** Formatte un prix en euros (ex: 70 → "70 €", 12.5 → "12,50 €"). */
export function formatEuro(value: number): string {
  const rounded = Math.round(value * 100) / 100
  const isInteger = Number.isInteger(rounded)
  return `${isInteger ? String(rounded) : rounded.toFixed(2).replace('.', ',')} €`
}
