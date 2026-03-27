# 🔧 Migration UUID → TEXT pour la table extras

## 🐛 Problème rencontré

L'erreur suivante apparaissait lors de l'exécution de la migration :

```
ERROR: 22P02: invalid input syntax for type uuid: "extra-massage-15min"
```

## 🔍 Cause racine

La table `extras` a été créée avec une colonne `id` de type `UUID`, mais le projet utilise des **IDs personnalisés** de type chaîne de caractères :
- Exemple : `'extra-massage-15min'`
- Ces chaînes ne sont pas des UUIDs valides (format requis : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

PostgreSQL refuse donc d'insérer ces valeurs dans une colonne UUID.

## ✅ Solution appliquée

Changement du type de colonne `extras.id` de `UUID` vers `TEXT`.

### Étapes de la migration

1. **Drop des contraintes** : Suppression temporaire des clés étrangères
2. **Conversion de type** : `UUID` → `TEXT` pour `extras.id`
3. **Mise à jour des références** : Conversion de `service_extras.extra_id` aussi
4. **Recréation des contraintes** : Ajout de la FK avec le bon type
5. **Ajout du champ duration** : Maintenant possible sans erreur de type

### Fichier de migration

`supabase/migrations/20260327_fix_extras_id_type.sql`

## 🎯 Avantages de TEXT vs UUID

**Avec TEXT :**
- ✅ IDs lisibles et descriptifs (`extra-massage-15min`)
- ✅ Pas besoin de table de correspondance
- ✅ Facilite le debugging et les logs
- ✅ Compatible avec les données existantes

**Inconvénients négligeables :**
- ❌ Légèrement plus d'espace disque (négligeable)
- ❌ Pas de validation automatique du format (mais non nécessaire ici)

## 📝 Convention d'ID recommandée

Pour garder une cohérence, utiliser le format :
```
extra-{nom-descriptif}
```

Exemples :
- `extra-massage-15min`
- `extra-huile-premium`
- `extra-shampoing-bio`

## ⚠️ Impact sur le code existant

**Aucun impact** sur le code TypeScript car :
- Le type `string` était déjà utilisé côté front
- Les APIs manipulent déjà des chaînes de caractères
- Seul le schéma de base de données change

## 🔄 Rollback (si besoin)

Si tu veux revenir à UUID (déconseillé) :

```sql
-- Supprimer les données avec IDs personnalisés
DELETE FROM extras WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Reconvertir en UUID
ALTER TABLE extras ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE service_extras ALTER COLUMN extra_id TYPE UUID USING extra_id::UUID;
```

---

*Dernière mise à jour : 27 mars 2026*
