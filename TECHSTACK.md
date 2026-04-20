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

> **Svenska är default** (sajten riktar sig primärt mot svensk marknad). Engelska är sekundärt språk, används även för admin-panelen.

### Arkitektur

- **`next-intl`** hanterar all text-översättning, datum/valuta-formatering och plural-regler
- **Path-based routing** (`localePrefix: 'as-needed'`): svenska på `/*`, engelska på `/en/*`
  - Admin-rutter (`/admin/*`) är **locale-neutrala** och alltid engelska — forceras via `x-pathname`-header i `src/proxy.ts` → `src/i18n/request.ts`
  - Alla publika sidor ligger under `src/app/[locale]/...`
- **`localeDetection: false`** — URL:en är sanningskällan; cookie-baserad auto-redirect är avstängd för att undvika språkväxlar-loopar
- **`NextIntlClientProvider` i `[locale]/layout.tsx`** (inte root) så provider-kontexten re-renderas korrekt vid locale-byte
- **Middleware komponerad**: `next-intl` först (redirect/rewrite) → Supabase session-refresh på samma response → admin-role-guard
- **Lokalt-medveten navigation** via `@/i18n/navigation` (`Link`, `redirect`, `useRouter`, `usePathname`, `getPathname`) — `next/link` används endast för admin-routes och aliaseras som `NextLink`
- **Server Components-first** — `next-intl` stödjer Server Components utan extra klient-JS

### Principer

- **Alla user-facing strings via `messages/{locale}.json`** — aldrig hårdkodade i JSX, inkl. `aria-label`/`placeholder`/`title`
- `en.json` och `sv.json` **måste ha identiska nyckel-set** — synkas vid varje ny sträng
- **Error-strängar är i18n-nycklar** (`errors.invalidCredentials`) — aldrig råa engelska meddelanden från DB/Stripe

### i18n + SEO

- `hreflang`-alternates genereras automatiskt i `buildMetadata` (`src/lib/metadata.ts`) baserat på `routing.locales` + `path`
- `sitemap.ts` emitterar locale-alternates för varje public route (`localizedUrl`-helper)
- Metadata (`title`, `description`) hämtas från `getTranslations('metadata')`
- `<html lang>` sätts dynamiskt via `getLocale()` i `src/app/layout.tsx`

### Stripe + email-integration

- Stripe Checkout får `locale` (UI-språk), översatta produktnamn, locale-aware `success_url`/`cancel_url`
- `session.metadata.locale` sparas så webhook kan välja email-mall senare
- **TODO**: Email-templates på svenska (se ROADMAP)

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

Tvådelad pipeline: ett snabbt **preview**-spår för webb/e-mail och ett
tyngre **print**-spår för tryckeri. All bildbearbetning sker server-side
via `sharp` (se `src/lib/image-processing.ts`).

**1. Upload & normalisering**

- Kund laddar upp foto → Server Action validerar storlek + MIME-typ
- `normalizeInput()` körs före AI: EXIF-rotate, konvertera till sRGB,
  cappa längsta sidan till 4096 px, strippa metadata utom sRGB-ICC,
  encoda som q=92 mozjpeg chroma 4:4:4
- Normaliserad buffer laddas upp direkt till Supabase Storage som
  `images/{user.id|guest}/originals/{orderId}.jpg`

**2. AI-generering**

- Kie.ai (`nano-banana-edit`) anropas med publik URL till normaliserad bild
- Output (~1184×864 landscape/portrait, ~1024² square) sparas som
  `images/{prefix}/generated/{orderId}.jpg` — utgör `preview.jpg`-spåret
- `orders.upscale_status` sätts till `pending` för att markera att
  print-filen återstår

**3. Upscale + AdobeRGB-konvertering (print-spår)**

- Trigger styrs av `app_settings.upscale_trigger`:
  `post_checkout` (default, efter Stripe `payment_intent.succeeded`) eller
  `post_generation` (direkt efter AI). Båda vägarna använder
  `next/server` `after()` så inga hot paths blockeras.
- Kie.ai Topaz (`topaz/image-upscale`, 4x) körs med samma task/polling-
  mönster som AI-generering
- Resultatet går genom `convertToAdobeRgb()`: embedd full AdobeRGB1998
  ICC-profil från `src/lib/icc/AdobeRGB1998.icc`, q=92 chroma 4:4:4,
  mozjpeg, alla andra metadata strippas
- Sparas som `images/{prefix}/print/{orderId}.jpg` i
  `orders.print_image_path`. `print_dpi` beräknas mot valt print-format
  och visas i admin orderdetalj.

**Tryckeri-spec** (fastställd 2026-04-17):

| Parameter | Värde |
|-----------|-------|
| Format | JPEG, 8-bit RGB |
| Färgrymd | AdobeRGB (1998) — ICC inbäddad i varje fil |
| Kompression | q=92, chroma 4:4:4 |
| Extra kanaler | Inga |
| DPI-mål | 300 (30×40), 200 (50×70), 150 (70×100) |

**Observability**

- `upscale_task_id`, `upscale_cost_time_ms`, `upscale_status` på varje
  order — ger både kostnadsspårning och per-order felsökning
- `app_settings.upscale_trigger` gör det möjligt att byta trigger-läge
  utan deploy
- Admin `/admin` dashboard visar "Pipeline health (last 7 days)"
  (success rate, avg DPI, avg tid, in-flight)
- Admin `/admin/settings` visar 30-dagars aggregat + trigger-toggle
- Admin order-detalj har `UpscaleActionButton` för manuell
  run/retry/check mot failade jobb
- Sentry-taggar på alla upscale-fel: `action`, `stage`, `orderId`,
  `taskId`, `factor`

**Utveckling**

- `scripts/test-image-pipeline.ts` — unit-liknande asserts mot
  `normalizeInput` + `convertToAdobeRgb` + DPI-matte
- `scripts/test-pipeline.ts` — integrationstest mot ett korpus i
  `test-images/worst-case/` (synthetic fixtures genereras vid första
  körning, real-world bilder kan droppas i mappen enligt README).
  Verifierar ICC-embedd, chroma-subsampling, DPI-golv per format.

---

## Deployment & Infrastruktur

| Teknologi | Syfte | URL/Info |
|-----------|-------|----------|
| **Vercel** | Hosting för Next.js — edge network, preview deploys, analytics | https://aquacanvas.vercel.app |
| **Supabase Cloud** | Managed databas, auth, storage, edge functions | EU West (xinnmqappqywcgzexapg) |
| **GitHub** | Versionskontroll, auto-deploy vid push till main | github.com/Wamaya-se/aquacanvas |

### Deployment-workflow

Hela stacken deployas via **git push till `main`**. Vercel har auto-deploy kopplat till repot.

```bash
# 1. Committa ändringar
git add -A
git commit -m "Beskrivning av ändringen"

# 2. Pusha till GitHub → Vercel bygger automatiskt
git push origin main
```

**Vad som händer vid push:**

| Tjänst | Trigger | Åtgärd |
|--------|---------|--------|
| **GitHub** | `git push` | Repot uppdateras |
| **Vercel** | Push till `main` | Ny production build + deploy (~1–3 min). Preview deploys skapas för PR:ar mot `main` |
| **Supabase** | Manuellt | Databasen deployas **inte** automatiskt — se nedan |

**När Supabase behöver uppdateras (databasändringar):**

```bash
# Pusha nya migrationer till Supabase Cloud
npx supabase db push --linked

# Generera uppdaterade TypeScript-typer efter schema-ändringar
npx supabase gen types typescript --linked > src/types/supabase.ts
```

**Miljövariabler (Vercel Dashboard):**

Om en ny env-variabel tillkommer måste den läggas till manuellt i Vercel Dashboard → Settings → Environment Variables. Befintliga:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `KIE_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL` (= `https://aquacanvas.vercel.app`)

**Checklista vid deploy:**

1. `git push origin main` — frontend + statiska assets
2. Om SQL-migrationer ändrats: `npx supabase db push --linked`
3. Om env-variabler ändrats: uppdatera i Vercel Dashboard
4. Verifiera: öppna https://aquacanvas.vercel.app och kontrollera

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
