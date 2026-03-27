# 🧪 Script de test - Durée des extras

## Pré-requis

1. ✅ Appliquer la migration SQL
2. ✅ Redémarrer le serveur Next.js

```bash
cd kalm-headspa-site
npm run dev
```

---

## Test 1 : Interface Admin - Créer un extra avec durée

1. Aller sur `/admin/extras`
2. Cliquer sur "Nouvel extra"
3. Remplir :
   - Nom : `Massage cuir chevelu premium`
   - Description : `Massage relaxant de 15 minutes`
   - Durée : `15`
   - Prix : `20.00`
   - Ordre : `0`
   - ✅ Visible par les clients
4. Enregistrer

**✅ Résultat attendu :**
- L'extra apparaît dans la liste avec le badge "+15 min"

---

## Test 2 : Interface Client - Voir la durée

1. Aller sur `/reservation`
2. Choisir une prestation (ex: Head Spa Essentiel - 60 min)
3. Sur l'étape "Options supplémentaires" :
   - Vérifier que l'extra affiche "+15 min" sous le nom
   - Sélectionner l'extra
   - Cliquer sur "Continuer"

**✅ Résultat attendu :**
- L'extra affiche correctement "+15 min"
- Le récapitulatif indique "1 option sélectionnée"

---

## Test 3 : Génération des créneaux

1. Choisir une date disponible
2. Observer les créneaux proposés

**✅ Résultat attendu :**
- Les créneaux sont plus espacés (75 min au lieu de 60 min)
- Exemple : si un créneau 10h00 est occupé par 60 min, avec l'extra de 15 min, le prochain créneau disponible devrait être à 11h15 minimum (et non 11h00)

---

## Test 4 : Changement d'extras et recalcul

1. Revenir sur l'étape "Options" (bouton précédent ou modification)
2. Désélectionner l'extra
3. Retourner sur l'étape "Créneau"

**✅ Résultat attendu :**
- Les créneaux sont recalculés automatiquement pour 60 min
- Plus de créneaux disponibles qu'avant

---

## Test 5 : Réservation complète avec extra

1. Sélectionner une prestation de 60 min
2. Ajouter l'extra de 15 min
3. Choisir une date et un créneau
4. Remplir les coordonnées
5. Simuler un paiement (mode test Stripe)

**✅ Résultat attendu :**
- La réservation est créée avec `duration = 75` dans la table `bookings`
- L'email de confirmation mentionne l'extra
- Le créneau est bien bloqué pour 75 min dans le planning

---

## Test 6 : Double réservation impossible

1. Créer une réservation à 10h00 avec prestation 60 min + extra 15 min (total 75 min)
2. Essayer de créer une autre réservation entre 10h00 et 11h15

**✅ Résultat attendu :**
- Aucun créneau disponible entre 10h00 et 11h15
- Le premier créneau disponible est à 11h15

---

## Test 7 : Extra sans durée (duration = 0)

1. Créer un extra "Produit capillaire" avec duration = 0 et prix 10€
2. Sélectionner cet extra lors d'une réservation

**✅ Résultat attendu :**
- L'extra ne modifie pas les créneaux disponibles
- Seul le prix augmente
- Les créneaux restent basés sur la durée de la prestation de base

---

## ⚠️ Points de vigilance

- [ ] Le cache des créneaux est bien invalidé quand on change les extras
- [ ] Le buffer_time du service est bien additionné en plus de la durée totale
- [ ] Les extras sont correctement sauvegardés dans `extras_json` lors de la confirmation
- [ ] L'email de confirmation liste bien les extras sélectionnés avec leur durée

---

## 🐛 En cas de problème

### Créneaux toujours calculés sur 60 min malgré l'extra

→ Vérifier dans la console du navigateur (Network tab) que le paramètre `extrasDuration` est bien passé dans l'URL :
```
/api/booking?action=slots&serviceId=xxx&date=2026-03-28&extrasDuration=15
```

### Type Error sur `extra.duration`

→ Vérifier que la migration SQL a bien été appliquée :
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'extras' AND column_name = 'duration';
```

### Extra ne s'affiche pas

→ Vérifier que `is_active = true` dans la table `extras`

---

*Dernière mise à jour : 27 mars 2026*
