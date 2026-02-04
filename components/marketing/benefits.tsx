'use client'

import { Heart, Sparkles, Brain } from 'lucide-react'
import { motion } from 'framer-motion'

const benefits = [
  {
    icon: Brain,
    title: 'Relaxation Profonde',
    description:
      'Évacuez le stress et les tensions accumulées grâce à des techniques ancestrales de massage crânien.',
  },
  {
    icon: Sparkles,
    title: 'Soin des Cheveux',
    description:
      'Revitalisez votre cuir chevelu et vos cheveux avec des soins naturels adaptés à vos besoins.',
  },
  {
    icon: Heart,
    title: 'Équilibre Émotionnel',
    description:
      'Retrouvez harmonie et bien-être intérieur dans un environnement apaisant et chaleureux.',
  },
]

export function Benefits() {
  return (
    <section className="py-20 md:py-32 bg-background-secondary">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Les bienfaits du Head Spa
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Une expérience unique pour votre corps et votre esprit
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="mb-6 h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-foreground-secondary leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
