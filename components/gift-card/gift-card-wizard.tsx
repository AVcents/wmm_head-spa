'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { AmountStep } from './steps/amount-step'
import { HairLengthStep } from './steps/hair-length-step'
import { DeliveryStep } from './steps/delivery-step'
import { RecipientStep } from './steps/recipient-step'
import { MessageStep } from './steps/message-step'
import { BuyerStep } from './steps/buyer-step'
import { ReviewStep } from './steps/review-step'
import { services } from '@/lib/services-data'

export interface GiftCardData {
  // Service selection
  serviceId?: string
  serviceName?: string
  serviceDuration?: number
  hairLength?: 'courts' | 'mi-longs' | 'longs'
  hairLengthLabel?: string
  amount?: number

  // Delivery step
  deliveryMethod?: 'digital' | 'physical'

  // Recipient step
  recipientFirstName?: string
  recipientLastName?: string
  recipientEmail?: string
  recipientPhone?: string

  // Message step
  personalMessage?: string
  senderName?: string

  // Buyer step
  buyerEmail?: string
  buyerPhone?: string
  buyerFirstName?: string
  buyerLastName?: string

  // Physical delivery
  shippingAddress?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  shippingTo?: 'recipient' | 'buyer'
}

// Steps de base (sans hair-length qui est conditionnelle)
const baseSteps = [
  { id: 1, name: 'Prestation', component: AmountStep },
  { id: 2, name: 'Longueur', component: HairLengthStep, conditional: true },
  { id: 3, name: 'Livraison', component: DeliveryStep },
  { id: 4, name: 'Destinataire', component: RecipientStep },
  { id: 5, name: 'Message', component: MessageStep },
  { id: 6, name: 'Vos informations', component: BuyerStep },
  { id: 7, name: 'Confirmation', component: ReviewStep },
]

export function GiftCardWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<GiftCardData>({})

  // Calculer les étapes visibles en fonction du service sélectionné
  const getVisibleSteps = () => {
    if (!formData.serviceId) {
      return baseSteps
    }

    const service = services.find((s) => s.id === formData.serviceId)
    const shouldShowHairLength = service?.hasVariants || false

    if (!shouldShowHairLength) {
      // Filtrer l'étape hair-length si pas de variantes
      return baseSteps.filter((step) => step.component !== HairLengthStep)
    }

    return baseSteps
  }

  const steps = getVisibleSteps()

  const handleNext = (data: Partial<GiftCardData>) => {
    const newFormData = { ...formData, ...data }
    setFormData(newFormData)

    // Si on vient de sélectionner un service sans variantes, skip l'étape hair-length
    if (currentStep === 1 && data.serviceId) {
      const service = services.find((s) => s.id === data.serviceId)
      if (service && !service.hasVariants) {
        // Skip directement à l'étape 3 (livraison)
        setCurrentStep(3)
        return
      }
    }

    if (currentStep < baseSteps.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      // Si on est à l'étape 3 et le service n'a pas de variantes, revenir à l'étape 1
      if (currentStep === 3) {
        const service = services.find((s) => s.id === formData.serviceId)
        if (service && !service.hasVariants) {
          setCurrentStep(1)
          return
        }
      }
      setCurrentStep((prev) => prev - 1)
    }
  }

  const CurrentStepComponent = steps[currentStep - 1]?.component || AmountStep

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div
                    className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStep > step.id
                        ? 'border-primary-600 bg-primary-600'
                        : currentStep === step.id
                        ? 'border-primary-600 bg-background'
                        : 'border-border bg-surface'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          currentStep === step.id
                            ? 'text-primary-600'
                            : 'text-foreground-secondary'
                        }`}
                      >
                        {step.id}
                      </span>
                    )}
                  </div>
                  {/* Step Name */}
                  <span
                    className={`mt-2 text-xs sm:text-sm font-medium text-center ${
                      currentStep >= step.id
                        ? 'text-foreground'
                        : 'text-foreground-secondary'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      currentStep > step.id ? 'bg-primary-600' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepComponent
              data={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
