import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import {
  getPromoCodesAdmin,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} from '@/lib/data'
import type { PromoCodeRow } from '@/lib/supabase/types'

type PromoUpdate = Partial<Omit<PromoCodeRow, 'id' | 'used_count' | 'created_at' | 'updated_at'>>

function errorJson(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

async function checkAuth() {
  const auth = await isAuthenticated()
  if (!auth) return errorJson('Non autorisé', 401)
  return null
}

// Normalise et valide les champs communs (POST/PUT)
type DiscountParse =
  | { error: string }
  | { discount_type: 'percentage' | 'fixed'; discount_value: number }

function parseDiscount(body: Record<string, unknown>): DiscountParse {
  const discountType = body['discount_type']
  if (discountType !== 'percentage' && discountType !== 'fixed') {
    return { error: 'Type de remise invalide (percentage ou fixed)' }
  }
  const value = Number(body['discount_value'])
  if (isNaN(value) || value < 0) {
    return { error: 'Valeur de remise invalide' }
  }
  if (discountType === 'percentage' && value > 100) {
    return { error: 'Un pourcentage ne peut pas dépasser 100' }
  }
  return { discount_type: discountType, discount_value: value }
}

// GET /api/admin/promo-codes — Liste
export async function GET() {
  const authError = await checkAuth()
  if (authError) return authError
  try {
    const codes = await getPromoCodesAdmin()
    return NextResponse.json(codes)
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : 'Erreur serveur', 500)
  }
}

// POST /api/admin/promo-codes — Créer
export async function POST(req: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    if (!code) return errorJson('Le code est requis')

    const discount = parseDiscount(body)
    if ('error' in discount) return errorJson(discount.error)

    const maxUses =
      body.max_uses == null || body.max_uses === ''
        ? null
        : Number(body.max_uses)
    if (maxUses != null && (isNaN(maxUses) || maxUses < 1)) {
      return errorJson('Nombre d\'utilisations invalide')
    }

    const created = await createPromoCode({
      code,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      min_amount: Number(body.min_amount ?? 0),
      max_uses: maxUses,
      expires_at: body.expires_at ? String(body.expires_at) : null,
      is_active: body.is_active !== false,
    })

    if (!created) {
      return errorJson('Impossible de créer le code (le code existe peut-être déjà)', 409)
    }
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : 'Erreur serveur', 500)
  }
}

// PUT /api/admin/promo-codes — Modifier
export async function PUT(req: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const { id } = body
    if (!id) return errorJson('id requis')

    const updates: PromoUpdate = {}
    if (body.code != null) updates.code = String(body.code).trim()
    if (body.discount_type != null || body.discount_value != null) {
      const discount = parseDiscount(body)
      if ('error' in discount) return errorJson(discount.error)
      updates.discount_type = discount.discount_type
      updates.discount_value = discount.discount_value
    }
    if (body.min_amount != null) updates.min_amount = Number(body.min_amount)
    if (body.max_uses !== undefined) {
      updates.max_uses =
        body.max_uses == null || body.max_uses === '' ? null : Number(body.max_uses)
    }
    if (body.expires_at !== undefined) {
      updates.expires_at = body.expires_at ? String(body.expires_at) : null
    }
    if (body.is_active != null) updates.is_active = Boolean(body.is_active)

    const ok = await updatePromoCode(id, updates)
    if (!ok) return errorJson('Erreur lors de la mise à jour', 500)
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : 'Erreur serveur', 500)
  }
}

// DELETE /api/admin/promo-codes — Supprimer
export async function DELETE(req: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError
  try {
    const { id } = await req.json()
    if (!id) return errorJson('id requis')
    const ok = await deletePromoCode(id)
    if (!ok) return errorJson('Erreur lors de la suppression', 500)
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorJson(error instanceof Error ? error.message : 'Erreur serveur', 500)
  }
}
