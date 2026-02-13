'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, Euro, ChevronDown, ChevronUp } from 'lucide-react'
import { Service } from '@/lib/services-data'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [showVariants, setShowVariants] = useState(false)

  if (!service.hasVariants) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
              {service.name}
            </h3>
            <p className="text-sm text-foreground-secondary mb-4">
              {service.description}
            </p>
            {service.hairLength && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-4">
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                  {service.hairLength}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-foreground-secondary">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{service.duration} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Euro className="h-4 w-4" />
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {service.price}€
              </span>
            </div>
          </div>
          <Link href={`/reservation?service=${service.id}`}>
            <Button size="sm">Réserver</Button>
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
              {service.name}
            </h3>
            <p className="text-sm text-foreground-secondary mb-4">
              {service.description}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-50 dark:bg-secondary-900/20 mb-2">
              <span className="text-xs font-medium text-secondary-700 dark:text-secondary-300">
                Prix selon longueur de cheveux
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowVariants(!showVariants)}
          className="w-full flex items-center justify-between py-3 px-4 rounded-lg bg-background border border-border hover:border-primary-300 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">
            {showVariants ? 'Masquer les options' : 'Voir les options de prix'}
          </span>
          {showVariants ? (
            <ChevronUp className="h-4 w-4 text-foreground-secondary" />
          ) : (
            <ChevronDown className="h-4 w-4 text-foreground-secondary" />
          )}
        </button>

        <AnimatePresence>
          {showVariants && service.variants && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 mt-4 pt-4 border-t border-border">
                {service.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground mb-1">
                        {variant.hairLengthLabel}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-foreground-secondary">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{variant.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Euro className="h-3 w-3" />
                          <span className="text-base font-bold text-primary-600 dark:text-primary-400">
                            {variant.price}€
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/reservation?service=${service.id}&variant=${variant.id}`}>
                      <Button size="sm" variant="outline">
                        Réserver
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
