# 📝 Changelog - Gestion durée des extras

## Version 1.1.0 - 27 mars 2026

### 🎯 Objectif
Corriger le problème de gestion des créneaux de réservation : les extras ajoutaient un coût mais ne bloquaient pas de temps supplémentaire dans le planning.

---

## ✨ Nouveautés

### Fonctionnalités

- **Ajout du champ `duration`** sur les extras (en minutes)
- **Calcul automatique** de la durée totale (prestation + extras) lors de la génération des créneaux
- **Recalcul dynamique** des créneaux disponibles quand le client modifie sa sélection d'extras
- **Affichage visuel** de la durée supplémentaire dans l'interface client et admin

### Interface Admin (`/admin/extras`)

- ✅ Nouveau champ "Durée supplémentaire (en minutes)" dans le formulaire
- ✅ Badge visuel "+X min" dans la liste des extras
- ✅ Validation : durée ≥ 0

### Interface Client (`/reservation`)

- ✅ Affichage "+X min" sous chaque extra si `duration > 0`
- ✅ Créneaux recalculés automatiquement selon les extras sélectionnés
- ✅ Réinitialisation du slot choisi si le client change ses extras

### API

- ✅ `/api/booking` : Nouveau paramètre `extrasDuration` dans l'URL
- ✅ Calcul : `totalDuration = baseDuration + extrasDuration`
- ✅ `/api/admin/extras` : Support du champ `duration` en POST/PUT

---

## 🔧 Modifications techniques

### Base de données

**Migration : `20260327_fix_extras_id_type.sql`**

1. **Fix UUID → TEXT** (pour bases existantes)
   - Conversion de `extras.id` : `UUID` → `TEXT`
   - Conversion de `service_extras.extra_id` : `UUID` → `TEXT`
   - Mise à jour des contraintes de clé étrangère

2. **Ajout champ duration**
   ```sql
   ALTER TABLE extras ADD COLUMN duration INTEGER NOT NULL DEFAULT 0;
   ```

**Migrations corrigées (pour fresh installs) :**
- `001_add_extras.sql` : `id TEXT` au lieu de `id UUID`
- `20260221_service_extras_cache.sql` : `extra_id TEXT` au lieu de `UUID`
- `fix_extras_associations.sql` : Suppression des casts `::uuid`

### Code TypeScript

**Types mis à jour :**
- `lib/supabase/types.ts` : `ExtraRow` avec `duration: number`
- `components/reservation/steps/extras-step.tsx` : `Extra` avec `duration`
- `app/admin/extras/page.tsx` : Type `Extra` avec `duration`

**Composants modifiés :**
- `components/reservation/steps/slot-step.tsx`
  - Calcul de la durée totale des extras
  - Passage du paramètre `extrasDuration` à l'API
  - Recalcul automatique quand les extras changent

- `components/reservation/reservation-content.tsx`
  - Réinitialisation du slot si les extras changent
  - Passage des `selectedExtras` au `SlotStep`

- `components/reservation/steps/extras-step.tsx`
  - Affichage de la durée sous chaque extra

- `app/admin/extras/page.tsx`
  - Formulaire avec champ durée
  - Badge "+X min" dans la liste

**APIs modifiées :**
- `app/api/booking/route.ts` : Gestion du paramètre `extrasDuration`
- `app/api/admin/extras/route.ts` : Support du champ `duration` en création/modification

---

## 🐛 Corrections de bugs

### Bug #1 : Erreur UUID lors de la migration

**Symptôme :**
```
ERROR: 22P02: invalid input syntax for type uuid: "extra-massage-15min"
```

**Cause :** La table `extras` était en UUID mais des IDs personnalisés (TEXT) étaient utilisés.

**Correction :**
- Migration automatique UUID → TEXT
- Mise à jour des migrations de base pour utiliser TEXT dès le départ

### Bug #2 : Double réservation possible

**Symptôme :** Deux clients pouvaient réserver le même créneau si l'un prenait un extra.

**Cause :** La durée des extras n'était pas prise en compte dans le calcul des créneaux.

**Correction :**
- Calcul de la durée totale (service + extras)
- Génération des créneaux avec la bonne durée

---

## 📚 Documentation ajoutée

| Fichier | Description |
|---------|-------------|
| `EXTRAS_DURATION_UPDATE.md` | Vue d'ensemble de la correction |
| `MIGRATION_UUID_TO_TEXT_EXTRAS.md` | Explication technique du fix UUID |
| `TEST_EXTRAS_DURATION.md` | Suite de tests à effectuer |
| `DEPLOY_EXTRAS_DURATION.md` | Guide de déploiement pas à pas |
| `CHANGELOG_EXTRAS_DURATION.md` | Ce fichier |

---

## ⚠️ Breaking Changes

### Aucun pour l'utilisateur final

### Pour les développeurs

- **Type `Extra`** : Ajout du champ obligatoire `duration: number`
- **Prop `SlotStep`** : Nouveau prop `selectedExtras: Extra[]` (requis)
- **API `/api/booking`** : Nouveau paramètre optionnel `extrasDuration`

---

## 🔄 Migration depuis v1.0

### Pour une base existante

```bash
# 1. Pull le nouveau code
git pull origin main

# 2. Appliquer la migration
npx supabase db push

# 3. (Optionnel) Mettre à jour les extras existants
# Exemple : UPDATE extras SET duration = 15 WHERE id = 'extra-massage-15min';

# 4. Redéployer
npm run build && [deploy command]
```

### Pour une fresh install

Rien de spécial ! Les migrations ont été corrigées, tout fonctionnera directement.

---

## 📊 Impact performance

- ✅ Aucun impact négatif
- ✅ Même nombre de requêtes SQL
- ✅ Cache des créneaux toujours fonctionnel
- ✅ Pas de requête supplémentaire côté client

---

## 🎯 Tests effectués

- [x] Création d'extra avec duration via admin
- [x] Affichage de la durée dans l'interface client
- [x] Calcul correct des créneaux avec extras
- [x] Recalcul automatique si changement d'extras
- [x] Impossibilité de double réservation
- [x] Extras sans durée (duration=0) fonctionnent toujours
- [x] Migration UUID→TEXT sur base existante
- [x] Fresh install avec nouvelles migrations

---

## 🚀 Prochaines améliorations possibles

- [ ] Ajout d'une limite max de durée pour les extras
- [ ] Suggestion automatique d'extras selon la durée restante
- [ ] Dashboard admin : statistiques sur les extras les plus choisis
- [ ] Gestion de "packs" d'extras (réduction si plusieurs extras)

---

## 👥 Contributeurs

- **Claude** (AI) - Développement et documentation
- **Vincent** (WMM Digital) - Product Owner & Tests

---

## 📞 Support

En cas de problème suite à cette mise à jour :
1. Consulter `DEPLOY_EXTRAS_DURATION.md` (section résolution de problèmes)
2. Vérifier les logs serveur
3. Contacter : vanglo@hotmail.fr

---

*Date de release : 27 mars 2026*
*Version : 1.1.0*
