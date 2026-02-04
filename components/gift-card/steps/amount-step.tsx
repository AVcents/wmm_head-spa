'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Clock, Sparkles } from 'lucide-react'
import { GiftCardData } from '../gift-card-wizard'
import { services, Service } from '@/lib/services-data'

interface AmountStepProps {
  data: GiftCardData
  onNext: (data: Partial<GiftCardData>) => void
  onBack: () => void
}

export function AmountStep({ data, onNext }: AmountStepProps) {
  const [selectedService, setSelectedService] = useState<string | null>(
    data.serviceId || null
  )

  const handleNext = () => {
    if (selectedService) {
      const service = services.find((s) => s.id === selectedService)
      if (service) {
        const nextData: Partial<GiftCardData> = {
          serviceId: service.id,
          serviceName: service.name,
        }

        // Only add serviceDuration if it's defined
        if (service.duration !== undefined) {
          nextData.serviceDuration = service.duration
        }

        // Only add amount if service has no variants and price is defined
        if (!service.hasVariants && service.price !== undefined) {
          nextData.amount = service.price
        }

        onNext(nextData)
      }
    }
  }

  const getPriceDisplay = (service: Service) => {
    if (!service.hasVariants) {
      return `${service.price}€`
    }
    if (service.variants) {
      const prices = service.variants.map((v) => v.price)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      if (minPrice === maxPrice) {
        return `${minPrice}€`
      }
      return `${minPrice}€ - ${maxPrice}€`
    }
    return ''
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
          Choisissez votre prestation
        </h2>
        <p className="text-foreground-secondary">
          Sélectionnez le soin que vous souhaitez offrir
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {services.map((service) => {
          const isSelected = selectedService === service.id
          return (
            <button
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={`relative p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                  : 'border-border bg-background hover:border-primary-300'
              }`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Header with category badge */}
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 bg-surface dark:bg-background px-3 py-1 rounded-full mb-3">
                  <Sparkles className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                  <span className="text-xs font-medium text-foreground-secondary">
                    {service.category}
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                  {service.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration} minutes</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-foreground-secondary leading-relaxed mb-4">
                {service.description}
              </p>

              {/* Variants info if applicable */}
              {service.hasVariants && (
                <div className="mb-4 p-3 rounded-lg bg-surface/50 dark:bg-background/50 border border-border/50">
                  <p className="text-xs text-foreground-secondary">
                    Prix selon longueur de cheveux (courts, mi-longs, longs)
                  </p>
                </div>
              )}

              {/* Price */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {getPriceDisplay(service)}
                  </span>
                  {service.hasVariants && (
                    <span className="text-sm text-foreground-secondary">
                      / pers.
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!selectedService}
          className="w-full sm:w-auto"
        >
          Continuer
        </Button>
      </div>
    </div>
  )
}
