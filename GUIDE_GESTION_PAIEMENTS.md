# 💳 Guide de Gestion des Paiements - Kalm Headspa

> Guide pratique pour Gwenaëlle sur la gestion des empreintes bancaires et des paiements

---

## 🎯 Vue d'ensemble

Lorsqu'un client réserve en ligne avec l'option **"Empreinte bancaire (paiement sur place)"**, voici ce qui se passe :

1. Le client entre sa carte bancaire
2. Stripe **bloque 100% du montant total** (mais ne le prélève pas encore)
3. La réservation est créée avec le statut "Confirmée"
4. **Vous devez ensuite décider** quoi faire de ce montant bloqué

> **À noter :** le montant est bloqué mais **pas débité**. Si le client vient et paie en salon (CB, espèces), il vous suffit de **libérer les fonds** pour qu'aucun prélèvement ne soit effectué côté Stripe.

---

## 📱 Comment gérer une empreinte bancaire ?

### 1. Accéder aux réservations

1. Connectez-vous à l'interface admin : `https://kalm-headspa.fr/admin`
2. Cliquez sur **"Réservations"** dans le menu
3. Les réservations avec empreinte bancaire affichent un **badge jaune "Empreinte bancaire en attente"**

### 2. Ouvrir les détails d'une réservation

Cliquez sur la réservation concernée pour afficher tous les détails.

Si la réservation a une empreinte bancaire en attente, vous verrez **4 boutons d'action** :

---

## ⚙️ Les 4 options disponibles

### ✅ Option 1 : **Capturer 100%** (Client venu)

**Quand l'utiliser ?**
- Le client s'est présenté au rendez-vous
- Vous souhaitez encaisser le montant total de la prestation

**Que se passe-t-il ?**
- Stripe prélève **100% du prix** de la prestation
- La réservation reste au statut "Confirmée"
- Le client est débité du montant total

**Exemple :**
- Prestation : 85€
- Montant bloqué : 85€ (100%)
- Montant capturé : **85€** (100%)

---

### ⚠️ Option 2 : **No-show (80%)** (Client absent)

**Quand l'utiliser ?**
- Le client ne s'est pas présenté au rendez-vous
- Il n'a pas prévenu de son absence
- Vous souhaitez appliquer la pénalité maximum

**Que se passe-t-il ?**
- Stripe prélève **80% du prix** (pénalité de non-présentation)
- La réservation passe au statut "No-show"
- Le client est débité de 80% du montant total

**Exemple :**
- Prestation : 85€
- Montant capturé : **68€** (80%)

---

### ❌ Option 3 : **Annul. (30%)** (Annulation tardive)

**Quand l'utiliser ?**
- Le client annule à la dernière minute (moins de 24h)
- Vous souhaitez appliquer une pénalité modérée

**Que se passe-t-il ?**
- Stripe prélève **30% du prix** (pénalité d'annulation)
- La réservation passe au statut "Annulée"
- Le client est débité de 30% du montant total

**Exemple :**
- Prestation : 85€
- Montant capturé : **25,50€** (30%)

---

### 🔓 Option 4 : **Libérer fonds** (Annulation sans pénalité)

**Quand l'utiliser ?**
- Le client annule avec un délai raisonnable (plus de 24h)
- Vous souhaitez être flexible et ne pas appliquer de pénalité
- Cas exceptionnel (maladie, urgence, etc.)

**Que se passe-t-il ?**
- Stripe **libère le montant bloqué**
- Aucun prélèvement n'est effectué
- La réservation passe au statut "Annulée"
- Le client ne paie rien

**Exemple :**
- Prestation : 85€
- Montant capturé : **0€**

---

## 📋 Cas pratiques

### Cas 1 : Client présent le jour J

**Situation :** Marie a réservé un Head Spa à 85€ pour le 15 mars. Elle se présente au rendez-vous.

**Action :**
1. Accédez à sa réservation dans `/admin/reservations`
2. Cliquez sur **"Capturer 100%"**
3. Stripe prélève 85€
4. Marie peut payer le reste sur place si besoin (extras, etc.)

---

### Cas 2 : Client absent sans prévenir

**Situation :** Paul a réservé un massage à 70€ pour le 20 mars. Il ne se présente pas et ne répond pas au téléphone.

**Action :**
1. Accédez à sa réservation
2. Cliquez sur **"No-show (80%)"**
3. Stripe prélève 56€ (80% de 70€)
4. Paul reçoit un email l'informant de la pénalité

---

### Cas 3 : Client annule 12h avant

**Situation :** Sophie annule son rendez-vous de 95€ la veille à 20h (rendez-vous prévu à 10h).

**Action :**
1. Accédez à sa réservation
2. Cliquez sur **"Annul. (30%)"**
3. Stripe prélève 28,50€ (30% de 95€)
4. Sophie est facturée d'une pénalité modérée

---

### Cas 4 : Client annule 3 jours avant pour urgence

**Situation :** Léa annule son rendez-vous de 105€ 3 jours à l'avance car elle a une urgence familiale.

**Action :**
1. Accédez à sa réservation
2. Cliquez sur **"Libérer fonds"**
3. Aucun prélèvement n'est effectué
4. Léa peut reprendre rendez-vous plus tard

---

## ⏱️ Quand agir ?

**Timing recommandé :**

- **Après le rendez-vous** (si client venu) → Capturer 100% dans la journée
- **Jour J + 1** (si client absent) → Appliquer No-show (80%)
- **Dès l'annulation** (si tardive) → Appliquer pénalité 30%
- **Avant le rendez-vous** (si annulation anticipée) → Libérer les fonds

**Délai maximum Stripe :**
- Vous avez **7 jours** pour capturer une empreinte bancaire
- Au-delà, Stripe libère automatiquement les fonds

---

## 🔒 Sécurité & Traçabilité

**Toutes vos actions sont enregistrées :**
- Montant capturé
- Date et heure de l'action
- Statut de la réservation
- PaymentIntent Stripe

**En cas de litige :**
- Vous pouvez consulter l'historique dans Stripe Dashboard
- Les emails de confirmation sont envoyés automatiquement
- Les CGV affichées lors de la réservation font référence

---

## ❓ Questions fréquentes

### Peut-on annuler une capture ?

**Non.** Une fois qu'un montant est capturé, il est définitif. Assurez-vous de choisir la bonne option avant de cliquer.

### Que se passe-t-il si je ne fais rien ?

Après **7 jours**, Stripe libère automatiquement les fonds. Le client ne paie rien et la réservation reste au statut "Confirmée" (vous devrez la passer manuellement en "Annulée" ou "No-show").

### Peut-on capturer plus que le montant bloqué ?

**Non.** Le montant bloqué correspond à 100% du prix de la prestation. Toute capture est effectuée dans la limite de ce montant.

### Le client reçoit-il une notification ?

**Oui.** Stripe envoie automatiquement un email au client lors de la capture ou de l'annulation, avec le montant prélevé.

---

## 📞 Support

**En cas de problème :**
- Contactez Vincent (vanglo@hotmail.fr)
- Consultez le dashboard Stripe : https://dashboard.stripe.com
- Vérifiez les logs dans `/admin/reservations`

---

**Dernière mise à jour :** 4 avril 2026
**Version :** 1.0.0
