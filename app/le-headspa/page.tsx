'use client'

import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Sparkles, Heart, Leaf } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function LeHeadspaPage() {
  const timeline = [
    {
      year: '1500+',
      title: 'Les origines',
      description: 'Le massage japonais traditionnel (Anma) est pratiqué depuis plus de 1500 ans. C\'est lui qui a inspiré ce que l\'on appelle aujourd\'hui le Head Spa.',
    },
    {
      year: '1990s',
      title: 'Le Head Spa naît dans les salons',
      description: 'Les instituts japonais formalisent le concept et le proposent comme un soin à part entière. Le Head Spa devient une institution.',
    },
    {
      year: '2020+',
      title: 'Le monde entier en parle',
      description: 'TikTok, YouTube, presse beauté... Le Head Spa touche des millions de personnes. Et pour cause — ça fait vraiment du bien.',
    },
  ]

  const philosophy = [
    {
      icon: Heart,
      title: 'La tête et le corps, ensemble',
      description: 'Les Japonais le savent depuis longtemps : quand la tête va, le corps suit. Le Head Spa agit sur les deux à la fois.',
    },
    {
      icon: Sparkles,
      title: 'Le cuir chevelu, d\'abord',
      description: 'Avant de s\'occuper des cheveux, on s\'occupe de ce qui les nourrit. Un cuir chevelu sain, ce sont des cheveux qui poussent mieux, plus forts.',
    },
    {
      icon: Leaf,
      title: 'Des produits qui font sens',
      description: 'Chez Kalm, on utilise des soins naturels, adaptés à votre cuir chevelu. Pas de superflu — juste ce dont vous avez besoin.',
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
                    Une pratique japonaise millénaire
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
                  L&apos;histoire du{' '}
                  <span className="text-primary-600 dark:text-primary-400">Head Spa</span>
                </h1>
                <p className="text-lg text-foreground-secondary leading-relaxed mb-8">
                  Le Head Spa, c&apos;est un soin complet du cuir chevelu et des cheveux, venu du Japon.
                  Massage, shampooing thérapeutique, huiles nourrissantes — tout est pensé pour vous faire
                  du bien, de la tête aux épaules.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/reservation">
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
                  src="/images/Salon1.jpeg"
                  alt="Espace Kalm Headspa"
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
                Une tradition qui vient de loin
              </h2>
              <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
                Le Head Spa n&apos;est pas une invention récente — il puise ses racines dans le massage japonais traditionnel
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
                  {index !== timeline.length - 1 && (
                    <div className="absolute left-[15px] top-8 w-0.5 h-full bg-gradient-to-b from-primary-600 to-primary-400" />
                  )}
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
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
                Ce qui guide chaque soin
              </h2>
              <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
                Quelques idées simples, venues du Japon, qui guident la façon dont je prends soin de vous
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
                  Pourquoi ça marche vraiment
                </h2>
                <p className="text-lg text-foreground-secondary">
                  Le Head Spa n&apos;est pas une tendance. C&apos;est une pratique qui existe depuis des générations,
                  et dont les bienfaits se ressentent dès la première séance.
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
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">✨</div>
                  <div className="text-sm text-foreground-secondary">Circulation relancée dès la séance</div>
                </div>
                <div className="p-6 rounded-xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 text-center">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">😌</div>
                  <div className="text-sm text-foreground-secondary">Moins de stress, tête plus légère</div>
                </div>
                <div className="p-6 rounded-xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 text-center">
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">72h</div>
                  <div className="text-sm text-foreground-secondary">D&apos;effets sur le cuir chevelu</div>
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
                  Le massage du cuir chevelu relance la circulation sanguine en profondeur — vos racines sont mieux
                  irriguées, vos cheveux mieux nourris. Le soin élimine aussi les résidus et impuretés qui s&apos;accumulent
                  au fil du temps. Et les effets ne s&apos;arrêtent pas à la sortie du salon : votre cuir chevelu continue
                  à en bénéficier pendant plusieurs jours.
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
                  Curieuse ? Curieux ?
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  C&apos;est normal d&apos;hésiter quand on ne connaît pas encore. N&apos;hésitez pas à m&apos;appeler,
                  je vous explique tout et on choisit ensemble le soin qui vous convient.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/reservation">
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
              <div className="absolute inset-0 bg-[url('/images/Salon1.jpeg')] opacity-10 bg-cover bg-center" />
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
