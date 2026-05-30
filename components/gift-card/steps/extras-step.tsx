'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Plus, ChevronLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { GiftCardData } from '../gift-card-wizard'
import type { GiftCardExtra } from '@/lib/gift-card'
import { formatEuro } from '@/lib/gift-card'

interface ExtrasStepProps {
  data: GiftCardData
  onNext: (data: Partial<GiftCardData>) => void
  onBack: () => void
}

interface ExtraOption {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
}

export function ExtrasStep({ data, onNext, onBack }: ExtrasStepProps) {
  const serviceId = data.serviceId
  const [extras, setExtras] = useState<ExtraOption[]>([])
  const [selected, setSelected] = useState<Set<string>>(
    new Set((data.extras ?? []).map((e) => e.id))
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function fetchExtras() {
      try {
        const url = serviceId
          ? `/api/extras?serviceId=${encodeURIComponent(serviceId)}`
          : '/api/extras'
        const res = await fetch(url)
        if (!res.ok) throw new Error('Erreur de chargement')
        const list: ExtraOption[] = await res.json()
        if (active) setExtras(list)
      } catch {
        if (active) setError('Impossible de charger les options supplémentaires.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void fetchExtras()
    return () => {
      active = false
    }
  }, [serviceId])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedList: GiftCardExtra[] = extras
    .filter((e) => selected.has(e.id))
    .map((e) => ({ id: e.id, name: e.name, price: Number(e.price) }))

  const total = selectedList.reduce((sum, e) => sum + e.price, 0)

  const handleNext = () => {
    onNext({ extras: selectedList })
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
          Options supplémentaires
        </h2>
        <p className="text-foreground-secondary">
          Enrichissez le bon cadeau avec des options à la carte. Leur montant s&apos;ajoute
          à la valeur du bon. Cette étape est facultative.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-3" />
          <p className="text-foreground-secondary text-sm">Chargement des options…</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-5 rounded-xl bg-error/10 border border-error/20 text-error mb-8">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && extras.length === 0 && (
        <div className="text-center py-12 mb-8">
          <Sparkles className="h-10 w-10 text-foreground-muted/30 mx-auto mb-3" />
          <p className="text-foreground-secondary text-sm">
            Aucune option disponible pour cette prestation.
          </p>
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
                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-border bg-background hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-6 w-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-foreground-muted/40 bg-transparent'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-foreground-muted/60" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{extra.name}</p>
                    {extra.description && (
                      <p className="text-sm text-foreground-secondary mt-0.5">
                        {extra.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={`text-lg font-bold flex-shrink-0 ${
                      isSelected
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-foreground'
                    }`}
                  >
                    +{formatEuro(Number(extra.price))}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/40">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-secondary">
              {selected.size} option{selected.size > 1 ? 's' : ''} sélectionnée
              {selected.size > 1 ? 's' : ''}
            </span>
            <span className="font-bold text-primary-600 dark:text-primary-400">
              +{formatEuro(total)}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between gap-4">
        <Button size="lg" variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-5 w-5" />
          Retour
        </Button>
        <Button size="lg" onClick={handleNext} className="w-full sm:w-auto">
          {selected.size > 0
            ? `Continuer avec ${selected.size} option${selected.size > 1 ? 's' : ''}`
            : 'Continuer sans option'}
        </Button>
      </div>
    </div>
  )
}
