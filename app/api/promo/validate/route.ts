// ============================================
// app/api/promo/validate/route.ts
// Aperçu public d'un code promo au checkout.
// Recalcule le total depuis la DB (jamais le montant client) puis applique
// le code. NE consomme PAS le code (used_count inchangé) — c'est une preview.
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { computeBookingTotal, applyPromoToTotal } from '@/lib/pricing'

interface ValidateBody {
  code: string
  serviceId: string
  variantId?: string | null
  extraIds?: string[]
}

export async function POST(req: NextRequest) {
  try {
    const body: ValidateBody = await req.json()

    if (!body.code || !body.code.trim()) {
      return NextResponse.json({ error: 'Code promo requis' }, { status: 400 })
    }
    if (!body.serviceId) {
      return NextResponse.json({ error: 'Prestation requise' }, { status: 400 })
    }

    // Total réel recalculé serveur (anti-manipulation)
    const baseTotal = await computeBookingTotal({
      serviceId: body.serviceId,
      variantId: body.variantId ?? null,
      extraIds: Array.isArray(body.extraIds) ? body.extraIds : [],
    })

    const result = await applyPromoToTotal(body.code, baseTotal)

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error ?? 'Code promo invalide' },
        { status: 200 }
      )
    }

    return NextResponse.json({
      valid: true,
      code: result.code,
      baseTotal,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[promo/validate]', message)
    return NextResponse.json({ error: 'Erreur de validation du code' }, { status: 500 })
  }
}
