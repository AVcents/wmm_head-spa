import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import {
  getPlanningOverrides,
  getAllScheduleTemplates,
  getActiveTemplateId,
  getMondayOf,
  upsertPlanningOverride,
  deletePlanningOverride,
} from '@/lib/data'

// GET /api/planning — liste les overrides + templates disponibles
export async function GET(_req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const [overrides, templates, activeTemplateId] = await Promise.all([
      getPlanningOverrides(),
      getAllScheduleTemplates(),
      getActiveTemplateId(),
    ])

    return NextResponse.json({ overrides, templates, activeTemplateId })
  } catch (err) {
    console.error('[planning GET] Erreur inattendue:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/planning — créer ou mettre à jour un override (PAS de sync Hapio auto)
export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json() as {
      week_start: string
      type: 'closed' | 'template' | 'custom'
      template_id?: string | null
      custom_hours?: Array<{ day_label: string; hours: string; sort_order: number }> | null
      label?: string | null
    }

    if (!body.week_start || !body.type) {
      return NextResponse.json({ error: 'week_start et type sont requis' }, { status: 400 })
    }

    // Normaliser : s'assurer que week_start est bien un lundi
    const monday = getMondayOf(new Date(body.week_start))
    if (monday !== body.week_start) {
      console.warn(`[planning] week_start ${body.week_start} n'est pas un lundi, corrigé en ${monday}`)
    }

    const success = await upsertPlanningOverride({
      week_start: monday,
      type: body.type,
      template_id: body.template_id ?? null,
      custom_hours: body.custom_hours ?? null,
      label: body.label ?? null,
    })

    if (!success) {
      return NextResponse.json({
        error: 'Erreur lors de la sauvegarde. Vérifiez que la table planning_overrides existe dans Supabase.',
      }, { status: 500 })
    }

    // Pas de sync Hapio — l'utilisateur synchronise manuellement via le bouton
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[planning POST] Erreur inattendue:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/planning — supprimer un override (PAS de sync Hapio auto)
export async function DELETE(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const weekStart = searchParams.get('week_start')
    if (!weekStart) {
      return NextResponse.json({ error: 'week_start requis' }, { status: 400 })
    }

    const success = await deletePlanningOverride(weekStart)
    if (!success) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[planning DELETE] Erreur inattendue:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
