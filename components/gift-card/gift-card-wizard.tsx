'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Gift, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AmountStep } from './steps/amount-step'
import { HairLengthStep } from './steps/hair-length-step'
import { DeliveryStep } from './steps/delivery-step'
import { RecipientStep } from './steps/recipient-step'
import { MessageStep } from './steps/message-step'
import { BuyerStep } from './steps/buyer-step'
import { ReviewStep } from './steps/review-step'
import { PaymentStep } from './steps/payment-step'
import type { Service } from '@/lib/services-data'

export interface GiftCardData {
  // Service selection
  serviceId?: string
  serviceName?: string
  serviceDuration?: number
  hairLength?: 'courts' | 'mi-longs' | 'longs' | 'rases' | 'enfant' | 'body'
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

  // Payment (Stripe)
  clientSecret?: string
  paymentIntentId?: string
}

// Steps avec IDs stables
const baseSteps = [
  { id: 1, name: 'Prestation', component: AmountStep },
  { id: 2, name: 'Longueur', component: HairLengthStep, conditional: true },
  { id: 3, name: 'Livraison', component: DeliveryStep },
  { id: 4, name: 'Destinataire', component: RecipientStep },
  { id: 5, name: 'Message', component: MessageStep },
  { id: 6, name: 'Vos infos', component: BuyerStep },
  { id: 7, name: 'Récapitulatif', component: ReviewStep },
  { id: 8, name: 'Paiement', component: PaymentStep },
]

interface GiftCardWizardProps {
  services: Service[]
}

export function GiftCardWizard({ services }: GiftCardWizardProps) {
  const searchParams = useSearchParams()
  const wizardBottomRef = useRef<HTMLDivElement>(null)

  // Lecture des paramètres URL (pré-sélection depuis la page Prestations)
  const urlServiceId = searchParams.get('serviceId')
  const urlServiceName = searchParams.get('serviceName')
  const urlPrice = searchParams.get('price')
  const urlHairLength = searchParams.get('hairLength')
  const urlHairLengthLabel = searchParams.get('hairLengthLabel')
  const urlDuration = searchParams.get('duration')

  const hasPreselectedService = Boolean(urlServiceId && urlServiceName && urlPrice)

  const preselectedService = hasPreselectedService
    ? services.find((s) => s.id === urlServiceId)
    : null

  // FormData initial depuis les URL params
  const getInitialFormData = (): GiftCardData => {
    if (!hasPreselectedService) return {}
    return {
      serviceId: urlServiceId ?? undefined,
      serviceName: urlServiceName ?? undefined,
      amount: urlPrice ? parseFloat(urlPrice) : undefined,
      ...(urlHairLength
        ? { hairLength: urlHairLength as GiftCardData['hairLength'] }
        : {}),
      ...(urlHairLengthLabel ? { hairLengthLabel: urlHairLengthLabel } : {}),
      ...(urlDuration ? { serviceDuration: parseInt(urlDuration) } : {}),
    }
  }

  // Étape initiale selon la pré-sélection
  const getInitialStep = () => {
    if (!hasPreselectedService) return 1
    // Service avec variantes mais pas de longueur dans l'URL → montrer HairLengthStep
    if (preselectedService?.hasVariants && !urlHairLength) return 2
    // Service sans variantes ou longueur déjà connue → aller directement à Livraison
    return 3
  }

  const [currentStep, setCurrentStep] = useState(getInitialStep)
  const [formData, setFormData] = useState<GiftCardData>(getInitialFormData)
  const [isComplete, setIsComplete] = useState(false)

  // Auto-scroll vers le bas du contenu à chaque changement d'étape
  useEffect(() => {
    const timer = setTimeout(() => {
      wizardBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 350)
    return () => clearTimeout(timer)
  }, [currentStep])

  // Calcul des étapes visibles selon le contexte
  const getVisibleSteps = () => {
    let stepsToShow = [...baseSteps]

    // Masquer AmountStep si service pré-sélectionné depuis l'URL
    if (hasPreselectedService) {
      stepsToShow = stepsToShow.filter((s) => s.component !== AmountStep)
    }

    // Masquer HairLengthStep si le service n'a pas de variantes
    const serviceId = formData.serviceId ?? urlServiceId
    if (serviceId) {
      const service = services.find((s) => s.id === serviceId)
      if (!service?.hasVariants) {
        stepsToShow = stepsToShow.filter((s) => s.component !== HairLengthStep)
      }
    }

    return stepsToShow
  }

  const steps = getVisibleSteps()

  // Lookup par ID pour éviter le bug d'index quand des étapes sont filtrées
  const CurrentStepComponent =
    steps.find((s) => s.id === currentStep)?.component ?? AmountStep

  const handleNext = (data: Partial<GiftCardData>) => {
    const newFormData = { ...formData, ...data }
    setFormData(newFormData)

    const currentIndex = steps.findIndex((s) => s.id === currentStep)
    const isLastStep = currentIndex === steps.length - 1

    // Dernière étape (Paiement) → succès
    if (isLastStep) {
      setIsComplete(true)
      return
    }

    // Cas spécial : service sans variantes sélectionné à l'étape 1 → sauter HairLength
    if (currentStep === 1 && data.serviceId) {
      const service = services.find((s) => s.id === data.serviceId)
      if (service && !service.hasVariants) {
        setCurrentStep(3)
        return
      }
    }

    // Naviguer vers l'étape suivante dans le tableau filtré
    const nextStep = steps[currentIndex + 1]
    if (nextStep) {
      setCurrentStep(nextStep.id)
    }
  }

  const handleBack = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]!.id)
    }
  }

  // -----------------------------------------------
  // Écran de succès
  // -----------------------------------------------
  if (isComplete) {
    const deliveryFee = formData.deliveryMethod === 'physical' ? 5 : 0
    const totalAmount = (formData.amount ?? 0) + deliveryFee

    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-2xl px-4 sm:px-6"
        >
          <div className="bg-surface border border-border rounded-3xl p-8 sm:p-12 text-center">
            {/* Icône succès */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 mb-6 mx-auto">
              <Check className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
              Bon cadeau envoyé !
            </h1>
            <p className="text-lg text-foreground-secondary mb-8">
              Votre paiement de{' '}
              <strong className="text-primary-600">{totalAmount}€</strong> a bien
              été encaissé. Le bon cadeau a été envoyé à{' '}
              <strong>
                {formData.recipientFirstName} {formData.recipientLastName}
              </strong>
              .
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
              {/* Acheteur */}
              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide mb-2">
                  Confirmation envoyée à
                </p>
                <p className="font-medium text-foreground">
                  {formData.buyerFirstName} {formData.buyerLastName}
                </p>
                <p className="text-sm text-foreground-secondary">
                  {formData.buyerEmail}
                </p>
              </div>
              {/* Destinataire */}
              <div className="p-4 rounded-xl bg-background border border-border">
                <div className="flex items-center gap-2 mb-2">
                  {formData.deliveryMethod === 'digital' ? (
                    <Mail className="h-4 w-4 text-primary-600" />
                  ) : (
                    <Gift className="h-4 w-4 text-primary-600" />
                  )}
                  <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wide">
                    Bon cadeau envoyé à
                  </p>
                </div>
                <p className="font-medium text-foreground">
                  {formData.recipientFirstName} {formData.recipientLastName}
                </p>
                <p className="text-sm text-foreground-secondary">
                  {formData.deliveryMethod === 'digital'
                    ? formData.recipientEmail
                    : 'Par courrier postal'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Retour à l&apos;accueil
                </Button>
              </Link>
              <Link href="/prestations">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700"
                >
                  Découvrir nos soins
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

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
                        {index + 1}
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
              services={services}
            />
          </motion.div>
        </AnimatePresence>

        {/* Cible auto-scroll — amène le bas du contenu en vue à chaque étape */}
        <div ref={wizardBottomRef} />
      </div>
    </div>
  )
}
