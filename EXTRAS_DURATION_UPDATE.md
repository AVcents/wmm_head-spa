# ✅ Mise à jour : Prise en compte de la durée des extras

## 🔍 Problème résolu

Avant cette mise à jour, les extras (options supplémentaires) ajoutaient un coût mais **ne bloquaient pas de temps supplémentaire** dans le planning. Cela créait un risque de double réservation.

**Exemple :**
- Prestation : 60 min
- Extra : Massage du cuir chevelu (+15 min)
- ❌ Ancien comportement : Les créneaux étaient générés pour 60 min uniquement
- ✅ Nouveau comportement : Les créneaux sont générés pour 75 min (60 + 15)

---

## 🛠️ Modifications apportées

### 1. **Base de données**
- Ajout du champ `duration` (INTEGER, en minutes) dans la table `extras`
- Migration : `supabase/migrations/20260327_add_duration_to_extras.sql`

### 2. **Interface admin**
- Ajout du champ "Durée supplémentaire" dans le formulaire de création/édition d'extras
- Affichage de la durée dans la liste des extras avec badge visuel
- Fichier : `app/admin/extras/page.tsx`

### 3. **Interface client**
- Affichage de la durée sous chaque extra ("+15 min")
- Fichier : `components/reservation/steps/extras-step.tsx`

### 4. **Génération des créneaux**
- Le `SlotStep` calcule la durée totale (prestation + extras)
- Passage de `extrasDuration` dans l'API
- Recalcul des créneaux si le client change ses extras
- Fichiers :
  - `components/reservation/steps/slot-step.tsx`
  - `app/api/booking/route.ts`
  - `components/reservation/reservation-content.tsx`

---

## 📋 Pour appliquer la migration

```bash
cd kalm-headspa-site

# Si tu utilises Supabase CLI local
supabase db push

# Sinon, exécute le SQL directement dans le dashboard Supabase :
# https://supabase.com/dashboard/project/YOUR_PROJECT/sql
```

**⚠️ Important :** La migration `20260327_fix_extras_id_type.sql` :
1. Change le type de `extras.id` de UUID vers TEXT (car des IDs personnalisés sont utilisés)
2. Met à jour les clés étrangères dans `service_extras`
3. Ajoute le champ `duration`

**Contenu de la migration :**
```sql
-- Change UUID -> TEXT pour supporter les IDs personnalisés
ALTER TABLE extras
  ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Ajoute le champ duration
ALTER TABLE extras
  ADD COLUMN IF NOT EXISTS duration INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN extras.duration IS 'Durée supplémentaire en minutes ajoutée à la prestation de base';
```

---

## ✅ Tests à effectuer

1. **Admin :**
   - [ ] Créer un extra avec une durée (ex: "Massage +15 min")
   - [ ] Vérifier que la durée s'affiche dans la liste

2. **Client :**
   - [ ] Sélectionner une prestation de 60 min
   - [ ] Ajouter un extra de 15 min
   - [ ] Vérifier que les créneaux affichés prennent en compte 75 min
   - [ ] Désélectionner l'extra → vérifier que les créneaux repassent à 60 min

3. **Planning :**
   - [ ] Créer une réservation avec un extra
   - [ ] Vérifier qu'aucun autre créneau ne peut chevaucher la durée totale

---

## 📌 Notes importantes

- Les extras **sans durée** (duration = 0) fonctionnent toujours (ex: produits, options sans impact temps)
- Si le client modifie ses extras après avoir choisi un créneau, le slot est **réinitialisé** automatiquement
- Le cache des créneaux reste cohérent grâce au recalcul à la volée

---

*Dernière mise à jour : 27 mars 2026*
