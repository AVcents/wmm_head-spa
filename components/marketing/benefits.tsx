'use client'

import { Heart, Sparkles, Brain, TrendingUp, Droplets, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const benefits = [
  {
    icon: Brain,
    title: 'Réduction du Stress',
    description:
      'Diminution de 30 à 40% du cortisol (hormone du stress) et libération d\'endorphines pour un bien-être mental profond.',
    stat: '-40%',
    statLabel: 'de cortisol',
  },
  {
    icon: TrendingUp,
    title: 'Stimulation Capillaire',
    description:
      'Jusqu\'à 120% d\'augmentation de la circulation sanguine dans le cuir chevelu pour nourrir intensément les follicules pileux.',
    stat: '+120%',
    statLabel: 'circulation',
  },
  {
    icon: Droplets,
    title: 'Détoxification Profonde',
    description:
      'Drainage lymphatique stimulé pour éliminer toxines et impuretés, favorisant un environnement sain pour vos cheveux.',
    stat: '72h',
    statLabel: 'd\'effet',
  },
  {
    icon: Sparkles,
    title: 'Qualité Capillaire',
    description:
      'Cheveux plus brillants, plus forts et plus volumineux grâce à une meilleure nutrition des racines.',
    stat: '100%',
    statLabel: 'naturel',
  },
  {
    icon: Heart,
    title: 'Bien-être Holistique',
    description:
      'Soulagement des maux de tête, amélioration du sommeil et équilibre émotionnel dans un environnement zen.',
    stat: '60-90',
    statLabel: 'minutes',
  },
  {
    icon: Shield,
    title: 'Équilibre du Cuir Chevelu',
    description:
      'Régulation du pH, élimination des pellicules et prévention des problèmes dermatologiques pour une santé optimale.',
    stat: '∞',
    statLabel: 'durabilité',
  },
]

export function Benefits() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-background-secondary">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Bienfaits scientifiquement prouvés
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Une transformation complète
          </h2>
          <p className="text-lg text-foreground-secondary max-w-3xl mx-auto">
            Le Head Spa va bien au-delà d&apos;un simple soin. C&apos;est une expérience holistique qui agit simultanément
            sur votre corps, votre esprit et vos cheveux, avec des résultats mesurables et durables.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                className="relative p-8 rounded-2xl bg-surface border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Icon & Stat Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{benefit.stat}</div>
                    <div className="text-xs text-foreground-secondary">{benefit.statLabel}</div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-foreground-secondary leading-relaxed text-sm">
                  {benefit.description}
                </p>

                {/* Decorative element */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-primary-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
              </motion.div>
            )
          })}
        </div>

        {/* Scientific backing */}
        <motion.div
          className="mt-16 p-8 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h3 className="text-xl font-serif font-bold text-foreground">
              Approche scientifique et holistique
            </h3>
          </div>
          <p className="text-center text-foreground-secondary max-w-3xl mx-auto">
            Des études démontrent qu&apos;après 72 heures post-traitement, des modifications de l&apos;expression génétique
            dans les cellules capillaires (gènes NOGGIN, BMP4, SMAD4) stimulent activement la croissance et la santé des cheveux.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
