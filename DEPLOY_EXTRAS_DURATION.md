# 🚀 Guide de déploiement - Durée des extras

## 📋 Checklist avant déploiement

- [ ] Code TypeScript mis à jour (types, composants, APIs)
- [ ] Migrations SQL créées et testées
- [ ] Tests manuels effectués en local
- [ ] Documentation à jour

---

## 🔧 Étape 1 : Appliquer les migrations

### Option A : Via Supabase CLI (recommandé)

```bash
cd kalm-headspa-site

# Push toutes les migrations en attente
npx supabase db push

# Vérifier que tout est bien appliqué
npx supabase db diff
```

### Option B : Via le dashboard Supabase

1. Aller sur https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Exécuter le SQL suivant :

```sql
-- ============================================
-- Migration complète : UUID->TEXT + duration
-- ============================================

-- PARTIE 1 : Fix UUID -> TEXT (si nécessaire)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'extras' AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE IF EXISTS service_extras
      DROP CONSTRAINT IF EXISTS service_extras_extra_id_fkey;

    ALTER TABLE extras
      ALTER COLUMN id TYPE TEXT USING id::TEXT;

    ALTER TABLE IF EXISTS service_extras
      ALTER COLUMN extra_id TYPE TEXT USING extra_id::TEXT;

    ALTER TABLE IF EXISTS service_extras
      ADD CONSTRAINT service_extras_extra_id_fkey
      FOREIGN KEY (extra_id) REFERENCES extras(id) ON DELETE CASCADE;

    RAISE NOTICE 'Conversion UUID -> TEXT effectuée';
  ELSE
    RAISE NOTICE 'extras.id est déjà TEXT';
  END IF;
END $$;

-- PARTIE 2 : Ajout du champ duration
ALTER TABLE extras
  ADD COLUMN IF NOT EXISTS duration INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN extras.duration IS 'Durée supplémentaire en minutes ajoutée à la prestation de base';
```

3. Vérifier le résultat :

```sql
-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'extras'
ORDER BY ordinal_position;

-- Résultat attendu :
-- id          | text    | NO  | NULL
-- name        | text    | NO  | NULL
-- description | text    | YES | NULL
-- price       | numeric | NO  | NULL
-- duration    | integer | NO  | 0
-- is_active   | boolean | NO  | true
-- sort_order  | integer | NO  | 0
-- created_at  | timestamptz | NO | now()
-- updated_at  | timestamptz | NO | now()
```

---

## 🔄 Étape 2 : Mettre à jour les extras existants

Si tu as déjà des extras dans ta base :

```sql
-- Exemple : Ajouter 15 min à l'extra massage
UPDATE extras
SET duration = 15
WHERE id = 'extra-massage-15min';

-- Lister tous les extras pour vérification
SELECT id, name, price, duration, is_active
FROM extras
ORDER BY sort_order;
```

---

## 🚀 Étape 3 : Déployer le code

### Via Vercel (si hébergé sur Vercel)

```bash
# Commit et push
git add .
git commit -m "feat: Ajout durée des extras dans le calcul des créneaux"
git push origin main

# Vercel déploiera automatiquement
```

### Via autre plateforme

```bash
# Build de production
npm run build

# Déployer selon votre plateforme
```

---

## ✅ Étape 4 : Tests post-déploiement

### Test 1 : Interface admin
1. ✅ `/admin/extras` → Créer un extra avec duration = 15
2. ✅ Vérifier que le badge "+15 min" s'affiche

### Test 2 : Réservation client
1. ✅ `/reservation` → Choisir une prestation
2. ✅ Ajouter l'extra de 15 min
3. ✅ Vérifier que les créneaux sont espacés de 75 min au lieu de 60

### Test 3 : Éviter la double réservation
1. ✅ Créer une réservation 10h00-11h15 (60min + 15min extra)
2. ✅ Vérifier qu'aucun créneau n'est disponible avant 11h15

---

## 🐛 Résolution de problèmes

### Erreur : "invalid input syntax for type uuid"

**Cause :** La migration n'a pas été appliquée et la table extras utilise encore UUID.

**Solution :**
```sql
-- Vérifier le type actuel
SELECT data_type FROM information_schema.columns
WHERE table_name = 'extras' AND column_name = 'id';

-- Si UUID, appliquer la migration manuellement (voir Étape 1)
```

### Erreur : "column duration does not exist"

**Cause :** La partie 2 de la migration n'a pas été appliquée.

**Solution :**
```sql
ALTER TABLE extras
  ADD COLUMN duration INTEGER NOT NULL DEFAULT 0;
```

### Les créneaux ne changent pas malgré l'extra

**Diagnostic :**
1. Ouvrir la console du navigateur (F12)
2. Onglet Network
3. Chercher l'appel `/api/booking?action=slots`
4. Vérifier que `extrasDuration=15` est présent dans l'URL

**Si absent :**
- Clear cache du navigateur
- Hard refresh (Ctrl+Shift+R)
- Vérifier que le code front a bien été déployé

---

## 🔙 Rollback (si nécessaire)

Pour annuler les changements :

```sql
-- 1. Supprimer le champ duration
ALTER TABLE extras DROP COLUMN IF EXISTS duration;

-- 2. (Optionnel) Reconvertir en UUID si besoin
-- ⚠️ Attention : va supprimer les extras avec IDs personnalisés
DELETE FROM extras WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
ALTER TABLE extras ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE service_extras ALTER COLUMN extra_id TYPE UUID USING extra_id::UUID;
```

---

## 📊 Monitoring post-déploiement

Points à surveiller les premiers jours :

- [ ] Vérifier les logs d'erreurs Vercel/serveur
- [ ] Tester 2-3 réservations réelles avec extras
- [ ] Vérifier le planning admin : les extras bloquent bien le temps
- [ ] Retours clients sur la disponibilité des créneaux

---

## 📞 Support

En cas de problème :
1. Consulter les logs serveur
2. Vérifier la structure de la table : `\d extras` (psql)
3. Tester l'API directement : `/api/extras`

---

*Dernière mise à jour : 27 mars 2026*
