'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const images = [
  {
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    alt: 'Massage crânien professionnel',
    className: 'col-span-2 row-span-2',
  },
  {
    url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
    alt: 'Produits naturels pour soins capillaires',
    className: 'col-span-1 row-span-1',
  },
  {
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
    alt: 'Ambiance spa relaxante',
    className: 'col-span-1 row-span-1',
  },
  {
    url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80',
    alt: 'Soin du cuir chevelu',
    className: 'col-span-1 row-span-2',
  },
  {
    url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80',
    alt: 'Relaxation et bien-être',
    className: 'col-span-2 row-span-1',
  },
]

export function ImageGallery() {
  return (
    <section className="py-16 md:py-24 bg-background-secondary dark:bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            L&apos;expérience{' '}
            <span className="text-primary-600 dark:text-primary-400">Kalm</span>
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Un espace dédié à votre bien-être, où tradition asiatique et modernité se rencontrent
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl group ${image.className}`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-white font-medium text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {image.alt}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
