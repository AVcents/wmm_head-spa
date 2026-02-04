'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft } from 'lucide-react'
import { GiftCardData } from '../gift-card-wizard'

interface RecipientStepProps {
  data: GiftCardData
  onNext: (data: Partial<GiftCardData>) => void
  onBack: () => void
}

export function RecipientStep({ data, onNext, onBack }: RecipientStepProps) {
  const [formData, setFormData] = useState({
    recipientFirstName: data.recipientFirstName || '',
    recipientLastName: data.recipientLastName || '',
    recipientEmail: data.recipientEmail || '',
    recipientPhone: data.recipientPhone || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.recipientFirstName.trim()) {
      newErrors.recipientFirstName = 'Le prénom est requis'
    }

    if (!formData.recipientLastName.trim()) {
      newErrors.recipientLastName = 'Le nom est requis'
    }

    if (!formData.recipientEmail.trim()) {
      newErrors.recipientEmail = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      newErrors.recipientEmail = 'Email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext(formData)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
          Informations du destinataire
        </h2>
        <p className="text-foreground-secondary">
          À qui souhaitez-vous offrir ce bon cadeau ?
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="recipientFirstName">
              Prénom <span className="text-red-500">*</span>
            </Label>
            <Input
              id="recipientFirstName"
              value={formData.recipientFirstName}
              onChange={(e) => handleChange('recipientFirstName', e.target.value)}
              placeholder="Marie"
              className={errors.recipientFirstName ? 'border-red-500' : ''}
            />
            {errors.recipientFirstName && (
              <p className="text-sm text-red-500">{errors.recipientFirstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientLastName">
              Nom <span className="text-red-500">*</span>
            </Label>
            <Input
              id="recipientLastName"
              value={formData.recipientLastName}
              onChange={(e) => handleChange('recipientLastName', e.target.value)}
              placeholder="Dupont"
              className={errors.recipientLastName ? 'border-red-500' : ''}
            />
            {errors.recipientLastName && (
              <p className="text-sm text-red-500">{errors.recipientLastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipientEmail">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="recipientEmail"
            type="email"
            value={formData.recipientEmail}
            onChange={(e) => handleChange('recipientEmail', e.target.value)}
            placeholder="marie.dupont@example.com"
            className={errors.recipientEmail ? 'border-red-500' : ''}
          />
          {errors.recipientEmail && (
            <p className="text-sm text-red-500">{errors.recipientEmail}</p>
          )}
          <p className="text-sm text-foreground-secondary">
            Le bon cadeau sera envoyé à cette adresse email
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipientPhone">
            Téléphone <span className="text-foreground-secondary">(optionnel)</span>
          </Label>
          <Input
            id="recipientPhone"
            type="tel"
            value={formData.recipientPhone}
            onChange={(e) => handleChange('recipientPhone', e.target.value)}
            placeholder="06 12 34 56 78"
          />
        </div>
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
        <Button size="lg" onClick={handleNext} className="w-full sm:w-auto">
          Continuer
        </Button>
      </div>
    </div>
  )
}
