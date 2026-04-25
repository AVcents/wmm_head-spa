import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getBookingById, updateBookingStatus } from '@/lib/supabase/bookings'

// ─── Types ──────────────────────────────────────────────────────────

interface CapturePaymentBody {
  bookingId: string
  captureType: 'full' | 'penalty_30' | 'penalty_80' | 'cancel'
}

// ─── Helpers ────────────────────────────────────────────────────────

function errorJson(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

// Les metadata ont pu être stockées en euros (anciens PI) ou en centimes
// (format actuel). Un nombre < 500 correspond forcément à des euros — un prix
// Head Spa plancher dépasse largement 5€.
function metaToCents(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback
  const n = parseFloat(raw)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return n < 500 ? Math.round(n * 100) : Math.round(n)
}

// ─── Route ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: CapturePaymentBody = await req.json()

    if (!body.bookingId || !body.captureType) {
      return errorJson('bookingId et captureType requis')
    }

    const booking = await getBookingById(body.bookingId)
    if (!booking) {
      return errorJson('Réservation introuvable', 404)
    }

    if (booking.payment_mode !== 'hold') {
      return errorJson('Cette réservation n\'a pas d\'empreinte bancaire')
    }

    if (!booking.payment_intent_id) {
      return errorJson('Aucun PaymentIntent associé à cette réservation')
    }

    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.retrieve(booking.payment_intent_id)

    if (paymentIntent.status !== 'requires_capture') {
      return errorJson(
        `Impossible de capturer : statut actuel = ${paymentIntent.status}`,
        400
      )
    }

    // ═══════════════════════════════════════════════════════════════
    // Option 1 : Annuler et libérer les fonds
    // ═══════════════════════════════════════════════════════════════
    if (body.captureType === 'cancel') {
      await stripe.paymentIntents.cancel(paymentIntent.id)
      await updateBookingStatus(booking.id, 'cancelled')

      return NextResponse.json({
        success: true,
        message: 'Paiement annulé et fonds libérés',
        cancelled: true,
      })
    }

    // ═══════════════════════════════════════════════════════════════
    // Option 2, 3, 4 : Capturer tout ou partie
    // ═══════════════════════════════════════════════════════════════

    const holdAmount = paymentIntent.amount // centimes autorisés, borne max
    const metadata   = paymentIntent.metadata ?? {}
    const fullPrice  = metaToCents(metadata['fullPrice'], holdAmount)
    const penalty30  = metaToCents(metadata['penalty30'], Math.round(fullPrice * 0.30))
    const penalty80  = metaToCents(metadata['penalty80'], Math.round(fullPrice * 0.80))

    let amountToCapture: number
    let newStatus: 'confirmed' | 'cancelled' | 'no_show'

    switch (body.captureType) {
      case 'full':
        amountToCapture = fullPrice
        newStatus = 'confirmed'
        break

      case 'penalty_30':
        amountToCapture = penalty30
        newStatus = 'cancelled'
        break

      case 'penalty_80':
        amountToCapture = penalty80
        newStatus = 'no_show'
        break

      default:
        return errorJson('Type de capture invalide')
    }

    // Ne jamais dépasser le montant autorisé — évite amount_too_large
    // (rétrocompat pour anciens PI qui autorisaient seulement 80%)
    amountToCapture = Math.min(amountToCapture, holdAmount)

    if (amountToCapture < 50) {
      return errorJson('Montant à capturer inférieur au minimum Stripe (0,50€)')
    }

    const captured = await stripe.paymentIntents.capture(paymentIntent.id, {
      amount_to_capture: amountToCapture,
    })

    await updateBookingStatus(booking.id, newStatus)

    return NextResponse.json({
      success: true,
      message: `Paiement capturé : ${(amountToCapture / 100).toFixed(2)}€`,
      captured: true,
      amountCaptured: amountToCapture / 100,
      newStatus,
      paymentIntentId: captured.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[capture-payment]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
