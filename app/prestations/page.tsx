'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { ServiceCard } from '@/components/services/service-card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  services,
  categories,
  durationFilters,
  priceFilters,
} from '@/lib/services-data'
import { Filter, Sparkles, Heart, TrendingUp, ArrowRight } from 'lucide-react'

export default function PrestationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDuration, setSelectedDuration] = useState<string | number>('all')
  const [selectedPrice, setSelectedPrice] = useState<string>('all')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Category filter
      if (selectedCategory !== 'all' && service.category !== selectedCategory) {
        return false
      }

      // Duration filter
      if (selectedDuration !== 'all') {
        if (!service.hasVariants) {
          if (service.duration !== selectedDuration) {
            return false
          }
        } else {
          // For services with variants, check if any variant matches the duration
          const hasMatchingDuration = service.variants?.some(
            (v) => v.duration === selectedDuration
          )
          if (!hasMatchingDuration) {
            return false
          }
        }
      }

      // Price filter
      if (selectedPrice !== 'all') {
        const priceFilter = priceFilters.find((f) => f.id === selectedPrice)
        if (priceFilter && priceFilter.value !== 'all') {
          const priceRange = priceFilter.value as { min: number; max: number }

          if (!service.hasVariants) {
            // For single services, check the price directly
            if (service.price && (service.price < priceRange.min || service.price > priceRange.max)) {
              return false
            }
          } else {
            // For services with variants, check if any variant matches the price range
            const hasMatchingPrice = service.variants?.some(
              (v) => v.price >= priceRange.min && v.price <= priceRange.max
            )
            if (!hasMatchingPrice) {
              return false
            }
          }
        }
      }

      return true
    })
  }, [selectedCategory, selectedDuration, selectedPrice])

  const resetFilters = () => {
    setSelectedCategory('all')
    setSelectedDuration('all')
    setSelectedPrice('all')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-background py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground mb-4">
                Nos prestations
              </h1>
              <p className="text-lg sm:text-xl text-foreground-secondary max-w-2xl mx-auto">
                Découvrez nos soins Head Spa et massages pour votre bien-être
              </p>
            </motion.div>

            {/* Benefits Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 p-8 md:p-12 mb-12"
            >
              <div className="relative z-10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                      <Sparkles className="h-4 w-4 text-white" />
                      <span className="text-sm font-medium text-white">
                        Résultats scientifiquement prouvés
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4">
                      Transformez votre bien-être en 60-90 minutes
                    </h2>
                    <p className="text-white/90 mb-6">
                      Chaque séance de Head Spa augmente jusqu&apos;à <strong>120% la circulation sanguine</strong>,
                      réduit le stress de <strong>40%</strong>, et active les gènes de croissance capillaire pendant <strong>72 heures</strong>.
                    </p>
                    <Link href="/bon-cadeau/commander">
                      <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-white/90 border-0 group">
                        Réserver maintenant
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <Heart className="h-8 w-8 text-white mb-2" />
                      <div className="text-2xl font-bold text-white">-40%</div>
                      <div className="text-sm text-white/80">Stress (cortisol)</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <TrendingUp className="h-8 w-8 text-white mb-2" />
                      <div className="text-2xl font-bold text-white">+120%</div>
                      <div className="text-sm text-white/80">Circulation</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 col-span-2">
                      <Sparkles className="h-8 w-8 text-white mb-2" />
                      <div className="text-2xl font-bold text-white">72 heures</div>
                      <div className="text-sm text-white/80">D&apos;activation génétique capillaire</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80')] opacity-10 bg-cover bg-center" />
            </motion.div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showMobileFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`lg:w-80 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}
              >
                <div className="bg-surface border border-border rounded-2xl p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif font-semibold text-foreground">
                      Filtres
                    </h2>
                    <button
                      onClick={resetFilters}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Réinitialiser
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Catégories
                    </h3>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                            selectedCategory === cat.value
                              ? 'bg-primary-600 text-white'
                              : 'bg-background text-foreground-secondary hover:bg-primary-50 dark:hover:bg-primary-900/20'
                          }`}
                        >
                          <span className="text-sm font-medium">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Filter */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Durée</h3>
                    <div className="flex flex-wrap gap-2">
                      {durationFilters.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setSelectedDuration(filter.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selectedDuration === filter.value
                              ? 'bg-primary-600 text-white'
                              : 'bg-background text-foreground-secondary hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-border'
                          }`}
                        >
                          {filter.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Prix</h3>
                    <div className="flex flex-wrap gap-2">
                      {priceFilters.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setSelectedPrice(filter.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selectedPrice === filter.id
                              ? 'bg-primary-600 text-white'
                              : 'bg-background text-foreground-secondary hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-border'
                          }`}
                        >
                          {filter.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>

              {/* Services Grid */}
              <div className="flex-1">
                <div className="mb-6">
                  <p className="text-sm text-foreground-secondary">
                    {filteredServices.length}{' '}
                    {filteredServices.length > 1 ? 'prestations' : 'prestation'} trouvée
                    {filteredServices.length > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <ServiceCard service={service} />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <p className="text-lg text-foreground-secondary">
                        Aucune prestation ne correspond à vos critères
                      </p>
                      <Button
                        onClick={resetFilters}
                        variant="outline"
                        className="mt-4"
                      >
                        Réinitialiser les filtres
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
