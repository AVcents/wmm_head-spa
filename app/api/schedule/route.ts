import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import {
  getAllScheduleTemplates,
  getActiveTemplateId,
  setActiveTemplate,
  createScheduleTemplate,
} from '@/lib/data'

export async function GET() {
  try {
    const auth = await isAuthenticated()
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const [templates, activeTemplateId] = await Promise.all([
      getAllScheduleTemplates(),
      getActiveTemplateId(),
    ])

    return NextResponse.json({ templates, activeTemplateId })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await isAuthenticated()
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, label, sortOrder, hours } = body as {
      id: string
      label: string
      sortOrder: number
      hours: Array<{ day_label: string; hours: string; sort_order: number }>
    }

    if (!id || !label) {
      return NextResponse.json({ error: 'id et label requis' }, { status: 400 })
    }

    const created = await createScheduleTemplate(id, label, sortOrder ?? 99, hours ?? [])
    if (!created) {
      return NextResponse.json({ error: 'Erreur création du planning' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await isAuthenticated()
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { templateId } = await request.json()

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID requis' }, { status: 400 })
    }

    // 1. Mettre à jour le template actif dans Supabase
    const success = await setActiveTemplate(templateId)
    if (!success) {
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
