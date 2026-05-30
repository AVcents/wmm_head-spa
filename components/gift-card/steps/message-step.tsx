'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { GiftCardData } from '../gift-card-wizard'
import { GIFT_CARD_MESSAGE_MAX } from '@/lib/gift-card'

interface MessageStepProps {
  data: GiftCardData
  onNext: (data: Partial<GiftCardData>) => void
  onBack: () => void
}

const messageSuggestions = [
  "Joyeux anniversaire ! Profite de ce moment de détente bien mérité. 🎂",
  "Félicitations ! Offre-toi un moment de relaxation pour célébrer. 🎉",
  "Bon rétablissement. Prends soin de toi avec ce moment de bien-être. 💚",
  "Joyeuses fêtes ! Un cadeau pour te ressourcer. 🎄",
  "Merci pour tout ! Tu mérites ce moment de détente. 🙏",
]

export function MessageStep({ data, onNext, onBack }: MessageStepProps) {
  const [formData, setFormData] = useState({
    personalMessage: data.personalMessage || '',
    senderName: data.senderName || '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSuggestionClick = (suggestion: string) => {
    setFormData((prev) => ({ ...prev, personalMessage: suggestion }))
  }

  const handleNext = () => {
    onNext(formData)
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
          Message personnalisé
        </h2>
        <p className="text-foreground-secondary">
          Ajoutez un message pour rendre ce cadeau encore plus spécial
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <Label htmlFor="senderName">
            Votre nom <span className="text-foreground-secondary">(optionnel)</span>
          </Label>
          <Input
            id="senderName"
            value={formData.senderName}
            onChange={(e) => handleChange('senderName', e.target.value)}
            placeholder="De la part de..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="personalMessage">
            Votre message <span className="text-foreground-secondary">(optionnel)</span>
          </Label>
          <Textarea
            id="personalMessage"
            value={formData.personalMessage}
            onChange={(e) => handleChange('personalMessage', e.target.value)}
            placeholder="Écrivez votre message personnalisé ici..."
            rows={5}
            maxLength={GIFT_CARD_MESSAGE_MAX}
          />
          <div className="flex justify-between text-sm text-foreground-secondary">
            <span>Maximum {GIFT_CARD_MESSAGE_MAX} caractères</span>
            <span>{formData.personalMessage.length}/{GIFT_CARD_MESSAGE_MAX}</span>
          </div>
        </div>

        {/* Message Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary-600" />
            <span>Suggestions de messages</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {messageSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-3 rounded-lg border border-border bg-background hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-sm text-foreground-secondary"
              >
                {suggestion}
              </button>
            ))}
          </div>
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
