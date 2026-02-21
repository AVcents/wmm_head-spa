import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import {
  updateScheduleHours,
  updateScheduleTemplateMeta,
  deleteScheduleTemplate,
  getActiveTemplateId,
} from '@/lib/data'

// PUT /api/schedule/[id] — Modifier les heures (et le label) d'un template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await isAuthenticated()
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { label, hours } = body as {
      label?: string
      hours: Array<{ day_label: string; hours: string; sort_order: number }>
    }

    if (!hours || !Array.isArray(hours)) {
      return NextResponse.json({ error: 'Champ hours requis' }, { status: 400 })
    }

    // Renommer si un label est fourni
    if (label) {
      const renamed = await updateScheduleTemplateMeta(id, label)
      if (!renamed) {
        return NextResponse.json({ error: 'Erreur lors du renommage' }, { status: 500 })
      }
    }

    // Remplacer les heures
    const updated = await updateScheduleHours(id, hours)
    if (!updated) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour des heures' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/schedule/[id] — Supprimer un template (interdit si actif)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await isAuthenticated()
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    // Refuser la suppression du template actif
    const activeId = await getActiveTemplateId()
    if (id === activeId) {
      return NextResponse.json(
        { error: 'Impossible de supprimer le planning actuellement actif' },
        { status: 400 }
      )
    }

    const deleted = await deleteScheduleTemplate(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
