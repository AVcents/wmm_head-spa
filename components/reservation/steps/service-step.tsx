'use client'

import { useState } from 'react'
import { Clock, Euro, ChevronDown, ChevronUp } from 'lucide-react'
import type { Service } from '@/lib/services-data'

interface Props {
  services: Service[]
  selected: Service | null
  selectedVariantId: string | null
  onSelect: (service: Service, variantId: string | null) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  'headspa-japonais': 'Head Spa Japonais',
  'headspa-holistique': 'Head Spa Holistique',
  massage: 'Massage',
}

export function ServiceStep({ services, selected, selectedVariantId, onSelect }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Grouper par catégorie
  const categories = [...new Set(services.map((s) => s.category))]

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
        Choisissez votre prestation
      </h2>

      {categories.map((cat) => (
        <div key={cat} className="mb-8">
          <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-4">
            {CATEGORY_LABELS[cat] ?? cat}
          </h3>

          <div className="space-y-3">
            {services
              .filter((s) => s.category === cat)
              .map((service) => {
                const isExpanded = expandedId === service.id

                if (!service.hasVariants) {
                  // Service simple — clic direct
                  return (
                    <button
                      key={service.id}
                      onClick={() => onSelect(service, null)}
                      className={`
                        w-full text-left p-5 rounded-2xl border-2 transition-all
                        ${selected?.id === service.id && !selectedVariantId
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-border bg-surface hover:border-primary-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-serif font-semibold text-foreground mb-1">
                            {service.name}
                          </h4>
                          <p className="text-sm text-foreground-secondary line-clamp-2">
                            {service.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {service.price}€
                          </div>
                          <div className="flex items-center gap-1 text-sm text-foreground-muted mt-1">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration} min
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                }

                // Service avec variantes — expand pour choisir
                return (
                  <div
                    key={service.id}
                    className={`
                      rounded-2xl border-2 transition-all overflow-hidden
                      ${selected?.id === service.id
                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
                        : 'border-border bg-surface'
                      }
                    `}
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : service.id)}
                      className="w-full text-left p-5 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-serif font-semibold text-foreground mb-1">
                            {service.name}
                          </h4>
                          <p className="text-sm text-foreground-secondary line-clamp-2">
                            {service.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {service.variants && service.variants.length > 0 && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                {Math.min(...service.variants.map((v) => v.price))}€ —{' '}
                                {Math.max(...service.variants.map((v) => v.price))}€
                              </div>
                            </div>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-foreground-muted" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-foreground-muted" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && service.variants && (
                      <div className="px-5 pb-5 space-y-2">
                        <div className="h-px bg-border mb-3" />
                        {service.variants.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => onSelect(service, variant.id)}
                            className={`
                              w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left
                              ${selectedVariantId === variant.id
                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-border/60 bg-background hover:border-primary-300'
                              }
                            `}
                          >
                            <div>
                              <span className="font-medium text-foreground">
                                {variant.hairLengthLabel}
                              </span>
                              <div className="flex items-center gap-1 text-sm text-foreground-muted mt-1">
                                <Clock className="h-3.5 w-3.5" />
                                {variant.duration} min
                              </div>
                            </div>
                            <div className="text-xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                              <Euro className="h-4 w-4" />
                              {variant.price}€
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )
}
