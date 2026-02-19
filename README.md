# Sales Command Center — MyCoach Pro

Interface commerciale interne de type Linear pour piloter le pipeline de vente MyCoach Pro : contacts Google Sheets → pipeline kanban → data center interactionnel → analytics.

---

## Stack Technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Drag & Drop | dnd-kit |
| State | TanStack Query + Zustand |
| Base de données | PostgreSQL (Supabase / Neon) + Prisma |
| Auth | NextAuth v4 (Google OAuth) |
| Emails | Gmail API (OAuth) |
| Sheets | Google Sheets API |
| CRM | Sellsy API v2 |
| Déploiement | Vercel + Cron Jobs |

---

## Fonctionnalités MVP

- **Pipeline Kanban** : colonnes drag & drop type Linear, filtres rapides (stale, next step manquant), command palette (`/` ou `⌘K`)
- **Data Center Interactionnel** : chaque carte affiche instantanément les compteurs (interactions, emails out/in, RDV, démos), dates clés, indicateurs (Replied, Stale, Next step ?), statut Sellsy
- **Google Sheets → Contacts** : import initial + sync incrémentale (hash par ligne), wizard de mapping colonnes, push-back stage/owner
- **Gmail Sync** : détection réponses, EmailThread, alimentation MetricsSnapshot
- **Sellsy Sync** : matching par email, opportunités, alertes
- **Fiche Contact** : timeline complète (interactions, emails, tasks, notes), score de santé, Sellsy
- **Analytics** : funnel conversion, taux de réponse, performance par owner
- **Admin Pipeline** : CRUD stages avec drag & drop, règles de passage (owner requis, next step, email)

---

## Installation & Démarrage Local

### 1. Prérequis

- Node.js 18+
- PostgreSQL (ou compte Supabase/Neon gratuit)
- Compte Google Cloud avec APIs activées

### 2. Variables d'environnement

```bash
cp .env.example .env.local
# Remplissez toutes les variables
```

### 3. Google Cloud Setup

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un projet ou utiliser un existant
3. Activer les APIs suivantes :
   - **Google Sheets API**
   - **Google Drive API**
   - **Gmail API**
4. Créer des identifiants OAuth 2.0 (type : Application Web)
5. Ajouter les URIs de redirection autorisées :
   - `http://localhost:3000/api/auth/callback/google`
   - `https://votre-domaine.vercel.app/api/auth/callback/google`
6. Copier `Client ID` et `Client Secret` dans `.env.local`

**Scopes Google demandés :**
```
openid
email
profile
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.metadata
```

> **Note sécurité Gmail** : Seuls les scopes `readonly` et `metadata` sont demandés. L'application ne peut pas envoyer d'emails ni modifier votre boîte.

### 4. Base de données

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate

# Pousser le schéma (dev)
npm run db:push

# Ou migrer (prod)
npm run db:migrate

# Seeder les données de démo
npm run db:seed
```

### 5. Démarrer

```bash
npm run dev
# → http://localhost:3000
```

Se connecter avec `admin@mycoacpro.fr` (données seed) ou via Google OAuth.

---

## Déploiement Vercel

### 1. Variables d'environnement Vercel

Configurer dans Settings → Environment Variables :

```
DATABASE_URL
NEXTAUTH_URL=https://votre-app.vercel.app
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
ENCRYPTION_KEY
CRON_SECRET
```

### 2. Deploy

```bash
vercel --prod
```

### 3. Cron Job

Le fichier `vercel.json` configure un cron toutes les 30 minutes qui :
1. Sync Google Sheets (pull incrémental)
2. Sync Gmail (threads récents)
3. Sync Sellsy (opportunités)
4. Recompute MetricsSnapshot (all)

Le endpoint `/api/cron/sync` est protégé par `CRON_SECRET`.

---

## Configuration Sellsy

1. Aller sur [API Sellsy](https://api.sellsy.com)
2. Créer une application OAuth2 dans votre compte Sellsy
3. Récupérer `Client ID` et `Client Secret`
4. Les renseigner dans l'onboarding (`/onboarding` → étape Sellsy)

Les credentials sont **chiffrés** en base (AES via `ENCRYPTION_KEY`).

---

## Architecture du Repo

```
/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Pages protégées (layout avec sidebar)
│   │   ├── pipeline/             # Vue kanban pipeline
│   │   ├── contact/[id]/         # Fiche contact
│   │   ├── account/[id]/         # Fiche organisation
│   │   ├── analytics/            # Dashboard analytics
│   │   └── admin/pipeline/       # Admin stages/pipelines
│   ├── login/                    # Page connexion
│   ├── onboarding/               # Wizard d'intégrations
│   └── api/                      # API Routes
│       ├── auth/[...nextauth]/   # NextAuth
│       ├── contacts/             # CRUD contacts
│       ├── pipeline/             # CRUD pipelines + board
│       ├── stages/               # CRUD stages
│       ├── interactions/         # CRUD interactions
│       ├── metrics/              # Recompute metrics
│       ├── analytics/            # Agregations analytics
│       ├── sync/{sheets,gmail,sellsy}  # Sync endpoints
│       ├── onboarding/           # Wizard API
│       └── cron/sync/            # Cron job endpoint
│
├── components/
│   ├── pipeline/
│   │   ├── PipelineBoard.tsx     # Board principal dnd-kit
│   │   ├── PipelineColumn.tsx    # Colonne droppable
│   │   ├── ContactCard.tsx       # Carte contact draggable
│   │   ├── DataCenter.tsx        # ⭐ Data Center Interactionnel
│   │   ├── PipelineFiltersBar.tsx # Filtres + search
│   │   ├── PipelineSwitcher.tsx  # Switcher de pipeline
│   │   └── CommandPalette.tsx    # Palette commandes (cmdk)
│   ├── contact/
│   │   ├── ContactDetailView.tsx # Fiche contact complète
│   │   └── InteractionTimeline.tsx # Timeline interactions
│   ├── onboarding/
│   │   └── OnboardingWizard.tsx  # Wizard 5 étapes
│   ├── analytics/
│   │   └── AnalyticsDashboard.tsx # Dashboard analytics
│   ├── admin/
│   │   └── PipelineAdmin.tsx     # Admin pipeline + stages
│   ├── layout/
│   │   └── Sidebar.tsx           # Sidebar navigation
│   └── ui/                       # Composants shadcn/ui
│
├── lib/
│   ├── prisma.ts                 # Client Prisma singleton
│   ├── auth.ts                   # NextAuth config + encryption
│   ├── api-helpers.ts            # Auth middleware + helpers
│   ├── metrics.ts                # ⭐ Recompute MetricsSnapshot
│   ├── sheets.ts                 # Google Sheets integration
│   ├── gmail.ts                  # Gmail sync + reply detection
│   ├── sellsy.ts                 # Sellsy API sync
│   └── utils.ts                  # Utilitaires + calcHealthScore
│
├── types/
│   └── index.ts                  # Types TypeScript stricts
│
├── prisma/
│   ├── schema.prisma             # ⭐ Schéma complet (16 modèles)
│   └── seed.ts                   # Données de démo
│
├── .env.example                  # Variables d'environnement
├── vercel.json                   # Config Vercel + Cron
└── README.md
```

---

## Modèle de données

```
User ─── Account (NextAuth)
       ── Contact (owner)
       ── Org (owner)
       ── Task (owner)

Org ─── Contact
     ── Interaction
     ── SellsyLink
     ── MetricsSnapshot

Contact ─── ContactPipelineState ─── Pipeline ─── PipelineStage
         ── ContactStageHistory
         ── Interaction (EMAIL_OUT/IN, CALL, MEETING, DEMO, ...)
         ── EmailThread
         ── Task
         ── Note
         ── MetricsSnapshot ⭐ (cache instantané pour les cards)
         ── SellsyLink

Event  (analytics)
AuditLog (traçabilité)
IntegrationSettings (tokens chiffrés, mapping, config sync)
```

---

## Raccourcis Clavier

| Raccourci | Action |
|---|---|
| `/` ou `⌘K` | Ouvrir la command palette |
| `G P` | Aller au Pipeline |
| `G A` | Aller aux Analytics |
| `N` | Nouveau contact (depuis palette) |
| `F` | Focus filtres/recherche |

---

## Scopes Google (Minimum Nécessaire)

```
openid                                              # Identité
email                                               # Email utilisateur
profile                                             # Nom et photo
https://www.googleapis.com/auth/spreadsheets        # Lire/écrire Sheets
https://www.googleapis.com/auth/drive.readonly      # Lister les Sheets
https://www.googleapis.com/auth/gmail.readonly      # Lire les emails
https://www.googleapis.com/auth/gmail.metadata      # Métadonnées emails
```

> **Importante** : Le scope `gmail.readonly` permet de lire les emails mais **pas d'en envoyer**. Le scope `gmail.metadata` permet de lire uniquement les en-têtes (expéditeur, destinataire, date) sans le contenu des messages.

---

## Tests

```bash
# Tester le mapping Sheets → Contact
curl -X POST http://localhost:3000/api/sync/sheets \
  -H "Cookie: next-auth.session-token=..."

# Tester un changement de stage
curl -X POST http://localhost:3000/api/contacts/CONTACT_ID/stage \
  -H "Content-Type: application/json" \
  -d '{"pipelineId": "...", "stageId": "..."}'

# Forcer recompute metrics
curl -X POST http://localhost:3000/api/metrics/recompute \
  -H "Content-Type: application/json" \
  -d '{"contactId": "..."}'
```

---

## Support & Feedback

Ce projet est développé pour un usage interne MyCoach Pro. Pour toute question, contacter l'équipe technique.
