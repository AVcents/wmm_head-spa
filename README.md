# Kalm Headspa - Site Web

Site web pour Kalm Headspa, espace de bien-être spécialisé dans le Head Spa.

## Stack Technique

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7 (strict mode)
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui + Custom
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Développement

```bash
# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev

# Build pour production
pnpm build

# Lancer en production
pnpm start

# Linter
pnpm lint

# Type checking
pnpm type-check
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## Structure du Projet

```
kalm-headspa-site/
├── app/                    # Pages Next.js (App Router)
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Page d'accueil
│   └── globals.css         # Styles globaux
├── components/
│   ├── ui/                 # Composants UI de base
│   ├── shared/             # Composants partagés (Header, Footer)
│   ├── marketing/          # Composants marketing
│   └── providers/          # Providers (Theme, etc.)
├── lib/                    # Utilitaires
└── public/                 # Assets statiques
```

## Fonctionnalités

- ✅ Design moderne et responsive
- ✅ Mode sombre / Mode clair
- ✅ Animations fluides (Framer Motion)
- ✅ Optimisation SEO
- ✅ Performance optimale
- ✅ Accessibilité WCAG AAA
- ✅ TypeScript strict mode

## Pages Actuelles

- **Accueil** (`/`) : Hero, Bienfaits, Prestations, CTA
- Prestations (à venir)
- Contact (à venir)

## Palette de Couleurs

- **Primary**: Vert Sauge (#4d9172)
- **Secondary**: Beige Doré (#a68a60)
- **Accents**: Terre, Menthe, Rose

Voir `app/globals.css` pour la palette complète.

## Standards AAA

Ce projet suit les standards AAA de l'agence :
- TypeScript strict mode (zéro `any`)
- Contraste WCAG AAA (7:1)
- Performance Lighthouse > 95
- Code production-ready

---

Développé avec ❤️ pour Kalm Headspa
