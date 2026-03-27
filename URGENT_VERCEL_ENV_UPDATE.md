# 🚨 URGENT : Mettre à jour les variables d'environnement Vercel

## ⚠️ Action requise

Le fix pour les emails admin **ne fonctionnera qu'après** avoir mis à jour les variables d'environnement sur Vercel.

---

## 📋 Étapes

### 1. Se connecter à Vercel

https://vercel.com/

### 2. Aller dans les paramètres du projet

1. Sélectionner le projet Kalm Headspa
2. Cliquer sur **Settings**
3. Cliquer sur **Environment Variables**

### 3. Modifier la variable `RESEND_FROM_EMAIL`

**Chercher :** `RESEND_FROM_EMAIL`

**Ancienne valeur :**
```
contact@kalm-headspa.fr
```

**Nouvelle valeur :**
```
reservations@kalm-headspa.fr
```

### 4. Vérifier `SALON_EMAIL`

**Doit rester :**
```
contact@kalm-headspa.fr
```

### 5. Redéployer

Après modification des variables d'environnement :

**Option A : Redéploiement automatique**
- Les variables sont automatiquement appliquées au prochain déploiement
- Faire un commit/push pour déclencher un déploiement

**Option B : Redéploiement manuel**
```bash
vercel --prod
```

---

## ✅ Vérification

Après le redéploiement :

1. **Test réservation client :**
   - Aller sur le site en production
   - Faire une réservation test
   - Vérifier que `contact@kalm-headspa.fr` reçoit bien l'email

2. **Vérifier les logs Vercel :**
   - Aller sur Vercel > Project > Deployments > Latest > Functions
   - Chercher les logs `[sendBookingEmails]`
   - Vérifier qu'il n'y a pas d'erreur

3. **Vérifier Resend :**
   - Aller sur https://resend.com/emails
   - Vérifier que les emails au salon sont bien "Delivered"

---

## 🔍 Troubleshooting

### L'email n'arrive toujours pas

**1. Vérifier que le domaine est bien configuré sur Resend :**
- https://resend.com/domains
- Vérifier que `kalm-headspa.fr` est **verified**
- Vérifier les records DNS (SPF, DKIM)

**2. Tester avec un email de test :**
Modifier temporairement sur Vercel :
```
SALON_EMAIL=ton-email-perso@gmail.com
```
Si ça fonctionne → problème de configuration DNS/Resend pour `contact@kalm-headspa.fr`

**3. Vérifier les SPAMs :**
L'email peut arriver dans les spams de `contact@kalm-headspa.fr`

---

## 📧 Configuration Resend minimale requise

Sur https://resend.com/domains, tu dois avoir :

### Records DNS à configurer :

**SPF (TXT record) :**
```
v=spf1 include:_spf.resend.com ~all
```

**DKIM (TXT record) :**
```
Fourni par Resend dans le dashboard
```

**DMARC (TXT record) - Optionnel :**
```
v=DMARC1; p=none
```

---

## 🎯 Résumé

✅ `.env.local` → Déjà mis à jour
⚠️ **Vercel Environment Variables → À faire maintenant**
✅ Documentation → Créée

**Une fois fait, le problème sera résolu ! 🎉**

---

*Urgent - À faire avant le prochain test client*
