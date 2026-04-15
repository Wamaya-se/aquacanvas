# Aquacanvas — Tech Stack

> **Senast uppdaterad:** 2026-04-14
> **Status:** Beslutad — deployed to production

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
| **Kie.ai** | AI-plattform för bildtransformation (primärt val, i produktion) |
| **google/nano-banana-edit** | Modell för stiltransformation (alla 5 stilar) |
| **Alternativ: Replicate / OpenAI Images API** | Fallback/alternativ för bildgenerering |

### AI-principer

- **Server-side only** — AI API-anrop sker via Server Actions eller Edge Functions, aldrig från klienten
- **Lazy SDK initialization** — `getReplicate()` singleton, aldrig modul-scope instantiering
- **Asynkron bearbetning** — bildgenerering tar tid; använd polling eller webhooks för statusuppdatering
- **Kö-system** — vid skala, använd en kö (Supabase Edge Function + pg_cron eller extern kö) för att hantera lastbalansering
- **Bildlagring** — originalbild + genererad bild lagras i Supabase Storage
- **Kostnadskontroll** — logga varje API-anrop med kostnad, sätt rate limits per användare

### Stöd för konststilar (Fas 1 → framtida)

| Stil | Status | Pris (SEK) | Modell |
|------|--------|------------|--------|
| Vattenmålning | Aktiv | 349 | google/nano-banana-edit |
| Oljemålning | Aktiv | 399 | google/nano-banana-edit |
| Kolskiss | Aktiv | 299 | google/nano-banana-edit |
| Anime | Aktiv | 349 | google/nano-banana-edit |
| Impressionism | Aktiv | 399 | google/nano-banana-edit |

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

| Teknologi | Syfte | URL/Info |
|-----------|-------|----------|
| **Vercel** | Hosting för Next.js — edge network, preview deploys, analytics | https://aquacanvas.vercel.app |
| **Supabase Cloud** | Managed databas, auth, storage, edge functions | EU West (xinnmqappqywcgzexapg) |
| **GitHub** | Versionskontroll, auto-deploy vid push till `main` | github.com/Wamaya-se/aquacanvas |

---

## Deployment & drift

Detta är den **praktiska kedjan** från laptop till live — använd den när du (eller AI-assistenten) ska “pusha till GitHub/Vercel”.

### Lokal utveckling

1. **Klona** repot: `git clone https://github.com/Wamaya-se/aquacanvas.git`
2. **Installera:** `npm install`
3. **Miljö:** kopiera `.env.example` → `.env.local` och fyll i värden (Supabase URL/nycklar från Supabase Dashboard; övrigt enligt behov för Stripe, Kie.ai, Resend).
4. **Starta:** `npm run dev` → appen på `http://localhost:3000`
5. **Byggtest (valfritt):** `npm run build` — samma kommando som Vercel kör

**Node:** version **20+** (LTS rekommenderas).

### Git → GitHub → Vercel (production)

1. Arbeta på branch **`main`** (eller skapa feature-branch och merga till `main` via PR).
2. **Commit** dina ändringar: `git add` / `git commit -m "…"`
3. **Push:** `git push origin main`
4. **Vercel** är kopplat till GitHub-repot: varje push till `main` startar en **ny production-build** automatiskt. Ingen manuell deploy från CLI behövs i normalfallet.
5. Följ bygget i **Vercel Dashboard** (Deployments) — vid fel, läs build-loggen där.

**Preview:** push till en **annan branch** eller **pull request** ger ofta en **preview-URL** (om det är aktiverat i Vercel-projektet).

### Vad som *inte* triggas av Git

- **Supabase** (databas, RLS, Storage-policies, Edge Functions) är **separat** från Vercel. Kod i `supabase/migrations/` och `supabase/functions/` måste **tillämpas mot Supabase-projektet** när du ändrar schema eller functions (t.ex. `supabase link` + `supabase db push`, eller SQL i Dashboard — följ teamets vanliga rutin).
- **Om en ändring bara rör** frontend, `public/`, texter eller i18n: räcker **Git push** — ingen Supabase-action.

### Miljövariabler

| Miljö | Var |
|-------|-----|
| **Lokal** | `.env.local` (git ignoreras — se `.env.example` för nycklar) |
| **Vercel** | Project → **Settings → Environment Variables** (Production / Preview). Ska spegla det appen behöver i drift, t.ex. `NEXT_PUBLIC_*`, `SUPABASE_SERVICE_ROLE_KEY`, Stripe, Kie.ai, Resend. |

Nya variabler i kod (`src/lib/env.ts`) måste **läggas till i Vercel** innan production fungerar.

### Checklista inför “be AI pusha till live”

1. `git status` — rätt filer med?
2. `npm run build` lokalt om du ändrat mycket (fångar Next/TS-fel innan Vercel).
3. `git commit` + `git push origin main`
4. Vänta på grön deploy i Vercel; vid schemaändring: glöm inte **Supabase** enligt ovan.

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
├── README.md                 # Snabbstart + länk till deploy-dokumentation
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
