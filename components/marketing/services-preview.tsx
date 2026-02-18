'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Clock, Euro } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const services = [
  {
    name: 'Headspa Japonais',
    duration: '45-75 min',
    price: 'À partir de 63€',
    description:
      'Le soin phare du salon. Massage du cuir chevelu, shampooing thérapeutique et détente profonde — vous repartez la tête légère et les cheveux nourris.',
    image: '/images/woman-enjoying-head-spa-relaxation-scalp-treatment-2026-01-23-18-03-50-utc.jpg',
  },
  {
    name: 'Headspa Holistique',
    duration: '105 min',
    price: 'À partir de 150€',
    description:
      'Pour celles et ceux qui veulent vraiment décrocher. Une heure quarante-cinq de soin complet : massage, huiles, aromathérapie. Une vraie bulle de douceur.',
    image: '/images/young-woman-enjoying-head-spa-water-therapy-2026-01-23-18-03-50-utc.jpg',
  },
  {
    name: 'Massage Corps Complet',
    duration: '60 min',
    price: '70€',
    description:
      'Du bout des pieds jusqu\'aux épaules. Un massage qui libère les tensions du corps et vous laisse dans un état de bien-être que vous n\'attendiez pas.',
    image: '/images/masseuse-holding-aromatherapy-sachets-over-woman-s-2026-01-05-01-12-22-utc.jpg',
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
            Que vous veniez pour vous détendre, prendre soin de vos cheveux, ou les deux — il y a un soin fait pour vous
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

                <Link href="/prestations" className="w-full">
                  <Button variant="outline" className="w-full">
                    En savoir plus
                  </Button>
                </Link>
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
