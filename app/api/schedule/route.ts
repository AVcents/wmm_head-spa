import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import {
  getAllScheduleTemplates,
  getActiveTemplateId,
  setActiveTemplate,
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

    const success = await setActiveTemplate(templateId)
    if (!success) {
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
