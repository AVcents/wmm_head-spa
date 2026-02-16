'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Gift, Heart, Sparkles, Phone, Mail, ArrowRight } from 'lucide-react'

export function BonCadeauPageContent() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900 px-4 py-2 rounded-full mb-6">
                <Gift className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  Le cadeau parfait
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
                Offrez un moment de{' '}
                <span className="text-primary-600 dark:text-primary-400">
                  bien-être
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-foreground-secondary mb-8 leading-relaxed">
                Faites plaisir à vos proches avec une carte cadeau Kalm Headspa.
                Un cadeau unique pour une expérience de relaxation inoubliable.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/bon-cadeau/commander">
                  <Button size="lg" className="group">
                    <Gift className="mr-2 h-5 w-5" />
                    Acheter un bon cadeau
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/images/Salon1.jpeg"
                alt="Bon cadeau spa relaxation"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/40 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Gift Section */}
      <section className="py-20 md:py-32 bg-background-secondary dark:bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Pourquoi offrir un bon cadeau ?
            </h2>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
              Un cadeau qui fait du bien, à tous les sens du terme
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Heart, title: 'Attentionné', description: 'Montrez à vos proches que vous pensez à leur bien-être et leur relaxation' },
              { icon: Sparkles, title: 'Unique', description: 'Une expérience mémorable qui sort de l\'ordinaire et crée des souvenirs' },
              { icon: Gift, title: 'Flexible', description: 'Valable 1 an, utilisable sur toutes nos prestations selon les envies' },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-surface dark:bg-surface border border-border rounded-2xl p-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-6">
                  <benefit.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-foreground-secondary leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <Link href="/bon-cadeau/commander">
              <Button size="lg" className="group">
                <Gift className="mr-2 h-5 w-5" />
                Commander mon bon cadeau
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-32 bg-background-secondary">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-foreground-secondary">En 3 étapes simples</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12">
            {[
              { step: '1', title: 'Choisissez', description: 'Sélectionnez la prestation ou le montant de votre choix' },
              { step: '2', title: 'Personnalisez', description: 'Ajoutez un message personnel pour rendre le cadeau unique' },
              { step: '3', title: 'Offrez', description: 'Recevez votre bon cadeau personnalisé et faites plaisir à vos proches' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 dark:bg-primary-500 text-white text-2xl font-bold rounded-full mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-foreground-secondary leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <Link href="/bon-cadeau/commander">
              <Button size="lg" className="group">
                <Gift className="mr-2 h-5 w-5" />
                Je commande maintenant
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Occasions */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Pour toutes les occasions
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['💝 Saint-Valentin', '🎂 Anniversaire', '🎄 Noël', '👶 Fête des mères', '💍 Mariage', '🎓 Réussite', '🌸 Printemps', '🎁 Juste parce que...'].map((occasion, index) => (
              <motion.div
                key={occasion}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-surface border border-border rounded-xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-foreground font-medium">{occasion}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/tablemassage2.jpeg" alt="Espace de relaxation" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-primary-600/95 dark:bg-primary-900/98" />
        </div>
        <div className="relative container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Offrez le cadeau du bien-être
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed">
              Un moment de détente absolue qui restera gravé dans les mémoires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:0621571222">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary-700 hover:bg-white/90">
                  <Phone className="mr-2 h-5 w-5" />
                  Appeler maintenant
                </Button>
              </a>
              <Link href="/bon-cadeau/commander">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  <Gift className="mr-2 h-5 w-5" />
                  Commander en ligne
                </Button>
              </Link>
            </div>
            <p className="text-white/80 text-sm mt-8">
              📧 Réception immédiate par email • 📄 Format PDF personnalisable • ⏰ Valable 1 an
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
