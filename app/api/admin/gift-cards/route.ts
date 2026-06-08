import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/gift-cards — Liste des bons cadeaux vendus
 * Query optionnels : delivery (digital|physical), shipped (true|false), limit
 */
export async function GET(req: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { searchParams } = req.nextUrl
    const supabase = createAdminClient()

    let query = supabase
      .from('gift_cards')
      .select('*')
      .order('created_at', { ascending: false })

    const delivery = searchParams.get('delivery')
    if (delivery === 'digital' || delivery === 'physical') {
      query = query.eq('delivery_method', delivery)
    }

    const limit = searchParams.get('limit')
    query = query.limit(limit ? Number(limit) : 200)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error('[admin/gift-cards GET]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/gift-cards — Mettre à jour un bon
 * Body : { id: string, shipped?: boolean, used?: boolean }
 * - shipped : marquer comme expédié / non expédié (bons papier)
 * - used    : marquer comme utilisé / non utilisé (réservation manuelle)
 */
export async function PATCH(req: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, shipped, used } = body as { id?: string; shipped?: boolean; used?: boolean }

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    const update: Record<string, unknown> = {}
    if (typeof shipped === 'boolean') {
      update['shipped_at'] = shipped ? new Date().toISOString() : null
    }
    if (typeof used === 'boolean') {
      update['used'] = used
      update['used_at'] = used ? new Date().toISOString() : null
      // Réservation manuelle : pas de booking lié dans la BDD
      update['used_booking_id'] = null
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('gift_cards')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('[admin/gift-cards PATCH]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
