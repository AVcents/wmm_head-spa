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

// ─── Route ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: CapturePaymentBody = await req.json()

    if (!body.bookingId || !body.captureType) {
      return errorJson('bookingId et captureType requis')
    }

    // Récupérer la réservation
    const booking = await getBookingById(body.bookingId)
    if (!booking) {
      return errorJson('Réservation introuvable', 404)
    }

    // Vérifier que c'est bien une empreinte bancaire
    if (booking.payment_mode !== 'hold') {
      return errorJson('Cette réservation n\'a pas d\'empreinte bancaire')
    }

    if (!booking.payment_intent_id) {
      return errorJson('Aucun PaymentIntent associé à cette réservation')
    }

    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.retrieve(booking.payment_intent_id)

    // Vérifier le statut
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

    const originalAmount = paymentIntent.amount // En centimes
    const metadata = paymentIntent.metadata ?? {}
    const fullPrice = parseFloat(metadata['fullPrice'] ?? '0') * 100 // En centimes
    const penalty30 = parseFloat(metadata['penalty30'] ?? '0')
    const penalty80 = parseFloat(metadata['penalty80'] ?? '0')

    let amountToCapture = originalAmount
    let newStatus: 'confirmed' | 'cancelled' | 'no_show' = 'confirmed'

    switch (body.captureType) {
      case 'full':
        // Capturer 100% du prix (le client est venu)
        amountToCapture = fullPrice
        newStatus = 'confirmed'
        break

      case 'penalty_30':
        // Annulation tardive → 30% de pénalité
        amountToCapture = penalty30
        newStatus = 'cancelled'
        break

      case 'penalty_80':
        // No-show → 80% de pénalité
        amountToCapture = penalty80
        newStatus = 'no_show'
        break

      default:
        return errorJson('Type de capture invalide')
    }

    // Capturer le montant
    const captured = await stripe.paymentIntents.capture(paymentIntent.id, {
      amount_to_capture: Math.round(amountToCapture),
    })

    // Mettre à jour le statut de la réservation
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
