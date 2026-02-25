// ─────────────────────────────────────────────────────────────────────────────
// MyCoach Pro — Site Configuration
// Modifiez ce fichier pour mettre à jour tout le contenu du site.
// ─────────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  name: "MyCoach Pro",
  tagline: "AMS & Data Platform for Elite Sports",
  url: "https://mycoachpro.io",
  email: "l.poirel@mycoachpro.io",
  logo: "https://i.imgur.com/VXQvKHp.png",

  meta: {
    title: "MyCoach Pro — AMS, gestion athlètes & data pour clubs & fédérations",
    description:
      "Centralisez entraînement, médical, wellness, tests et BI dans un seul AMS sécurisé. +200 clubs et fédérations font confiance à MyCoach Pro.",
    ogImage: "/og-image.png",
  },

  nav: {
    links: [
      { label: "Douleurs", href: "#douleurs" },
      { label: "Solution", href: "#benefices" },
      { label: "Comment ça marche", href: "#process" },
      { label: "Tarifs", href: "#tarifs" },
      { label: "FAQ", href: "#faq" },
    ],
    ctaPrimary: { label: "Demander une démo", href: "#demo" },
    ctaSecondary: { label: "Voir la vidéo", href: "#video" },
  },

  hero: {
    badge: "+200 clubs & fédérations",
    h1: "Centralisez vos données athlètes.\nSécurisez. Analysez. Partagez.",
    subtitle:
      "MyCoach Pro est un AMS (Athlete Management System) qui connecte entraînement, match, médical, wellness, tests, planning, documents et dashboards BI — au même endroit.",
    bullets: [
      "Moins d'outils, moins de frictions, plus de temps terrain.",
      "Des droits d'accès précis (médical vs performance vs coach).",
      "Des dashboards BI sur-mesure pour décider plus vite.",
    ],
    ctaPrimary: "Demander une démo",
    ctaSecondary: "Voir comment ça marche",
    videoLabel: "Regarder la présentation (2 min)",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    trustedBy: "Adopté par des staffs exigeants, du médical au terrain.",
  },

  pains: [
    {
      icon: "Layers",
      title: "Trop d'outils fragmentés",
      desc: "GPS, forms, Excel, WhatsApp, Drive… Chaque outil silo génère des frictions et des erreurs.",
    },
    {
      icon: "FileX",
      title: "Données non structurées",
      desc: "Impossible d'historiser proprement, de comparer des saisons ou de faire du longitudinal sérieux.",
    },
    {
      icon: "ShieldOff",
      title: "Risques sécurité & confidentialité",
      desc: "Accès mal gérés, données médicales exposées, aucune traçabilité des droits.",
    },
    {
      icon: "BarChart2",
      title: "Analyse lente & bricolée",
      desc: "Des dashboards dépendants d'une seule personne, reconstruits à chaque réunion.",
    },
    {
      icon: "Share2",
      title: "Partage compliqué",
      desc: "Le staff est éclaté, l'information n'arrive pas au bon moment, ni au bon interlocuteur.",
    },
    {
      icon: "UserX",
      title: "Turnover = perte de données",
      desc: "Quand un staff change, la méthodologie, les notes et l'historique partent avec lui.",
    },
  ],

  painIntro:
    "Le problème n'est pas la donnée. C'est l'absence de système durable.",

  benefits: {
    heading: "Une seule plateforme pour collecter, structurer, analyser et collaborer.",
    subheading:
      "Chaque module répond à un besoin précis. Ensemble, ils forment un système de décision.",
    cards: [
      {
        icon: "ClipboardList",
        title: "Collecte",
        desc: "Questionnaires wellness/RPE, imports GPS, documents, planning — tout entre dans MyCoach Pro.",
      },
      {
        icon: "Database",
        title: "Centralisation",
        desc: "Une source de vérité unique, historisée sur plusieurs saisons, accessible en quelques clics.",
      },
      {
        icon: "PieChart",
        title: "Analyse BI",
        desc: "Dashboards temps réel, alertes intelligentes, comparaisons longitudinales.",
      },
      {
        icon: "Users",
        title: "Collaboration",
        desc: "Partage staff structuré, commentaires, workflows, notifications ciblées.",
      },
      {
        icon: "ShieldCheck",
        title: "Sécurité",
        desc: "Droits par rôle, séparation médical/perf, conformité RGPD, traçabilité totale.",
      },
      {
        icon: "Rocket",
        title: "Scalabilité",
        desc: "Multi-équipes, multi-catégories, multi-centres. Conçu pour les fédérations.",
      },
    ],
    modules: [
      "Entraînement",
      "Match",
      "Blessures",
      "Tests",
      "Wellness",
      "Stats",
      "Documents",
      "Calendrier",
      "BI & Dashboards",
    ],
  },

  stats: [
    { value: "+200", label: "clubs & fédérations" },
    { value: "Multi-saisons", label: "d'historique structuré" },
    { value: "< 2 min", label: "pour accéder à n'importe quel dashboard" },
  ],

  steps: [
    {
      number: "01",
      title: "Configurer",
      desc: "Définissez rôles, équipes, modules et nomenclatures selon votre organisation.",
      detail: "Onboarding guidé, structure adaptée en moins d'une semaine.",
    },
    {
      number: "02",
      title: "Collecter",
      desc: "Forms, imports, intégrations GPS et outils tiers — les données entrent automatiquement.",
      detail: "Questionnaires mobiles, automatisation des imports, API disponible.",
    },
    {
      number: "03",
      title: "Analyser",
      desc: "Dashboards BI temps réel, alertes proactives, suivi longitudinal par athlète.",
      detail: "Filtres multi-critères, exports PDF/Excel, vues manager & terrain.",
    },
    {
      number: "04",
      title: "Partager",
      desc: "Accès staff selon rôle, exports ciblés, routines hebdo automatisées.",
      detail: "Notifications, rapports automatiques, portail athlète.",
    },
  ],

  onboarding: {
    title: "Accompagnement & Data Science",
    desc: "Notre équipe vous aide à définir vos KPIs, structurer vos données et prendre en main la plateforme. Workshop, ateliers et suivi continu disponibles.",
  },

  pricingToggle: true,

  plans: [
    {
      id: "essentiel",
      name: "Essentiel",
      tagline: "Collecter & centraliser",
      monthlyPrice: "19",
      yearlyPrice: "17",
      unit: "/ licence / mois",
      highlight: false,
      badge: null,
      features: [
        "Questionnaires wellness & RPE",
        "Centralisation données athlètes",
        "Planning & calendrier",
        "Gestion documents",
        "Reporting de base",
      ],
      cta: "Demander un devis",
    },
    {
      id: "avance",
      name: "Avancé",
      tagline: "Collaborer & analyser",
      monthlyPrice: "39",
      yearlyPrice: "35",
      unit: "/ licence / mois",
      highlight: true,
      badge: "Le plus populaire",
      features: [
        "Tout Essentiel +",
        "Modules blessures & tests",
        "Dashboards BI interactifs",
        "Gestion droits par rôle",
        "Collaboration staff avancée",
      ],
      cta: "Demander un devis",
    },
    {
      id: "expert",
      name: "Expert",
      tagline: "BI sur-mesure & accompagnement",
      monthlyPrice: "49",
      yearlyPrice: "44",
      unit: "/ licence / mois",
      highlight: false,
      badge: "Fédérations & clubs pro",
      features: [
        "Tout Avancé +",
        "BI sur-mesure & personnalisé",
        "Accompagnement data science",
        "Multi-équipes & multi-centres",
        "Support prioritaire dédié",
      ],
      cta: "Demander un devis",
    },
  ],

  pricingNote:
    "Engagement 1, 2 ou 3 saisons disponible. Remises sur volume. Tarifs HT, TVA en sus.",

  testimonials: [
    {
      quote:
        "Avant, on passait 2h à recoller des infos de 4 outils différents avant chaque réunion de staff. Maintenant tout est là, en temps réel.",
      author: "Responsable Performance",
      org: "Club de football professionnel",
      avatar: "RP",
    },
    {
      quote:
        "On a sécurisé le médical sans bloquer le staff perf. Chaque rôle voit exactement ce qu'il doit voir. C'est ce qu'on cherchait depuis des années.",
      author: "Médecin du sport",
      org: "Centre de formation régional",
      avatar: "MS",
    },
    {
      quote:
        "Les dashboards ont changé nos routines de décision. Le coach reçoit son rapport hebdo automatiquement. Aucun bricolage.",
      author: "Data Analyst",
      org: "Académie nationale",
      avatar: "DA",
    },
    {
      quote:
        "Le déploiement a été rapide. En une semaine on avait nos équipes configurées et les premiers questionnaires actifs.",
      author: "Directeur sportif",
      org: "Club amateur élite",
      avatar: "DS",
    },
    {
      quote:
        "MyCoach Pro nous a permis de standardiser les pratiques sur 8 centres. Un seul référentiel, des données comparables.",
      author: "Responsable Développement",
      org: "Fédération nationale",
      avatar: "RD",
    },
  ],

  caseStudies: [
    {
      slug: "club-pro-ams-unique",
      label: "Club Professionnel",
      title: "Un AMS unique pour perf & médical",
      context:
        "Club de football pro, 3 équipes, staff de 12 personnes, données éparpillées sur 5 outils.",
      result:
        "Centralisation en 3 semaines. Dashboards temps réel. Zéro fuite de données médicales. Gain estimé : 5h/semaine par membre du staff.",
      metrics: ["5h/sem économisées", "0 incident sécurité", "3 semaines déploiement"],
    },
    {
      slug: "federation-standardisation",
      label: "Fédération",
      title: "Standardisation multi-centres",
      context:
        "Fédération nationale, 8 centres régionaux, 200+ athlètes, aucun référentiel commun.",
      result:
        "Nomenclature unifiée, suivi longitudinal possible pour la première fois, comparaisons inter-centres opérationnelles.",
      metrics: ["8 centres connectés", "+200 athlètes suivis", "1 référentiel commun"],
    },
  ],

  faq: [
    {
      question: "On a déjà un GPS / un outil forms. Pourquoi un AMS ?",
      answer:
        "Un AMS ne remplace pas vos outils existants — il les connecte. MyCoach Pro centralise les données issues de votre GPS, de vos forms et de vos imports Excel dans une seule source de vérité, avec l'historisation et le BI que vos outils actuels ne proposent pas.",
    },
    {
      question: "Comment gérez-vous la confidentialité médicale ?",
      answer:
        "MyCoach Pro propose une séparation stricte par rôle : le staff médical accède uniquement aux données médicales, le staff performance aux données perf. Chaque accès est tracé. Le système est conçu en conformité RGPD, avec hébergement sécurisé.",
    },
    {
      question: "Peut-on personnaliser les modules et les nomenclatures ?",
      answer:
        "Oui. MyCoach Pro est conçu pour s'adapter à votre organisation : noms de KPIs, catégories d'équipes, types de tests, workflows — tout est configurable lors de l'onboarding et modifiable ensuite.",
    },
    {
      question: "Combien de temps pour déployer la plateforme ?",
      answer:
        "En général, une semaine pour configurer les équipes, rôles et premiers modules. Nos clients sont opérationnels en moins de 2 semaines avec l'accompagnement inclus.",
    },
    {
      question: "Peut-on importer l'historique de données existant ?",
      answer:
        "Oui. Nous proposons des formats d'import CSV/Excel et pouvons accompagner la migration de vos données historiques lors de l'onboarding.",
    },
    {
      question: "Quels exports et API sont disponibles ?",
      answer:
        "Exports PDF, Excel, CSV depuis n'importe quel dashboard. Une API REST est disponible sur les plans Avancé et Expert pour les intégrations personnalisées.",
    },
    {
      question: "Qui a accès à quoi dans la plateforme ?",
      answer:
        "Vous définissez les rôles (coach, préparateur physique, médecin, admin, direction) et leurs droits lors de la configuration. Chaque utilisateur ne voit que ce que son rôle lui autorise.",
    },
    {
      question: "Quel support et accompagnement sont inclus ?",
      answer:
        "Tous les plans incluent un onboarding guidé et un support par email. Les plans Avancé et Expert incluent des ateliers data science, un suivi mensuel et un support prioritaire.",
    },
    {
      question: "Y a-t-il des engagements minimums ?",
      answer:
        "Nous proposons des engagements 1, 2 ou 3 saisons, avec des remises progressives. Pas de frais cachés — tout est transparent dès le devis.",
    },
  ],

  finalCta: {
    heading: "Vous voulez voir à quoi ressemble une vraie routine data staff ?",
    subtext:
      "15–20 min, on vous montre un exemple concret : collecte → BI → partage. Sans engagement.",
    roles: ["Coach", "Préparateur physique", "Médecin / Para-médical", "Data Analyst", "Admin / Direction"],
    submitLabel: "Planifier une démo",
    videoLabel: "Ou regarder la vidéo (2 min)",
    successMessage: "Merci ! Nous vous recontacterons sous 24–48h.",
  },

  footer: {
    links: [
      { label: "Produit", href: "#benefices" },
      { label: "Tarifs", href: "#tarifs" },
      { label: "Sécurité", href: "#faq" },
      { label: "Contact", href: "mailto:l.poirel@mycoachpro.io" },
    ],
    legal: [
      { label: "Mentions légales", href: "#" },
      { label: "Politique de confidentialité", href: "#" },
      { label: "CGU", href: "#" },
    ],
    copy: "© 2025 MyCoach Pro — AMS & data platform for elite sports.",
  },
};

export type SiteConfig = typeof siteConfig;
