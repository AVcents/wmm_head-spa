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
import type { PromoCodeRow } from '@/lib/supabase/types'

// ─── Types ──────────────────────────────────────────────────────

export interface BookingPriceInput {
  serviceId: string
  variantId?: string | null
  extraIds?: string[]
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
  const extraIds = (input.extraIds ?? []).filter(Boolean)
  if (extraIds.length > 0) {
    const { data: extras, error } = await supabase
      .from('extras')
      .select('price')
      .in('id', extraIds)
      .eq('is_active', true)
    if (error) {
      throw new Error('Erreur de lecture des extras')
    }
    extrasTotal = (extras ?? []).reduce(
      (sum, e) => sum + Number((e as { price: number }).price),
      0
    )
  }

  return round2(servicePrice + extrasTotal)
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
