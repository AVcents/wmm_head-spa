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
import { ChevronLeft, Lock } from 'lucide-react'
import { GiftCardData } from '../gift-card-wizard'

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
  const deliveryFee = data.deliveryMethod === 'physical' ? 5 : 0
  const totalAmount = (data.amount ?? 0) + deliveryFee

  if (!data.clientSecret) {
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
      <div className="mb-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 flex justify-between items-center">
        <span className="text-sm font-medium text-foreground-secondary">Total à régler</span>
        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {totalAmount}€
        </span>
      </div>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: data.clientSecret,
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
          totalAmount={totalAmount}
          onSuccess={() => onNext({})}
          onBack={onBack}
        />
      </Elements>

      {/* Badge sécurité */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-foreground-secondary">
        <Lock className="h-3 w-3" />
        <span>Paiement 100% sécurisé · Powered by Stripe</span>
      </div>
    </div>
  )
}
