'use client'

import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Sparkles, Heart, Leaf } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function AProposPage() {
  const timeline = [
    {
      year: '1500+',
      title: 'Les Origines Ancestrales',
      description: 'L\'Anma, technique de massage japonaise thérapeutique vieille de plus de 1500 ans, pose les fondations du Head Spa moderne.',
    },
    {
      year: '1990s',
      title: 'La Modernisation',
      description: 'Les salons japonais révolutionnent les soins capillaires en formalisant le concept de Head Spa comme expérience de luxe.',
    },
    {
      year: '2020+',
      title: 'L\'Expansion Mondiale',
      description: 'Le Head Spa devient une tendance wellness mondiale, avec une croissance de +40% par an et des millions d\'adeptes.',
    },
  ]

  const philosophy = [
    {
      icon: Heart,
      title: 'Harmonie Corps-Esprit',
      description: 'Le concept japonais "Kokoro to Karada" : esprit et corps indissociables.',
    },
    {
      icon: Sparkles,
      title: 'Santé du Cuir Chevelu',
      description: 'Le cuir chevelu est la "terre" qui nourrit les cheveux. Un cuir chevelu sain = des cheveux sains.',
    },
    {
      icon: Leaf,
      title: 'Détoxification Naturelle',
      description: 'Élimination des toxines pour une purification profonde et un bien-être durable.',
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-6">
                  <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    Plus de 1500 ans de tradition
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
                  L&apos;histoire du{' '}
                  <span className="text-primary-600 dark:text-primary-400">Head Spa</span>
                </h1>
                <p className="text-lg text-foreground-secondary leading-relaxed mb-8">
                  Le Head Spa est bien plus qu&apos;un simple soin capillaire. C&apos;est une tradition japonaise
                  millénaire qui allie sagesse ancestrale et innovation moderne pour offrir une expérience
                  holistique unique de bien-être et de transformation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/bon-cadeau/commander">
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700">
                      Réserver une séance
                    </Button>
                  </Link>
                  <Link href="/prestations">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Découvrir nos soins
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden"
              >
                <Image
                  src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"
                  alt="Tradition japonaise du Head Spa"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-background-secondary">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                Une tradition millénaire
              </h2>
              <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
                Du massage thérapeutique Anma à la tendance wellness mondiale d&apos;aujourd&apos;hui
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  className="relative pl-8 pb-12 last:pb-0"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {/* Timeline line */}
                  {index !== timeline.length - 1 && (
                    <div className="absolute left-[15px] top-8 w-0.5 h-full bg-gradient-to-b from-primary-600 to-primary-400" />
                  )}

                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>

                  {/* Content */}
                  <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-2">{item.year}</div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-foreground-secondary">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                Notre philosophie
              </h2>
              <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
                Une approche holistique inspirée de la sagesse japonaise
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {philosophy.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="p-8 rounded-2xl bg-surface border border-border text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 mb-6">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-foreground-secondary">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Science Section */}
        <section className="py-20 bg-gradient-to-b from-background to-background-secondary">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                  Une approche scientifiquement prouvée
                </h2>
                <p className="text-lg text-foreground-secondary">
                  Le Head Spa n&apos;est pas qu&apos;une tradition : c&apos;est une pratique dont les bienfaits sont validés par la science moderne.
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="p-6 rounded-xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 text-center">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">+120%</div>
                  <div className="text-sm text-foreground-secondary">Augmentation de la circulation sanguine</div>
                </div>
                <div className="p-6 rounded-xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 text-center">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">-40%</div>
                  <div className="text-sm text-foreground-secondary">Réduction du cortisol (stress)</div>
                </div>
                <div className="p-6 rounded-xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 text-center">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">72h</div>
                  <div className="text-sm text-foreground-secondary">D&apos;activation génétique capillaire</div>
                </div>
              </motion.div>

              <motion.div
                className="p-8 rounded-2xl bg-surface border border-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <p className="text-foreground-secondary leading-relaxed">
                  Des études récentes démontrent qu&apos;après 72 heures post-traitement, des modifications de l&apos;expression
                  génétique dans les cellules de la papille dermique déclenchent des changements dans les gènes NOGGIN, BMP4 et SMAD4,
                  tous liés à la croissance capillaire. Le massage stimule également le drainage lymphatique, permettant au corps
                  d&apos;éliminer significativement plus de toxines.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 p-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
                  Prêt à découvrir le Head Spa ?
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Offrez-vous une expérience unique alliant tradition japonaise millénaire et bien-être moderne.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/bon-cadeau/commander">
                    <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-white/90 border-0">
                      Réserver maintenant
                    </Button>
                  </Link>
                  <a href="tel:0621571222">
                    <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                      06 21 57 12 22
                    </Button>
                  </a>
                </div>
              </div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80')] opacity-10 bg-cover bg-center" />
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
