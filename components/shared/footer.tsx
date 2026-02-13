'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Facebook, Instagram, Clock, Send, Sparkles, Scale } from 'lucide-react'
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
    { href: '/a-propos', label: 'À propos' },
  ]

  const legalLinks = [
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/cgv', label: 'CGV' },
    { href: '/politique-confidentialite', label: 'Confidentialité' },
  ]

  const [scheduleLabel, setScheduleLabel] = useState('')
  const [openingHours, setOpeningHours] = useState([
    { day: 'Lundi - Vendredi', hours: '9h00 - 12h00 / 13h00 - 19h00' },
    { day: 'Samedi', hours: 'Fermé' },
    { day: 'Dimanche', hours: 'Fermé' },
  ])

  useEffect(() => {
    async function loadSchedule() {
      try {
        const res = await fetch('/api/public/schedule')
        if (res.ok) {
          const data = await res.json()
          setScheduleLabel(data.label)
          setOpeningHours(data.hours)
        }
      } catch {
        // Keep default hours on error
      }
    }
    loadSchedule()
  }, [])

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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
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
                  href="https://www.instagram.com/kalm_headspa?igsh=MWd4aG9qa2d4YnR0bA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-400 dark:bg-primary-900/40 text-white dark:text-primary-400 hover:bg-primary-500 dark:hover:bg-primary-800 transition-all hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.facebook.com/p/Kalm-Headspa-61575796355668/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-400 dark:bg-primary-900/40 text-white dark:text-primary-400 hover:bg-primary-500 dark:hover:bg-primary-800 transition-all hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Contact & Informations légales - côte à côte sur mobile */}
            <div className="grid grid-cols-2 gap-6 lg:contents">
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

              {/* Pages légales */}
              <div>
                <h3 className="text-base font-serif font-semibold text-foreground mb-4 flex items-start gap-2">
                  <Scale className="h-4 w-4 mt-0.5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <span className="hidden sm:inline">Informations légales</span>
                  <span className="sm:hidden">Infos légales</span>
                </h3>
                <ul className="space-y-3">
                  {legalLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Horaires */}
            <div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                Horaires
              </h3>
              {scheduleLabel && (
                <p className="text-xs text-foreground-muted mb-3 italic">{scheduleLabel}</p>
              )}
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
              <div className="mt-4 p-3 rounded-lg bg-primary-600 dark:bg-primary-900/40 border border-primary-700 dark:border-primary-800">
                <p className="text-xs font-medium text-white dark:text-primary-300 text-center">
                  Sur rendez-vous uniquement
                </p>
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
            <a
              href="https://www.webmastermarketing.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <Image
                src="/images/WMM-full-black.png"
                alt="WMM Digital Agency"
                width={240}
                height={60}
                className="h-14 w-auto dark:hidden"
              />
              <Image
                src="/images/WMM-full-white.png"
                alt="WMM Digital Agency"
                width={240}
                height={60}
                className="h-14 w-auto hidden dark:block"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
