'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Mail, Package, ChevronLeft } from 'lucide-react'
import { GiftCardData } from '../gift-card-wizard'

interface DeliveryStepProps {
  data: GiftCardData
  onNext: (data: Partial<GiftCardData>) => void
  onBack: () => void
}

const deliveryOptions = [
  {
    value: 'digital' as const,
    icon: Mail,
    title: 'Version numérique',
    description: 'Envoi immédiat par email',
    features: [
      'Réception instantanée',
      'Aucun frais de livraison',
      'Écologique',
      'Parfait pour un cadeau de dernière minute',
    ],
    price: 'Gratuit',
  },
  {
    value: 'physical' as const,
    icon: Package,
    title: 'Version papier',
    description: 'Bon cadeau imprimé et envoyé par courrier',
    features: [
      'Carte cadeau élégante',
      'Enveloppe premium',
      'Message manuscrit disponible',
      'Livraison sous 2-3 jours ouvrés',
    ],
    price: '+5€',
  },
]

export function DeliveryStep({ data, onNext, onBack }: DeliveryStepProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<'digital' | 'physical' | null>(
    data.deliveryMethod || null
  )

  const handleNext = () => {
    if (selectedDelivery) {
      onNext({ deliveryMethod: selectedDelivery })
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
          Mode de livraison
        </h2>
        <p className="text-foreground-secondary">
          Comment souhaitez-vous recevoir votre bon cadeau ?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {deliveryOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedDelivery === option.value
          return (
            <button
              key={option.value}
              onClick={() => setSelectedDelivery(option.value)}
              className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-border bg-background hover:border-primary-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/40">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    {option.description}
                  </p>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <Check className="h-4 w-4 text-primary-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-border">
                <span className="text-lg font-bold text-primary-600">
                  {option.price}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-between gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={onBack}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Retour
        </Button>
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!selectedDelivery}
          className="w-full sm:w-auto"
        >
          Continuer
        </Button>
      </div>
    </div>
  )
}
