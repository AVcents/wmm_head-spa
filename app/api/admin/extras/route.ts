import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getExtrasAdmin, createExtra, updateExtra, deleteExtra } from '@/lib/data'

function errorJson(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

async function checkAuth() {
  const auth = await isAuthenticated()
  if (!auth) return errorJson('Non autorisé', 401)
  return null
}

// GET /api/admin/extras — Tous les extras (admin)
export async function GET() {
  const authError = await checkAuth()
  if (authError) return authError
  try {
    const extras = await getExtrasAdmin()
    return NextResponse.json(extras)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/extras — Créer un extra
export async function POST(req: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const { name, description, price, is_active, sort_order } = body
    if (!name || price == null) return errorJson('name et price sont requis')
    const extra = await createExtra({
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      price: Number(price),
      is_active: is_active !== false,
      sort_order: Number(sort_order ?? 0),
    })
    if (!extra) return errorJson('Erreur lors de la création', 500)
    return NextResponse.json(extra, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/admin/extras — Modifier un extra
export async function PUT(req: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return errorJson('id requis')
    const ok = await updateExtra(id, {
      ...(updates.name != null ? { name: String(updates.name).trim() } : {}),
      ...(updates.description !== undefined ? { description: updates.description ? String(updates.description).trim() : null } : {}),
      ...(updates.price != null ? { price: Number(updates.price) } : {}),
      ...(updates.is_active != null ? { is_active: Boolean(updates.is_active) } : {}),
      ...(updates.sort_order != null ? { sort_order: Number(updates.sort_order) } : {}),
    })
    if (!ok) return errorJson('Erreur lors de la mise à jour', 500)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/extras — Supprimer un extra
export async function DELETE(req: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError
  try {
    const { id } = await req.json()
    if (!id) return errorJson('id requis')
    const ok = await deleteExtra(id)
    if (!ok) return errorJson('Erreur lors de la suppression', 500)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
  }
}
