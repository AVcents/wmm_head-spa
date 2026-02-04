'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Phone, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

export function CTASection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1600&q=80"
          alt="Espace de relaxation Kalm Headspa"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/95 via-primary-700/95 to-secondary-700/95 dark:from-primary-900/95 dark:via-primary-950/95 dark:to-secondary-950/95" />
      </div>

      <div className="relative container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Prêt à vous ressourcer ?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed">
            Offrez-vous un moment de détente absolue dans notre espace dédié à
            votre bien-être. Gwenaëlle vous accueille dans un cadre chaleureux et
            apaisant.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:0621571222">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-white text-primary-700 hover:bg-white/90"
              >
                <Phone className="mr-2 h-5 w-5" />
                06 21 57 12 22
              </Button>
            </a>
            <a href="mailto:gw.guiot@outlook.fr">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10"
              >
                <Mail className="mr-2 h-5 w-5" />
                Envoyer un email
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
