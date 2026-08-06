# Rapport de faisabilité — Abonnement & Bon cadeau à montant libre
**Projet :** Kalm Headspa · **Date :** 2 août 2026 · **Auteur :** WMM Digital Agency

---

## 1. Réponse courte

| Demande | Faisable ? | Charge estimée |
|---|---|---|
| **Bon cadeau à montant libre** | ✅ Oui — les fondations sont déjà là | **5 à 6,5 j** (option recommandée avec solde) |
| **Système d'abonnement** | ✅ Oui, mais c'est un vrai chantier — rien n'existe aujourd'hui | **4 à 6 j** (formule carnet prépayé) ou **10 à 14 j** (abonnement récurrent) |

Les deux fonctionnalités partagent une brique commune (**un système de crédit / solde**). Les développer dans le même lot fait économiser 2 à 3 jours par rapport à deux chantiers séparés.

---

## 2. État des lieux du code existant

### Ce qui est déjà en place et réutilisable

| Brique | Fichier | Réutilisable pour |
|---|---|---|
| Tunnel bon cadeau 9 étapes | `components/gift-card/gift-card-wizard.tsx` | Montant libre (branche à ajouter) |
| Paiement Stripe (PaymentIntent) | `app/api/gift-card/create-payment-intent/route.ts` | Les deux |
| Webhook Stripe | `app/api/webhooks/stripe/route.ts` | Les deux (à refactorer, cf. §5) |
| Table `gift_cards` | `supabase/schema.sql` | Montant libre — **`service_id` est déjà nullable, commenté "NULL = bon cadeau libre"** |
| Utilisation d'un bon en réservation (total **ou** partiel CB) | `app/api/booking/create-intent/route.ts:164-236` | Les deux |
| Codes promo + calcul serveur autoritaire | `lib/pricing.ts` | Modèle à copier pour sécuriser les montants |
| Génération PDF du chèque cadeau | `lib/pdf.ts` | Montant libre (template à adapter) |
| Emails transactionnels (3 templates bon cadeau) | `lib/email.ts` | Les deux |
| Back-office avec sidebar + auth cookie | `app/admin/*`, `middleware.ts` | Les deux (nouvelles pages à greffer) |

### Ce qui manque totalement

- ❌ **Aucun espace client / compte utilisateur.** La réservation est 100 % invité (nom, email, tél). Pas de Supabase Auth côté public.
- ❌ **Aucune notion de solde.** La table `gift_cards` a un simple booléen `used` : un bon est consommé en totalité, quel que soit le prix de la prestation.
- ❌ **Aucune brique Stripe Billing** (abonnements, factures récurrentes, portail client).
- ❌ La contrainte SQL sur `bookings.payment_mode` n'accepte que `hold | direct | gift_card | in_person`.

---

## 3. Bon cadeau à montant libre

### 3.1 Le point bloquant à trancher : le solde

Aujourd'hui, un bon est **tout ou rien** :

- Bon de 60 € sur une prestation à 80 € → le client paie 20 € en CB. ✅ OK
- Bon de **100 €** sur une prestation à **70 €** → le bon est marqué `used`, **les 30 € sont perdus**. ⚠️

Pour un bon à montant libre, c'est le scénario **le plus courant** (on offre 100 €, la personne prend un soin à 78 €). Sans gestion de solde, ça génère mécaniquement des réclamations et une mauvaise image.

**Deux options :**

| | Option A — sans solde | Option B — avec solde ✅ recommandé |
|---|---|---|
| Principe | Le bon est consommé en une fois, le reliquat est perdu | Le bon garde un solde utilisable sur plusieurs séances |
| Mention CGV | « non fractionnable, non remboursable » | « utilisable en plusieurs fois pendant 1 an » |
| Charge | 2,5 – 3,5 j | 5 – 6,5 j |
| Risque commercial | Élevé (litiges clients) | Faible |

### 3.2 Détail de la charge (option B recommandée)

| Lot | Détail | Charge |
|---|---|---|
| **UI/UX tunnel** | Étape 1 repensée : bascule « Choisir une prestation » / « Montant libre », montants suggérés (50/80/100/150 €) + champ libre, validation min/max, aperçu live du bon | 1 j |
| **Logique du wizard** | Branche conditionnelle : un bon libre saute les étapes Longueur et Options ; `getVisibleSteps()` à refondre (aujourd'hui basé sur `serviceId`) | 0,5 j |
| **Migration BDD** | `initial_amount` / `remaining_amount` + table `gift_card_transactions` (traçabilité des débits) + fonction SQL de débit atomique (anti-race, sur le modèle de `increment_promo_usage`) | 0,5 j |
| **API bon cadeau** | Validation serveur du montant (bornes, arrondi), création du bon libre | 0,5 j |
| **Utilisation en réservation** | Débit partiel au lieu du booléen `used`, calcul du reste à payer, rollback si annulation, cohérence `create-intent` ↔ `confirm` | 1,25 j |
| **PDF + emails** | Variante du chèque cadeau affichant « Valeur : 100 € » au lieu du nom de prestation (le template Illustrator `Gift-cart \| Kalm-headspa.indd` doit être décliné) + adaptation des 3 emails | 1 j |
| **Back-office** | Colonne solde, historique d'utilisation, filtre « bon libre / prestation », débit manuel (utilisation en salon) | 0,75 j |
| **CGV + mentions** | Rédaction des clauses (validité, fractionnement, non-remboursable) | 0,25 j |
| **Recette** | Parcours complets en Stripe test : achat, envoi, utilisation partielle ×2, expiration | 0,75 j |
| **TOTAL** | | **6,5 j** |

> En option A (sans solde) : retirer les lots « Migration BDD », le débit partiel et une partie du back-office → **~3,5 j**.

---

## 4. Système d'abonnement

### 4.1 Il faut d'abord choisir le modèle économique

C'est **la** décision structurante : les deux formules n'ont pas le même coût, ni le même impact sur le site.

#### Formule 1 — « Carnet de séances » prépayé (recommandé pour démarrer)
La cliente achète 5 ou 10 séances d'un coup, avec une remise. Pas de prélèvement récurrent.
- Techniquement, c'est **le même moteur que le bon cadeau à solde** → très peu de code neuf.
- Pas besoin de compte client : un code type `KH-CARNET-XXXX` suffit, exactement comme un bon cadeau.
- Pas de contrainte juridique lourde (pas de reconduction tacite).
- **Charge : 4 à 6 j** (si développé après ou avec le lot bon cadeau libre : **2,5 à 3,5 j**).

#### Formule 2 — Abonnement récurrent mensuel (ex. 69 €/mois = 1 soin/mois)
Prélèvement automatique via Stripe Billing.
- Impose un **espace client** (aujourd'hui inexistant) : voir son abonnement, ses crédits, sa prochaine échéance, résilier.
- Impose Stripe Billing complet + gestion des impayés.
- Impose le respect de la **résiliation en 3 clics** (obligation légale depuis juin 2023 pour tout contrat souscrit en ligne par un consommateur) et l'information sur la reconduction tacite (loi Chatel).
- **Charge : 10 à 14 j.**

### 4.2 Détail de la charge — Formule 2 (abonnement récurrent)

| Lot | Détail | Charge |
|---|---|---|
| **Espace client** | Supabase Auth (lien magique par email), page `/mon-compte`, politiques RLS, middleware, rattachement des réservations passées à l'email | 2,5 – 3 j |
| **Stripe Billing** | Produits/Prix côté Stripe, Checkout en mode subscription, portail client (changement de carte, résiliation), refonte du webhook en routeur d'événements (`invoice.paid`, `payment_failed`, `subscription.updated/deleted`) avec idempotence | 2,5 – 3 j |
| **Moteur de crédits** | Attribution mensuelle, report ou expiration des séances non utilisées, ledger de traçabilité | 1,5 j |
| **Intégration réservation** | Nouveau mode de paiement « Utiliser mon abonnement », vérification + débit serveur, gestion de l'écart de prix (les tarifs varient selon la longueur de cheveux : 63 € à 180 €), remboursement du crédit en cas d'annulation, migration de la contrainte SQL `payment_mode` | 1,5 j |
| **UI/UX** | Page publique « Nos abonnements » (offres, comparatif, FAQ), tunnel de souscription, tableau de bord abonné | 1,5 – 2 j |
| **Back-office** | Liste des abonnés, fiche détail, actions (suspendre, offrir un crédit, résilier), indicateurs (MRR, taux de résiliation) | 1,5 j |
| **Emails** | Bienvenue, confirmation de prélèvement, échec de paiement, crédit du mois, résiliation | 1 j |
| **Juridique** | CGV abonnement, résiliation 3 clics, mise à jour de la politique de confidentialité (comptes clients) | 0,5 – 1 j |
| **Recette** | Tests avec les *test clocks* Stripe pour simuler 3 mois de renouvellements, impayés, résiliation | 1 j |
| **TOTAL** | | **13,5 – 15,5 j** — soit **10 à 14 j** avec la mutualisation du moteur de crédits si le lot bon cadeau est fait avant |

### 4.3 Décisions à prendre avec Gwenaëlle avant de chiffrer définitivement

1. **Formule 1 ou 2 ?** (carnet prépayé vs prélèvement mensuel)
2. Un abonnement donne droit à **une séance précise** ou à **un montant en crédit** (souplesse sur les longueurs de cheveux) ?
3. Les séances non utilisées sont-elles **reportées** au mois suivant, ou **perdues** ? Avec un plafond ?
4. Les extras (add-ons) sont-ils inclus, ou toujours payants ?
5. **Engagement** : sans engagement, ou 3/6/12 mois ?
6. L'abonnement donne-t-il des avantages annexes (remise sur les produits capillaires, priorité de réservation) ?

---

## 5. Points d'attention relevés dans le code existant

À traiter dans le même lot — ce sont des dettes qui deviennent gênantes dès qu'on touche à l'argent.

### 🔴 Le montant des bons cadeaux n'est pas revérifié côté serveur
`app/api/gift-card/create-payment-intent/route.ts:96` — `giftAmount` est calculé à partir de `body.amount` et `body.deliveryFee`, tous deux envoyés par le navigateur, sans contrôle de cohérence. Concrètement, un `deliveryFee` négatif permet d'obtenir un bon d'une valeur supérieure au montant payé. Les réservations, elles, sont protégées (`lib/pricing.ts` relit les prix en base) — il faut appliquer le même principe ici. C'est **d'autant plus critique** avec un montant libre, où la valeur devient totalement pilotée par le client.
→ **Correctif : 0,5 j**, à inclure obligatoirement.

### 🟠 Les codes de bons sont prévisibles
`create-payment-intent/route.ts:89` — `KH-${Date.now().toString(36).slice(-6)}` : basé sur l'horodatage, donc énumérable et exposé aux collisions. Dès qu'un bon porte un solde réutilisable, le code devient de l'argent → générer un code aléatoire + contrainte d'unicité en base.
→ **0,25 j**

### 🟠 Le webhook Stripe n'est pas structuré pour de nouveaux flux
`app/api/webhooks/stripe/route.ts` — enchaînement de `if` sur les types d'événements, aucune table de suivi des événements traités. Ajouter les événements d'abonnement dessus sans refonte va être fragile.
→ Inclus dans le lot Stripe Billing.

---

## 6. Synthèse budgétaire

| Scénario | Contenu | Charge |
|---|---|---|
| **A — Minimal** | Bon cadeau montant libre sans solde + durcissement sécurité | **4 j** |
| **B — Recommandé** ⭐ | Bon libre **avec solde** + carnets de séances prépayés + durcissement sécurité | **9 – 11 j** |
| **C — Complet** | Bon libre avec solde + abonnement récurrent Stripe + espace client + durcissement | **16 – 20 j** |

*Charges exprimées en jours de développement, hors allers-retours de validation client (compter +10 %) et hors création graphique du nouveau visuel de chèque cadeau si elle est confiée à un tiers.*

### Recommandation

Partir sur le **scénario B**, livré en deux jalons :

1. **Jalon 1 (~6,5 j)** — Bon cadeau à montant libre avec solde + correctifs de sécurité. Valeur immédiate, saisonnalité forte (Noël, fête des mères).
2. **Jalon 2 (~3,5 j)** — Carnets de séances prépayés, qui réutilisent le moteur de crédits du jalon 1.

Le passage à l'abonnement récurrent (scénario C) reste ouvert : le moteur de crédits construit aux jalons 1 et 2 est exactement la brique qu'il faudra. On ne paiera alors que l'espace client + Stripe Billing (~8 j), sans rien jeter.

L'abonnement récurrent n'a de sens que si Gwenaëlle a déjà une base de clientes fidèles régulières — sinon, un carnet de 5 séances remplit le même objectif commercial pour un tiers du budget et sans contrainte juridique.
