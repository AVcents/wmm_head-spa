'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, CreditCard, Sparkles, User, Check, Gift } from 'lucide-react'
import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import type { Service } from '@/lib/services-data'
import { ServiceStep } from './steps/service-step'
import { DateStep } from './steps/date-step'
import { SlotStep } from './steps/slot-step'
import { InfoStep } from './steps/info-step'
import { ExtrasStep } from './steps/extras-step'
import type { Extra } from './steps/extras-step'
import { PaymentStep } from './steps/payment-step'
import { ConfirmationStep } from './steps/confirmation-step'

export type PaymentMode = 'hold' | 'direct' | 'gift_card'

export interface BookingState {
  service: Service | null
  variantId: string | null
  date: string | null       // YYYY-MM-DD
  slot: {
    startsAt: string
    endsAt: string
    resourceId?: string
  } | null
  // IDs réels Hapio (UUID) résolus lors de l'étape créneaux
  hapioServiceId: string | null
  hapioLocationId: string | null
  clientInfo: {
    name: string
    email: string
    phone: string
    message?: string
  } | null
  // Extras sélectionnés
  selectedExtras: Extra[]
  bookingId: string | null
  // Paiement
  paymentMode: PaymentMode | null
  paymentIntentId: string | null
  amountPaid: number | null
}

const STEPS = [
  { id: 'service', label: 'Prestation', icon: Sparkles },
  { id: 'extras', label: 'Options', icon: Gift },
  { id: 'date', label: 'Date', icon: Calendar },
  { id: 'slot', label: 'Créneau', icon: Clock },
  { id: 'info', label: 'Coordonnées', icon: User },
  { id: 'payment', label: 'Paiement', icon: CreditCard },
] as const

type StepId = (typeof STEPS)[number]['id'] | 'confirmation'

interface Props {
  services: Service[]
  preselectedServiceId?: string
  preselectedVariantId?: string
}

export default function ReservationContent({
  services,
  preselectedServiceId,
  preselectedVariantId,
}: Props) {
  // Pré-sélection si on vient d'une carte prestation
  const initialService = preselectedServiceId
    ? services.find((s) => s.id === preselectedServiceId) ?? null
    : null
  const initialVariant = preselectedVariantId ?? null
  const initialStep: StepId = initialService ? 'extras' : 'service'

  const [currentStep, setCurrentStep] = useState<StepId>(initialStep)
  const [booking, setBooking] = useState<BookingState>({
    service: initialService,
    variantId: initialVariant,
    date: null,
    slot: null,
    hapioServiceId: null,
    hapioLocationId: null,
    clientInfo: null,
    selectedExtras: [],
    bookingId: null,
    paymentMode: null,
    paymentIntentId: null,
    amountPaid: null,
  })

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep)

  const goTo = (step: StepId) => setCurrentStep(step)

  const goBack = () => {
    const idx = STEPS.findIndex((s) => s.id === currentStep)
    const prevStep = STEPS[idx - 1]
    if (idx > 0 && prevStep) setCurrentStep(prevStep.id)
  }

  const updateBooking = (updates: Partial<BookingState>) => {
    setBooking((prev) => ({ ...prev, ...updates }))
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto max-w-3xl px-4">
          {/* Titre */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-3">
              Réserver un soin
            </h1>
            <p className="text-foreground-secondary text-lg">
              Choisissez votre prestation et votre créneau en quelques clics
            </p>
          </motion.div>

          {/* Stepper */}
          {currentStep !== 'confirmation' && (
            <div className="mb-10">
              <div className="flex items-center justify-between max-w-xl mx-auto">
                {STEPS.map((step, i) => {
                  const isActive = step.id === currentStep
                  const isDone = i < stepIndex
                  const Icon = step.icon

                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`
                            flex items-center justify-center h-10 w-10 rounded-full
                            transition-all duration-300
                            ${isDone
                              ? 'bg-primary-600 text-white'
                              : isActive
                                ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900/40'
                                : 'bg-surface border-2 border-border text-foreground-muted'
                            }
                          `}
                        >
                          {isDone ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium hidden sm:block ${
                            isActive || isDone
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-foreground-muted'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`h-0.5 w-5 sm:w-10 mx-1 mt-[-20px] rounded-full transition-colors duration-300 ${
                            i < stepIndex
                              ? 'bg-primary-600'
                              : 'bg-border'
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bouton retour (masqué sur service, confirmation, payment et extras car géré dans ces composants) */}
          {currentStep !== 'service' && currentStep !== 'confirmation' && currentStep !== 'payment' && currentStep !== 'extras' && (
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          )}

          {/* Contenu de l'étape */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {currentStep === 'service' && (
                <ServiceStep
                  services={services}
                  selected={booking.service}
                  selectedVariantId={booking.variantId}
                  onSelect={(service, variantId) => {
                    updateBooking({ service, variantId })
                    goTo('extras')
                  }}
                />
              )}

              {currentStep === 'extras' && (
                <ExtrasStep
                  selectedExtras={booking.selectedExtras}
                  serviceId={booking.service?.id ?? undefined}
                  onNext={(extras) => {
                    updateBooking({ selectedExtras: extras })
                    goTo('date')
                  }}
                  onBack={() => goTo('service')}
                />
              )}

              {currentStep === 'date' && booking.service && (
                <DateStep
                  selectedDate={booking.date}
                  onSelect={(date) => {
                    updateBooking({ date, slot: null })
                    goTo('slot')
                  }}
                />
              )}

              {currentStep === 'slot' && booking.service && booking.date && (
                <SlotStep
                  service={booking.service}
                  variantId={booking.variantId}
                  date={booking.date}
                  onSelect={(slot, hapioServiceId, hapioLocationId) => {
                    updateBooking({ slot, hapioServiceId, hapioLocationId })
                    goTo('info')
                  }}
                />
              )}

              {currentStep === 'info' && booking.service && booking.slot && (
                <InfoStep
                  booking={booking}
                  onNext={(clientInfo) => {
                    updateBooking({ clientInfo })
                    goTo('payment')
                  }}
                />
              )}

              {currentStep === 'payment' && booking.service && booking.slot && booking.clientInfo && (
                <PaymentStep
                  booking={booking}
                  onConfirm={(bookingId, paymentMode, paymentIntentId, amountPaid) => {
                    updateBooking({ bookingId, paymentMode, paymentIntentId, amountPaid })
                    goTo('confirmation')
                  }}
                  onBack={() => goTo('info')}
                />
              )}

              {currentStep === 'confirmation' && booking.bookingId && (
                <ConfirmationStep booking={booking} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  )
}
