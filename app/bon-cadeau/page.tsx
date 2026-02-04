'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { motion } from 'framer-motion'
import { Gift, Heart, Sparkles, CheckCircle, Phone, Mail, ArrowRight } from 'lucide-react'

export default function BonCadeauPage() {
  return (
    <>
      <Header />
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
                  <Button size="lg" variant="outline">
                    En savoir plus
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80"
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
                {
                  icon: Heart,
                  title: 'Attentionné',
                  description: 'Montrez à vos proches que vous pensez à leur bien-être et leur relaxation',
                },
                {
                  icon: Sparkles,
                  title: 'Unique',
                  description: 'Une expérience mémorable qui sort de l\'ordinaire et crée des souvenirs',
                },
                {
                  icon: Gift,
                  title: 'Flexible',
                  description: 'Valable 1 an, utilisable sur toutes nos prestations selon les envies',
                },
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
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-foreground-secondary leading-relaxed">
                    {benefit.description}
                  </p>
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

        {/* Gift Options */}
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
                Choisissez votre formule
              </h2>
              <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
                Des montants adaptés à toutes les envies
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Bon Découverte',
                  price: '65€',
                  image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
                  features: [
                    'Headspa Japonais 60min',
                    'Massage crânien traditionnel',
                    'Soins capillaires naturels',
                    'Moment de pure détente',
                  ],
                  popular: false,
                },
                {
                  name: 'Bon Prestige',
                  price: '85€',
                  image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
                  features: [
                    'Headspa Holistique 90min',
                    'Massage & aromathérapie',
                    'Relaxation profonde',
                    'Soin complet corps-esprit',
                  ],
                  popular: true,
                },
                {
                  name: 'Bon Libre',
                  price: 'Montant libre',
                  image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80',
                  features: [
                    'Montant de votre choix',
                    'Utilisable sur toutes prestations',
                    'Valable 1 an',
                    'Personnalisable',
                  ],
                  popular: false,
                },
              ].map((option, index) => (
                <motion.div
                  key={option.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`relative bg-surface border-2 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                    option.popular
                      ? 'border-primary-500 dark:border-primary-400'
                      : 'border-border'
                  }`}
                >
                  {option.popular && (
                    <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                      POPULAIRE
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-48">
                    <Image
                      src={option.image}
                      alt={option.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                      {option.name}
                    </h3>
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6">
                      {option.price}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {option.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-foreground-secondary">
                          <CheckCircle className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/bon-cadeau/commander" className="w-full">
                      <Button
                        className="w-full"
                        variant={option.popular ? 'default' : 'outline'}
                      >
                        Choisir cette formule
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center mt-12"
            >
              <p className="text-foreground-muted mb-6">
                Besoin d&apos;aide pour choisir ?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:0621571222">
                  <Button variant="outline" size="lg">
                    <Phone className="mr-2 h-5 w-5" />
                    06 21 57 12 22
                  </Button>
                </a>
                <a href="mailto:gw.guiot@outlook.fr">
                  <Button variant="outline" size="lg">
                    <Mail className="mr-2 h-5 w-5" />
                    Nous écrire
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it Works */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&q=80"
              alt="Spa zen"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-background/95 dark:bg-background/98" />
          </div>

          <div className="relative container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
              <p className="text-lg text-foreground-secondary">
                En 3 étapes simples
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12">
              {[
                {
                  step: '1',
                  title: 'Choisissez',
                  description: 'Sélectionnez le montant ou la prestation de votre choix parmi nos formules',
                },
                {
                  step: '2',
                  title: 'Commandez',
                  description: 'Contactez-nous par téléphone ou email pour finaliser votre bon cadeau',
                },
                {
                  step: '3',
                  title: 'Offrez',
                  description: 'Recevez votre bon cadeau personnalisé et faites plaisir à vos proches',
                },
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
                  <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-foreground-secondary leading-relaxed">
                    {item.description}
                  </p>
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

        {/* Occasions Section */}
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
                Pour toutes les occasions
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                '💝 Saint-Valentin',
                '🎂 Anniversaire',
                '🎄 Noël',
                '👶 Fête des mères',
                '💍 Mariage',
                '🎓 Réussite',
                '🌸 Printemps',
                '🎁 Juste parce que...',
              ].map((occasion, index) => (
                <motion.div
                  key={occasion}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-surface dark:bg-surface border border-border rounded-xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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
            <Image
              src="https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1600&q=80"
              alt="Espace de relaxation"
              fill
              className="object-cover"
              sizes="100vw"
            />
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
                Commandez votre bon cadeau en quelques clics.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:0621571222">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-primary-700 hover:bg-white/90"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Appeler maintenant
                  </Button>
                </a>
                <a href="mailto:gw.guiot@outlook.fr">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Commander par email
                  </Button>
                </a>
              </div>

              <p className="text-white/80 text-sm mt-8">
                📧 Réception immédiate par email • 📄 Format PDF personnalisable • ⏰ Valable 1 an
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
