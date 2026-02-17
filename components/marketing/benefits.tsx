'use client'

import { Heart, Sparkles, Brain, TrendingUp, Droplets, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const benefits = [
  {
    icon: Brain,
    title: 'Moins de stress',
    description:
      'Le massage du cuir chevelu détend profondément. Beaucoup de clientes repartent avec cette sensation de tête vide — dans le bon sens du terme.',
    stat: '😮‍💨',
    statLabel: 'enfin relâché',
  },
  {
    icon: TrendingUp,
    title: 'Des cheveux qui respirent',
    description:
      'La circulation sanguine est relancée au niveau du cuir chevelu. Vos racines sont mieux nourries, vos cheveux plus beaux naturellement.',
    stat: '✨',
    statLabel: 'cheveux vivants',
  },
  {
    icon: Droplets,
    title: 'Un cuir chevelu purifié',
    description:
      'Le soin élimine les impuretés accumulées et rééquilibre votre cuir chevelu. Idéal si vous vous sentez à l\'étroit dans vos cheveux.',
    stat: '💧',
    statLabel: 'cuir chevelu sain',
  },
  {
    icon: Sparkles,
    title: 'Des cheveux plus beaux',
    description:
      'Plus brillants, plus doux, plus forts. Pas besoin de miracle — juste un bon soin fait avec les bons gestes et les bons produits.',
    stat: '100%',
    statLabel: 'naturel',
  },
  {
    icon: Heart,
    title: 'Une vraie pause',
    description:
      'On s\'occupe de vous, et de vous seulement. Maux de tête, tension, fatigue — tout ça fond pendant la séance.',
    stat: '60-90',
    statLabel: 'minutes pour soi',
  },
  {
    icon: Shield,
    title: 'Des effets qui durent',
    description:
      'Le mieux-être ressenti après une séance ne s\'arrête pas à la sortie du salon. Le cuir chevelu continue à en profiter les jours suivants.',
    stat: '72h',
    statLabel: 'd\'effet',
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
              Ce que vous allez ressentir
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Du bien, vraiment
          </h2>
          <p className="text-lg text-foreground-secondary max-w-3xl mx-auto">
            Le Head Spa, c&apos;est bien plus qu&apos;un soin pour les cheveux. En une séance, vous vous sentez plus léger,
            plus calme, avec des cheveux et un cuir chevelu qui respirent enfin.
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
              Une pratique qui a fait ses preuves
            </h3>
          </div>
          <p className="text-center text-foreground-secondary max-w-3xl mx-auto">
            Le Head Spa ne date pas d&apos;hier. Cette pratique japonaise, affinée depuis des générations,
            allie massage professionnel, soins du cuir chevelu et produits adaptés. Les résultats se voient —
            et se ressentent — dès la première séance.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
