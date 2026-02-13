'use client'

import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { Scale, Building2, User, Mail, Phone } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MentionsLegalesPage() {
  const sections = [
    {
      icon: Building2,
      title: 'Éditeur du site',
      content: (
        <>
          <p><strong>Raison sociale :</strong> Kalm Headspa</p>
          <p><strong>Forme juridique :</strong> Auto-entrepreneur</p>
          <p><strong>Siège social :</strong> 65 Rue du Centre, 88200 Vecoux, France</p>
          <p><strong>SIRET :</strong> [À compléter]</p>
          <p><strong>Responsable de publication :</strong> Gwenaëlle GUIOT</p>
        </>
      ),
    },
    {
      icon: User,
      title: 'Contact',
      content: (
        <>
          <p><strong>Téléphone :</strong> <a href="tel:0621571222" className="text-primary-600 dark:text-primary-400 hover:underline">06 21 57 12 22</a></p>
          <p><strong>Email :</strong> <a href="mailto:gw.guiot@outlook.fr" className="text-primary-600 dark:text-primary-400 hover:underline">gw.guiot@outlook.fr</a></p>
          <p><strong>Adresse :</strong> 65 Rue du Centre, 88200 Vecoux</p>
        </>
      ),
    },
    {
      icon: Building2,
      title: 'Hébergement',
      content: (
        <>
          <p><strong>Hébergeur :</strong> Vercel Inc.</p>
          <p><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
          <p><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">vercel.com</a></p>
        </>
      ),
    },
    {
      icon: Scale,
      title: 'Propriété intellectuelle',
      content: (
        <>
          <p>L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes, etc.) est la propriété exclusive de Kalm Headspa, sauf mention contraire.</p>
          <p className="mt-4">Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces différents éléments est strictement interdite sans l'accord écrit préalable de Kalm Headspa.</p>
          <p className="mt-4">Les marques et logos présents sur le site sont la propriété de leurs détenteurs respectifs.</p>
        </>
      ),
    },
    {
      icon: Building2,
      title: 'Responsabilité',
      content: (
        <>
          <p>Les informations communiquées sur ce site sont présentées à titre indicatif et général. Kalm Headspa s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées, mais ne peut en garantir l'exhaustivité.</p>
          <p className="mt-4">Kalm Headspa ne saurait être tenu responsable :</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>Des erreurs ou omissions dans le contenu du site</li>
            <li>De l'indisponibilité temporaire du site</li>
            <li>Des dommages résultant de l'utilisation du site ou de l'impossibilité de l'utiliser</li>
            <li>Du contenu des sites tiers vers lesquels renvoient les liens hypertextes présents sur le site</li>
          </ul>
        </>
      ),
    },
    {
      icon: User,
      title: 'Données personnelles',
      content: (
        <>
          <p>Les informations recueillies sur ce site font l'objet d'un traitement informatique destiné à :</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>La gestion des réservations de prestations</li>
            <li>La vente de bons cadeaux</li>
            <li>L'envoi de communications commerciales (avec votre consentement)</li>
          </ul>
          <p className="mt-4">Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données vous concernant.</p>
          <p className="mt-4">Pour exercer ces droits, vous pouvez nous contacter à l'adresse : <a href="mailto:gw.guiot@outlook.fr" className="text-primary-600 dark:text-primary-400 hover:underline">gw.guiot@outlook.fr</a></p>
          <p className="mt-4">Pour plus d'informations, consultez notre <a href="/politique-confidentialite" className="text-primary-600 dark:text-primary-400 hover:underline">Politique de confidentialité</a>.</p>
        </>
      ),
    },
    {
      icon: Building2,
      title: 'Cookies',
      content: (
        <>
          <p>Ce site utilise des cookies pour améliorer l'expérience utilisateur et mesurer l'audience.</p>
          <p className="mt-4">Les cookies utilisés sont :</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>Cookies techniques :</strong> Nécessaires au fonctionnement du site (session, préférences)</li>
            <li><strong>Cookies d'analyse :</strong> Pour mesurer l'audience et améliorer le site</li>
          </ul>
          <p className="mt-4">Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités du site pourraient ne pas fonctionner correctement.</p>
        </>
      ),
    },
    {
      icon: Scale,
      title: 'Droit applicable',
      content: (
        <>
          <p>Les présentes mentions légales sont régies par le droit français.</p>
          <p className="mt-4">En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux compétents selon les règles de droit commun.</p>
        </>
      ),
    },
    {
      icon: Building2,
      title: 'Conception et développement',
      content: (
        <>
          <p><strong>Agence :</strong> WMM (WebMaster Marketing)</p>
          <p><strong>Site web :</strong> <a href="https://www.webmastermarketing.fr" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">www.webmastermarketing.fr</a></p>
        </>
      ),
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background to-background-secondary">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 mb-6">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
                Mentions légales
              </h1>
              <p className="text-lg text-foreground-secondary leading-relaxed">
                Informations légales et réglementaires du site Kalm Headspa
              </p>
              <p className="text-sm text-foreground-muted mt-4">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="py-20">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  className="bg-surface border border-border rounded-2xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex-shrink-0">
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-foreground mt-2">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-foreground-secondary leading-relaxed space-y-2 ml-16">
                    {section.content}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-background-secondary">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-serif font-bold text-white mb-4">
                Une question sur nos mentions légales ?
              </h2>
              <p className="text-lg text-white/90 mb-6">
                N'hésitez pas à nous contacter pour toute demande d'information
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:gw.guiot@outlook.fr"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-white/90 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  Nous écrire
                </a>
                <a
                  href="tel:0621571222"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  06 21 57 12 22
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
