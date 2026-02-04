'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, Check } from 'lucide-react'
import { GiftCardData } from '../gift-card-wizard'

interface BuyerStepProps {
  data: GiftCardData
  onNext: (data: Partial<GiftCardData>) => void
  onBack: () => void
}

export function BuyerStep({ data, onNext, onBack }: BuyerStepProps) {
  const isPhysical = data.deliveryMethod === 'physical'

  const [formData, setFormData] = useState({
    buyerFirstName: data.buyerFirstName || '',
    buyerLastName: data.buyerLastName || '',
    buyerEmail: data.buyerEmail || '',
    buyerPhone: data.buyerPhone || '',
    shippingTo: data.shippingTo || ('recipient' as 'recipient' | 'buyer'),
    shippingAddress: data.shippingAddress || {
      street: '',
      city: '',
      postalCode: '',
      country: 'France',
    },
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string | { [key: string]: string }) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, [field]: value },
    }))
    if (errors[`shippingAddress.${field}`]) {
      setErrors((prev) => ({ ...prev, [`shippingAddress.${field}`]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.buyerFirstName.trim()) {
      newErrors.buyerFirstName = 'Le prénom est requis'
    }

    if (!formData.buyerLastName.trim()) {
      newErrors.buyerLastName = 'Le nom est requis'
    }

    if (!formData.buyerEmail.trim()) {
      newErrors.buyerEmail = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
      newErrors.buyerEmail = 'Email invalide'
    }

    // Validate shipping address only for physical delivery
    if (isPhysical) {
      if (!formData.shippingAddress.street.trim()) {
        newErrors['shippingAddress.street'] = 'L\'adresse est requise'
      }
      if (!formData.shippingAddress.postalCode.trim()) {
        newErrors['shippingAddress.postalCode'] = 'Le code postal est requis'
      }
      if (!formData.shippingAddress.city.trim()) {
        newErrors['shippingAddress.city'] = 'La ville est requise'
      }
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
          Vos informations
        </h2>
        <p className="text-foreground-secondary">
          {isPhysical
            ? 'Nous avons besoin de vos coordonnées pour la livraison'
            : 'Nous avons besoin de votre email pour confirmer votre commande'}
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Buyer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="buyerFirstName">
              Prénom <span className="text-red-500">*</span>
            </Label>
            <Input
              id="buyerFirstName"
              value={formData.buyerFirstName}
              onChange={(e) => handleChange('buyerFirstName', e.target.value)}
              placeholder="Jean"
              className={errors.buyerFirstName ? 'border-red-500' : ''}
            />
            {errors.buyerFirstName && (
              <p className="text-sm text-red-500">{errors.buyerFirstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyerLastName">
              Nom <span className="text-red-500">*</span>
            </Label>
            <Input
              id="buyerLastName"
              value={formData.buyerLastName}
              onChange={(e) => handleChange('buyerLastName', e.target.value)}
              placeholder="Martin"
              className={errors.buyerLastName ? 'border-red-500' : ''}
            />
            {errors.buyerLastName && (
              <p className="text-sm text-red-500">{errors.buyerLastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyerEmail">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="buyerEmail"
            type="email"
            value={formData.buyerEmail}
            onChange={(e) => handleChange('buyerEmail', e.target.value)}
            placeholder="jean.martin@example.com"
            className={errors.buyerEmail ? 'border-red-500' : ''}
          />
          {errors.buyerEmail && (
            <p className="text-sm text-red-500">{errors.buyerEmail}</p>
          )}
          <p className="text-sm text-foreground-secondary">
            Vous recevrez la confirmation de commande à cette adresse
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyerPhone">
            Téléphone <span className="text-foreground-secondary">(optionnel)</span>
          </Label>
          <Input
            id="buyerPhone"
            type="tel"
            value={formData.buyerPhone}
            onChange={(e) => handleChange('buyerPhone', e.target.value)}
            placeholder="06 12 34 56 78"
          />
        </div>

        {/* Physical Delivery Address */}
        {isPhysical && (
          <>
            <div className="pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Adresse de livraison
              </h3>

              {/* Shipping To Choice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleChange('shippingTo', 'recipient')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.shippingTo === 'recipient'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-border bg-background hover:border-primary-300'
                  }`}
                >
                  {formData.shippingTo === 'recipient' && (
                    <div className="flex justify-end mb-2">
                      <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="font-medium text-foreground">Chez le destinataire</div>
                  <div className="text-sm text-foreground-secondary mt-1">
                    {data.recipientFirstName} {data.recipientLastName}
                  </div>
                </button>

                <button
                  onClick={() => handleChange('shippingTo', 'buyer')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.shippingTo === 'buyer'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-border bg-background hover:border-primary-300'
                  }`}
                >
                  {formData.shippingTo === 'buyer' && (
                    <div className="flex justify-end mb-2">
                      <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="font-medium text-foreground">À mon adresse</div>
                  <div className="text-sm text-foreground-secondary mt-1">
                    Je remettrai le bon en main propre
                  </div>
                </button>
              </div>

              {/* Address Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">
                    Adresse <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="street"
                    value={formData.shippingAddress.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="12 rue de la Paix"
                    className={errors['shippingAddress.street'] ? 'border-red-500' : ''}
                  />
                  {errors['shippingAddress.street'] && (
                    <p className="text-sm text-red-500">{errors['shippingAddress.street']}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">
                      Code postal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="postalCode"
                      value={formData.shippingAddress.postalCode}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                      placeholder="75001"
                      className={errors['shippingAddress.postalCode'] ? 'border-red-500' : ''}
                    />
                    {errors['shippingAddress.postalCode'] && (
                      <p className="text-sm text-red-500">
                        {errors['shippingAddress.postalCode']}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">
                      Ville <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="Paris"
                      className={errors['shippingAddress.city'] ? 'border-red-500' : ''}
                    />
                    {errors['shippingAddress.city'] && (
                      <p className="text-sm text-red-500">{errors['shippingAddress.city']}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={formData.shippingAddress.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    placeholder="France"
                  />
                </div>
              </div>
            </div>
          </>
        )}
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
