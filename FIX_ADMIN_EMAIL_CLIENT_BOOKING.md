# 🔧 Fix : Admin ne reçoit pas d'email (réservation client)

## 🐛 Problème identifié

Quand un client réserve via `/reservation`, il reçoit bien son email de confirmation, mais **l'admin (salon) ne reçoit PAS l'email de notification**.

### Cause racine

Configuration dans `.env.local` :
```bash
RESEND_FROM_EMAIL=contact@kalm-headspa.fr
SALON_EMAIL=contact@kalm-headspa.fr
```

**Le problème :** Resend (et la plupart des services d'email) **bloquent** l'envoi d'un email quand :
- FROM = `contact@kalm-headspa.fr`
- TO = `contact@kalm-headspa.fr`

C'est une protection anti-boucle. Résultat : l'email au salon est **silencieusement rejeté** par Resend.

---

## ✅ Solution

### Option 1 : Utiliser un email FROM différent (Recommandé)

Modifier `.env.local` :

```bash
# ✅ Email d'envoi (FROM)
RESEND_FROM_EMAIL=reservations@kalm-headspa.fr

# ✅ Email de réception salon (TO)
SALON_EMAIL=contact@kalm-headspa.fr
```

**Avantages :**
- Plus clair pour le client (il voit que ça vient de "reservations@...")
- Pas de conflit FROM = TO
- Meilleure délivrabilité

**Configuration Resend requise :**
1. Aller sur https://resend.com/domains
2. Vérifier que le domaine `kalm-headspa.fr` est bien configuré
3. Créer l'email `reservations@kalm-headspa.fr` (ou n'importe quel alias)

---

### Option 2 : Utiliser l'email par défaut Resend

Si tu ne peux pas configurer `reservations@kalm-headspa.fr` immédiatement :

```bash
# Email d'envoi : utiliser l'email par défaut Resend
RESEND_FROM_EMAIL=onboarding@resend.dev

# Email de réception salon
SALON_EMAIL=contact@kalm-headspa.fr
```

**Inconvénient :**
- L'email client verra "onboarding@resend.dev" comme expéditeur
- Moins professionnel

---

### Option 3 : Modifier le code pour gérer ce cas

Si tu veux garder la même config, on peut modifier `lib/email.ts` pour envoyer au salon via un email différent :

```typescript
// Dans sendBookingEmails()
const SALON_TO = SALON_EMAIL === FROM ? 'admin@kalm-headspa.fr' : SALON_EMAIL
```

Mais ça nécessite de créer `admin@kalm-headspa.fr`.

---

## 🎯 Recommandation finale

**👉 Option 1 : `reservations@kalm-headspa.fr`**

C'est la solution la plus propre et professionnelle.

### Étapes :

**1. Sur Resend :**
- Aller sur https://resend.com/domains
- Vérifier que `kalm-headspa.fr` est bien configuré (SPF, DKIM)
- Note : Resend accepte n'importe quel alias du domaine vérifié

**2. Modifier `.env.local` :**
```bash
RESEND_FROM_EMAIL=reservations@kalm-headspa.fr
SALON_EMAIL=contact@kalm-headspa.fr
```

**3. Redémarrer le serveur :**
```bash
npm run dev
```

**4. Tester :**
- Faire une réservation client via `/reservation`
- Vérifier l'email reçu sur `contact@kalm-headspa.fr`

---

## 🧪 Diagnostic

Pour vérifier si c'est bien le problème FROM = TO :

**1. Logs Resend :**
- Va sur https://resend.com/emails
- Cherche les emails récents
- Regarde si l'email au salon apparaît comme "failed" ou "rejected"

**2. Logs serveur (Vercel) :**
```
[sendBookingEmails] salon OK — id: re_xxxxx
```
Si tu vois "OK" mais que l'email n'arrive pas → c'est bien le problème FROM = TO

**3. Test rapide :**
Dans `.env.local`, change temporairement :
```bash
SALON_EMAIL=ton-email-perso@gmail.com
```
Redémarre et teste. Si l'email arrive → c'est confirmé.

---

## 📧 Format de l'email salon

L'email envoyé au salon contient :
- **Badge date/heure** en haut
- Infos client (nom, email, téléphone, message)
- Infos prestation (nom, durée, prix, extras)
- ID de réservation

---

## 🚀 Déploiement

```bash
# 1. Modifier .env.local en local
# 2. Modifier les variables d'environnement sur Vercel :
# https://vercel.com/your-project/settings/environment-variables

# Ajouter/modifier :
RESEND_FROM_EMAIL=reservations@kalm-headspa.fr
SALON_EMAIL=contact@kalm-headspa.fr

# 3. Redéployer
vercel --prod
```

---

*Date : 27 mars 2026*
*Solution recommandée : Option 1 (reservations@kalm-headspa.fr)*
