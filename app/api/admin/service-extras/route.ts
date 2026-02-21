import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getServiceExtrasAdmin, setServiceExtras } from '@/lib/data'

async function checkAuth() {
  const auth = await isAuthenticated()
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  return null
}

// GET /api/admin/service-extras?serviceId=xxx
// → retourne les extra_ids liés à cette prestation (pour l'UI admin)
export async function GET(req: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError

  const serviceId = req.nextUrl.searchParams.get('serviceId')
  if (!serviceId) return NextResponse.json({ error: 'serviceId requis' }, { status: 400 })

  try {
    const links = await getServiceExtrasAdmin(serviceId)
    const extraIds = links.map((l) => l.extra_id)
    return NextResponse.json({ extraIds })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/admin/service-extras
// Body: { serviceId: string, extraIds: string[] }
// → remplace toutes les liaisons extras pour cette prestation
export async function POST(req: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError

  try {
    const { serviceId, extraIds } = await req.json()
    if (!serviceId) return NextResponse.json({ error: 'serviceId requis' }, { status: 400 })
    if (!Array.isArray(extraIds)) return NextResponse.json({ error: 'extraIds (array) requis' }, { status: 400 })

    const ok = await setServiceExtras(serviceId, extraIds as string[])
    if (!ok) return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
