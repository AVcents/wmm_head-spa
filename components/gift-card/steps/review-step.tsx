'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Check, Mail, Package, Gift } from 'lucide-react'
import { GiftCardData } from '../gift-card-wizard'
import { deliveryFeeFor, extrasTotal, giftAmountOf, giftTotalOf, formatEuro } from '@/lib/gift-card'

interface ReviewStepProps {
  data: GiftCardData
  onNext: (data: Partial<GiftCardData>) => void
  onBack: () => void
}

export function ReviewStep({ data, onNext, onBack }: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const deliveryFee = deliveryFeeFor(data.deliveryMethod)
  const giftAmount = giftAmountOf(data)        // prestation + extras (valeur du bon)
  const extrasSum = extrasTotal(data.extras)
  const totalAmount = giftTotalOf(data)        // bon + frais de livraison
  const selectedExtras = data.extras ?? []

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/gift-card/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          serviceId: data.serviceId ?? '',
          serviceName: data.serviceName ?? 'Bon cadeau libre',
          hairLengthLabel: data.hairLengthLabel ?? '',
          deliveryMethod: data.deliveryMethod ?? 'digital',
          deliveryFee,
          extras: selectedExtras,
          buyerEmail: data.buyerEmail ?? '',
          buyerFirstName: data.buyerFirstName ?? '',
          buyerLastName: data.buyerLastName ?? '',
          buyerPhone: data.buyerPhone ?? '',
          recipientEmail: data.recipientEmail ?? '',
          recipientFirstName: data.recipientFirstName ?? '',
          recipientLastName: data.recipientLastName ?? '',
          recipientPhone: data.recipientPhone ?? '',
          senderName: data.senderName ?? '',
          personalMessage: data.personalMessage ?? '',
          ...(data.deliveryMethod === 'physical' && data.shippingAddress
            ? { shippingAddress: data.shippingAddress, shippingTo: data.shippingTo ?? 'recipient' }
            : {}),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erreur serveur')
      }
      const { clientSecret, paymentIntentId } = await res.json()
      onNext({ clientSecret, paymentIntentId })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[ReviewStep]', msg)
      alert(`Erreur : ${msg}`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
          Récapitulatif de votre commande
        </h2>
        <p className="text-foreground-secondary">
          Vérifiez les informations avant de finaliser votre commande
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Gift Card Details */}
        <div className="p-6 rounded-xl bg-background border border-border">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/40">
              <Gift className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Bon cadeau
              </h3>
              <div className="space-y-1 text-sm text-foreground-secondary">
                {data.serviceName && (
                  <>
                    <p>
                      <span className="font-medium">Prestation :</span> {data.serviceName}
                    </p>
                    {data.serviceDuration && (
                      <p>
                        <span className="font-medium">Durée :</span> {data.serviceDuration} minutes
                      </p>
                    )}
                    {data.hairLengthLabel && (
                      <p>
                        <span className="font-medium">Longueur :</span> {data.hairLengthLabel}
                      </p>
                    )}
                  </>
                )}
                {selectedExtras.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border space-y-1">
                    <p className="font-medium text-foreground">Options :</p>
                    {selectedExtras.map((extra) => (
                      <p key={extra.id} className="flex justify-between">
                        <span>+ {extra.name}</span>
                        <span>+{formatEuro(Number(extra.price))}</span>
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                  {formatEuro(giftAmount)}
                </p>
                {extrasSum > 0 && (
                  <p className="text-xs text-foreground-secondary">
                    Prestation {formatEuro(data.amount || 0)} + options {formatEuro(extrasSum)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="p-6 rounded-xl bg-background border border-border">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/40">
              {data.deliveryMethod === 'digital' ? (
                <Mail className="h-6 w-6 text-primary-600" />
              ) : (
                <Package className="h-6 w-6 text-primary-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Mode de livraison
              </h3>
              <p className="text-sm text-foreground-secondary">
                {data.deliveryMethod === 'digital'
                  ? 'Version numérique - Envoi par email'
                  : 'Version papier - Envoi par courrier'}
              </p>
              <p className="text-sm font-medium text-foreground mt-2">
                {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee}€`}
              </p>
            </div>
          </div>
        </div>

        {/* Recipient Info */}
        <div className="p-6 rounded-xl bg-background border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Destinataire
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Nom :</span>
              <span className="text-foreground font-medium">
                {data.recipientFirstName} {data.recipientLastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Email :</span>
              <span className="text-foreground font-medium">{data.recipientEmail}</span>
            </div>
            {data.recipientPhone && (
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Téléphone :</span>
                <span className="text-foreground font-medium">{data.recipientPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Personal Message */}
        {(data.personalMessage || data.senderName) && (
          <div className="p-6 rounded-xl bg-background border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Message personnalisé
            </h3>
            {data.senderName && (
              <p className="text-sm text-foreground-secondary mb-2">
                De la part de : <span className="font-medium text-foreground">{data.senderName}</span>
              </p>
            )}
            {data.personalMessage && (
              <p className="text-sm text-foreground-secondary italic bg-surface p-4 rounded-lg border border-border">
                &ldquo;{data.personalMessage}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Buyer Info */}
        <div className="p-6 rounded-xl bg-background border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Vos informations
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Nom :</span>
              <span className="text-foreground font-medium">
                {data.buyerFirstName} {data.buyerLastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Email :</span>
              <span className="text-foreground font-medium">{data.buyerEmail}</span>
            </div>
            {data.buyerPhone && (
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Téléphone :</span>
                <span className="text-foreground font-medium">{data.buyerPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address for Physical */}
        {data.deliveryMethod === 'physical' && data.shippingAddress && (
          <div className="p-6 rounded-xl bg-background border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Adresse de livraison
            </h3>
            <div className="text-sm text-foreground-secondary">
              <p className="font-medium text-foreground mb-2">
                {data.shippingTo === 'recipient'
                  ? `${data.recipientFirstName} ${data.recipientLastName}`
                  : `${data.buyerFirstName} ${data.buyerLastName}`}
              </p>
              <p>{data.shippingAddress.street}</p>
              <p>
                {data.shippingAddress.postalCode} {data.shippingAddress.city}
              </p>
              <p>{data.shippingAddress.country}</p>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="p-6 rounded-xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-600">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {formatEuro(totalAmount)}
            </span>
          </div>
          {deliveryFee > 0 && (
            <p className="text-sm text-foreground-secondary mt-2">
              Montant du bon : {formatEuro(giftAmount)} + Frais de livraison : {formatEuro(deliveryFee)}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Retour
        </Button>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            'Préparation du paiement...'
          ) : (
            <>
              <Check className="mr-2 h-5 w-5" />
              Procéder au paiement
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
