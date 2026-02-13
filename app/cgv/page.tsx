'use client'

import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { FileText, ShoppingCart, CreditCard, Calendar, AlertTriangle, Gift, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CGVPage() {
  const sections = [
    {
      icon: FileText,
      title: 'Article 1 - Champ d\'application',
      content: (
        <>
          <p>Les présentes Conditions Générales de Vente (CGV) s'appliquent à l'ensemble des prestations de services et ventes de bons cadeaux proposés par Kalm Headspa.</p>
          <p className="mt-4">Toute commande de prestation ou achat de bon cadeau implique l'acceptation sans réserve des présentes CGV.</p>
          <p className="mt-4"><strong>Services proposés :</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Prestations de Head Spa (soins du cuir chevelu et relaxation)</li>
            <li>Massages et soins bien-être</li>
            <li>Vente de bons cadeaux</li>
          </ul>
        </>
      ),
    },
    {
      icon: Calendar,
      title: 'Article 2 - Réservations et rendez-vous',
      content: (
        <>
          <p><strong>2.1 - Prise de rendez-vous</strong></p>
          <p className="mt-2">Les rendez-vous peuvent être pris :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>En ligne via notre système de réservation</li>
            <li>Par téléphone au 06 21 57 12 22</li>
            <li>Par email à gw.guiot@outlook.fr</li>
          </ul>
          <p className="mt-4"><strong>2.2 - Confirmation</strong></p>
          <p className="mt-2">Toute réservation fait l'objet d'une confirmation par email ou SMS. En l'absence de confirmation, le rendez-vous n'est pas validé.</p>
          <p className="mt-4"><strong>2.3 - Retard</strong></p>
          <p className="mt-2">En cas de retard de plus de 15 minutes sans prévenir, Kalm Headspa se réserve le droit d'annuler le rendez-vous. La prestation sera alors considérée comme due et facturée.</p>
        </>
      ),
    },
    {
      icon: RefreshCw,
      title: 'Article 3 - Annulation et modification',
      content: (
        <>
          <p><strong>3.1 - Par le client</strong></p>
          <p className="mt-2">Toute annulation ou modification de rendez-vous doit être effectuée au minimum <strong>24 heures à l'avance</strong>.</p>
          <p className="mt-2">Les annulations peuvent être effectuées :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Via votre espace de réservation en ligne</li>
            <li>Par téléphone au 06 21 57 12 22</li>
            <li>Par email à gw.guiot@outlook.fr</li>
          </ul>
          <p className="mt-4"><strong>Pénalités en cas d'annulation tardive :</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Annulation moins de 24h avant : 50% du montant de la prestation facturé</li>
            <li>Annulation moins de 4h avant ou absence : 100% du montant facturé</li>
          </ul>
          <p className="mt-4"><strong>3.2 - Par le professionnel</strong></p>
          <p className="mt-2">En cas d'annulation de notre fait (maladie, force majeure), vous serez prévenu dans les meilleurs délais et un nouveau rendez-vous vous sera proposé sans frais supplémentaires.</p>
        </>
      ),
    },
    {
      icon: CreditCard,
      title: 'Article 4 - Tarifs et paiement',
      content: (
        <>
          <p><strong>4.1 - Tarifs</strong></p>
          <p className="mt-2">Les tarifs des prestations sont indiqués en euros TTC et sont consultables sur le site internet et en institut. Ils peuvent être modifiés à tout moment mais sont garantis pour les prestations déjà réservées.</p>
          <p className="mt-4"><strong>4.2 - Modalités de paiement</strong></p>
          <p className="mt-2">Le paiement peut être effectué :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>En ligne par carte bancaire (sécurisé via Stripe)</li>
            <li>Sur place : espèces, carte bancaire, chèque</li>
            <li>Par bon cadeau valide</li>
          </ul>
          <p className="mt-4"><strong>4.3 - Paiement des prestations</strong></p>
          <p className="mt-2">Le paiement s'effectue généralement à la fin de la prestation. Pour certaines prestations ou à la demande, un acompte de 30% pourra être demandé lors de la réservation.</p>
        </>
      ),
    },
    {
      icon: Gift,
      title: 'Article 5 - Bons cadeaux',
      content: (
        <>
          <p><strong>5.1 - Validité</strong></p>
          <p className="mt-2">Les bons cadeaux sont valables <strong>12 mois</strong> à compter de la date d'achat. Passé ce délai, ils ne pourront plus être utilisés et ne seront ni remboursés ni échangés.</p>
          <p className="mt-4"><strong>5.2 - Utilisation</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Les bons cadeaux sont nominatifs et peuvent être offerts à un tiers</li>
            <li>Ils sont utilisables en une ou plusieurs fois</li>
            <li>Le solde non utilisé reste disponible jusqu'à la date d'expiration</li>
            <li>Aucun rendu de monnaie n'est effectué</li>
            <li>Les bons cadeaux ne sont ni remboursables ni échangeables contre de l'argent</li>
          </ul>
          <p className="mt-4"><strong>5.3 - Perte ou vol</strong></p>
          <p className="mt-2">En cas de perte ou de vol, aucun duplicata ne sera délivré. Il est recommandé de conserver une copie du bon cadeau.</p>
        </>
      ),
    },
    {
      icon: AlertTriangle,
      title: 'Article 6 - Contre-indications et responsabilité',
      content: (
        <>
          <p><strong>6.1 - Déclaration préalable</strong></p>
          <p className="mt-2">Le client s'engage à informer le professionnel de toute contre-indication médicale, allergie ou état de santé particulier avant toute prestation.</p>
          <p className="mt-4"><strong>6.2 - Contre-indications</strong></p>
          <p className="mt-2">Certaines prestations peuvent être déconseillées ou contre-indiquées en cas de :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Problèmes de cuir chevelu (plaies, infections, lésions)</li>
            <li>Hypertension sévère non contrôlée</li>
            <li>Problèmes circulatoires graves</li>
            <li>Grossesse (selon le type de prestation)</li>
            <li>Allergies aux produits utilisés</li>
            <li>Traitements médicaux en cours (chimiothérapie, etc.)</li>
          </ul>
          <p className="mt-4"><strong>6.3 - Responsabilité</strong></p>
          <p className="mt-2">Kalm Headspa ne saurait être tenu responsable en cas de dissimulation d'informations médicales importantes par le client.</p>
          <p className="mt-2">Les prestations proposées sont des soins de bien-être et de détente, et ne constituent en aucun cas un acte médical ou thérapeutique.</p>
        </>
      ),
    },
    {
      icon: ShoppingCart,
      title: 'Article 7 - Droit de rétractation',
      content: (
        <>
          <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les prestations de services pleinement exécutées avant la fin du délai de rétractation.</p>
          <p className="mt-4"><strong>Cas concernés :</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Prestations en institut :</strong> Aucun droit de rétractation après la réalisation de la prestation</li>
            <li><strong>Bons cadeaux :</strong> Droit de rétractation de 14 jours pour les achats en ligne, sauf si le bon a déjà été utilisé</li>
          </ul>
        </>
      ),
    },
    {
      icon: FileText,
      title: 'Article 8 - Protection des données personnelles',
      content: (
        <>
          <p>Les données personnelles collectées lors de la prise de rendez-vous ou de l'achat de bons cadeaux sont nécessaires à la gestion de votre dossier client et au suivi de nos prestations.</p>
          <p className="mt-4">Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition.</p>
          <p className="mt-4">Pour plus d'informations, consultez notre <a href="/politique-confidentialite" className="text-primary-600 dark:text-primary-400 hover:underline">Politique de confidentialité</a>.</p>
        </>
      ),
    },
    {
      icon: FileText,
      title: 'Article 9 - Réclamations et litiges',
      content: (
        <>
          <p><strong>9.1 - Service client</strong></p>
          <p className="mt-2">Pour toute réclamation, vous pouvez nous contacter :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Par email : gw.guiot@outlook.fr</li>
            <li>Par téléphone : 06 21 57 12 22</li>
            <li>Par courrier : 65 Rue du Centre, 88200 Vecoux</li>
          </ul>
          <p className="mt-4"><strong>9.2 - Médiation</strong></p>
          <p className="mt-2">En cas de litige, vous pouvez recourir à une médiation de la consommation. Le médiateur compétent est :</p>
          <p className="mt-2"><strong>Association des Médiateurs Européens (AME CONSO)</strong><br />
          11 Place Dauphine - 75001 Paris<br />
          <a href="https://www.mediationconso-ame.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">www.mediationconso-ame.com</a></p>
          <p className="mt-4"><strong>9.3 - Droit applicable</strong></p>
          <p className="mt-2">Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
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
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
                Conditions Générales de Vente
              </h1>
              <p className="text-lg text-foreground-secondary leading-relaxed">
                Conditions applicables aux prestations et bons cadeaux Kalm Headspa
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
              <AlertTriangle className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Points importants</h3>
                <ul className="text-sm text-foreground-secondary space-y-2">
                  <li><strong>Annulation :</strong> Minimum 24h à l'avance pour éviter toute pénalité</li>
                  <li><strong>Retard :</strong> Au-delà de 15 min sans prévenir, le rendez-vous peut être annulé</li>
                  <li><strong>Bons cadeaux :</strong> Valables 12 mois à compter de la date d'achat</li>
                  <li><strong>Contre-indications :</strong> Informez-nous de tout problème de santé avant votre prestation</li>
                </ul>
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
              <h2 className="text-3xl font-serif font-bold text-white mb-4">
                Une question sur nos conditions ?
              </h2>
              <p className="text-lg text-white/90 mb-6">
                Notre équipe est à votre disposition pour répondre à toutes vos questions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:0621571222"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-white/90 transition-colors"
                >
                  06 21 57 12 22
                </a>
                <a
                  href="mailto:gw.guiot@outlook.fr"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Nous écrire
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
