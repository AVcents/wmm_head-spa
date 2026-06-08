'use client'

import { useState } from 'react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Lock, Ticket, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { GiftCardData } from '../gift-card-wizard'
import { giftTotalOf, buildGiftIntentBody, formatEuro } from '@/lib/gift-card'

// Initialisation Stripe (singleton)
const stripePromise = loadStripe(
  process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']!
)

interface PaymentStepProps {
  data: GiftCardData
  onNext: (data: Partial<GiftCardData>) => void
  onBack: () => void
}

// -----------------------------------------------
// Formulaire interne (doit être enfant de <Elements>)
// -----------------------------------------------
function CheckoutForm({
  totalAmount,
  onSuccess,
  onBack,
}: {
  totalAmount: number
  onSuccess: () => void
  onBack: () => void
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
        // Pas de redirect — on reste dans l'app
        return_url: `${window.location.origin}/bon-cadeau/commander?success=true`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message ?? 'Une erreur est survenue.')
      setIsProcessing(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess()
    } else {
      setErrorMessage('Le paiement n\'a pas pu être finalisé. Veuillez réessayer.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-between gap-4">
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Retour
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={!stripe || isProcessing}
          className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700"
        >
          <Lock className="mr-2 h-4 w-4" />
          {isProcessing ? 'Traitement...' : `Payer ${totalAmount}€`}
        </Button>
      </div>
    </form>
  )
}

// -----------------------------------------------
// PaymentStep — wrappé dans <Elements>
// -----------------------------------------------
export function PaymentStep({ data, onNext, onBack }: PaymentStepProps) {
  const baseTotal = giftTotalOf(data)

  // clientSecret / montant gérés en état : recréés si un code promo est appliqué
  const [clientSecret, setClientSecret] = useState<string | null>(data.clientSecret ?? null)
  const [chargeAmount, setChargeAmount] = useState<number>(baseTotal)
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string
    discountAmount: number
    finalAmount: number
  } | null>(null)

  // État du champ code promo
  const [promoInput, setPromoInput] = useState('')
  const [promoStatus, setPromoStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [promoError, setPromoError] = useState<string | null>(null)
  // Bon cadeau 100% offert (pas de Stripe)
  const [isFree, setIsFree] = useState(false)
  const [confirmingFree, setConfirmingFree] = useState(false)

  // Applique un code promo : recrée le PaymentIntent au montant remisé
  const applyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoStatus('loading')
    setPromoError(null)
    try {
      const res = await fetch('/api/gift-card/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildGiftIntentBody(data), promoCode: promoInput.trim() }),
      })
      const result = await res.json()
      if (!res.ok || result.error) {
        setPromoStatus('error')
        setPromoError(result.error ?? 'Code promo invalide')
        return
      }
      const code = result.appliedPromo ?? promoInput.trim().toUpperCase()
      // Cas 100% offert : pas de Stripe, on prépare la confirmation directe
      if (result.free) {
        setIsFree(true)
        setChargeAmount(0)
        setAppliedPromo({ code, discountAmount: result.discountAmount ?? baseTotal, finalAmount: 0 })
        setPromoStatus('idle')
        return
      }
      setIsFree(false)
      setClientSecret(result.clientSecret)
      setChargeAmount(result.amount ?? baseTotal)
      setAppliedPromo({
        code,
        discountAmount: result.discountAmount ?? 0,
        finalAmount: result.amount ?? baseTotal,
      })
      setPromoStatus('idle')
    } catch {
      setPromoStatus('error')
      setPromoError('Erreur de validation du code')
    }
  }

  // Retire le code : restaure le PaymentIntent plein tarif initial
  const removePromo = () => {
    setAppliedPromo(null)
    setPromoInput('')
    setPromoStatus('idle')
    setPromoError(null)
    setIsFree(false)
    setClientSecret(data.clientSecret ?? null)
    setChargeAmount(baseTotal)
  }

  // Confirme un bon cadeau 100% offert (création serveur sans Stripe)
  const confirmFree = async () => {
    if (!appliedPromo) return
    setConfirmingFree(true)
    setPromoError(null)
    try {
      const res = await fetch('/api/gift-card/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildGiftIntentBody(data), promoCode: appliedPromo.code, finalize: true }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.error ?? 'Erreur lors de la création du bon cadeau')
      }
      onNext({})
    } catch (err) {
      setConfirmingFree(false)
      setPromoError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  if (!clientSecret) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center">
        <p className="text-foreground-secondary">
          Erreur : session de paiement introuvable. Veuillez revenir en arrière et réessayer.
        </p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ChevronLeft className="mr-2 h-5 w-5" />
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
          Paiement sécurisé
        </h2>
        <p className="text-foreground-secondary">
          Votre paiement est sécurisé par Stripe. Le bon cadeau sera envoyé après confirmation.
        </p>
      </div>

      {/* Récapitulatif montant */}
      <div className="mb-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
        {appliedPromo && (
          <div className="flex justify-between items-center text-success text-sm mb-2">
            <span className="flex items-center gap-1.5">
              <Ticket className="h-4 w-4" /> Code {appliedPromo.code}
            </span>
            <span className="font-medium">−{formatEuro(appliedPromo.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground-secondary">Total à régler</span>
          <span className="flex items-baseline gap-2">
            {appliedPromo && (
              <span className="text-base text-foreground-muted line-through">{formatEuro(baseTotal)}</span>
            )}
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatEuro(chargeAmount)}
            </span>
          </span>
        </div>
      </div>

      {/* Champ code promo */}
      <div className="mb-6">
        {!appliedPromo ? (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value.toUpperCase())
                  if (promoStatus === 'error') {
                    setPromoStatus('idle')
                    setPromoError(null)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void applyPromo()
                  }
                }}
                placeholder="Code promo"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => void applyPromo()}
                disabled={!promoInput.trim() || promoStatus === 'loading'}
                className="px-5 py-2.5 rounded-xl border border-primary-600 text-primary-700 dark:text-primary-300 font-medium text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                {promoStatus === 'loading'
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : 'Appliquer'}
              </button>
            </div>
            {promoStatus === 'error' && promoError && (
              <p className="mt-2 text-sm text-error flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                {promoError}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-success/10 border border-success/20">
            <span className="text-sm text-success flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Code <strong>{appliedPromo.code}</strong> appliqué
            </span>
            <button
              type="button"
              onClick={removePromo}
              className="text-xs text-foreground-secondary hover:text-error underline transition-colors"
            >
              Retirer
            </button>
          </div>
        )}
      </div>

      {isFree ? (
        <div>
          <div className="mb-4 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            Votre code couvre la totalité : ce bon cadeau est offert, aucun paiement n&apos;est nécessaire.
          </div>
          {promoError && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {promoError}
            </div>
          )}
          <div className="flex justify-between gap-4">
            <Button type="button" size="lg" variant="outline" onClick={onBack} disabled={confirmingFree} className="w-full sm:w-auto">
              <ChevronLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => void confirmFree()}
              disabled={confirmingFree}
              className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700"
            >
              {confirmingFree ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Confirmation…</>
              ) : (
                <><CheckCircle2 className="mr-2 h-5 w-5" /> Confirmer le bon cadeau</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Elements
            key={clientSecret}
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
            <CheckoutForm
              totalAmount={chargeAmount}
              onSuccess={() => onNext({})}
              onBack={onBack}
            />
          </Elements>

          {/* Badge sécurité */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-foreground-secondary">
            <Lock className="h-3 w-3" />
            <span>Paiement 100% sécurisé · Powered by Stripe</span>
          </div>
        </>
      )}
    </div>
  )
}
