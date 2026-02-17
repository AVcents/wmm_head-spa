'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Leaf, Recycle, FlaskConical, Award, MapPin } from 'lucide-react'

const products = [
  {
    id: 'shampoing',
    name: 'Shampoing sur-mesure',
    tagline: 'La base d\'un rituel capillaire personnalisé',
    description:
      'Formulé selon votre diagnostic capillaire, ce shampoing nettoie en douceur sans altérer l\'équilibre naturel de votre cuir chevelu.',
    image: 'https://juste.paris/wp-content/themes/juste/images/products/SHAMP-hp.png',
    variants: [
      { label: '250 ml', price: '20€' },
      { label: '500 ml', price: '34€' },
    ],
    badges: ['Sans sulfates', 'Sans silicones', '97% naturel'],
  },
  {
    id: 'apres-shampoing',
    name: 'Après-shampoing sur-mesure',
    tagline: 'Démêlant, hydratant, adapté à vos cheveux',
    description:
      'Enrichi en actifs botaniques sélectionnés pour votre type de cheveux. Laisse les longueurs souples, brillantes et faciles à coiffer.',
    image: 'https://juste.paris/wp-content/themes/juste/images/products/APSHAMP-hp.png',
    variants: [
      { label: '250 ml', price: '20€' },
      { label: '500 ml', price: '34€' },
    ],
    badges: ['Vegan', 'Made in France', 'Éco-conçu'],
  },
  {
    id: 'masque',
    name: 'Masque capillaire sur-mesure',
    tagline: 'Nutrition intense, une fois par semaine',
    description:
      'Un soin concentré qui répare, nourrit et renforce la fibre capillaire en profondeur. Résultat visible dès la première application.',
    image: 'https://juste.paris/wp-content/themes/juste/images/products/MASQUE-ROUGE-250-HP.png',
    variants: [
      { label: '250 ml', price: '29€' },
    ],
    badges: ['Réparateur', 'Nourrissant', 'Sans parabènes'],
  },
  {
    id: 'complements',
    name: 'Compléments alimentaires',
    tagline: 'La beauté capillaire, de l\'intérieur',
    description:
      'Un complexe de vitamines et minéraux ciblé pour renforcer la pousse, limiter la chute et sublimer l\'éclat de vos cheveux au quotidien.',
    image: 'https://juste.paris/wp-content/themes/juste/images/products/visuel_comp_hp.png',
    variants: [
      { label: '1 mois', price: '25€' },
      { label: '3 mois', price: '64€' },
    ],
    badges: ['Cure personnalisée', 'Cliniquement testé', 'Sans OGM'],
  },
]

const values = [
  { icon: Leaf, label: '97% naturel', desc: 'Ingrédients d\'origine naturelle' },
  { icon: Recycle, label: 'Éco-responsable', desc: 'Emballages 100% recyclés' },
  { icon: Award, label: 'Made in France', desc: 'Fabriqué en France' },
  { icon: FlaskConical, label: 'Sur-mesure', desc: 'Formule adaptée à vous' },
]

export function JusteParisCatalog() {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero */}
      <section className="relative bg-white overflow-hidden py-20 md:py-32">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-green-500 opacity-5 pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Texte */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 bg-green-100 text-green-800">
                <Leaf className="h-4 w-4" />
                Partenaire officiel Juste Paris
              </div>

              <div className="mb-6">
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-serif font-bold tracking-tight leading-none text-green-950">
                  juste
                </h1>
                <p className="text-2xl sm:text-3xl font-light tracking-[0.3em] uppercase text-green-700">
                  paris
                </p>
              </div>

              <p className="text-xl sm:text-2xl text-gray-500 font-light leading-relaxed mb-4 max-w-xl">
                Shampoing, soin &amp; compléments{' '}
                <span className="font-medium text-green-700">sur-mesure</span>
              </p>
              <p className="text-gray-500 leading-relaxed max-w-lg">
                Des soins capillaires personnalisés, formulés selon votre diagnostic,
                avec des ingrédients naturels et éco-responsables. Gwenaëlle vous
                accompagne dans le choix de votre routine.
              </p>

              <div className="inline-flex items-center gap-3 mt-8 px-5 py-3 rounded-2xl border bg-green-50 border-green-200 text-green-900">
                <MapPin className="h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">Disponible directement sur place</p>
                  <p className="text-xs opacity-70">Salon Kalm Headspa · Vecoux, 88200</p>
                </div>
              </div>
            </motion.div>

            {/* Visuel brand */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-shrink-0"
            >
              <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                <div className="text-center">
                  <div className="relative w-32 h-20 mx-auto mb-4">
                    <Image
                      src="https://juste.paris/wp-content/themes/juste/images/logo-juste.png"
                      alt="Juste Paris"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs mt-3 tracking-wide text-green-700 font-medium">
                    97% naturel · Made in France
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Note client : 4,7 / 5 ⭐
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bannière disponible sur place */}
      <div className="bg-gradient-to-r from-green-900 to-green-700">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <MapPin className="h-4 w-4" />
              <span className="font-semibold">Disponible directement sur place au salon</span>
            </div>
            <span className="hidden sm:block opacity-40">·</span>
            <span className="opacity-80 text-center">
              Venez découvrir et tester les produits avec Gwenaëlle
            </span>
          </div>
        </div>
      </div>

      {/* Valeurs marque */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-green-100"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-green-100">
                  <v.icon className="h-6 w-6 text-green-700" />
                </div>
                <p className="font-semibold text-sm mb-1 text-green-950">
                  {v.label}
                </p>
                <p className="text-xs text-green-700">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalogue produits */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium tracking-widest uppercase mb-3 text-green-700">
              La gamme
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Soins sur-mesure
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Chaque produit est personnalisé selon votre diagnostic capillaire.
              Une formule, rien que pour vous.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                className="rounded-3xl overflow-hidden flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Image produit — fond blanc */}
                <div className="relative h-56 bg-white flex items-center justify-center overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-contain h-44 w-auto drop-shadow-sm"
                    unoptimized
                  />
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-serif font-bold mb-1 text-green-950">
                    {product.name}
                  </h3>
                  <p className="text-sm font-medium mb-3 text-green-700">
                    {product.tagline}
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">
                    {product.description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {product.badges.map((badge) => (
                      <span
                        key={badge}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-800"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Prix + dispo */}
                  <div className="mt-auto pt-5 border-t border-gray-100">
                    <div className="flex flex-wrap gap-5 mb-4">
                      {product.variants.map((v) => (
                        <div key={v.label}>
                          <p className="text-2xl font-bold text-green-700">
                            {v.price}
                          </p>
                          <p className="text-xs text-gray-400">{v.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl bg-green-50 text-green-800 border border-green-200">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      Disponible sur place
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-green-900 to-green-700">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="w-6 h-6" fill="#fbbf24" viewBox="0 0 24 24">
                  <path
                    fill="#fbbf24"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
              <span className="ml-2 text-white font-semibold text-lg">4,7 / 5</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              Venez découvrir Juste Paris au salon
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Gwenaëlle vous accueille et vous conseille sur la gamme complète.
              Testez, sentez, et repartez avec les produits faits pour vous.
            </p>

            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white">
              <MapPin className="h-5 w-5 text-green-300 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Kalm Headspa</p>
                <p className="text-white/70 text-xs">Vecoux · 88200 · 06 21 57 12 22</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
