'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Sparkles, User, Check } from 'lucide-react'
import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import type { Service } from '@/lib/services-data'
import { ServiceStep } from './steps/service-step'
import { DateStep } from './steps/date-step'
import { SlotStep } from './steps/slot-step'
import { InfoStep } from './steps/info-step'
import { ConfirmationStep } from './steps/confirmation-step'

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
    giftCardCode?: string
  } | null
  bookingId: string | null
}

const STEPS = [
  { id: 'service', label: 'Prestation', icon: Sparkles },
  { id: 'date', label: 'Date', icon: Calendar },
  { id: 'slot', label: 'Créneau', icon: Clock },
  { id: 'info', label: 'Coordonnées', icon: User },
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
  const initialStep: StepId = initialService ? 'date' : 'service'

  const [currentStep, setCurrentStep] = useState<StepId>(initialStep)
  const [booking, setBooking] = useState<BookingState>({
    service: initialService,
    variantId: initialVariant,
    date: null,
    slot: null,
    hapioServiceId: null,
    hapioLocationId: null,
    clientInfo: null,
    bookingId: null,
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
              <div className="flex items-center justify-between max-w-lg mx-auto">
                {STEPS.map((step, i) => {
                  const isActive = step.id === currentStep
                  const isDone = i < stepIndex
                  const Icon = step.icon

                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`
                            flex items-center justify-center h-11 w-11 rounded-full
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
                            <Check className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium ${
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
                          className={`h-0.5 w-8 sm:w-14 mx-2 mt-[-20px] rounded-full transition-colors duration-300 ${
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

          {/* Bouton retour */}
          {currentStep !== 'service' && currentStep !== 'confirmation' && (
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
                    goTo('date')
                  }}
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
                  onConfirm={(clientInfo, bookingId) => {
                    updateBooking({ clientInfo, bookingId })
                    goTo('confirmation')
                  }}
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
