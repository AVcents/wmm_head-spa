'use client'

import { useState, useCallback } from 'react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import {
  CreditCard,
  Shield,
  Gift,
  Lock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Clock,
  Euro,
  Info,
} from 'lucide-react'
import type { BookingState, PaymentMode } from '../reservation-content'

// Stripe singleton
const stripePromise = loadStripe(
  process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']!
)

// ---------- Types ----------

interface Props {
  booking: BookingState
  onConfirm: (
    bookingId: string,
    paymentMode: PaymentMode,
    paymentIntentId: string | null,
    amountPaid: number
  ) => void
  onBack: () => void
}

interface IntentResponse {
  clientSecret?: string
  paymentIntentId?: string
  paymentType: 'stripe' | 'gift_card_full' | 'gift_card_partial'
  remainingAmount?: number
  giftCardValid?: boolean
  error?: string
}

// ---------- Helpers ----------

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateFr(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// -----------------------------------------------
// Formulaire Stripe interne (enfant de <Elements>)
// -----------------------------------------------
function StripeCheckoutForm({
  amount,
  buttonLabel,
  onSuccess,
  disabled,
}: {
  amount: number
  buttonLabel: string
  onSuccess: (paymentIntentId: string) => void
  disabled: boolean
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/reservation?payment=success`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message ?? 'Une erreur est survenue.')
      setIsProcessing(false)
    } else if (paymentIntent) {
      // Pour hold: status sera 'requires_capture'
      // Pour direct: status sera 'succeeded'
      if (
        paymentIntent.status === 'succeeded' ||
        paymentIntent.status === 'requires_capture'
      ) {
        onSuccess(paymentIntent.id)
      } else {
        setErrorMessage(
          'Le paiement n\'a pas pu être finalisé. Veuillez réessayer.'
        )
        setIsProcessing(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || disabled}
        className="w-full py-4 rounded-xl bg-primary-600 text-white font-semibold text-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            {buttonLabel} — {amount}€
          </>
        )}
      </button>
    </form>
  )
}

// -----------------------------------------------
// PaymentStep principal
// -----------------------------------------------
export function PaymentStep({ booking, onConfirm, onBack }: Props) {
  const [selectedMode, setSelectedMode] = useState<PaymentMode | null>(null)
  const [cgvAccepted, setCgvAccepted] = useState(false)
  const [giftCardCode, setGiftCardCode] = useState('')
  const [giftCardStatus, setGiftCardStatus] = useState<
    'idle' | 'loading' | 'valid_full' | 'valid_partial' | 'error'
  >('idle')
  const [giftCardError, setGiftCardError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [_paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [remainingAmount, setRemainingAmount] = useState<number | null>(null)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [confirmingBooking, setConfirmingBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const variant = booking.variantId
    ? booking.service?.variants?.find((v) => v.id === booking.variantId)
    : null

  const price = variant?.price ?? booking.service?.price ?? 0
  const extrasTotal = (booking.selectedExtras ?? []).reduce(
    (sum, e) => sum + Number(e.price),
    0
  )
  const totalPrice = price + extrasTotal

  // Créer un intent Stripe (pour hold ou direct)
  const createStripeIntent = useCallback(
    async (mode: 'hold' | 'direct') => {
      setLoadingIntent(true)
      setError(null)
      setClientSecret(null)
      setPaymentIntentId(null)

      try {
        const res = await fetch('/api/booking/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: mode,
            amount: totalPrice,
            serviceId: booking.service?.id ?? '',
            clientName: booking.clientInfo?.name ?? '',
            clientEmail: booking.clientInfo?.email ?? '',
            hapioServiceId: booking.hapioServiceId ?? '',
            hapioLocationId: booking.hapioLocationId ?? '',
            startsAt: booking.slot?.startsAt ?? '',
            endsAt: booking.slot?.endsAt ?? '',
            resourceId: booking.slot?.resourceId,
            serviceName: booking.service?.name ?? '',
          }),
        })

        const data: IntentResponse = await res.json()

        if (!res.ok || data.error) {
          throw new Error(data.error ?? 'Erreur lors de la création du paiement')
        }

        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          setPaymentIntentId(data.paymentIntentId ?? null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setLoadingIntent(false)
      }
    },
    [booking, totalPrice]
  )

  // Sélection du mode de paiement
  const handleModeSelect = (mode: PaymentMode) => {
    setSelectedMode(mode)
    setError(null)
    setClientSecret(null)
    setPaymentIntentId(null)
    setGiftCardStatus('idle')
    setGiftCardError(null)
    setRemainingAmount(null)

    if (mode === 'hold' || mode === 'direct') {
      void createStripeIntent(mode)
    }
  }

  // Valider le bon cadeau
  const validateGiftCard = async () => {
    if (!giftCardCode.trim()) return

    setGiftCardStatus('loading')
    setGiftCardError(null)
    setClientSecret(null)
    setPaymentIntentId(null)
    setRemainingAmount(null)

    try {
      const res = await fetch('/api/booking/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'gift_card',
          amount: totalPrice,
          giftCardCode: giftCardCode.trim(),
          serviceId: booking.service?.id ?? '',
          clientName: booking.clientInfo?.name ?? '',
          clientEmail: booking.clientInfo?.email ?? '',
          hapioServiceId: booking.hapioServiceId ?? '',
          hapioLocationId: booking.hapioLocationId ?? '',
          startsAt: booking.slot?.startsAt ?? '',
          endsAt: booking.slot?.endsAt ?? '',
          resourceId: booking.slot?.resourceId,
          serviceName: booking.service?.name ?? '',
        }),
      })

      const data: IntentResponse = await res.json()

      if (!res.ok || data.error) {
        setGiftCardStatus('error')
        setGiftCardError(data.error ?? 'Code invalide')
        return
      }

      if (data.paymentType === 'gift_card_full') {
        setGiftCardStatus('valid_full')
      } else if (data.paymentType === 'gift_card_partial') {
        setGiftCardStatus('valid_partial')
        setRemainingAmount(data.remainingAmount ?? 0)
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          setPaymentIntentId(data.paymentIntentId ?? null)
        }
      }
    } catch (err) {
      setGiftCardStatus('error')
      setGiftCardError(
        err instanceof Error ? err.message : 'Erreur de validation'
      )
    }
  }

  // Confirmer la réservation (appelé après succès Stripe ou directement pour bon cadeau complet)
  const confirmBooking = async (
    mode: PaymentMode,
    piId: string | null,
    amountPaid: number
  ) => {
    setConfirmingBooking(true)
    setError(null)

    try {
      const res = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: piId,
          giftCardCode:
            mode === 'gift_card' ? giftCardCode.trim() : undefined,
          hapioServiceId: booking.hapioServiceId,
          hapioLocationId: booking.hapioLocationId,
          startsAt: booking.slot?.startsAt,
          endsAt: booking.slot?.endsAt,
          resourceId: booking.slot?.resourceId,
          clientName: booking.clientInfo?.name,
          clientEmail: booking.clientInfo?.email,
          clientPhone: booking.clientInfo?.phone,
          message: booking.clientInfo?.message,
          serviceName: booking.service?.name,
          variantName: variant?.hairLengthLabel,
          price: totalPrice,
          extras: (booking.selectedExtras ?? []).map((e) => ({
            name: e.name,
            price: e.price,
          })),
          extrasTotal,
          paymentMode: mode,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Erreur lors de la confirmation')
      }

      onConfirm(data.bookingId, mode, piId, amountPaid)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setConfirmingBooking(false)
    }
  }

  // Succès du paiement Stripe
  const handleStripeSuccess = (piId: string) => {
    const amountPaid =
      selectedMode === 'hold'
        ? 0
        : selectedMode === 'gift_card'
          ? (remainingAmount ?? 0)
          : totalPrice
    void confirmBooking(selectedMode!, piId, amountPaid)
  }

  // Confirmer avec bon cadeau complet (pas de Stripe)
  const handleGiftCardFullConfirm = () => {
    void confirmBooking('gift_card', null, 0)
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all'

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
        Paiement
      </h2>

      {/* Récapitulatif */}
      <div className="bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 rounded-2xl p-5 mb-8">
        <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-3">
          Récapitulatif
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary">Prestation</span>
            <span className="font-medium text-foreground">
              {booking.service?.name}
              {variant ? ` — ${variant.hairLengthLabel}` : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Date
            </span>
            <span className="font-medium text-foreground capitalize">
              {booking.date ? formatDateFr(booking.date) : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Heure
            </span>
            <span className="font-medium text-foreground">
              {booking.slot ? formatTime(booking.slot.startsAt) : ''}
            </span>
          </div>
          <div className="h-px bg-primary-200 dark:bg-primary-800/30 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary flex items-center gap-1.5">
              <Euro className="h-4 w-4" /> Prestation
            </span>
            <span className="font-medium text-foreground">{price}€</span>
          </div>
          {(booking.selectedExtras ?? []).length > 0 && (
            <>
              {(booking.selectedExtras ?? []).map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <span className="text-foreground-secondary text-sm">+ {e.name}</span>
                  <span className="font-medium text-foreground text-sm">+{Number(e.price).toFixed(2)}€</span>
                </div>
              ))}
              <div className="h-px bg-primary-200 dark:bg-primary-800/30 my-1" />
            </>
          )}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              {totalPrice}€
            </span>
          </div>
        </div>
      </div>

      {/* Acceptation des CGV */}
      <div className={`flex items-start gap-3 mb-8 p-4 rounded-xl border-2 transition-colors cursor-pointer ${
        cgvAccepted
          ? 'border-primary-400 bg-primary-50/40 dark:bg-primary-900/10'
          : 'border-border bg-surface'
      }`}
        onClick={() => setCgvAccepted((v) => !v)}
      >
        <div className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          cgvAccepted
            ? 'border-primary-600 bg-primary-600'
            : 'border-foreground-muted bg-transparent'
        }`}>
          {cgvAccepted && (
            <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <p className="text-sm text-foreground-secondary leading-relaxed select-none">
          J&apos;ai lu et j&apos;accepte les{' '}
          <a
            href="/cgv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            conditions générales de vente
          </a>{' '}
          de Kalm Headspa. Je reconnais avoir pris connaissance des modalités de la prestation et de la politique d&apos;annulation.
        </p>
      </div>

      {/* Sélection du mode de paiement */}
      <div className="space-y-3 mb-8">
        <h3 className="text-lg font-medium text-foreground">
          Comment souhaitez-vous régler ?
        </h3>

        {/* Option 1 — Empreinte bancaire */}
        <button
          type="button"
          onClick={() => handleModeSelect('hold')}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
            selectedMode === 'hold'
              ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
              : 'border-border hover:border-primary-300 bg-surface'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedMode === 'hold'
                  ? 'border-primary-600'
                  : 'border-foreground-muted'
              }`}
            >
              {selectedMode === 'hold' && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary-600" />
                <span className="font-medium text-foreground">
                  Empreinte bancaire (paiement sur place)
                </span>
              </div>
              <p className="text-sm text-foreground-secondary mt-1">
                Votre carte ne sera pas débitée. Vous payez en salon le jour du rendez-vous.
              </p>
              {selectedMode === 'hold' && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium mb-1">Politique d&apos;annulation</p>
                      <ul className="space-y-1 text-xs">
                        <li>Annulation à plus de 24h : aucun frais</li>
                        <li>Annulation à moins de 24h : 30% du montant ({Math.round(totalPrice * 0.30)}€)</li>
                        <li>Absence sans prévenir : 80% du montant ({Math.round(totalPrice * 0.80)}€)</li>
                      </ul>
                      <p className="mt-2 text-xs italic">
                        En confirmant, vous acceptez cette politique d&apos;annulation et autorisez
                        le prélèvement des pénalités le cas échéant.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Option 2 — Paiement direct */}
        <button
          type="button"
          onClick={() => handleModeSelect('direct')}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
            selectedMode === 'direct'
              ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
              : 'border-border hover:border-primary-300 bg-surface'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedMode === 'direct'
                  ? 'border-primary-600'
                  : 'border-foreground-muted'
              }`}
            >
              {selectedMode === 'direct' && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary-600" />
                <span className="font-medium text-foreground">
                  Paiement immédiat par carte — {totalPrice}€
                </span>
              </div>
              <p className="text-sm text-foreground-secondary mt-1">
                Réglez la totalité maintenant par carte bancaire.
              </p>
            </div>
          </div>
        </button>

        {/* Option 3 — Bon cadeau */}
        <button
          type="button"
          onClick={() => handleModeSelect('gift_card')}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
            selectedMode === 'gift_card'
              ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
              : 'border-border hover:border-primary-300 bg-surface'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedMode === 'gift_card'
                  ? 'border-primary-600'
                  : 'border-foreground-muted'
              }`}
            >
              {selectedMode === 'gift_card' && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary-600" />
                <span className="font-medium text-foreground">
                  J&apos;ai un bon cadeau
                </span>
              </div>
              <p className="text-sm text-foreground-secondary mt-1">
                Utilisez votre code bon cadeau pour cette réservation.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Zone bon cadeau */}
      {selectedMode === 'gift_card' && (
        <div className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={giftCardCode}
              onChange={(e) => {
                setGiftCardCode(e.target.value.toUpperCase())
                if (giftCardStatus !== 'idle') {
                  setGiftCardStatus('idle')
                  setGiftCardError(null)
                }
              }}
              placeholder="Code bon cadeau (ex: KH-XXXXXX)"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => void validateGiftCard()}
              disabled={
                !giftCardCode.trim() || giftCardStatus === 'loading'
              }
              className="px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              {giftCardStatus === 'loading' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Valider'
              )}
            </button>
          </div>

          {/* Résultat validation */}
          {giftCardStatus === 'error' && giftCardError && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {giftCardError}
            </div>
          )}

          {giftCardStatus === 'valid_full' && (
            <div className="mt-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Bon cadeau valide — La prestation est entièrement couverte.
            </div>
          )}

          {giftCardStatus === 'valid_partial' && remainingAmount !== null && (
            <div className="mt-3 space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-200 text-sm flex items-start gap-2">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Bon cadeau valide, mais il reste <strong>{remainingAmount}€</strong> à régler par carte.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formulaire Stripe (si nécessaire) */}
      {clientSecret &&
        (selectedMode === 'hold' ||
          selectedMode === 'direct' ||
          (selectedMode === 'gift_card' &&
            giftCardStatus === 'valid_partial')) && (
          <div className="mb-6">
            {loadingIntent ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                <span className="ml-2 text-foreground-secondary">
                  Chargement du formulaire de paiement...
                </span>
              </div>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#b36d52',
                      colorBackground: '#ffffff',
                      borderRadius: '8px',
                      fontFamily: 'Arial, sans-serif',
                    },
                  },
                  locale: 'fr',
                }}
              >
                <StripeCheckoutForm
                  amount={
                    selectedMode === 'hold'
                      ? Math.round(totalPrice * 0.80)
                      : selectedMode === 'gift_card'
                        ? (remainingAmount ?? 0)
                        : totalPrice
                  }
                  buttonLabel={
                    selectedMode === 'hold'
                      ? 'Confirmer l\'empreinte'
                      : 'Payer'
                  }
                  onSuccess={handleStripeSuccess}
                  disabled={!cgvAccepted || confirmingBooking}
                />
              </Elements>
            )}
          </div>
        )}

      {/* Bouton confirmer avec bon cadeau complet (pas de Stripe) */}
      {selectedMode === 'gift_card' && giftCardStatus === 'valid_full' && (
        <button
          type="button"
          onClick={handleGiftCardFullConfirm}
          disabled={!cgvAccepted || confirmingBooking}
          className="w-full py-4 rounded-xl bg-primary-600 text-white font-semibold text-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {confirmingBooking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Confirmation en cours...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Confirmer la réservation
            </>
          )}
        </button>
      )}

      {/* Loading intent */}
      {loadingIntent && !clientSecret && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          <span className="ml-2 text-foreground-secondary">
            Préparation du paiement...
          </span>
        </div>
      )}

      {/* Confirming booking overlay */}
      {confirmingBooking && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
          <span className="ml-2 text-foreground-secondary">
            Finalisation de votre réservation...
          </span>
        </div>
      )}

      {/* Erreur globale */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Badge sécurité */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-foreground-secondary">
        <Lock className="h-3 w-3" />
        <span>Paiement 100% sécurisé · Powered by Stripe</span>
      </div>

      {/* Retour */}
      <button
        type="button"
        onClick={onBack}
        className="mt-4 flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors mx-auto"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux options
      </button>
    </div>
  )
}
