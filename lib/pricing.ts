// ============================================
// lib/pricing.ts
// Calcul AUTORITAIRE du prix d'une réservation, côté serveur.
//
// Principe de sécurité : le montant facturé ne doit JAMAIS dépendre d'une
// valeur envoyée par le navigateur. On relit les prix réels (prestation,
// variante, extras) depuis Supabase, puis on applique le code promo.
// Utilisé par /api/promo/validate, /api/booking/create-intent et
// /api/booking/confirm pour garantir le même résultat partout.
// ============================================

import { createAdminClient } from '@/lib/supabase/admin'
import { GIFT_CARD_DELIVERY_FEE } from '@/lib/gift-card'
import type { PromoCodeRow } from '@/lib/supabase/types'

// ─── Types ──────────────────────────────────────────────────────

export interface BookingPriceInput {
  serviceId: string
  variantId?: string | null
  extraIds?: string[]
}

export interface GiftCardPriceInput {
  serviceId?: string | null
  variantId?: string | null
  extraIds?: string[]
  deliveryMethod?: string | null
}

export interface GiftCardPrice {
  /** Valeur faciale du bon = prestation + options (hors livraison) */
  giftAmount: number
  /** Frais d'expédition (bon papier uniquement) */
  deliveryFee: number
  /** Total réellement dû par l'acheteur */
  total: number
}

export interface PromoResult {
  valid: boolean
  /** Remise appliquée en euros (0 si invalide), plafonnée au total */
  discountAmount: number
  /** Total après remise (= baseTotal si invalide) */
  finalAmount: number
  /** Code normalisé (MAJUSCULES) si valide */
  code?: string
  /** Message d'erreur destiné au client si invalide */
  error?: string
}

// ─── Arrondi monétaire ──────────────────────────────────────────

/** Arrondit à 2 décimales (évite les artefacts flottants type 39.599999) */
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

// ─── Total de base (prestation + extras) depuis la DB ───────────

/**
 * Recalcule le total réel d'une réservation à partir des prix stockés.
 * Lève une erreur si la prestation/variante est introuvable.
 */
export async function computeBookingTotal(
  input: BookingPriceInput
): Promise<number> {
  const supabase = createAdminClient()

  // Prix de la prestation : variante prioritaire, sinon prix de base du service
  let servicePrice: number | null = null

  if (input.variantId) {
    const { data: variant, error } = await supabase
      .from('service_variants')
      .select('price, service_id')
      .eq('id', input.variantId)
      .single()
    if (error || !variant) {
      throw new Error('Variante de prestation introuvable')
    }
    const v = variant as { price: number; service_id: string }
    if (v.service_id !== input.serviceId) {
      throw new Error('Variante incohérente avec la prestation')
    }
    servicePrice = Number(v.price)
  } else {
    const { data: service, error } = await supabase
      .from('services')
      .select('price')
      .eq('id', input.serviceId)
      .single()
    if (error || !service) {
      throw new Error('Prestation introuvable')
    }
    servicePrice = Number((service as { price: number | null }).price ?? 0)
  }

  // Prix des extras : on relit les prix réels des extras actifs sélectionnés
  let extrasTotal = 0
  const extraIds = [...new Set((input.extraIds ?? []).filter(Boolean))]
  if (extraIds.length > 0) {
    const { data: extras, error } = await supabase
      .from('extras')
      .select('id, price')
      .in('id', extraIds)
      .eq('is_active', true)
    if (error) {
      throw new Error('Erreur de lecture des extras')
    }
    // Une option désactivée (ou inexistante) ne doit PAS disparaître
    // silencieusement du total : sinon le client la reçoit sans la payer.
    if ((extras ?? []).length !== extraIds.length) {
      throw new Error('Une option sélectionnée n\'est plus disponible')
    }
    extrasTotal = (extras ?? []).reduce(
      (sum, e) => sum + Number((e as { price: number }).price),
      0
    )
  }

  return round2(servicePrice + extrasTotal)
}

// ─── Durée de base d'une réservation depuis la DB ───────────────

/**
 * Recalcule la durée réelle d'une réservation (prestation + extras).
 *
 * Pendant du prix : le créneau envoyé par le navigateur ne doit pas faire
 * foi. Sans ce contrôle, une réservation peut bloquer 75 min d'agenda tout
 * en n'ayant payé que 60 min de prestation (et inversement, sous-bloquer
 * l'agenda et faire déborder sur le rendez-vous suivant).
 */
export async function computeBookingDuration(
  input: BookingPriceInput
): Promise<number> {
  const supabase = createAdminClient()

  let baseDuration: number
  if (input.variantId) {
    const { data: variant, error } = await supabase
      .from('service_variants')
      .select('duration, service_id')
      .eq('id', input.variantId)
      .single()
    if (error || !variant) {
      throw new Error('Variante de prestation introuvable')
    }
    const v = variant as { duration: number; service_id: string }
    if (v.service_id !== input.serviceId) {
      throw new Error('Variante incohérente avec la prestation')
    }
    baseDuration = Number(v.duration)
  } else {
    const { data: service, error } = await supabase
      .from('services')
      .select('duration')
      .eq('id', input.serviceId)
      .single()
    if (error || !service) {
      throw new Error('Prestation introuvable')
    }
    baseDuration = Number((service as { duration: number | null }).duration ?? 0)
  }

  let extrasDuration = 0
  const extraIds = [...new Set((input.extraIds ?? []).filter(Boolean))]
  if (extraIds.length > 0) {
    const { data: extras, error } = await supabase
      .from('extras')
      .select('id, duration')
      .in('id', extraIds)
      .eq('is_active', true)
    if (error) {
      throw new Error('Erreur de lecture des extras')
    }
    if ((extras ?? []).length !== extraIds.length) {
      throw new Error('Une option sélectionnée n\'est plus disponible')
    }
    extrasDuration = (extras ?? []).reduce(
      (sum, e) => sum + Number((e as { duration: number | null }).duration ?? 0),
      0
    )
  }

  return baseDuration + extrasDuration
}

// ─── Total d'un bon cadeau depuis la DB ─────────────────────────

/**
 * Recalcule le montant d'un bon cadeau à partir des prix stockés.
 * Même principe que computeBookingTotal : le navigateur ne fixe jamais
 * le prix, il ne fait que l'afficher.
 *
 * Un service à variantes EXIGE un variantId — sans lui on ne peut pas
 * connaître le tarif, et accepter le montant du client rouvrirait la faille.
 */
export async function computeGiftCardTotal(
  input: GiftCardPriceInput
): Promise<GiftCardPrice> {
  // NOTE : le bon cadeau à montant libre (service_id NULL) n'existe pas
  // encore. Le jour où il arrivera, c'est ici qu'il faudra brancher une
  // validation de fourchette plutôt qu'un refus sec.
  if (!input.serviceId) {
    throw new Error('Prestation requise pour calculer le montant du bon cadeau')
  }

  const supabase = createAdminClient()
  const { data: service, error } = await supabase
    .from('services')
    .select('has_variants')
    .eq('id', input.serviceId)
    .single()

  if (error || !service) {
    throw new Error('Prestation introuvable')
  }

  const hasVariants = Boolean((service as { has_variants: boolean }).has_variants)
  if (hasVariants && !input.variantId) {
    throw new Error('Longueur de cheveux requise pour cette prestation')
  }
  if (!hasVariants && input.variantId) {
    throw new Error('Variante incohérente avec la prestation')
  }

  const giftAmount = await computeBookingTotal({
    serviceId: input.serviceId,
    variantId: input.variantId ?? null,
    extraIds: input.extraIds ?? [],
  })

  const deliveryFee =
    input.deliveryMethod === 'physical' ? GIFT_CARD_DELIVERY_FEE : 0

  return {
    giftAmount,
    deliveryFee,
    total: round2(giftAmount + deliveryFee),
  }
}

// ─── Application d'un code promo ────────────────────────────────

/**
 * Valide un code promo et calcule la remise sur un total donné.
 * Ne modifie PAS le compteur d'utilisation (voir increment_promo_usage).
 * Renvoie toujours un PromoResult exploitable (valid=false si refusé).
 */
export async function applyPromoToTotal(
  rawCode: string,
  baseTotal: number
): Promise<PromoResult> {
  const fallback: PromoResult = {
    valid: false,
    discountAmount: 0,
    finalAmount: round2(baseTotal),
  }

  const code = rawCode.trim().toUpperCase()
  if (!code) {
    return { ...fallback, error: 'Code promo vide' }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (error || !data) {
    return { ...fallback, error: 'Code promo invalide' }
  }

  const promo = data as PromoCodeRow

  if (!promo.is_active) {
    return { ...fallback, error: 'Ce code promo n\'est plus actif' }
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { ...fallback, error: 'Ce code promo a expiré' }
  }

  if (promo.max_uses != null && promo.used_count >= promo.max_uses) {
    return { ...fallback, error: 'Ce code promo a atteint sa limite d\'utilisation' }
  }

  if (baseTotal < Number(promo.min_amount)) {
    return {
      ...fallback,
      error: `Ce code est valable à partir de ${Number(promo.min_amount)}€ d'achat`,
    }
  }

  // Calcul de la remise
  let discount =
    promo.discount_type === 'percentage'
      ? (baseTotal * Number(promo.discount_value)) / 100
      : Number(promo.discount_value)

  // La remise ne peut jamais dépasser le total ni rendre le total négatif
  discount = round2(Math.min(discount, baseTotal))
  const finalAmount = round2(baseTotal - discount)

  return {
    valid: true,
    discountAmount: discount,
    finalAmount,
    code: promo.code,
  }
}

/**
 * Incrémente atomiquement le compteur d'usage d'un code promo.
 * Renvoie true si l'incrément a réussi (code encore valide), false sinon.
 * S'appuie sur la fonction SQL increment_promo_usage (anti-race).
 */
export async function incrementPromoUsage(code: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('increment_promo_usage', {
      promo_code_input: code,
    })
    if (error) {
      console.error('[pricing] incrementPromoUsage:', error.message)
      return false
    }
    return Number(data) > 0
  } catch (e) {
    console.error('[pricing] incrementPromoUsage:', e)
    return false
  }
}
