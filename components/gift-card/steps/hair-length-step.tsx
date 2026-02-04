'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, ChevronLeft, Clock, Euro } from 'lucide-react'
import { GiftCardData } from '../gift-card-wizard'
import { services } from '@/lib/services-data'

interface HairLengthStepProps {
  data: GiftCardData
  onNext: (data: Partial<GiftCardData>) => void
  onBack: () => void
}

export function HairLengthStep({ data, onNext, onBack }: HairLengthStepProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  const service = services.find((s) => s.id === data.serviceId)

  if (!service || !service.hasVariants || !service.variants) {
    // Si pas de variantes, skip cette étape
    onNext({})
    return null
  }

  const handleNext = () => {
    if (selectedVariant) {
      const variant = service.variants?.find((v) => v.id === selectedVariant)
      if (variant) {
        onNext({
          hairLength: variant.hairLength,
          hairLengthLabel: variant.hairLengthLabel,
          amount: variant.price,
          serviceDuration: variant.duration,
        })
      }
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
          Choisissez la longueur de cheveux
        </h2>
        <p className="text-foreground-secondary mb-4">
          Pour la prestation : <span className="font-medium text-foreground">{service.name}</span>
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {service.variants.map((variant) => {
          const isSelected = selectedVariant === variant.id
          return (
            <button
              key={variant.id}
              onClick={() => setSelectedVariant(variant.id)}
              className={`relative w-full p-6 rounded-xl border-2 transition-all text-left ${
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

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {variant.hairLengthLabel}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-foreground-secondary">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{variant.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Euro className="h-4 w-4" />
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {variant.price}€
                      </span>
                    </div>
                  </div>
                </div>
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
          disabled={!selectedVariant}
          className="w-full sm:w-auto"
        >
          Continuer
        </Button>
      </div>
    </div>
  )
}
