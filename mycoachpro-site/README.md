# MyCoach Pro — Site Vitrine SaaS

Landing page B2B pour **MyCoach Pro**, AMS (Athlete Management System) pour clubs et fédérations sportives.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** (design dark premium)
- **framer-motion** (animations)
- **lucide-react** (icônes)

## Lancer en local

```bash
npm install
npm run dev   # → http://localhost:3000
```

## Build & déploiement

```bash
npm run build   # build production
npm start       # serveur production
```

Prêt pour **Vercel** (zero-config). Pour déployer :

```bash
npx vercel --prod
```

## Modifier le contenu

**Tout le contenu est dans un seul fichier :**

```
config/site.config.ts
```

Il contient : navbar, hero, douleurs, bénéfices, stats, étapes, tarifs, témoignages, FAQ, CTA final, footer.

### Exemple — modifier les prix

```ts
plans: [
  { id: "essentiel", monthlyPrice: "19", yearlyPrice: "17", ... }
]
```

### Exemple — ajouter un témoignage

```ts
testimonials: [
  { quote: "...", author: "Nom", org: "Club", avatar: "NN" }
]
```

## Intégration leads (formulaire démo)

Modifier `app/api/lead/route.ts` pour brancher votre CRM / Airtable / SendGrid.

## Architecture (11 sections)

| # | Section | Composant |
|---|---------|-----------|
| 1 | Navbar sticky + scroll spy | `Navbar.tsx` |
| 2 | Hero (H1 + vidéo card) | `Hero.tsx` |
| 3 | Douleurs (6 pain points) | `PainPoints.tsx` |
| 4 | Bénéfices + modules | `Benefits.tsx` |
| 5 | Preuve sociale #1 (stats) | `SocialProof.tsx` |
| 6 | Comment ça marche (4 étapes) | `HowItWorks.tsx` |
| 7 | Tarifs (3 plans + toggle) | `Pricing.tsx` |
| 8 | Témoignages + cas clients | `Testimonials.tsx` |
| 9 | FAQ accordion | `FAQ.tsx` |
| 10 | CTA Final + formulaire | `FinalCTA.tsx` |
| 11 | Footer | `Footer.tsx` |

**Sticky CTA** flottant bas-droite : vidéo + démo
**Modal vidéo** globale avec Escape pour fermer
