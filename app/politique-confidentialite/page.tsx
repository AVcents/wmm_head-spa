'use client'

import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { Shield, Lock, Eye, Database, UserCheck, Cookie, Mail, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PolitiqueConfidentialitePage() {
  const sections = [
    {
      icon: Shield,
      title: '1. Responsable du traitement',
      content: (
        <>
          <p>Le responsable du traitement des données personnelles est :</p>
          <p className="mt-4"><strong>Kalm Headspa</strong><br />
          Gwenaëlle GUIOT<br />
          65 Rue du Centre<br />
          88200 Vecoux<br />
          Email : <a href="mailto:gw.guiot@outlook.fr" className="text-primary-600 dark:text-primary-400 hover:underline">gw.guiot@outlook.fr</a><br />
          Téléphone : <a href="tel:0621571222" className="text-primary-600 dark:text-primary-400 hover:underline">06 21 57 12 22</a></p>
        </>
      ),
    },
    {
      icon: Database,
      title: '2. Données collectées',
      content: (
        <>
          <p>Nous collectons les données personnelles suivantes :</p>
          <p className="mt-4"><strong>2.1 - Lors de la prise de rendez-vous :</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>Date et heure du rendez-vous souhaitées</li>
            <li>Type de prestation choisie</li>
          </ul>
          <p className="mt-4"><strong>2.2 - Lors de l'achat d'un bon cadeau :</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Nom et prénom de l'acheteur</li>
            <li>Adresse email</li>
            <li>Informations de paiement (traitées par Stripe)</li>
            <li>Nom du bénéficiaire (facultatif)</li>
          </ul>
          <p className="mt-4"><strong>2.3 - Fiche client en institut :</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Informations de santé pertinentes (allergies, contre-indications)</li>
            <li>Historique des prestations</li>
            <li>Notes et préférences</li>
          </ul>
          <p className="mt-4"><strong>2.4 - Données de navigation :</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Adresse IP</li>
            <li>Type de navigateur</li>
            <li>Pages visitées</li>
            <li>Données d'usage via cookies (avec votre consentement)</li>
          </ul>
        </>
      ),
    },
    {
      icon: Eye,
      title: '3. Finalités du traitement',
      content: (
        <>
          <p>Vos données personnelles sont collectées pour les finalités suivantes :</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>Gestion des réservations :</strong> Planification et confirmation de vos rendez-vous</li>
            <li><strong>Gestion des bons cadeaux :</strong> Traitement des commandes et envoi des bons</li>
            <li><strong>Relation client :</strong> Suivi personnalisé, rappels de rendez-vous, gestion des demandes</li>
            <li><strong>Santé et sécurité :</strong> Adaptation des prestations à vos besoins et contre-indications</li>
            <li><strong>Communications commerciales :</strong> Envoi d'offres et actualités (avec votre consentement)</li>
            <li><strong>Amélioration du service :</strong> Analyse de l'utilisation du site pour optimiser l'expérience</li>
            <li><strong>Obligations légales :</strong> Conformité comptable et fiscale</li>
          </ul>
        </>
      ),
    },
    {
      icon: Lock,
      title: '4. Base légale du traitement',
      content: (
        <>
          <p>Le traitement de vos données repose sur :</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>L'exécution d'un contrat :</strong> Gestion de vos réservations et prestations</li>
            <li><strong>Votre consentement :</strong> Newsletter, cookies d'analyse, données de santé</li>
            <li><strong>L'intérêt légitime :</strong> Amélioration de nos services, prévention de la fraude</li>
            <li><strong>Obligation légale :</strong> Conservation des données comptables</li>
          </ul>
        </>
      ),
    },
    {
      icon: Database,
      title: '5. Destinataires des données',
      content: (
        <>
          <p>Vos données personnelles sont destinées :</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>Personnel autorisé :</strong> Seule Gwenaëlle GUIOT a accès à vos données</li>
            <li><strong>Prestataires techniques :</strong>
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Hapio (système de réservation en ligne)</li>
                <li>Stripe (paiement sécurisé des bons cadeaux)</li>
                <li>Supabase (hébergement de la base de données)</li>
                <li>Vercel (hébergement du site web)</li>
                <li>Resend (envoi d'emails transactionnels)</li>
              </ul>
            </li>
            <li><strong>Autorités compétentes :</strong> En cas d'obligation légale uniquement</li>
          </ul>
          <p className="mt-4">Tous nos prestataires sont soumis à des obligations de confidentialité et ne peuvent utiliser vos données qu'aux fins pour lesquelles nous les leur communiquons.</p>
        </>
      ),
    },
    {
      icon: Database,
      title: '6. Durée de conservation',
      content: (
        <>
          <p>Vos données sont conservées pendant les durées suivantes :</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>Données de réservation :</strong> 3 ans après le dernier rendez-vous</li>
            <li><strong>Données de santé :</strong> 5 ans après le dernier soin (fiche client papier)</li>
            <li><strong>Bons cadeaux :</strong> 12 mois + 3 ans (durée légale comptable)</li>
            <li><strong>Données comptables :</strong> 10 ans (obligation légale)</li>
            <li><strong>Newsletter :</strong> Jusqu'à votre désinscription + 3 ans</li>
            <li><strong>Cookies :</strong> Maximum 13 mois</li>
          </ul>
          <p className="mt-4">À l'issue de ces délais, vos données sont supprimées ou anonymisées.</p>
        </>
      ),
    },
    {
      icon: UserCheck,
      title: '7. Vos droits',
      content: (
        <>
          <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
            <li><strong>Droit de rectification :</strong> Corriger des données inexactes ou incomplètes</li>
            <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données (sous conditions)</li>
            <li><strong>Droit à la limitation :</strong> Limiter temporairement le traitement de vos données</li>
            <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données (notamment pour la prospection)</li>
            <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
            <li><strong>Droit de retirer votre consentement :</strong> À tout moment, pour les traitements basés sur le consentement</li>
            <li><strong>Droit de définir des directives :</strong> Sur le sort de vos données après votre décès</li>
          </ul>
          <p className="mt-4"><strong>Comment exercer vos droits :</strong></p>
          <p className="mt-2">Vous pouvez exercer ces droits en nous contactant :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Par email : <a href="mailto:gw.guiot@outlook.fr" className="text-primary-600 dark:text-primary-400 hover:underline">gw.guiot@outlook.fr</a></li>
            <li>Par téléphone : <a href="tel:0621571222" className="text-primary-600 dark:text-primary-400 hover:underline">06 21 57 12 22</a></li>
            <li>Par courrier : 65 Rue du Centre, 88200 Vecoux</li>
          </ul>
          <p className="mt-4">Nous vous répondrons dans un délai maximum d'1 mois. Une pièce d'identité pourra être demandée pour vérifier votre identité.</p>
          <p className="mt-4"><strong>Réclamation :</strong></p>
          <p className="mt-2">Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL :</p>
          <p className="mt-2">
            CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07<br />
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">www.cnil.fr</a>
          </p>
        </>
      ),
    },
    {
      icon: Lock,
      title: '8. Sécurité des données',
      content: (
        <>
          <p>Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Les accès non autorisés</li>
            <li>Les modifications non autorisées</li>
            <li>La perte ou la destruction</li>
            <li>Les divulgations accidentelles</li>
          </ul>
          <p className="mt-4"><strong>Mesures de sécurité :</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Connexions sécurisées HTTPS (SSL/TLS)</li>
            <li>Paiements sécurisés via Stripe (certifié PCI-DSS)</li>
            <li>Authentification sécurisée pour l'accès aux données</li>
            <li>Sauvegardes régulières</li>
            <li>Accès limité aux données (principe du moindre privilège)</li>
          </ul>
        </>
      ),
    },
    {
      icon: Cookie,
      title: '9. Cookies',
      content: (
        <>
          <p>Notre site utilise des cookies pour améliorer votre expérience et analyser l'utilisation du site.</p>
          <p className="mt-4"><strong>Types de cookies utilisés :</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>Cookies techniques (obligatoires) :</strong>
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Session utilisateur</li>
                <li>Préférences de navigation</li>
                <li>Sécurité et authentification</li>
              </ul>
            </li>
            <li><strong>Cookies d'analyse (avec consentement) :</strong>
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Mesure d'audience</li>
                <li>Statistiques de visite</li>
                <li>Amélioration du site</li>
              </ul>
            </li>
          </ul>
          <p className="mt-4"><strong>Gestion des cookies :</strong></p>
          <p className="mt-2">Vous pouvez à tout moment modifier vos préférences en matière de cookies :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Via les paramètres de votre navigateur</li>
            <li>En refusant les cookies lors de votre première visite</li>
          </ul>
          <p className="mt-4">Le refus des cookies techniques peut affecter le bon fonctionnement du site.</p>
        </>
      ),
    },
    {
      icon: Mail,
      title: '10. Newsletter et communications',
      content: (
        <>
          <p>Si vous vous inscrivez à notre newsletter, vous recevrez :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Nos actualités et nouveautés</li>
            <li>Des offres spéciales et promotions</li>
            <li>Des conseils bien-être</li>
          </ul>
          <p className="mt-4"><strong>Désinscription :</strong></p>
          <p className="mt-2">Vous pouvez vous désinscrire à tout moment en cliquant sur le lien de désinscription présent dans chaque email ou en nous contactant directement.</p>
        </>
      ),
    },
    {
      icon: AlertCircle,
      title: '11. Transferts de données hors UE',
      content: (
        <>
          <p>Certains de nos prestataires peuvent être situés hors de l'Union Européenne :</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>Vercel (USA) :</strong> Hébergement du site - Garanti par les clauses contractuelles types de la Commission européenne</li>
            <li><strong>Stripe (USA) :</strong> Paiement - Certifié Privacy Shield et clauses contractuelles types</li>
          </ul>
          <p className="mt-4">Ces transferts sont encadrés par des garanties appropriées conformément au RGPD.</p>
        </>
      ),
    },
    {
      icon: Shield,
      title: '12. Modifications de la politique',
      content: (
        <>
          <p>Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment pour refléter les évolutions légales ou de nos pratiques.</p>
          <p className="mt-4">Toute modification sera publiée sur cette page avec une nouvelle date de mise à jour. Pour les modifications importantes, nous vous en informerons par email si nous disposons de votre adresse.</p>
          <p className="mt-4">Nous vous invitons à consulter régulièrement cette page.</p>
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
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
                Politique de confidentialité
              </h1>
              <p className="text-lg text-foreground-secondary leading-relaxed">
                Protection de vos données personnelles - Conformité RGPD
              </p>
              <p className="text-sm text-foreground-muted mt-4">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-8 bg-primary-50 dark:bg-primary-900/20 border-y border-primary-200 dark:border-primary-800">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Votre vie privée est importante</h3>
                <p className="text-sm text-foreground-secondary">
                  Kalm Headspa s'engage à protéger vos données personnelles et à respecter votre vie privée.
                  Cette politique vous explique comment nous collectons, utilisons et protégeons vos informations
                  conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
              </div>
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
                  transition={{ duration: 0.6, delay: index * 0.05 }}
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
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mb-6">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white mb-4">
                Exercez vos droits
              </h2>
              <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                Pour toute question sur vos données personnelles ou pour exercer vos droits
                (accès, rectification, suppression), contactez-nous
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:gw.guiot@outlook.fr"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-white/90 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  gw.guiot@outlook.fr
                </a>
                <a
                  href="tel:0621571222"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
                >
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
