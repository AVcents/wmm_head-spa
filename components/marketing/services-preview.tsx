'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Clock, Euro } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const services = [
  {
    name: 'Headspa Japonais',
    duration: '60 min',
    price: '65€',
    description:
      'Rituel traditionnel japonais combinant massage crânien, soins capillaires et moments de pure relaxation.',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
  },
  {
    name: 'Headspa Holistique',
    duration: '90 min',
    price: '85€',
    description:
      'Approche globale du bien-être intégrant massage, aromathérapie et techniques de relaxation profonde.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
  },
  {
    name: 'Massage Corps Complet',
    duration: '60 min',
    price: '70€',
    description:
      'Massage relaxant du corps entier pour libérer les tensions et retrouver harmonie physique et mentale.',
    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80',
  },
]

export function ServicesPreview() {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Nos prestations
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Choisissez l&apos;expérience qui vous correspond
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              className="group relative bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Service Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-serif font-semibold text-white">
                    {service.name}
                  </h3>
                </div>
              </div>

              {/* Service Content */}
              <div className="p-6">
                <div className="flex items-center gap-6 mb-4 text-sm text-foreground-secondary">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {service.price}
                    </span>
                  </div>
                </div>

                <p className="text-foreground-secondary leading-relaxed mb-6">
                  {service.description}
                </p>

                <Button variant="outline" className="w-full">
                  En savoir plus
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link href="/prestations">
            <Button size="lg" variant="default">
              Voir toutes les prestations
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
