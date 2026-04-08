# Aquacanvas — Tech Stack

> **Senast uppdaterad:** 2026-04-08
> **Status:** Beslutad

---

## Översikt

Aquacanvas är en e-commerce-plattform som erbjuder AI-genererad konst. Kunden laddar upp ett foto (t.ex. sin stuga, sitt husdjur, en stadsbild) och väljer en konststil (vattenmålning, oljemålning, sketch, etc.). En AI-tjänst transformerar fotot till en konstnärlig version som kunden sedan kan beställa som tryck/poster.

**Fas 1:** En produkt — fototransformation till vattenmålning. Fler stilar och produkttyper (canvastavla, inramad poster, etc.) läggs till framöver.

---

## Frontend

| Teknologi | Version | Syfte |
|-----------|---------|-------|
| **Next.js** | 16.x | React-ramverk med App Router, SSR, SSG, streaming |
| **React** | 19.x | UI-bibliotek |
| **TypeScript** | 5.x | Typsäkerhet end-to-end |
| **Tailwind CSS** | 4.x | Utility-first styling, matchar designsystem |
| **Shadcn/UI** | senaste | Komponentbibliotek — **alla UI-primitiver**. Varianter anpassade till DESIGN.md |
| **Radix UI** | unified `radix-ui` | Tillgängliga primitiver (via Shadcn) |
| **Motion** (f.d. Framer Motion) | senaste | Animationer — transform + opacity, spring-easing |
| **Zustand** | 5.x | Lättviktig global state management |
| **TanStack Query** | 5.x | Server state, caching, datasynkronisering |
| **React Hook Form** | 7.x | Formulärhantering |
| **Zod** | senaste | Schemavalidering — delad mellan frontend & backend |
| **next-intl** | senaste | Internationalisering — Server Components-stöd |

### Frontend-principer

- **Server Components som default** — `'use client'` bara vid event listeners, browser APIs, lokal state
- **App Router** — layouter, loading states, error boundaries, parallel routes
- **Shadcn/UI som komponentbas** — Alla knappar, inputs, kort, labels etc. använder Shadcn-komponenter. Varianterna anpassas till DESIGN.md. Raw HTML bara om ingen Shadcn-komponent finns.
- **Typografi-alias** — Använd `font-heading` och `font-sans` via Tailwind-konfiguration
- **Mobile-first responsive** — designa för mobil, skala uppåt
- **Streaming & Suspense** — progressiv rendering av produktsidor och bildgenerering
- **Image Optimization** — Next.js `<Image>` med lazy loading, responsive sizing, WebP

---

## AI / Bildgenerering

| Teknologi | Syfte |
|-----------|-------|
| **Replicate** | AI-plattform för bildtransformation (primärt val) |
| **Stable Diffusion (img2img)** | Modell för stiltransformation (vattenmålning, etc.) |
| **Alternativ: OpenAI Images API** | Fallback/alternativ för bildgenerering |

### AI-principer

- **Server-side only** — AI API-anrop sker via Server Actions eller Edge Functions, aldrig från klienten
- **Lazy SDK initialization** — `getReplicate()` singleton, aldrig modul-scope instantiering
- **Asynkron bearbetning** — bildgenerering tar tid; använd polling eller webhooks för statusuppdatering
- **Kö-system** — vid skala, använd en kö (Supabase Edge Function + pg_cron eller extern kö) för att hantera lastbalansering
- **Bildlagring** — originalbild + genererad bild lagras i Supabase Storage
- **Kostnadskontroll** — logga varje API-anrop med kostnad, sätt rate limits per användare

### Stöd för konststilar (Fas 1 → framtida)

| Stil | Status | Prompt/Modell |
|------|--------|---------------|
| Vattenmålning | Fas 1 — MVP | img2img med watercolor-prompt |
| Oljemålning | Framtida | img2img med oil painting-prompt |
| Kolskiss | Framtida | img2img med charcoal sketch-prompt |
| Anime/Manga | Framtida | Separat modell |
| Impressionism | Framtida | Style transfer-modell |

---

## Backend

| Teknologi | Version | Syfte |
|-----------|---------|-------|
| **Supabase** | Senaste (cloud-hosted) | Backend-as-a-Service: databas, auth, storage, realtime |
| **PostgreSQL** | 15+ (via Supabase) | Relationsdatabas |
| **Supabase Auth** | Inbyggd | Autentisering: OAuth, magic links, JWT |
| **Supabase Storage** | Inbyggd | Fil-/medialagring med CDN (originalbilder + genererade) |
| **Supabase Realtime** | Inbyggd | Realtidsuppdateringar (orderstatus, bildgenerering) |
| **Supabase Edge Functions** | Deno runtime | Serverless affärslogik (webhooks, AI-anrop) |
| **Supabase CLI** | senaste | Lokal utveckling, migrationer, typgenerering |

### Backend-principer

- **Row Level Security (RLS)** — säkerhet på databasnivå, alla queries filtreras per användare
- **Typgenerering** — `supabase gen types` för TypeScript-typer direkt från databasschema
- **Edge Functions** — för betalningar, webhooks, AI API-anrop
- **Connection pooling** — PgBouncer inbyggd i Supabase

---

## Internationalisering (i18n) — Strategi

> Engelska är default. Fler språk (svenska, etc.) läggs till framöver.

### Principer

- **`next-intl`** hanterar all text-översättning, datum/valuta-formatering och plural-regler
- **Alla user-facing strings via `messages/{locale}.json`** — aldrig hårdkodade i JSX
- **Server Components-first** — `next-intl` stödjer Server Components utan extra klient-JS

### i18n + SEO

- `hreflang`-taggar när fler språk aktiveras
- Metadata (`title`, `description`) hämtas från översättningsfiler
- Sitemap inkluderar alla språkversioner

---

## Betalningar

| Teknologi | Version | Syfte |
|-----------|---------|-------|
| **Stripe** | senaste (Node SDK) | Betalningar, prenumerationer |

### Stripe-principer

- **Stripe Checkout** — förbyggda betalningsflöden för e-commerce
- **Webhooks** — hanteras via Server Actions eller Edge Functions
- **Stripe Elements** — inbäddade betalningsformulär i frontend (framtida)
- **Orderstatus** — uppdateras via webhook-events (payment_intent.succeeded, etc.)

---

## Media & Lagring

| Teknologi | Syfte |
|-----------|-------|
| **Supabase Storage** | Primär lagring för originalbilder och genererade konstverk |
| **Next.js Image** | Optimerad bildvisning (WebP, responsive, lazy loading) |
| **Cloudflare R2** | Kostnadseffektiv objektlagring vid skala (framtida) |

### Bildflöde

1. Kund laddar upp originalfoto → Server Action validerar (storlek, MIME-typ)
2. Originalfoto sparas i Supabase Storage (`{userId}/originals/{orderId}.{ext}`)
3. AI-tjänst anropas med originalfoto + vald stil
4. Genererad bild sparas i Supabase Storage (`{userId}/generated/{orderId}.{ext}`)
5. Kund förhandsgranskar → godkänner → betalar → orderstatus uppdateras

---

## Deployment & Infrastruktur

| Teknologi | Syfte |
|-----------|-------|
| **Vercel** | Hosting för Next.js — edge network, preview deploys, analytics |
| **Supabase Cloud** | Managed databas, auth, storage, edge functions |
| **GitHub** | Versionskontroll, CI/CD via GitHub Actions |

---

## Utvecklingsverktyg

| Verktyg | Syfte |
|---------|-------|
| **ESLint** | Linting med Next.js-konfiguration |
| **Prettier** | Kodformatering |
| **Husky + lint-staged** | Pre-commit hooks |
| **TypeScript strict mode** | Maximal typsäkerhet |

---

## Projektstruktur

```
aquacanvas/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Auth-routes (login, register)
│   │   ├── (shop)/           # Butik & produktsidor
│   │   ├── (dashboard)/      # Kundkonto (ordrar, inställningar)
│   │   ├── (admin)/          # Admin-panel
│   │   ├── (marketing)/      # Publika sidor (landing, om oss)
│   │   ├── api/              # API-routes (webhooks)
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Globala stilar + Tailwind
│   ├── components/
│   │   ├── ui/               # Shadcn/UI-komponenter
│   │   ├── shared/           # Delade applikationskomponenter
│   │   ├── shop/             # Butik-specifika komponenter
│   │   └── dashboard/        # Dashboard-komponenter
│   ├── lib/
│   │   ├── supabase/         # Supabase-klient, helpers
│   │   ├── stripe.ts         # Stripe-integration
│   │   ├── ai.ts             # AI-service (Replicate/OpenAI)
│   │   ├── email.ts          # E-postutskick
│   │   ├── env.ts            # Env-validering
│   │   └── utils.ts          # Utility-funktioner
│   ├── hooks/                # Custom React hooks
│   ├── stores/               # Zustand stores
│   ├── types/                # TypeScript-typer & interfaces
│   └── validators/           # Zod-scheman
├── supabase/
│   ├── migrations/           # SQL-migrationer
│   ├── functions/            # Edge Functions
│   └── seed.sql              # Testdata
├── messages/                 # i18n-filer (en.json, sv.json)
├── public/                   # Statiska filer
├── brand_assets/             # Logotyper, designfiler, DESIGN.md
├── TECHSTACK.md              # (denna fil)
├── ROADMAP.md                # Projektstatus och sprints
├── CLAUDE.md                 # AI-instruktioner för projektet
└── .cursorrules              # Cursor IDE-regler
```

---

## SEO — Hög prioritet

SEO är kritiskt för e-commerce. Organisk trafik driver försäljning.

### Principer

- **Metadata på alla sidor** — Unik `title`, `description`, `og:image` via `generateMetadata`
- **Strukturerad data (JSON-LD)** — `Product`, `Organization`, `BreadcrumbList`, `FAQPage`
- **Sitemap & robots.txt** — Automatisk generering
- **Core Web Vitals** — LCP < 2.5s, INP < 200ms, CLS < 0.1
- **Semantisk HTML** — Korrekt heading-hierarki, landmarks

---

## Tillgänglighet (a11y) — Hög prioritet

- **WCAG 2.1 AA** som miniminivå
- **Semantisk HTML** — `<nav>`, `<main>`, `<article>`, `<section>` med ARIA-landmarks
- **Tangentbordsnavigering** — Alla interaktiva element nåbara via tangentbord
- **Focus management** — Synlig focus-indikator, skip-to-content-länk
- **Kontrast** — 4.5:1 för normal text, 3:1 för stor text
- **Formulär** — Associerade `<label>`, felmeddelanden kopplade via `aria-describedby`
- **Bilder** — Meningsfulla `alt`-attribut
- **Reducerad rörelse** — Respektera `prefers-reduced-motion`

---

## Skalbarhetsstrategi

### Fas 1 — MVP (1 produkt: vattenmålning)
- Supabase Free/Pro för databas, auth, storage
- Vercel Hobby/Pro för frontend
- Replicate pay-per-use för AI
- Stripe Test Mode under utveckling

### Fas 2 — Tillväxt (fler stilar, fler produkter)
- Supabase Pro med connection pooling
- Cloudflare R2 för medialagring vid skala
- Redis (Upstash) för caching av genererade bilder
- Kö-system för AI-anrop

### Fas 3 — Skala
- Supabase Enterprise med read replicas
- CDN för genererade bilder
- Batch-generering och asynkrona flöden
- Eventuell microservice-uppdelning
