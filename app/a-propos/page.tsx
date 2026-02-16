'use client'

import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Sparkles, Heart, Users, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function AProposPage() {
  const values = [
    {
      icon: Calendar,
      title: 'Liberté & Équilibre',
    },
    {
      icon: Users,
      title: 'Lien Humain',
      description: 'Ce qui me tient le plus à cœur : vous rencontrer, échanger, créer un vrai lien. Chaque séance est une rencontre avant d\'être un soin.',
    },
    {
      icon: Heart,
      title: 'Votre Bien-être',
      description: 'Que vous repartiez avec ce sentiment d\'avoir vraiment pris du temps pour vous. Cette sensation de légèreté et de sérénité que je connais et que je veux vous offrir.',
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
                    Fondatrice de Kalm Headspa
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground mb-4">
                  Gwenaëlle{' '}
                  <span className="text-primary-600 dark:text-primary-400">Bazin</span>
                </h1>
                <p className="text-xl text-foreground-secondary font-light italic mb-8 leading-relaxed">
                  « Cet endroit que j&apos;ai imaginé pour que vous soyez heureux(ses) de me rejoindre. »
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/bon-cadeau">
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700">
                      Prendre rendez-vous
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
                className="relative h-[420px] lg:h-[520px] rounded-3xl overflow-hidden shadow-2xl"
              >
                <Image
                  src="/images/Gwen.jpeg"
                  alt="Gwenaëlle Bazin, fondatrice de Kalm Headspa"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/20 to-transparent" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Citation / Histoire personnelle */}
        <section className="py-20 bg-background-secondary">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                  Mon histoire
                </h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto" />
              </motion.div>

              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative bg-surface border border-border rounded-2xl p-8 md:p-10"
                >
                  {/* Guillemet décoratif */}
                  <span className="absolute -top-5 left-8 text-7xl font-serif text-primary-200 dark:text-primary-800 leading-none select-none">
                    "
                  </span>
                  <div className="space-y-6 text-foreground-secondary leading-relaxed text-lg">
                    <p>
                      En tant que jeune maman de deux enfants, j&apos;ai découvert à quel point il est essentiel
                      pour moi de trouver un équilibre entre ma vie professionnelle et ma vie personnelle.
                    </p>
                    <p>
                      Avoir une liberté dans mon planning professionnel, organiser mes journées de manière à
                      pouvoir être présente pour mes enfants tout en continuant à m&apos;épanouir dans mon travail.
                    </p>
                    <p>
                      Ce qui est tout aussi important pour moi, c&apos;est de maintenir un contact humain,
                      d&apos;échanger avec vous et de créer des liens. Vous relaxer et que vous repartiez avec ce
                      sentiment d&apos;avoir bien pris le temps pour vous. Cette sensation que j&apos;ai aussi.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Valeurs */}
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
                Ce qui me guide
              </h2>
              <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
                Les valeurs qui sont au cœur de Kalm Headspa
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="p-8 rounded-2xl bg-surface border border-border text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 mb-6">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-foreground-secondary leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Kalm Headspa — La marque */}
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
                Kalm Headspa
              </h2>
              <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
                Un espace pensé pour vous, dans un cadre chaleureux et apaisant
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Description de la marque */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <p className="text-lg text-foreground-secondary leading-relaxed">
                  Kalm Headspa est né de l&apos;envie de créer un lieu où chaque personne peut vraiment
                  déposer le poids du quotidien. Un espace dédié au Head Spa — cette pratique japonaise
                  millénaire — au cœur des Vosges, à Vecoux.
                </p>
                <p className="text-lg text-foreground-secondary leading-relaxed">
                  Ici, le temps s&apos;arrête. Chaque soin est dispensé avec attention, dans un environnement
                  soigné et chaleureux, pensé dans les moindres détails pour que vous vous sentiez
                  pleinement accueillis.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-5 rounded-xl bg-surface border border-border text-center">
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">100%</div>
                    <div className="text-sm text-foreground-secondary">Sur rendez-vous</div>
                  </div>
                  <div className="p-5 rounded-xl bg-surface border border-border text-center">
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">Vecoux</div>
                    <div className="text-sm text-foreground-secondary">88200, Vosges</div>
                  </div>
                </div>
              </motion.div>

              {/* Photos de la marque — zone à personnaliser avec les vraies photos */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="relative h-56 rounded-2xl overflow-hidden col-span-2">
                  <Image
                    src="/images/Salon1.jpeg"
                    alt="Espace Kalm Headspa"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="relative h-40 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/Tablemassage.jpeg"
                    alt="Table de massage Head Spa"
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
                <div className="relative h-40 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/tablemassage2.jpeg"
                    alt="Soin Head Spa Kalm"
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
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
                  Venez me rejoindre
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  J&apos;ai hâte de vous accueillir et de vous offrir ce moment rien que pour vous.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/bon-cadeau">
                    <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-white/90 border-0">
                      Prendre rendez-vous
                    </Button>
                  </Link>
                  <a href="tel:0621571222">
                    <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                      06 21 57 12 22
                    </Button>
                  </a>
                </div>
              </div>
              <div className="absolute inset-0 bg-[url('/images/tablemassage2.jpeg')] opacity-10 bg-cover bg-center" />
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
