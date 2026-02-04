import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-background-secondary">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* À propos */}
          <div>
            <h3 className="text-lg font-serif font-semibold text-foreground mb-4">
              Kalm Headspa
            </h3>
            <p className="text-sm text-foreground-secondary leading-relaxed">
              Espace de bien-être dédié aux soins capillaires et à la relaxation.
              Découvrez le Head Spa, une tradition asiatique de détente profonde.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-serif font-semibold text-foreground mb-4">
              Contact
            </h3>
            <div className="space-y-3">
              <a
                href="https://maps.google.com/?q=65+Rue+du+Centre+Vecoux+88200"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-3 text-sm text-foreground-secondary hover:text-primary-600 transition-colors"
              >
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>65 Rue du Centre<br />88200 Vecoux</span>
              </a>
              <a
                href="tel:0621571222"
                className="flex items-center space-x-3 text-sm text-foreground-secondary hover:text-primary-600 transition-colors"
              >
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>06 21 57 12 22</span>
              </a>
              <a
                href="mailto:gw.guiot@outlook.fr"
                className="flex items-center space-x-3 text-sm text-foreground-secondary hover:text-primary-600 transition-colors"
              >
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>gw.guiot@outlook.fr</span>
              </a>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="text-lg font-serif font-semibold text-foreground mb-4">
              Suivez-nous
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-foreground-muted">
              © {new Date().getFullYear()} Kalm Headspa. Tous droits réservés.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/mentions-legales"
                className="text-sm text-foreground-muted hover:text-primary-600 transition-colors"
              >
                Mentions légales
              </Link>
              <Link
                href="/cgv"
                className="text-sm text-foreground-muted hover:text-primary-600 transition-colors"
              >
                CGV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
