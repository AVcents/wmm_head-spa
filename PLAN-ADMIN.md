# Plan — Espace Admin Kalm Headspa

## Architecture

**Approche : JSON files + API routes Next.js + middleware auth**

Pas de Supabase pour l'instant. Les données sont stockées dans des fichiers JSON dans `/data/` à la racine du projet. Les API routes lisent/écrivent ces fichiers. L'admin est protégé par un mot de passe simple en variable d'environnement.

> Migration Supabase possible plus tard en remplaçant simplement les fonctions de lecture/écriture dans `/lib/data.ts`.

---

## Fichiers à créer

### 1. Data layer (`/data/` + `/lib/data.ts`)

- `data/services.json` — initialisé avec les services actuels de `services-data.ts`
- `data/schedule.json` — template horaires actif + les 3 templates prédéfinis
- `lib/data.ts` — fonctions `readServices()`, `writeServices()`, `readSchedule()`, `writeSchedule()` (lecture/écriture fichiers JSON côté serveur)

### 2. API Routes (`/app/api/`)

- `app/api/auth/route.ts` — POST login (vérifie mdp vs `ADMIN_PASSWORD` env var, set cookie HTTP-only)
- `app/api/services/route.ts` — GET (liste) + PUT (maj complète)
- `app/api/schedule/route.ts` — GET (horaire actif) + PUT (changer template actif)

### 3. Middleware auth

- `middleware.ts` — protège `/admin/*` avec vérification du cookie de session

### 4. Pages admin (`/app/admin/`)

- `app/admin/login/page.tsx` — formulaire de connexion simple
- `app/admin/layout.tsx` — layout admin (sidebar nav, header)
- `app/admin/page.tsx` — dashboard (redirect vers prestations)
- `app/admin/prestations/page.tsx` — CRUD prestations (liste, edit inline, ajout, suppression)
- `app/admin/horaires/page.tsx` — 3 boutons template + aperçu horaires actifs

### 5. Modifications existantes

- `lib/services-data.ts` → remplacé par lecture dynamique depuis JSON (via server component ou API)
- `components/shared/footer.tsx` → horaires lus depuis `data/schedule.json` via API/server
- `app/prestations/page.tsx` → services lus dynamiquement
- `components/gift-card/steps/amount-step.tsx` → services lus dynamiquement

---

## Modèle de données

### `data/schedule.json`
```json
{
  "activeTemplate": "semaine-impaire",
  "templates": {
    "semaine-impaire": {
      "label": "Semaine impaire",
      "hours": [
        { "day": "Lundi - Vendredi", "hours": "9h00 - 12h00 / 13h00 - 19h00" },
        { "day": "Samedi", "hours": "Fermé" },
        { "day": "Dimanche", "hours": "Fermé" }
      ]
    },
    "semaine-paire": {
      "label": "Semaine paire",
      "hours": [
        { "day": "Lundi - Vendredi", "hours": "9h00 - 12h00 / 13h00 - 17h00" },
        { "day": "Samedi", "hours": "Fermé" },
        { "day": "Dimanche", "hours": "Fermé" }
      ]
    },
    "vacances-impaire": {
      "label": "Vacances scolaires — Semaine impaire",
      "hours": [
        { "day": "Lundi - Vendredi", "hours": "14h00 - 18h00" },
        { "day": "Samedi", "hours": "Fermé" },
        { "day": "Dimanche", "hours": "Fermé" }
      ]
    },
    "vacances-paire": {
      "label": "Vacances scolaires — Semaine paire",
      "hours": [
        { "day": "Lundi - Vendredi", "hours": "9h00 - 12h00" },
        { "day": "Samedi", "hours": "Fermé" },
        { "day": "Dimanche", "hours": "Fermé" }
      ]
    }
  }
}
```

### `data/services.json`
Exactement la structure actuelle de `services-data.ts` exportée en JSON.

---

## Page admin horaires — UX

4 boutons clairs avec le template actif mis en surbrillance :
- **Semaine impaire** : 9h-12h / 13h-19h
- **Semaine paire** : 9h-12h / 13h-17h
- **Vacances — Semaine impaire** : 14h-18h
- **Vacances — Semaine paire** : 9h-12h

Clic → modale de confirmation → API call → mise à jour → toast de succès.

---

## Auth

- Variable d'env : `ADMIN_PASSWORD`
- Login : POST `/api/auth` avec le mot de passe
- Cookie HTTP-only `admin-session` avec un token signé (simple hash)
- Middleware vérifie le cookie sur toutes les routes `/admin/*` (sauf `/admin/login`)

---

## Ordre d'implémentation

1. Data layer (JSON files + lib/data.ts)
2. API routes (auth, services, schedule)
3. Middleware auth
4. Page login admin
5. Layout admin
6. Page horaires (boutons templates)
7. Page prestations (CRUD)
8. Refactor pages publiques pour lire les données dynamiquement
9. Vérification
