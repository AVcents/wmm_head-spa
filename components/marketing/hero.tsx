'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, Users, Award } from 'lucide-react'
import { motion } from 'framer-motion'

export function Hero() {
  const stats = [
    { icon: TrendingUp, value: '+120%', label: 'de circulation sanguine' },
    { icon: Users, value: '1500+', label: 'ans de tradition' },
    { icon: Award, value: '#1', label: 'bien-être japonais' },
  ]

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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-6"
            >
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                Tradition japonaise ancestrale
              </span>
            </motion.div>

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
              className="text-lg sm:text-xl text-foreground-secondary mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Découvrez le <strong>Head Spa</strong>, une expérience holistique née au Japon il y a plus de 1500 ans.
              Alliant massage du cuir chevelu, aromathérapie et relaxation profonde, cette tradition révolutionnaire
              augmente jusqu&apos;à 120% la circulation sanguine pour une transformation complète.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-3 gap-4 mb-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-surface border border-border">
                  <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-foreground-secondary">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/bon-cadeau/commander" className="flex-1 sm:flex-initial">
                <Button size="lg" className="w-full group bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800">
                  Réserver une séance
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="tel:0621571222" className="flex-1 sm:flex-initial">
                <Button size="lg" variant="outline" className="w-full">
                  06 21 57 12 22
                </Button>
              </a>
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
