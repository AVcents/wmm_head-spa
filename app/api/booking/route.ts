// ============================================
// app/api/booking/route.ts
// API publique de réservation — sans Hapio
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateSlots } from '@/lib/slots'
import { invalidateSlotsCache } from '@/lib/data'
import { cancelBooking } from '@/lib/supabase/bookings'

function errorJson(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

// ──────────────────────────────────────────────────────────────────
// GET /api/booking?action=slots&serviceId=X&variantId=Y&date=YYYY-MM-DD
// ──────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const action = searchParams.get('action')

    if (action !== 'slots') {
      return errorJson('Action invalide. Utiliser : slots')
    }

    const serviceId = searchParams.get('serviceId')
    const variantId = searchParams.get('variantId') ?? null
    const date = searchParams.get('date')
    const extrasDurationParam = searchParams.get('extrasDuration')

    if (!serviceId || !date) {
      return errorJson('serviceId et date sont requis')
    }

    // Validation format date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorJson('date doit être au format YYYY-MM-DD')
    }

    // ── Résoudre la durée depuis Supabase ──────────────────────────
    const supabase = createAdminClient()
    let baseDuration: number
    const extrasDuration = extrasDurationParam ? parseInt(extrasDurationParam, 10) : 0

    if (variantId) {
      const { data: variant } = await supabase
        .from('service_variants')
        .select('duration')
        .eq('id', variantId)
        .single()

      if (!variant) return errorJson('Variant introuvable', 404)
      baseDuration = (variant as { duration: number }).duration
    } else {
      const { data: service } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single()

      if (!service || !(service as { duration: number | null }).duration) {
        return errorJson('Service introuvable ou sans durée définie', 404)
      }
      baseDuration = (service as { duration: number }).duration
    }

    // Durée totale = durée du service + durée des extras
    const duration = baseDuration + extrasDuration

    // ── Générer les créneaux ───────────────────────────────────────
    // Clé de cache : variantId si présent (durée spécifique), sinon serviceId
    const cacheKey = variantId ?? serviceId
    const slots = await generateSlots(cacheKey, duration, date, false)

    return NextResponse.json(slots)
  } catch (error) {
    console.error('[booking GET]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// ──────────────────────────────────────────────────────────────────
// DELETE /api/booking — Annuler une réservation (public, post-confirmation)
// ──────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookingId, cacheKey, date } = body

    if (!bookingId) {
      return errorJson('bookingId requis')
    }

    const cancelled = await cancelBooking(bookingId)
    if (!cancelled) {
      return errorJson('Erreur lors de l\'annulation', 500)
    }

    // Invalider le cache si on dispose du cacheKey et de la date
    if (cacheKey && date) {
      invalidateSlotsCache(String(cacheKey), String(date)).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[booking DELETE]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur annulation' },
      { status: 500 }
    )
  }
}
