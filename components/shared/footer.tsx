'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Instagram, Clock, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter subscription
    setIsSubscribed(true)
    setEmail('')
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  const quickLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/prestations', label: 'Nos prestations' },
    { href: '/bon-cadeau', label: 'Bon cadeau' },
    { href: '#apropos', label: 'À propos' },
  ]

  const legalLinks = [
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/cgv', label: 'CGV' },
    { href: '/politique-confidentialite', label: 'Confidentialité' },
  ]

  const openingHours = [
    { day: 'Lundi - Vendredi', hours: '9h00 - 19h00' },
    { day: 'Samedi', hours: '9h00 - 18h00' },
    { day: 'Dimanche', hours: 'Fermé' },
  ]

  return (
    <footer className="bg-gradient-to-b from-background to-background-secondary dark:from-background-secondary dark:to-background border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-border">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
              Restez informé de nos actualités
            </h3>
            <p className="text-foreground-secondary mb-6">
              Recevez nos offres exclusives et conseils bien-être directement dans votre boîte mail
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" className="gap-2 bg-gradient-to-r from-primary-600 to-primary-700">
                <Send className="h-4 w-4" />
                S&apos;inscrire
              </Button>
            </form>
            {isSubscribed && (
              <p className="text-sm text-primary-600 dark:text-primary-400 mt-3">
                Merci pour votre inscription !
              </p>
            )}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* À propos */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-foreground">
                  Kalm Headspa
                </h3>
              </div>
              <p className="text-sm text-foreground-secondary leading-relaxed mb-4">
                Espace de bien-être dédié aux soins capillaires et à la relaxation profonde.
                Découvrez le Head Spa, une tradition japonaise ancestrale.
              </p>
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-all hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-all hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Navigation rapide */}
            <div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-4">
                Navigation
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all mr-0 group-hover:mr-2"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Horaires */}
            <div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                Horaires
              </h3>
              <ul className="space-y-3">
                {openingHours.map((schedule) => (
                  <li key={schedule.day} className="text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground-secondary">{schedule.day}</span>
                      <span className="font-medium text-foreground">{schedule.hours}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <p className="text-xs text-primary-700 dark:text-primary-300">
                  Sur rendez-vous uniquement
                </p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-4">
                Contact
              </h3>
              <div className="space-y-4">
                <a
                  href="https://maps.google.com/?q=65+Rue+du+Centre+Vecoux+88200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-3 text-sm text-foreground-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                >
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>
                    65 Rue du Centre<br />
                    88200 Vecoux
                  </span>
                </a>
                <a
                  href="tel:0621571222"
                  className="flex items-center space-x-3 text-sm text-foreground-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                >
                  <Phone className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>06 21 57 12 22</span>
                </a>
                <a
                  href="mailto:gw.guiot@outlook.fr"
                  className="flex items-center space-x-3 text-sm text-foreground-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                >
                  <Mail className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>gw.guiot@outlook.fr</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-foreground-secondary">
              © {new Date().getFullYear()} Kalm Headspa. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-foreground-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
