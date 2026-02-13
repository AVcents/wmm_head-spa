import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import {
  getServicesAdmin,
  updateService,
  createService,
  deleteService,
  upsertVariants,
} from '@/lib/data'

export async function GET() {
  try {
    const auth = await isAuthenticated()
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const services = await getServicesAdmin()
    return NextResponse.json(services)
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
    const { variants, ...serviceData } = body

    const success = await createService(serviceData)
    if (!success) {
      return NextResponse.json({ error: 'Erreur création' }, { status: 500 })
    }

    if (variants?.length > 0) {
      await upsertVariants(serviceData.id, variants)
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

    const body = await request.json()
    const { id, variants, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const success = await updateService(id, updates)
    if (!success) {
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }

    if (variants !== undefined) {
      await upsertVariants(id, variants)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await isAuthenticated()
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const success = await deleteService(id)
    if (!success) {
      return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
