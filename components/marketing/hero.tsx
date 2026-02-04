'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
      {/* Content */}
      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
                Restaurez votre{' '}
                <span className="text-primary-600 dark:text-primary-400">
                  équilibre
                </span>
              </h1>
            </motion.div>

            <motion.p
              className="text-lg sm:text-xl text-foreground-secondary mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Découvrez le Head Spa, une tradition asiatique de bien-être alliant
              relaxation profonde et soins capillaires d&apos;exception
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button size="lg" className="group">
                Découvrir nos soins
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Me contacter
              </Button>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl hidden lg:block"
          >
            <Image
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80"
              alt="Massage crânien professionnel au Kalm Headspa"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 0vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/30 to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-400/30 dark:bg-primary-500/10 rounded-full blur-3xl animate-blob -z-10" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-secondary-400/30 dark:bg-secondary-500/10 rounded-full blur-3xl animate-blob animation-delay-2000 -z-10" />
      <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-accent-mint/25 dark:bg-accent-mint/8 rounded-full blur-3xl animate-blob animation-delay-4000 -z-10" />
    </section>
  )
}
