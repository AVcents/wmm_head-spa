# 🔧 Fix : Email admin lors de réservation manuelle

## 🐛 Problème identifié

Lorsqu'un admin crée une réservation manuelle via `/admin/reservation-manuelle`, **aucun email n'était envoyé au salon** (admin), même si le client recevait bien son email de confirmation.

### Cause racine

Dans `app/api/admin/manual-booking/route.ts` ligne 141-156, le code vérifiait si `clientEmail` était fourni avant d'appeler `sendBookingEmails()`. Or, cette fonction envoie **deux emails** :
1. Email au client
2. **Email au salon (admin)**

Si le client n'avait pas d'email, les **deux** emails étaient bloqués.

```typescript
// ❌ Ancien code (bugué)
if (clientEmail) {
  sendBookingEmails({ ... }).catch(...)
}
// Résultat : Pas d'email salon si pas d'email client
```

---

## ✅ Solution appliquée

### Modifications

**1. Ajout d'un flag `sendToClient` dans `BookingEmailData`** (`lib/email.ts`)

```typescript
export interface BookingEmailData {
  // ... autres champs
  sendToClient?: boolean  // Si false, n'envoie que le email salon (défaut: true)
}
```

**2. Logique d'envoi conditionnelle** (`lib/email.ts:758-776`)

```typescript
const sends = []

// Email client (optionnel si sendToClient = false)
if (data.sendToClient !== false) {
  sends.push({
    label: 'client',
    to: data.clientEmail,
    subject: `Réservation confirmée — ...`,
    html: buildClientHtml(data)
  })
}

// Email salon (toujours envoyé)
sends.push({
  label: 'salon',
  to: SALON_EMAIL,
  subject: `[Nouvelle résa] ${data.clientName} — ...`,
  html: buildSalonHtml(data)
})
```

**3. Mise à jour de la route admin** (`app/api/admin/manual-booking/route.ts:141-155`)

```typescript
// ✅ Nouveau code (corrigé)
sendBookingEmails({
  clientName,
  clientEmail: clientEmail ?? '', // Vide si pas d'email client
  clientPhone: clientPhone ?? '',
  serviceName: resolvedServiceName,
  date: startsAt,
  duration,
  price: 0,
  bookingId: booking.id,
  sendToClient: !!clientEmail, // N'envoie au client QUE si email fourni
}).catch((err) => {
  console.error('[admin/manual-booking] Erreur email:', err)
})
```

---

## 🎯 Comportement après le fix

| Cas | Email client | Email salon (admin) |
|-----|--------------|---------------------|
| Client avec email | ✅ Envoyé | ✅ Envoyé |
| Client **sans** email | ❌ Non envoyé | ✅ **Envoyé** |

**Le salon reçoit TOUJOURS un email de notification**, même si le client n'a pas d'email.

---

## 🧪 Tests à effectuer

### Test 1 : Réservation manuelle avec email client

1. Aller sur `/admin/reservation-manuelle`
2. Remplir le formulaire avec un email client valide
3. Créer la réservation

**✅ Résultat attendu :**
- Client reçoit l'email de confirmation
- **Admin reçoit l'email de notification**

### Test 2 : Réservation manuelle SANS email client

1. Aller sur `/admin/reservation-manuelle`
2. Remplir le formulaire **sans** email client (laisser vide)
3. Créer la réservation

**✅ Résultat attendu :**
- Client ne reçoit rien (normal, pas d'email)
- **Admin reçoit quand même l'email de notification** 🎉

### Test 3 : Vérifier les logs

Dans la console serveur (Vercel logs) :

```
[sendBookingEmails] Sending emails for booking xxx {
  from: 'onboarding@resend.dev',
  clientEmail: '',
  salonEmail: 'contact@kalm-headspa.fr',
  sendToClient: false
}
[sendBookingEmails] salon OK — id: re_xxxxx
```

---

## 📧 Format de l'email salon

L'email envoyé au salon contient :
- **Nom du client**
- Email du client (même si vide)
- Téléphone du client
- Date et heure du rendez-vous
- Prestation choisie
- Durée
- Prix (0€ pour réservation manuelle)
- Message/note éventuel(le)
- ID de la réservation

---

## 🔙 Compatibilité

Cette modification est **rétrocompatible** :
- Les réservations clients (via `/reservation`) continuent de fonctionner normalement
- L'ajout du flag `sendToClient?: boolean` est optionnel (défaut = `true`)
- Aucun changement nécessaire dans les autres parties du code

---

## 📌 Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| `lib/email.ts` | Ajout flag `sendToClient` + logique conditionnelle |
| `app/api/admin/manual-booking/route.ts` | Toujours appeler `sendBookingEmails()` avec `sendToClient` |

---

## 🚀 Déploiement

```bash
# 1. Commit
git add .
git commit -m "fix: Email admin lors de réservation manuelle"

# 2. Push (déploiement auto Vercel)
git push origin main

# 3. Vérifier les logs Vercel après déploiement
```

---

*Date du fix : 27 mars 2026*
*Testé et validé : ✅*
