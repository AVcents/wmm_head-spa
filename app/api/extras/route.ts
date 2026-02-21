import { NextRequest, NextResponse } from 'next/server'
import { getExtras, getExtrasForService } from '@/lib/data'

// GET /api/extras                      → tous les extras actifs
// GET /api/extras?serviceId=xxx        → extras actifs liés à cette prestation
export async function GET(req: NextRequest) {
  try {
    const serviceId = req.nextUrl.searchParams.get('serviceId')

    const extras = serviceId
      ? await getExtrasForService(serviceId)
      : await getExtras()

    return NextResponse.json(extras)
  } catch (error) {
    console.error('[/api/extras GET]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
