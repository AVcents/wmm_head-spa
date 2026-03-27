'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Check, Plus, Minus, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Extra {
  id: string
  name: string
  description: string | null
  price: number
  duration: number // Durée supplémentaire en minutes
}

interface Props {
  selectedExtras: Extra[]
  serviceId?: string
  onNext: (extras: Extra[]) => void
  onBack?: () => void
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ExtrasStep({ selectedExtras: initialExtras, serviceId, onNext, onBack }: Props) {
  const [extras, setExtras] = useState<Extra[]>([])
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialExtras.map((e) => e.id))
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchExtras() {
      try {
        const url = serviceId
          ? `/api/extras?serviceId=${encodeURIComponent(serviceId)}`
          : '/api/extras'
        const res = await fetch(url)
        if (!res.ok) throw new Error('Erreur de chargement')
        const data: Extra[] = await res.json()
        setExtras(data)
      } catch {
        setError('Impossible de charger les options supplémentaires.')
      } finally {
        setLoading(false)
      }
    }
    void fetchExtras()
  }, [serviceId])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedList = extras.filter((e) => selected.has(e.id))
  const totalExtras = selectedList.reduce((sum, e) => sum + Number(e.price), 0)

  const handleNext = () => {
    onNext(selectedList)
  }

  return (
    <div>
      <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
        Options supplémentaires
      </h2>
      <p className="text-foreground-secondary mb-8">
        Personnalisez votre soin avec des options à la carte. Vous pouvez passer cette étape.
      </p>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-3" />
          <p className="text-foreground-secondary text-sm">Chargement des options…</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-error/10 border border-error/20 text-error mb-8">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && extras.length === 0 && (
        <div className="text-center py-12 mb-8">
          <Sparkles className="h-10 w-10 text-foreground-muted/30 mx-auto mb-3" />
          <p className="text-foreground-secondary text-sm">Aucune option disponible pour le moment.</p>
        </div>
      )}

      {!loading && !error && extras.length > 0 && (
        <div className="space-y-3 mb-8">
          {extras.map((extra) => {
            const isSelected = selected.has(extra.id)
            return (
              <button
                key={extra.id}
                type="button"
                onClick={() => toggle(extra.id)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                    : 'border-border bg-surface hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox custom */}
                  <div
                    className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-foreground-muted/40 bg-transparent'
                    }`}
                  >
                    {isSelected ? (
                      <Minus className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-foreground-muted/60" />
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isSelected ? 'text-foreground' : 'text-foreground'}`}>
                      {extra.name}
                    </p>
                    {extra.description && (
                      <p className="text-sm text-foreground-secondary mt-0.5">{extra.description}</p>
                    )}
                    {extra.duration > 0 && (
                      <p className="text-xs text-foreground-muted mt-1">+{extra.duration} min</p>
                    )}
                  </div>

                  {/* Prix */}
                  <span className={`text-lg font-bold flex-shrink-0 ${
                    isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-foreground'
                  }`}>
                    +{Number(extra.price).toFixed(2)}€
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Sous-total extras si sélection */}
      {selected.size > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-secondary">
              {selected.size} option{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}
            </span>
            <span className="font-bold text-primary-600 dark:text-primary-400">
              +{totalExtras.toFixed(2)}€
            </span>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-border text-foreground font-semibold text-base hover:bg-background transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary-600 text-white font-semibold text-base hover:bg-primary-700 transition-colors"
        >
          {selected.size > 0 ? (
            <>
              <Check className="h-4 w-4" />
              Continuer avec {selected.size} option{selected.size > 1 ? 's' : ''}
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              Continuer sans option
            </>
          )}
        </button>
      </div>
    </div>
  )
}
