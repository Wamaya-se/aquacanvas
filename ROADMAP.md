# Aquacanvas — Roadmap

> Updated: 2026-04-22 (Fas 15 prod-deploy verifierad + Fas 13 batchplan definierad — migration `00021_hero_mockup.sql` bekräftad live i cloud via `supabase db push --dry-run`, alla 3 hero-mockup masters i Storage svarar 200, Vercel deploy rent, `npm run i18n:audit` grönt; DPI-indikator i Fas 13 bockad av (redan levererad via Fas 14 Batch F); Fas 13 scope-uppdelad i 5 batchar A–E: email capture → abandoned cart → delning → newsletter → analytics-baseline). | Format: compact, token-efficient. Update after each session.

## 🎯 Aktiv prioritet

**Nästa upp:** **Fas 13** — email capture, abandoned cart, newsletter, delning (Fas 15 komplett + prod-deploy verifierad 2026-04-22).
**Parallellt möjligt:** Fas 13 email capture, abandoned cart, newsletter, delning.
**Detaljerade fynd:** se `AUDIT.md` (filreferenser, radnummer, åtgärdsförslag per item).
**Arbetsregel:** en batch = en fokuserad session = en commit. Markera `[x]` direkt när items är klara, uppdatera `## Status`-raden i batchen.

## Completed

- [x] Project setup (Next.js 16.2.2, Tailwind 4, Shadcn/UI, TypeScript 5)
- [x] Design system + tokens (globals.css — dark/light, surfaces, gradients, fonts)
- [x] Font setup (DM Sans heading, Manrope body — `font-heading` / `font-sans`)
- [x] Shadcn/UI installed + customized (Button, Card, Input, Label, Textarea, Badge, Separator, Avatar, Skeleton, Switch, AlertDialog, Progress, Table, Select, DropdownMenu, Dialog, Tabs, Sheet)
- [x] next-themes (ThemeProvider, ThemeToggle — dark default, system support)
- [x] i18n: next-intl setup, messages/en.json, NextIntlClientProvider
- [x] Grundläggande projektstruktur (route groups: marketing, auth, shop, dashboard, admin — layouts + error boundaries)
- [x] Skills: all 7 skills skapade och refererade i .cursorrules
- [x] Env-validering: src/lib/env.ts (getters för Supabase, Stripe, Replicate, Resend) + `env` object
- [x] SEO: robots.ts, sitemap.ts (dynamic with products), generateMetadata med i18n
- [x] a11y: skip-to-content, reduced-motion, focus-visible, semantic HTML
- [x] Utilities: lib/utils.ts (cn), types/actions.ts (ActionResult<T>), hooks/use-action-error.ts
- [x] Supabase: @supabase/supabase-js + @supabase/ssr installerade, `supabase init` (config.toml)
- [x] Supabase-klienter: server.ts, client.ts, middleware.ts, admin.ts i src/lib/supabase/
- [x] DB-schema: initial migration (profiles, styles, orders, generated_images) med RLS, triggers, enums
- [x] Storage bucket: `images` med RLS-policies
- [x] TypeScript-typer: src/types/supabase.ts (Database, manuella typer)
- [x] Proxy: src/proxy.ts (sessionsrefresh, admin-guard — kundroutes borttagna; omdöpt från middleware.ts 2026-04-20)
- [x] Auth flow: login/register Server Actions (Zod-validering, ActionResult), logout
- [x] Auth-sidor: /login, /register (pages + LoginForm/RegisterForm klientkomponenter) — dolda för kunder
- [x] Auth callback: /auth/callback route handler (code exchange)
- [x] Zod-validators: src/validators/auth.ts, order.ts, product.ts, style.ts
- [x] Seed data: 5 konststilar (watercolor aktiv, övriga inaktiva)
- [x] **Fas 2: Landing Page & Produktsida**
  - [x] Header: sticky glassmorphism nav (logo, nav links, theme toggle, mobile hamburger) — auth-knappar borttagna
  - [x] Footer: brand, copyright, policy links
  - [x] Landing page — Hero, How It Works, Style Showcase, Final CTA
  - [x] Create page (/create): ImageUpload, StylePicker, ArtPreview, CreateFlow
- [x] **Fas 3: AI-integration & Bildgenerering**
  - [x] Kie.ai API, Server Actions, polling, storage, rate limiting
  - [x] GenerationProgress, GenerationResult, updated CreateFlow
- [x] **Fas 4: Checkout & Betalning**
  - [x] Stripe SDK, per-style pricing, checkout session, webhook, success/cancel pages
  - [x] Guest orders (migration 00002)
- [x] **Fas 5: Admin Panel Pivot** (NYTT — inga kundkonton, gäst-only)
  - [x] Kundkonto-UI dolt: login/register borttaget från header, middleware uppdaterat
  - [x] Products-tabell (migration 00004): niche landningssidor med SEO-content
  - [x] Orders utökad: product_id, customer_email (captured via Stripe webhook)
  - [x] Admin layout: sidebar-nav med Dashboard, Orders, Products, Styles, Settings
  - [x] Admin dashboard: statistik (intäkter, ordrar idag, pending, senaste ordrar)
  - [x] Admin produkthantering: CRUD (lista, skapa, redigera, ta bort)
  - [x] Admin orderhantering: lista med statusfilter, detalj med bilder + statusändring
  - [x] Admin stilhantering: lista, redigera (pris, prompt, aktiv)
  - [x] Admin inställningar: service-status, env-variabler, admin-email
  - [x] Publika produktsidor: /p/[slug] med SEO, JSON-LD, before/after slider, CTA
  - [x] Email: Resend + React Email (orderbekräftelse till kund, admin-notis vid ny order)
  - [x] Sitemap: dynamisk med produktsidor

## Completed — Fas 6: Polish & Utökning

- [x] Buggfix: next-themes script tag warning → migrerat till @wrksz/themes (drop-in replacement)
- [x] Admin: Användarhantering (lista, skapa, redigera, ta bort, lösenordsåterställning)
  - Migration 00005: handle_new_user() kopierar roll från app_metadata
  - Server Actions: createUser, updateUser, deleteUser, resetUserPassword
  - Sidor: /admin/users, /admin/users/new, /admin/users/[id]
  - Sidebar: Users-länk tillagd
- [x] Admin: bilduppladdning direkt i produktformulär (Storage integration)
  - ImageUploadField komponent: drag & drop, förhandsgranskning, ta bort
  - Server Actions: upload till Supabase Storage (`products/{id}/field.ext`), upsert, cleanup
  - Validator: bild-fält borttagna från Zod (hanteras separat via File i FormData)
  - Stödjer: JPEG, PNG, WebP ≤ 5 MB per bild
- [x] Produktsidor: inbäddat create-flöde (ersätter CTA → /create redirect)
  - CreateFlow med `lockedStyleId` prop — döljer StylePicker, förvälja stil
  - Produktsida /p/[slug] renderar CreateFlow direkt med låst stil
  - BeforeAfterSlider fixad: `unoptimized` prop för externa bild-URL:er
- [x] Responsiv polish av admin-panelen (mobil-vänlig)
  - Sidebar → Sheet drawer på mobil (<md), fast sidebar på desktop
  - AdminMobileHeader: hamburger-meny + brand-namn
  - Layout: responsiv padding (px-4 py-4 md:px-8 md:py-8)
  - Tabeller: overflow-x-auto på alla listsidor (orders, products, users, styles, dashboard)
- [x] Admin: CSV-export av ordrar
  - Server Action `exportOrdersCsv` med statusfilter, returnerar CSV-sträng
  - ExportCsvButton klientkomponent med Blob-download
- [x] E-post: shipped-statusuppdatering till kund
  - OrderShippedEmail React Email-template
  - `sendOrderShippedEmail` i send.ts, triggas i `updateOrderStatus` vid shipped
- [x] Admin: AI-kostnadslogg (per order: modell, kostnad, duration)
  - Migration 00006: `ai_model`, `ai_cost_time_ms`, `ai_task_id` på orders
  - Loggas i `generateArtwork` (task ID + model) och `checkGenerationStatus` (costTime)
  - Visas i orderdetalj under "AI Generation"-sektion
- [x] Produktsidor: FAQ-sektion
  - Migration 00007: `faq` JSONB-kolumn på products
  - Admin: dynamisk FAQ-editor i ProductForm (add/remove Q&A-par)
  - Frontend: `<details>`/`<summary>` FAQ-sektion med FAQPage JSON-LD
- [x] Rabattkoder: discount_codes-tabell + Stripe Coupons/Promo Codes
  - Migration 00008: `discount_codes`-tabell + `orders.discount_code_id`
  - Admin: /admin/discounts (lista), /admin/discounts/new (skapa)
  - Stripe: Coupon + Promotion Code skapas vid admin-create, synkas vid toggle/delete
  - Checkout: discount code-input i GenerationResult, validering + applicering i `createCheckoutSession`
  - Webhook: incrementerar `current_uses` efter betalning

## Next Sprint — Fas 7: Publik frontend & SEO

- [x] Om oss-sida (/about): mission, process, värderingar, CTA
- [x] Kontakt-sida (/contact): formulär (Resend), kontaktinfo
- [x] FAQ-sida (/faq): 10 frågor i 4 kategorier, accordion
- [x] SEO: JSON-LD Organization (landing page), BreadcrumbList (about, faq, contact, produktsidor), FAQPage (/faq)
- [x] Sitemap: /about, /faq, /contact tillagda
- [x] Nav: About + FAQ i header, About + FAQ + Contact i footer
- [x] Landing page förbättringar:
  - Social proof-bar (2500+ artworks, 1200+ kunder, 5 stilar)
  - Testimonials-sektion (3 omdömen med stjärnor, avatarer, citat)
  - FAQ-sektion (4 vanliga frågor, accordion, länk till /faq)
- [x] Galleri (/gallery): featured before/after slider + 2-kolumns rutnät med 6 exempel
  - Nav: Gallery i header + footer, sitemap uppdaterad
  - SEO: generateMetadata, BreadcrumbList JSON-LD
- [x] Buggfix: home page title duplication (absolute title i generateMetadata)
- [x] Hero before/after: ny hero-before.jpg (16:9 crop), hero-after.png (tavlan centrerad i 16:9)
- [ ] Blog/innehållssidor (MDX)

## Completed — Fas 7b: Miljöpreview (Environment Previews)

- [x] Databasschema: environment_scenes + environment_previews tabeller (migration 00012)
  - RLS-policies för publik läsning, gäst-åtkomst, admin full
  - Storage-policies för environment-scenes/ och environment-previews/ mappar
  - Seed: 3 initiala rum-scener
- [x] AI-modul: createEnvironmentPreviewTask (flux-2/flex-image-to-image via Kie.ai)
  - Tar motivbild + rumsbild, skapar kompositbild
  - Återanvänder befintlig getTaskStatus för polling
- [x] Server Actions: generateEnvironmentPreviews + checkEnvironmentPreviewsStatus
  - Parallell generering av alla aktiva scener
  - Per-preview statusspårning (pending/processing/success/fail)
  - Ägandevalidering (user/guest)
- [x] Kundflöde: valfri "Se din tavla i ett rum"-knapp efter bildgenerering
  - EnvironmentPreviewGallery-komponent med progress/skeleton/resultat
  - Integrerat i GenerationResult mellan preview och format-val
- [x] Admin: Scenes CRUD (/admin/scenes) — lista, skapa, redigera, ta bort
  - Bilduppladdning till Supabase Storage
  - SceneForm-komponent med ImageUploadField
  - Sidebar: Scenes-länk tillagd
- [x] Admin: orderdetalj visar rum-previews (läs-galleri)
- [x] i18n: alla nya strängar i messages/en.json (shop, errors, admin)
- [x] Validators: Zod-scheman för environment preview actions
- [x] TypeScript-typer: environment_scenes + environment_previews + preview_status enum

## Fas 8: Fler stilar & produkter

- [x] Alla 5 AI-stilar aktiverade med tunade prompts (watercolor, oil painting, charcoal sketch, anime, impressionism)
- [x] print_formats-tabell med 3 canvasstorlekar (30×40, 50×70, 70×100 cm)
- [x] Per-stil prissättning (watercolor 349, charcoal 299, anime 349, oil/impressionism 399 SEK)
- [x] Canvasformat-val i checkout-flödet (FormatPicker-komponent)
- [x] Totalpris = stil + format (AI-generering + canvas print)
- [x] Stripe Checkout uppdaterat med formatinfo i metadata + produktbeskrivning
- [x] E-postmallar (orderbekräftelse, admin-notis) visar valt format
- [x] Admin: formathantering (CRUD) — /admin/formats
- [x] Admin: orderdetalj visar valt printformat
- [x] Admin sidebar: Formats-länk tillagd
- [x] Orientering & utökade format (Fas 8b):
  - Migration 00013: orientation-kolumn på print_formats + orders
  - Liggande format: 40×30, 70×50, 100×70 cm (speglade mått, samma pris)
  - Kvadratformat: 30×30, 50×50, 70×70 cm (129/199/329 SEK)
  - Smart-detect: auto-detekterar fotots orientering, föreslår matchande canvas
  - OrientationPicker-komponent med visuella proportionella knappar
  - Mismatch-varning om foto och vald canvas-orientering inte matchar
  - AI-generering anpassad: portrait→3:4, landscape→4:3, square→1:1 aspect ratio
  - FormatPicker filtrerat: visar bara storlekar som matchar vald orientering
  - Admin: format-formulär + lista visar orientation-fält
- [ ] Fler produktformat: inramad poster, vykort (framtida)
- [ ] Stilförhandsvisning: live-preview med thumbnail (→ se Fas 11: fler-stils-förhandsvisning)

## Completed — Deployment

- [x] GitHub repo: Wamaya-se/aquacanvas (public)
- [x] Supabase cloud project (EU West): migreringar + seed data pushade
- [x] Vercel deploy: https://aquacanvas.vercel.app (auto-deploy från main)
- [x] Environment variables: Supabase, Kie.ai, site URL konfigurerade i Vercel
- [x] Build-fix: Stripe SDK v22 API-ändring, Supabase RPC-typer, Suspense boundary
- [ ] Supabase Auth URL Configuration: site_url + redirect URL (manuellt i dashboard)
- [ ] Stripe-nycklar i Vercel (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] Resend API-nyckel i Vercel (RESEND_API_KEY)
- [ ] Egen domän (valfritt)

> **Deploy-instruktioner:** Se `TECHSTACK.md` → "Deployment-workflow" för steg-för-steg.

## Fas 9: Auth & GDPR (framtida, om kundkonton aktiveras)

- [ ] Kundregistrering (reaktivera)
- [ ] Lösenordsåterställning
- [ ] Google OAuth
- [ ] Cookie-consent banner
- [ ] Integritetspolicy + Användarvillkor
- [ ] Radera konto / dataexport

## Completed — Fas 10a: Bildförhandsgranskning & Testläge

- [x] Lightbox-galleri: yet-another-react-lightbox (YARL) med Zoom, Fullscreen, Thumbnails, Counter
  - ImageLightbox wrapper-komponent (src/components/shop/image-lightbox.tsx)
  - Klickbara bilder med hover-overlay och expand-ikon
  - Alla bilder (original, AI-genererad, miljöpreviews) i en sammanhållen lightbox
  - Keyboard-nav, touch/swipe, a11y
- [x] Admin testläge: cookie-baserat ("aquacanvas-test-mode")
  - Server Action toggleTestMode med admin-guard
  - TestModeToggle på Admin Settings-sidan
  - Create-sidan visar färdigt resultat med testbilder från /public/images
  - EnvironmentPreviewGallery visar 3 testmiljöbilder utan API-anrop
  - Checkout/format-val dolt i testläge
- [x] EnvironmentPreviewGallery: onPreviewsLoaded callback + klickbara bilder i lightbox
- [x] i18n: nya nycklar (zoomImage, imageCounter, testMode*)

## Fas 10: Polish & Produktion

- [x] Initial production deploy (Vercel + Supabase Cloud)
- [x] Miljöpreview-prompt förbättrad: restriktiv compositing-prompt som skyddar ram, kräver 100% täckning, och fryser alla rum-pixlar
- [ ] Responsiv polish-pass
- [ ] Performance-pass (lazy loading, image optimization, cache)
- [ ] Monitoring: Sentry, uptime
- [ ] Rate limiting (login, register, bildgenerering)

## Fas 11: Create-upplevelse & Produktvisualisering

Mål: Gör det tydligt för kunden exakt hur deras canvastavla kommer se ut. Öka konvertering genom bättre visualisering.

### Hög prioritet

- [x] Auto-trigger miljöpreviews: Starta generering automatiskt efter AI-resultat (ta bort opt-in-knappen). Visa skeleton-laddare direkt under resultatet.
- [x] Canvas-ram-mockup på resultatbild: CSS-baserad ram + skuggning på den genererade bilden så den ser ut som en fysisk canvastavla, inte en platt bild.
- [x] Storleksvisualisering vid formatval: Proportionell SVG-illustration av canvasen ovanför en soffa-silhuett vid valt format, så kunden förstår fysisk storlek.

### Medel prioritet

- [ ] Before/After-slider på resultat: Ersätt sida-vid-sida med interaktiv slider (återanvänd befintlig BeforeAfterSlider). Behåll lightbox.
- [ ] Upplösnings-/kvalitetsindikator: Beräkna DPI utifrån fotots upplösning vs valt canvasformat. Grön/gul/röd indikator med rekommendation.
- [ ] Orienterings-matchade miljöscener: Tagga scener med orientering i DB, filtrera vilka scener som visas baserat på kundens valda orientering. 2–3 scener per orientering.

### Lägre prioritet

- [ ] Fler-stils-förhandsvisning: Visa lågupplösta thumbnails av fotot i varje stil innan full generering, så kunden kan jämföra utan att vänta.
- [ ] Förbättrad progress med steg-indikation: Stepper-komponent med simulerade steg ("Analyserar ditt foto..." → "Applicerar stil..." → "Finputsar..." → "Klar!").

## Fas 12: Säkerhets- & kvalitetsaudit (2026-04-16)

> Resultat av djupanalys (se `AUDIT.md` för detaljer per item).
> 4 batchar = 4 fokuserade sessioner. Varje batch är en commit.

### Batch 1 — Kritiska säkerhetsfixar 🔴

> **Status:** ✅ Klar (2026-04-16) · **Mål:** Inga kvarvarande critical-säkerhetshål i prod.

- [x] Open redirect i login (`src/lib/actions/auth.ts`) — `isSafePath()` helper i `src/lib/safe-redirect.ts`
- [x] Open redirect i OAuth callback (`src/app/(auth)/callback/route.ts`) — samma helper
- [x] Rate-limit-bypass + test mode cookies kräver admin-verifiering (`src/lib/actions/admin-settings.ts`) — `isAdmin()` check vid varje read
- [x] Stripe webhook-idempotens — migration `00014_stripe_event_idempotency.sql` + insert/check i `src/app/api/webhooks/stripe/route.ts`
- [x] `createProduct` rullar tillbaka produkten vid uppladdningsfel (`src/lib/actions/admin-products.ts`)
- [x] `updateProduct` mappar exception till säker i18n-nyckel
- [x] Provider `failMsg` borttagen från publik typ — loggas bara server-side
- [x] `guestSessionId` Zod-validerad (`guestSessionIdSchema`) i `ai.ts`, `checkout.ts`, `environment-preview.ts`
- [x] Bonus: Supabase-typer regenererade från cloud (auktoritativ) + 2 typ-exporter exporterade (`FormatData`, `ProductData`) för konsumenter

### Batch 2 — Juridik & GDPR 🟠

> **Status:** ✅ Klar (2026-04-16) · **Mål:** Sajten är GDPR-redo + alla länkar fungerar.

- [x] Skapa `/privacy` (integritetspolicy) — sida + i18n + sitemap + WebPage/Breadcrumb JSON-LD
- [x] Skapa `/terms` (användarvillkor) — svensk distansavtalslag (14 dagars ångerrätt, undantag för kundanpassade varor), immaterialrätt, reklamation
- [x] Skapa `/cookies` (cookie-policy) — lista över alla cookies + motivering till varför ingen banner krävs
- [x] Ta bort `/forgot-password`-länk i `src/components/auth/login-form.tsx` (reaktiveras i Fas 9); rensat `auth.forgotPassword`-nyckel från `messages/en.json`
- [x] Cookie-banner-beslut dokumenterat i `AUDIT.md` + `/cookies` (inga analytics/marketing — omvärderas när analytics tillkommer i Batch 4)
- [x] Dataradering-flöde (minimum): dokumenterat i `/privacy` — email `support@aquacanvas.com` med order-ID + e-post → manuell radering inom 30 dagar (GDPR Art. 12(3)). Full Server Action + admin-vy flaggad till Fas 13 om volym kräver.
- [x] Footer-länkar verifierade + `/cookies` tillagd i `src/components/shared/footer.tsx`

### Batch 3 — i18n & a11y-städning ✅

> **Status:** ✅ Klar · **Mål:** Inga hårdkodade strängar, semantiskt korrekt landmark-struktur.

- [x] Auth-rubriker via i18n (`src/app/(auth)/login/page.tsx`, `register/page.tsx`)
- [x] Hero/gallery/product `alt`-texter via i18n (ny `alt`-namespace i `messages/en.json`)
- [x] `aria-label` på `<nav>`-element (`header.tsx`, `mobile-nav.tsx`)
- [x] Theme toggle `aria-label` via `common.themeToggle`
- [x] Loading-knapptext `"..."` → `common.loading` (login/register)
- [x] JSON-LD breadcrumb-labels översatta + `getSiteUrl()` i alla marketing-sidor
- [x] Organization JSON-LD läser från env (`getSiteUrl()` + `getContactEmail()`)
- [x] Fixade nästlad `<main>` i marketing/shop/auth error-boundaries (använder `<div>` nu)
- [x] Konsekvent `aria-invalid` + `aria-describedby` på auth + admin-formulär (format, scene, product, discount, user, style + image-upload)
- [x] Strukturerad `fieldErrors`-pipeline: `ActionResult.fieldErrors` + `zodIssuesToFieldErrors`-helper → alla Server Actions returnerar per-fält i18n-nycklar
- [x] FAQ-fält: ersatt `as string`-cast med typsäker `formData.get` + Zod-parse
- [x] Hårdkodad `text-white` → ny `--on-scrim`-token (`generation-result.tsx`, `environment-preview-gallery.tsx`)

### Batch 4 — SEO + observability ✅

> **Status:** ✅ Klar · **Mål:** Sajten är produktionsmogen för trafik & felövervakning.

- [x] Sentry-integration (server + client + edge) — villkorlig via `SENTRY_DSN`, `instrumentation.ts` + `onRequestError`, `captureServerError`-helper, integrerad i Stripe-webhook, AI-actions och root `error.tsx` med `orderId`/`taskId`-tags
- [x] Distributed rate limiting — Upstash Redis via `@upstash/ratelimit` med in-memory-fallback, `RATE_LIMITS`-buckets (`aiAuth`, `aiGuest`, `login`, `register`, `contact`)
- [x] Rate limiting på `login` (email+IP), `register` (IP) och `sendContactMessage` (IP) + `errors.rateLimitedRequests`-nyckel
- [x] `metadataBase` i root layout (via `getSiteUrl()`)
- [x] `buildMetadata`-helper + `alternates.canonical` på alla publika sidor (marketing + auth + checkout + product + create)
- [x] Twitter `summary_large_image`-card på alla publika sidor (via `buildMetadata`)
- [x] OG-image för auth, checkout och root (`opengraph-image.tsx` via `next/og` per route group)
- [x] `loading.tsx` per route group (marketing, shop, admin, dashboard) med Skeleton
- [x] `usePollingTask`-hook utbruten — DRY mellan `create-flow.tsx` och `environment-preview-gallery.tsx`, inkl. `useLatest`-pattern
- [x] `getSiteUrl()` i `sitemap.ts` + `robots.ts`
- [x] Type-safe Supabase-relationer via `db-helpers.ts` (`parseOrientation`, `parseFaq`, `parseFormatRow`, `parseProductRow`, `getSceneName`, `unwrapSingleRelation`) — ersätter samtliga `as unknown as`-cast

---

## Fas 14: Print-ready bildpipeline

> **Mål:** Säkerställa att varje beställning resulterar i en tryckfärdig fil som matchar tryckeriets tekniska krav, oavsett kvalitet på kundens uppladdade foto.
> **Bakgrund:** Produktionen bekräftade specs 2026-04-17. Användaruppladdade bilder kräver hårdare automation — tryckeriet gör ingen case-by-case-bedömning utan skickar filerna som de är till produktion.
> **Verifierat 2026-04-18 via `scripts/probe-ai-output.ts`:** `nano-banana-edit` producerar deterministiskt 1184×864 px (landscape/portrait) och ~1024×1024 (square). Efter 4x Topaz-upscale = 4736/4096 px längsta sida. Räcker för 30×40/40×30/30×30 vid tryckeri-DPI, men **inte** för 50×70+ eller 70×70. Stora format inaktiverade via `00018_disable_large_formats.sql` tills vi eventuellt byter till `nano-banana-pro` (2K native) eller förhandlar ner DPI-krav.

### Tryckeri-spec (bekräftad)

| Parameter | Värde |
|---|---|
| Filformat | JPEG |
| Färgrymd | **AdobeRGB (1998)** — inbäddad ICC i varje fil |
| Färgläge | RGB, 8-bit |
| Extra kanaler | Inga |
| Bleed | Ingen (1 mm kan skäras bort) |
| Kompression | "Klokt" → q=92, chroma 4:4:4 |
| Dimension | Ratio avgör — exakt cm-storlek krävs inte |
| DPI-mål | 300 för små (30×40), 200 för mellan (50×70), 150 för stora (70×100) |

### Beslutade designval

1. **Upscaling via Kie.ai Topaz** (`topaz/image-upscale`, 4x), återanvänder befintligt task/polling-mönster.
2. **Upscaling triggas post-checkout** (default, efter `payment_intent.succeeded` i Stripe-webhook) för att undvika kostnad på abandoned carts.
3. **Admin-toggle för trigger-läge** — `post_checkout` (default) eller `post_generation`, lagras i ny `app_settings`-tabell så det kan växlas utan redeploy.
4. **Två filer per order** i Storage:
   - `preview.jpg` — sRGB, q=85, för webbvisning (finns redan som `generated_image_path`)
   - `print.jpg` — AdobeRGB, q=92 chroma 4:4:4, för tryckeri (nytt — `print_image_path`)
5. **Alltid 4x upscale** initialt för enkel kostnads-/kvalitetsmodell. Smart upscale-factor baserat på format kan komma i senare optimering.
6. **sRGB working space** internt mellan AI och upscale — konvertering till AdobeRGB sker bara i sista steget (print-fil).
7. **EXIF-normalisering före AI** — `sharp().rotate()` fixar orientering, strippa all metadata utom ICC.

### Batch A — Foundation: sharp + ICC + DB-schema 🏗️

> **Status:** ✅ Klar (2026-04-18) · **Commit:** pending

- [x] `npm install sharp` + `server-only` (transitivt via guardade moduler)
- [x] `AdobeRGB1998.icc` (560 bytes) kopierad från macOS ColorSync till `src/lib/icc/`
- [x] `next.config.ts` — `outputFileTracingIncludes` säkerställer ICC-profilen bundlas med Vercel serverless-funktioner
- [x] Migration `00019_print_pipeline.sql`:
  - `orders.print_image_path`, `orders.print_dpi`, `orders.upscale_task_id`, `orders.upscale_cost_time_ms`, `orders.upscale_status`
  - Ny tabell `app_settings (key text pk, value jsonb, updated_at)` med RLS (public read, admin-only write)
  - Seed: `('upscale_trigger', '"post_checkout"')`
- [x] `src/types/supabase.ts` uppdaterad manuellt (gen types --linked saknar privileges): orders-kolumner, app_settings-tabell, upscale_status-enum, `UpscaleStatus`-export
- [x] `src/lib/image-processing.ts`:
  - `normalizeInput(buffer, { maxLongestSide, quality })` — EXIF-rotate, sRGB, cap, q=92 mozjpeg 4:4:4, inbäddad sRGB ICC
  - `convertToAdobeRgb(buffer)` — embed AdobeRGB ICC via filväg, q=92, chroma 4:4:4, mozjpeg, strippa övrig metadata
  - `probeDimensions(buffer)` — lättviktig dim-kontroll utan full bearbetning
  - `computePrintDpi(w, h, formatLongestCm)` — floor-rundat, konservativt
  - `requiredLongestPx(formatLongestCm, targetDpi)` — ceil-rundat för gate-logik
- [x] `scripts/test-image-pipeline.ts` — 16 asserts gröna: normalisering, cap-enforcement, AdobeRGB-ICC i output (`Adobe RGB (1998)` i description), chroma 4:4:4, DPI-matte
- [x] `scripts/probe-ai-output.ts` — mätverktyg mot befintliga nano-banana-edit-ordrar (användes till scope-beslutet)

**Exit-kriterium uppfyllt:** Pipeline fungerar lokalt mot testbild, 560-byte AdobeRGB ICC korrekt inbäddad i output, DB-schema live i cloud, inga regressioner i typecheck.

### Batch B — Upscaling-modul via Kie.ai Topaz 🔼

> **Status:** ✅ Klar (2026-04-20) · **Commit:** pending · **Session-scope:** Extend `lib/ai.ts` med Topaz-stöd, bygg Server Action som triggar + pollar upscale, hantera fel/retry. Ej integrerat i flödet än.

- [x] `createUpscaleTask(imageUrl, factor)` i `src/lib/ai.ts` (återanvänd `getHeaders()`, samma createTask-endpoint med `model: 'topaz/image-upscale'`, Zod-typad `UpscaleFactor = '1'|'2'|'4'|'8'`)
- [x] Uppdatera `getTaskStatus` — normaliserar `resultUrls[]` + fallback för `imageUrl` / `image_url` för defensiv kompatibilitet över Kie-modeller
- [x] `src/lib/actions/upscale.ts`:
  - `triggerUpscale(orderId)` — admin-guardad, hämtar `generated_image_path`, skapar publik URL via storage, anropar Kie, sparar `upscale_task_id` + status=processing. Idempotent (returnerar befintlig task vid `processing`/`success`).
  - `checkUpscaleStatus(orderId)` — admin-guardad, kort-kretsar vid `success`, pollar annars Kie, på `success` laddar ner resultat → `convertToAdobeRgb` → `images/{prefix}/print/{orderId}.jpg` i Storage → räknar `print_dpi` mot `print_formats.width_cm/height_cm` (longest) → uppdaterar `print_image_path`, `print_dpi`, `upscale_cost_time_ms`, `upscale_status=success`
- [x] `src/lib/actions/admin-settings.ts` — `getUpscaleTrigger()` (service-role-read, safe-parse-fallback till default) + `setUpscaleTrigger('post_checkout' | 'post_generation')` (admin-guardad upsert med `revalidatePath('/admin/settings')`)
- [x] Zod-validators i `src/validators/admin.ts` — `upscaleTriggerSchema`, `triggerUpscaleSchema`, `checkUpscaleStatusSchema` + `DEFAULT_UPSCALE_TRIGGER` export
- [x] Error-hantering: alla fel går via `captureServerError` med `{ orderId, taskId, stage }`-tags, sätter `upscale_status='fail'` och revaliderar admin-vyer. Provider-`failMsg` loggas bara server-side — klient får `errors.generic`.
- [x] Kostnadslogging: `upscale_cost_time_ms` skrivs från Kie `costTime` både vid fail och success (Batch A-kolumn återanvänd).

**Exit-kriterium:** ✅ Typecheck + ESLint rent. Manuell trigger-path redo för admin-UI i Batch D. E2E-verifiering mot cloud-order kvar till Batch C/D när UI finns.

### Batch C — Pipeline-integration 🔗

> **Status:** ✅ Klar (2026-04-20) · **Commit:** pending · **Session-scope:** Koppla ihop allt — pre-AI normalisering, post-checkout upscale, fallback post-generation om toggle säger det.

- [x] `generateArtwork` i `src/lib/actions/ai.ts`:
  - Innan upload: `normalizeInput(file.arrayBuffer())` — EXIF-rotate, sRGB, cap 4096 px, q=92 chroma 4:4:4, inbäddad sRGB ICC
  - Laddar upp normaliserad `Buffer` direkt till Supabase Storage (ersätter `File`-objektet)
  - `original_image_path` alltid `.jpg` (tar bort gammal MIME-baserad extension)
  - Kie.ai `uploadFileToKie` vidgad till `ArrayBuffer | Buffer | Uint8Array` med narrow-to-`Uint8Array` före `Buffer.from` så TS-overloads inte kollapsar
- [x] `checkGenerationStatus`:
  - Efter lyckad generering: sätter `upscale_status = 'pending'` på ordern oavsett trigger-läge (enklare idempotens än flaggor)
  - Läser `getUpscaleTrigger()` från `app_settings` — om `post_generation`: `after(() => triggerUpscaleInternal(order.id))` (non-blocking, loggar fel via `captureServerError`)
  - Om `post_checkout`: lämnar `upscale_status='pending'` — Stripe-webhooken tar hand om resten
- [x] `triggerUpscale` split: ny `triggerUpscaleInternal(orderId)` utan admin-guard för server-only callers (webhook + ai.ts), befintlig `triggerUpscale` är nu admin-guardad wrapper för manuell retry-UI
- [x] Stripe webhook `src/app/api/webhooks/stripe/route.ts`:
  - Läser nu `upscale_status` + relationer i samma select
  - Efter `status=paid`: om `upscale_status === 'pending'`, `after(() => triggerUpscaleInternal(order.id))` — Stripe får 200 OK innan Kie createTask körs, inga retries p.g.a. latens
  - Alla fel loggas till Sentry med `stripe_webhook_upscale_trigger`-stage
- [ ] Uppdatera `create-flow.tsx` progress-UI (flyttat till Batch D tillsammans med övrig synlighet) — admin får full insyn där, kund behöver inte vänta på upscale för att gå till checkout

**Exit-kriterium:** ✅ Typecheck rent, ESLint (inga nya fel — 4 pre-existing i andra filer), fire-and-forget-semantik via `next/server` `after()`. Manuell E2E mot cloud kvar till Batch D när admin-UI kan trigga retries.

### Batch D — Admin-UI 🎛️

> **Status:** ✅ Klar (2026-04-20) · **Commit:** pending · **Session-scope:** Synliggör pipelinen i admin, låt admin växla trigger-läge, visa DPI/print-fil per order.

- [x] `src/app/(admin)/admin/settings/page.tsx`:
  - Ny sektion "Image Pipeline" med:
    - Select för trigger-läge (post_checkout / post_generation) med hint-text per val
    - Pipeline-metrics: antal success/fail/processing + avg upscale-tid + avg DPI senaste 30 dagarna (via ny `getUpscaleMetrics`)
- [x] `src/components/admin/upscale-trigger-toggle.tsx` — klientkomponent som sparar via `setUpscaleTrigger`, med dirty-state och error-hantering via `useActionError`
- [x] `src/components/admin/upscale-action-button.tsx` — enhetligt run/retry/check-action beroende på `upscale_status` (null/fail → run/retry, pending/processing → check, success → dold)
- [x] Admin orderdetalj (`/admin/orders/[id]`):
  - Ny sektion "Print file": status-badge (success/warning/destructive/secondary), DPI, upscale-tid, task-ID, öppna-knapp för `print.jpg`
  - `UpscaleActionButton` kör `triggerUpscale`/`checkUpscaleStatus` + `router.refresh()`
- [x] i18n-nycklar i `messages/sv.json` + `messages/en.json` (admin-namespace — engelska per konvention)

**Exit-kriterium:** ✅ Admin kan se/växla pipeline-beteende utan kod-ändring, kan manuellt reprocessa trasiga ordrar. Typecheck rent, ESLint utan nya fel (4 pre-existing i theme-toggle/create-flow/env-preview-gallery från tidigare batchar).

### Batch E — Testning & monitoring 🧪

> **Status:** ✅ Klar (2026-04-20) · **Commit:** pending · **Session-scope:** Worst-case-testsvit + observability så vi hittar problem tidigt.

- [x] `test-images/worst-case/` — korpus-struktur + README som dokumenterar slots (12 MP iPhone P3, HEIC, Instagram, PNG-screenshot, Facebook-strip, motion blur, scannat foto). Scriptet lärs scanna mappen, så user/CI kan droppa in riktiga bilder efter behov.
- [x] 4 committade synthetic fixtures (tiny thumbnail 480×640, PNG-screenshot 900×1600, stripped-metadata JPEG 2000×1500, large landscape 5000×3000) genereras av scriptet vid första körning — håller repot runable utan att binärdata explodereras.
- [x] Dev-script `scripts/test-pipeline.ts`: normalize → simulerad 4x lanczos3-upscale → AdobeRGB-konvertering → DPI per format (30×40/30×30 aktiva + 50×70/70×100 för kontext) → ICC/chroma/golv-gates. Utfall sparas i `test-images/output/` (gitignored).
- [x] `scripts/_shim-server-only.ts` — Node require-cache shim så båda pipeline-testscripten kan köras utanför Next.js-kontext (server-only-paketet throwar annars på import). Fixade även regression i Batch A-scriptet.
- [x] Sentry-tags på upscale-fel: `factor` tillagd i `triggerUpscaleInternal` (create_task, order_update) + alla tre stages i `checkUpscaleStatus` (poll, task_fail, download_convert_upload). `DEFAULT_UPSCALE_FACTOR` exporteras nu från `trigger-upscale.ts` för single source of truth.
- [x] Admin-dashboard: Pipeline Health-kort (7-dagars fönster) med success rate, failed count, in-flight, avg tid, avg DPI. Tomt-state: "No upscale activity in the last 7 days." + länk till settings.
- [x] `getUpscaleMetrics` utökad: valfri `days`-param, ny `successRate` (mot terminal states, `null` när tomt), `windowDays` returneras. Settings-sidan kör fortsatt 30 dagar, dashboard 7 dagar.
- [x] TECHSTACK.md "Bildflöde"-sektionen helt omskriven: tvådelad preview/print-pipeline, tryckeri-spec, observability, utveckling.
- [x] Nya i18n-nycklar i admin-namespace: `pipelineHealthWeek`, `pipelineHealthSuccessRate`, `pipelineHealthFailed`, `pipelineHealthInFlight`, `pipelineHealthAvgDpi`, `pipelineHealthAvgTime`, `pipelineHealthEmpty`, `viewSettings`.

**Exit-kriterium:** ✅ Alla 4 synthetic fixtures passerar pipeline-gates (ICC embedded, chroma 4:4:4, DPI ≥ 150 på 30×40), monitoring synliggör health på `/admin` och `/admin/settings`, utvecklare kan droppa riktiga bilder i `test-images/worst-case/` och re-köra. Typecheck rent, ESLint utan nya fel (4 pre-existing kvar sedan Batch C).

### Batch F — DPI pre-checkout gate 🛡️

> **Status:** ✅ Klar (2026-04-21) · **Commit:** pending · **Session-scope:** Hård spärr i FormatPicker om valt format inte kan levereras i tillräcklig DPI.
> **Notering:** Med nuvarande aktiva format (30×40, 40×30, 30×30) landar alla i grön zon för typiska nano-banana-edit-outputs — denna batch är tekniskt redundant just nu men infrastrukturen är redo för när 50×70/70×100 återaktiveras via `nano-banana-pro` eller lösare DPI-krav.

- [x] Migration `00020_generated_dimensions.sql` — `generated_width_px` + `generated_height_px` integer-kolumner på `orders`, fyllda via `sharp.metadata()` i `checkGenerationStatus` (probe-fallback till `null` loggas via `captureServerError`, blockar inte flödet)
- [x] `src/lib/format-eligibility.ts` — pure, client+server-safe: `targetDpiForLongestCm` (300/200/150 per tryckeri-spec), `computeFormatEligibility` (grade grön/gul/röd mot 80 %-tröskel), `hasAnyEligibleFormat`. `DEFAULT_ELIGIBILITY_UPSCALE_FACTOR=4` matchar `DEFAULT_UPSCALE_FACTOR` i trigger-upscale
- [x] `GenerationStatusData` utökad med `generatedWidthPx`/`generatedHeightPx` (även på "already generated"-snabbvägen så sidreload fungerar)
- [x] `FormatPicker` — ny valfri `eligibility`-prop, QualityBadge-komponent (bg-success/warning/destructive-tokens), disabled-state på röda format, native `title`-tooltip via i18n, `aria-disabled` för a11y
- [x] `generation-result.tsx` — memoiserad eligibility, auto-deselect om vald format faller i röd zon efter att dims resolvar, `LowResolutionBlock` empty state (dölj rabattfält + checkout-knappar + simulate-knapp när alla format är röda)
- [x] `create-flow.tsx` + `art-preview.tsx` — flödar `generatedWidthPx`/`generatedHeightPx` från `checkGenerationStatus`-response till `GenerationResult` via props, rensas vid reset/re-run
- [x] `createCheckoutSession` + `simulatePurchase` — `isFormatEligibleForOrder`-guard rejecterar röda format server-side (`errors.formatDpiTooLow`); `fetchFormat` inkluderar nu `width_cm`/`height_cm`. Skippar check gracefully när dims saknas (legacy orders) så inga paying customers låses ute
- [x] i18n-nycklar — `shop.dpiBadge{Recommended,Acceptable,TooLow}`, `shop.dpiTooltip.{green,yellow,red}`, `shop.dpiAllFormatsTooLow{Title,Body}`, `shop.dpiUploadBigger`, `errors.formatDpiTooLow` (sv + en)

**Exit-kriterium:** ✅ Typecheck rent, ESLint utan nya fel (4 pre-existing i theme-toggle/create-flow/env-preview-gallery/reset-password-button sedan tidigare), `scripts/test-image-pipeline.ts` grönt (16 asserts). Migration pushad till cloud. Defense-in-depth garanterar att ingen forged payload kan sniffa igenom en röd format till Stripe.

### Öppna frågor (kan lösas parallellt med batcharna)

- [ ] Utvärdera `nano-banana-pro` (2K native) mot `nano-banana-edit`: kostnad/call + kvalitetsjämförelse för era 5 stilar. Om Pro levererar likvärdig kvalitet till rimlig kostnad → byta modell och återaktivera 50×70/70×100.
- [ ] Följ upp med tryckeriet: absolut minimum-DPI per storlek. Kan 50×70 tryckas @ 170 DPI? 70×100 @ 120 DPI? Det kan låsa upp stora format utan modellbyte.
- [ ] Smart upscale-factor (1/2/4/8 baserat på behov istället för alltid 4x) — följer-upp-optimering efter Batch E
- [ ] HEIC-stöd klient-side (`heic2any`) — separat fas om det blir frekvent kundklagomål

---

## Fas 15: AI-genererad hero-mockup 🖼️

> **Mål:** Ersätt den CSS-baserade canvasramen på huvudresultatet med en riktig, fotorealistisk canvas-på-vägg-mockup genererad via samma Kie-pipeline (`flux-2/flex-image-to-image`) som miljöbilderna. Kunden ser direkt hur deras verk kommer se ut som fysisk tavla — dramatiskt högre upplevd kvalitet än en CSS-ram.
> **Bakgrund:** Tre mockup-masterfiler (`mockup-vertical/horizontal/square.jpeg`, 1000×1000 px, canvas på grå betongvägg med lätt perspektiv för vertical/horizontal) valda av designern. Orienteringen (`orders.orientation`: `portrait`/`landscape`/`square`) styr vilken mockup som används; fallback auto-detect från `generated_width_px`/`generated_height_px` om fält saknas.
> **Beslutade designval:**
>
> 1. **Samma Kie-flöde som env-previews** — `createEnvironmentPreviewTask` återanvänds med en av tre mockup-masters som "scen". Prompten är generell "canvas-i-scen" och fungerar både för rum och rena mockups.
> 2. **Mockup-masters i Supabase Storage** under `hero-mockups/` (konsistens med `environment-scenes/`). Seedas via migration (policy only — filerna laddas upp manuellt via Supabase dashboard eller seed-script eftersom migrations inte kan skicka binärer).
> 3. **Resultat i Storage** under `hero-mockup-previews/${orderId}.png` (samma namngivning som env-previews).
> 4. **Parallell generering** — hero-mockup kickar igång direkt när AI-artworken är klar, parallellt med de 3 env-previews. Totalt 4 Kie-calls per order.
> 5. **Vänlig progress-UI** — delad komponent (`GenerationProgress`) med ett lugnt meddelande + animerad progress bar (tidsbaserat, exponentiell avtagning mot 90 % tills Kie landar). Återanvänds av både `HeroMockup` och `EnvironmentPreviewGallery`.
> 6. **Fail-fallback:** Retry-knapp (samma UX som env-preview-fel). Ingen fallback till CSS-ramen — om AI inte fungerar ska användaren se det och kunna retrya.
> 7. **`tryAgain` bevarar hero-mockup** — om användaren genererar om artworken på samma order raderas inte `hero_mockup_*`-fälten (enligt val). Detta innebär att tryAgain i praktiken skapar en ny order (vilket den redan gör) och den nya ordern genererar en ny mockup from scratch.
> 8. **Download + checkout oförändrade** — nedladdningen pekar fortsatt på `generated_image_path` (raw AI-bild), format-val och Stripe-flöde orörda.
> 9. **Lightbox visar båda** — mockup-scenen som första slide, raw AI-bild som andra slide (enligt val). Original + env-previews följer efter.

### Batch A — DB-schema & mockup-masters i Storage 🏗️

> **Status:** ✅ Klar (2026-04-21) · **Commit:** pending · **Session-scope:** Migration + storage-setup + regen av Supabase-typer. Inget AI eller UI-arbete. Exit när masters är live i cloud och typer kompilerar.

- [x] Migration `00021_hero_mockup.sql`:
  - Kolumner på `orders`: `hero_mockup_image_path text`, `hero_mockup_status public.preview_status not null default 'pending'`, `hero_mockup_task_id text`, `hero_mockup_ai_cost_time_ms integer` — med column comments
  - Storage policy: public read på `hero-mockups/` (masters, depth-1 prefix) och `hero-mockup-previews/` (composites, depth-2 prefix — matchar `{userId|guest}/hero-mockup-previews/{orderId}.png`). Återanvänder `preview_status`-enumet från 00012.
- [x] `scripts/seed-hero-mockups.ts` — idempotent service-role upload (upsert: true, cacheControl 31536000) av de tre masterfilerna från `public/images/mockup-*.jpeg` till `hero-mockups/`. Körd mot cloud; alla tre URLs svarar 200 OK.
- [x] `src/types/supabase.ts` — manuellt uppdaterad `orders.Row/Insert/Update` med 4 nya kolumner. `hero_mockup_status` typad som `preview_status` (inte nullable, default `'pending'`). `tsc --noEmit` rent.
- [x] `src/lib/hero-mockup-scenes.ts` — `HERO_MOCKUP_PATHS: Record<OrientationValue, string>` + `resolveHeroMockupOrientation(orientation, width, height)`-helper som prefererar explicit kolumn och faller tillbaka till pixel-ratio med 5 % tolerans runt 1:1 för square.
- [x] `npx supabase db push` kört mot cloud-projekt `xinnmqappqywcgzexapg`. Master-URL verifierad via curl (HTTP/2 200, 223 488 B matchar lokal fil).

**Exit-kriterium:** ✅ Migration live i cloud, 3 masters publika på `hero-mockups/mockup-<orientation>.jpeg`, typecheck + ESLint rent, `HERO_MOCKUP_PATHS` + `resolveHeroMockupOrientation` redo att konsumeras av Batch B.

### Batch B — Server actions (`hero-mockup.ts`) 🤖

> **Status:** ✅ Klar (2026-04-21) · **Commit:** pending · **Session-scope:** Backend-pipeline för generering + polling. Inget UI-arbete. E2E mot riktig order kvarstår tills UI finns i Batch D (alternativt via `scripts/test-hero-mockup.ts`).

- [x] Extraherad `verifyOrderOwnership` i två återanvändbara primitives i `src/lib/actions/_order-ownership.ts`: `getOrderAuthContext(guestSessionId)` (auth + guest-UUID-validering) + `verifyOrderAccess(order, ctx)` (renodlad ägandekoll). Tvåstegsmönstret låter varje caller kontrollera sin egen SELECT. `environment-preview.ts`-wrappern refactored till att bara vara en tunn adapter ovanpå.
- [x] `src/lib/actions/hero-mockup.ts` — `'use server'`:
  - `generateHeroMockup(orderId, guestSessionId)` — idempotent (kort-kretsar vid `processing`/`success` och returnerar befintlig `imageUrl` om `success`), verifierar order-status (`generated`/`paid`/`shipped`), löser orientation via `resolveHeroMockupOrientation`, hämtar master + artwork, laddar upp båda till Kie, skapar task via `createEnvironmentPreviewTask`, sparar `hero_mockup_status='processing'` + `hero_mockup_task_id`. Rensar `hero_mockup_image_path` + `ai_cost_time_ms` vid retry så stale URLs aldrig kan läcka.
  - `checkHeroMockupStatus(orderId, guestSessionId)` — short-circuit på terminalt state, polls Kie annars, på `success` laddar ner + uploadar `${prefix}/hero-mockup-previews/${orderId}.png` och uppdaterar ordern, på `fail` sätter status + loggar `failCode`. Transient network-fel under polling återgår till `processing` så klienten fortsätter poll (matchar env-preview-beteendet).
- [x] Validators: `generateHeroMockupSchema`, `checkHeroMockupSchema` (UUID-only, speglar env-preview) + `GenerateHeroMockupInput`/`CheckHeroMockupInput`-typer exporterade.
- [x] Error-hantering: `captureServerError` med `{ action, orderId, taskId, stage, failCode }`-tags. Stages: `master_fetch`, `master_upload`, `artwork_fetch`, `artwork_upload`, `task_create`, `order_update`, `poll`, `download_upload`, `task_fail`. Fail-fallback sätter `hero_mockup_status='fail'` i databasen så retry-UX + admin ser det tydligt.
- [x] `scripts/test-hero-mockup.ts` — fristående E2E-driver som kör samma Kie-flöde mot en riktig order-ID utan att gå via server-action-lagret. Snabb sanity-check utan UI; `npx tsx scripts/test-hero-mockup.ts <orderId>`.
- [ ] E2E-verifiering mot en cloud-order — kvar tills UI i Batch D, eller kan köras nu via `test-hero-mockup.ts` om test-order finns (~20-30s + ~$0.02 i Kie-kostnad).

**Exit-kriterium:** ✅ Typecheck + ESLint rent, pipeline kodstrukturellt komplett, idempotens + retry-semantik på plats. E2E parkerad till Batch D där UI triggar actions end-to-end.

### Batch C — Delad progress-komponent 🎨

> **Status:** ✅ Klar (2026-04-21) · **Commit:** pending · **Session-scope:** Progress-UI för sekundära AI-genereringar (hero mockup + env previews). Det befintliga `GenerationProgress` (full-block paintbrush-pulse för primär artwork-generering) bibehölls; ny slim `GenerationProgressBar` lades till som syskon-export i samma fil.

- [x] `src/components/shop/generation-progress.tsx` — två named exports:
  - `GenerationProgress` (oförändrad, zero-props): full-block paintbrush-pulse för primär `generateArtwork`-state, används i `ArtPreview`
  - `GenerationProgressBar` (ny): slim progress bar med props `{ message, isActive, estimatedDurationMs?, className? }`
- [x] Tidsbaserad exponentiell progress: `progress(t) = 0.9 * (1 - exp(-t / tau))` med `tau = estimatedDurationMs / 3` — startar snabbt, avtar mot 90 %. När `isActive` flippar till `false` renderas direkt 100 % (ingen setState i effect — klart mot React 19 `react-hooks/set-state-in-effect`-regeln)
- [x] `prefers-reduced-motion` respekterad via `useSyncExternalStore` — reduced users får en statisk bar på 45 % utan RAF-animation
- [x] a11y: yttre `role="status"` + `aria-live="polite"`, inre `role="progressbar"` med `aria-valuemin/max/now`. Brand-färg på fyllnadsbaren, surface-container-high som bakgrund per DESIGN.md
- [x] Nya i18n-nycklar under `shop`:
  - `progressHeroMockup`: "Skapar en förhandsvisning av din canvas…" / "Creating a preview of your canvas…"
  - `progressEnvironmentPreviews`: "Placerar din tavla i olika rum…" / "Placing your artwork in different rooms…"
- [x] Adopterad i `EnvironmentPreviewGallery`: gamla Loader2+text i headern ersatt med `<GenerationProgressBar>` (estimatedDurationMs: 45s för multi-scene). Behåller per-kort `Loader2` i `PreviewCard` (skiljer "väntar på min scen" från "hela batchen pågår")
- [x] Visuell sanity: komponent matchar surface-container-high / brand-färg / ghost-border-stil från DESIGN.md. Mot test-mode kommer Batch D ge första riktiga end-to-end-visuell verifiering

**Exit-kriterium:** ✅ Typecheck + ESLint rent (pre-existing warning i `environment-preview-gallery.tsx:136` kvarstår, orelaterat till denna batch), `GenerationProgress` zero-props-kontraktet bevarat, ny `GenerationProgressBar` redo för `HeroMockup`-adoption i Batch D.

### Batch D — HeroMockup-komponent & integration 🖼️

> **Status:** ✅ Klar (2026-04-21) · **Commit:** pending · **Session-scope:** Koppla ihop allt. `CanvasMockup` CSS-ram bortplockad, ersatt av `HeroMockup`-komponent som triggar `generateHeroMockup`, pollar via `usePollingTask`, renderar progress → AI-mockup → klickbar för lightbox.

- [x] `src/components/shop/hero-mockup.tsx`:
  - Props: `orderId`, `guestSessionId`, `orientation: OrientationValue`, `existingMockupUrl?: string | null`, `testMode?: boolean`, `onMockupReady: (url: string) => void`, `onImageClick: () => void`
  - States: `idle` | `generating` | `success` | `fail` — initial state hydreras från `existingMockupUrl`/`testMode`
  - Mount-effekt (`hasStartedRef` + `setTimeout(0)` för att hålla `react-hooks/set-state-in-effect`-lint ren): kör `generateHeroMockup` + `startPolling` när ingen mockup-URL finns
  - `usePollingTask` med `maxAttempts: 40, initialDelay: 4000, maxDelay: 15000, backoff: 1.3` — kort-kretsar på `success`/`fail`
  - `testMode`: renderar statisk master-bild från `/images/mockup-<vertical|horizontal|square>.jpeg` — inga Kie-calls
  - **generating**-state: `<Skeleton>` med orientation-matchad aspect (`aspect-[3/4]`/`aspect-[4/3]`/`aspect-square`) + `<GenerationProgressBar>` (25s estimate)
  - **success**-state: klickbar `<Image>` (hover Expand-overlay, keyboard Enter/Space) — triggerar `onImageClick`; `generatedLabel` som caption
  - **fail**-state: `AlertTriangle` + felmeddelande via `useActionError` + `<Button variant="secondary">` med `RefreshCw` för retry
  - `onMockupReady(url)` triggas via effekt så samma URL inte skickar dubbla callbacks (`lastReadyRef`)
- [x] Uppdatera `generation-result.tsx`:
  - Nya props: `heroMockupUrl: string | null`, `onHeroMockupReady: (url: string) => void`
  - Ersatt `<CanvasMockup>` med `<HeroMockup>`; fallback till `<ClickableImage>` (raw generated) om `resolveHeroMockupOrientation` returnerar `null` (legacy orders utan orientation + dims)
  - `baseImages` omstrukturerad: `[heroMockup?, generated, original?]` — mockup slide 1, generated slide 2, original slide 3 (när närvarande). `heroMockupSlideIndex`/`originalSlideIndex` beräknas för klick-routing
  - Gamla inline `CanvasMockup`-komponenten (CSS-gradient-ram) borttagen
- [x] Uppdatera `create-flow.tsx`: nytt `heroMockupUrl`-state, nollställs i `handleGenerate` (ny order) och `handleReset`, propageras via `onHeroMockupReady={setHeroMockupUrl}`
- [x] Uppdatera `art-preview.tsx`: types-prop-passthrough för `heroMockupUrl` + `onHeroMockupReady`
- [x] i18n-nycklar: `shop.heroMockupAlt`, `shop.heroMockupFailed`, `shop.heroMockupTryAgain` (sv + en) — progress-meddelande återanvänder befintlig `shop.progressHeroMockup` från Batch C
- [ ] E2E-verifiering mot dev-order: kvarstår tills Batch E (alternativt direkt via `npm run dev` mot riktig order)
- [x] Admin test-mode: statisk master-mockup renderas, inga Kie-calls

**Exit-kriterium:** ✅ Typecheck rent, ESLint utan nya fel (4 pre-existing kvar: `theme-toggle`, `create-flow:73`, `environment-preview-gallery:136`, `reset-password-button`). HeroMockup integrerad end-to-end i create-flow → art-preview → generation-result. Lightbox-ordning verifierad. Test-mode renderar statisk master utan backend-calls. E2E mot riktig AI-pipeline kvarstår till manuell QA/Batch E.

### Batch E — Polish & slutstädning ✨

> **Status:** ✅ Klar (2026-04-22) · **Commit:** pending · **Session-scope:** A11y-pass, kostnads-tracking, admin-synlighet, dokumentation. Pre-merge cleanup.

- [x] `src/lib/hero-mockup-pipeline.ts` — delad `server-only` kärnmodul. `triggerHeroMockup(order)` + `pollHeroMockup(order, prefix)` utan authz, så att både kundflöde (`hero-mockup.ts`) och admin-wrappers (`admin-hero-mockup.ts`) kan dela samma Kie-kod utan att exponera internals som RPC. `hero-mockup.ts` slimmad till en tunn `'use server'`-wrapper som kör owner-verifiering + delegerar.
- [x] `src/lib/actions/admin-hero-mockup.ts` — `adminTriggerHeroMockup(orderId)` (admin-guardad, resettar `success`/`fail` → `pending` innan re-run så idempotens-guarden inte kort-kretsar) + `adminCheckHeroMockupStatus(orderId)` (admin-poll via `pollHeroMockup`). Båda revaliderar `/admin/orders` + `/admin/orders/[id]` efter åtgärd.
- [x] `src/components/admin/hero-mockup-action-button.tsx` — run/retry/check-knapp som speglar `UpscaleActionButton`-mönstret: `pending` → run, `processing` → check, `fail`/`success` → retry. Använder `useActionError` + `router.refresh()`.
- [x] Admin orderdetalj (`/admin/orders/[id]`): ny sektion "Hero mockup" med status-badge (secondary/warning/success/destructive), task-ID, Kie-tid, inbäddad preview-bild, öppna-i-ny-flik + `HeroMockupActionButton`.
- [x] Kostnads-tracking: `getHeroMockupMetrics({ days })` i `admin-settings.ts` — filtrerar till `['processing','success','fail']` (pending = aldrig körd) och returnerar success/fail/processing-counts, `avgCostTimeMs`, `successRate`, `windowDays`. Dashboard renderar 7-dagars kort, settings 30-dagars aggregat.
- [x] A11y-pass: `aria-busy="true"` på hero-mockup generating state (Skeleton markerad `aria-hidden`), `focus-visible:ring-2 ring-brand`-stil på klickbara mockup/artwork-bilder i `HeroMockup` + `ClickableImage`. `GenerationProgressBar` hade redan `role="status"` + `aria-live="polite"`.
- [x] `TECHSTACK.md` "Bildflöde"-sektionen utökad med ett nytt steg "3. Hero-mockup + rum-previews" (fil-referenser, Storage-paths, status-fält) och Observability-punkterna utökade med hero-mockup-metrics + `HeroMockupActionButton`.
- [x] `DB Schema Status`-raden uppdaterad med `hero_mockup_image_path/status/task_id/ai_cost_time_ms`, `generated_width_px/height_px` och `upscale_enabled` / `environment_previews_enabled` feature-flags.
- [x] Verifiera prod-deploy (2026-04-22): `supabase db push --dry-run` = "Remote database is up to date" (00021 live), alla 3 masters i `hero-mockups/` svarar HTTP 200, Vercel `/` + `/en` svarar 200, `npm run i18n:audit` + `tsc --noEmit` rent.
- [ ] Ev. flytta delad `verifyOrderOwnership` till bredare shared helper om fler actions kan dra nytta (ej blockerande — skippad).

**Exit-kriterium:** ✅ Typecheck + ESLint rent, admin har full insyn i hero-mockup-pipeline via dashboard + settings + order-detalj, retry-knappar gör samma sak som upscale-equivalenten, dokumentation speglar det nya flödet. Pre-merge cleanup komplett.

### Öppna frågor (kan lösas parallellt)

- [ ] **Kie-promptens kvalitet mot rena mockups** — nuvarande `ENVIRONMENT_PREVIEW_PROMPT` är tränad för "rumsscener med canvas". Mot en minimalistisk mockup (canvas på grå vägg) kan den ibland missa kantdetaljer. Om retry-frekvensen är hög → skriv en dedikerad `HERO_MOCKUP_PROMPT` som är enklare ("place artwork on blank canvas") och byt ut i Batch B.
- [ ] **Fallback-beteende om Kie är nere länge** — just nu visar vi retry-knapp. Om vi ser många fails i prod → överväg att visa den gamla CSS-ramen som graceful degradation (konfigurerbart via admin-toggle).
- [ ] **Kostnadsoptimering:** Cacha hero-mockups per `(artwork_hash, orientation)` så att identiska ombeställningar återanvänder samma mockup utan ny Kie-call. Kräver hash-fält på `orders`. Separat optimering efter Batch E.

---

## Fas 13: Strategiska produktidéer

> Inte audit-arbete — produktbeslut. Plocka när Fas 12 är klar och du vill prioritera tillväxt/differentiering.

### Tillväxt & konvertering

- [x] **Svenska översättning** (`messages/sv.json`) + `hreflang`-implementation — path-based routing (sv default på `/`, en på `/en/*`), `next-intl` middleware komponerad med Supabase session-refresh, admin förblir engelska, locale switcher i header, `buildMetadata` + `sitemap.ts` genererar `hreflang` automatiskt. `NextIntlClientProvider` flyttad till `[locale]/layout.tsx` så switcher fungerar stabilt över navigering. Stripe checkout använder `getLocale()` för UI-språk, `success_url`/`cancel_url` och produktnamn; locale skickas med i session-metadata för senare email-flöden. OAuth callback-URL bygger rätt path via `getPathname`. Alla error-boundaries återställer via `common.tryAgain`; root `error.tsx` använder statisk tvåspråkig fallback för att undvika provider-krasch. (2026-04-17)
- [x] **Email-templates på svenska** — Migration 00015 tillade `locale`-kolumn på `orders` (default `'sv'`, check `('sv','en')`). Webhook läser `locale` från Stripe session-metadata och sparar på order. Templates (`order-confirmation`, `order-shipped`, `admin-order-notification`) refaktorerade till rena string-prop-komponenter; `send.ts` pre-resolvar via `getTranslations({ locale, namespace: 'emails.*' })`. `admin-orders.ts` läser `locale` från order vid shipped-mejl. `i18n/request.ts` uppdaterad att respektera explicit `requestLocale` först (så admin-actions och webhook kan rendera annan locale än `/admin`-default `'en'`). Nya översättningsnycklar i `emails.*`-namespace i både `sv.json` och `en.json`. (2026-04-18)
- [x] **Kundrecensioner/betyg på produktsidor** — Migration 00016 tillade `product_reviews`-tabell + `review_status`-enum (`pending`/`approved`/`rejected`). RLS: publik läsning av godkända, publik insert med `status='pending'`-tvång, admin full via `is_admin()`. Server Actions: `submitReview` (Zod, rate-limitad via ny `reviewSubmit`-bucket på IP+email, 3/h), `moderateReview` (admin approve/reject/delete + `revalidatePath('/p/[slug]')`), `getPublicReviewStats`. Admin-UI: `/admin/reviews` med statusfilter + moderation-knappar (approve/reject/delete) + sidebar-länk. Publik UI: `ReviewsSection` server-komponent med snittbetyg + lista, `ReviewForm` klientkomponent med interaktiv stjärnväljare och i18n-fel. Product JSON-LD utökat med `aggregateRating` (ratingValue + reviewCount) när godkända omdömen finns — SEO-boost via rich results. Nya i18n-nycklar: `reviews`-namespace (sv + en) + admin `review*`-nycklar. (2026-04-18)
- [x] **Next.js 16 deprecations åtgärdade** — `src/middleware.ts` omdöpt till `src/proxy.ts` (funktion `middleware` → `proxy`) per Next.js 16 filkonvention (matcher och logik oförändrade; `next-intl`-import kvar på paketets `next-intl/middleware`-export). Sentry-options i `next.config.ts` flyttade: `disableLogger` → `webpack.treeshake.removeDebugLogging`, `automaticVercelMonitors` → `webpack.automaticVercelMonitors`. Verifierat: lint + `tsc --noEmit` grönt; `/`, `/en`, `/login`, `/sitemap.xml`, `/robots.txt` svarar 200; `/admin` utan session ger 307 → `/login?redirect=%2Fadmin`. (2026-04-20)
- [ ] E-post-capture innan generering (för abandoned cart + lead gen) — se **Batch A** nedan
- [ ] Abandoned cart e-post-sekvens (Resend + cron / Supabase Edge Function) — se **Batch B** nedan
- [ ] Delningsfunktion: dela genererat verk på sociala medier (med dynamisk OG-bild) — se **Batch C** nedan
- [ ] Newsletter-signup (footer + post-purchase) — se **Batch D** nedan
- [x] DPI/kvalitetsindikator vid formatval — levererat via **Fas 14 Batch F** (grön/gul/röd QualityBadge i `FormatPicker` + `LowResolutionBlock` + server-side `isFormatEligibleForOrder`-guard)

### Fas 13 — Tillväxt & konvertering (batchplan)

> **Arbetsregel:** En batch = en fokuserad session = en commit. Sekvensering: A → B (B beror på A), C + D oberoende, E valfri parallell.

#### Batch A — Email capture + consent 📧

> **Status:** 🟦 Planerad · **Beroende:** — · **Mål:** Fånga kundens e-post *innan* AI-generering så vi har kontaktpunkt för Batch B + framtida marknadsföring. Varje generation → 1 lead (idag tappar vi majoriteten som inte slutför checkout).

- [ ] Migration `00022_order_email_capture.sql`:
  - `orders.email_captured_at timestamptz` (skiljer "kund gav email" från "Stripe fyllde i det")
  - `orders.marketing_consent boolean default false` (GDPR — separat bock för newsletter-opt-in)
- [ ] Zod-validator `captureOrderEmailSchema` (email + marketing_consent + guestSessionId)
- [ ] Server Action `captureOrderEmail(orderId, email, consent)` — ägande-verifiering via befintlig `_order-ownership.ts`-helper
- [ ] `src/components/shop/email-capture-modal.tsx` (Shadcn Dialog):
  - Triggas i `CreateFlow` när kund klickar "Generera" *innan* `generateArtwork` körs
  - Obligatoriskt email (Zod), valfri marketing-consent-checkbox med länk till `/privacy`
  - "Skip"-länk tillåten (legalt krav + test-mode) som ghost-link
  - `localStorage`-flag `ac_email_captured` → visas bara en gång per session
- [ ] i18n: `shop.emailCapture.*` (title, description, emailLabel, consentLabel, privacyLink, submit, skip) — sv + en
- [ ] Integration i `create-flow.tsx` innan `handleGenerate`
- [ ] Admin dashboard-kort: "Emails captured (7d)" + conversion rate till paid order
- [ ] i18n-audit + typecheck + ESLint rent

**Exit-kriterium:** Nya orders får `email_captured_at` satt, GDPR-consent sparas separat, modal dyker upp i båda locales, test-mode skippar modal.

#### Batch B — Abandoned cart-sekvens 🛒

> **Status:** 🟦 Planerad · **Beroende:** Batch A · **Mål:** Automatiskt mejla kunder som genererat ett verk men inte slutfört checkout inom ~1h. Industry recovery rate 10–15 %.

- [ ] Migration `00023_abandoned_cart.sql`:
  - `orders.abandoned_email_sent_at timestamptz`
  - `orders.unsubscribe_token text unique` (random token per order)
  - Tabell `email_unsubscribes (email text pk, unsubscribed_at, reason)` — global opt-out
- [ ] Supabase Edge Function `abandoned-cart` (pg-cron var 15:e minut):
  - SELECT orders WHERE `status='generated'` AND `email_captured_at < now() - interval '1 hour'` AND `abandoned_email_sent_at IS NULL` AND `customer_email NOT IN email_unsubscribes`
  - Max 50 per tick (safety)
- [ ] React Email-template `emails/abandoned-cart.tsx` — återanvänder `send.ts`-pipeline + `orders.locale` för sv/en
- [ ] Recovery-länk: `/create?resume={orderId}&token={unsubscribe_token}` — create-flow pre-fillar från existing order
- [ ] `/unsubscribe/[token]` route handler — sätter `email_unsubscribes` + redirect till bekräftelse
- [ ] Admin-toggle (`app_settings.abandoned_cart_enabled`) + metrics-kort på dashboard (sent / recovered / unsubscribe-rate, 7d)
- [ ] i18n: `emails.abandonedCart.*` + `pages.unsubscribe.*`

**Exit-kriterium:** Edge function triggas av pg-cron, mejl skickas bara en gång per order, unsubscribe-länken fungerar + respekteras, admin kan pausa, metrics visas på dashboard.

#### Batch C — Delningsfunktion med dynamisk OG-bild 🔗

> **Status:** 🟦 Planerad · **Beroende:** — (oberoende av A/B) · **Mål:** Kunder delar sin genererade tavla på sociala medier med vacker preview-kort. Viral loop + gratis marknadsföring.

- [ ] Publik route `src/app/(marketing)/share/[orderId]/page.tsx`:
  - Visar hero-mockup + stilnamn (INGA känsliga fält: ingen email, inget original-foto)
  - CTA: "Skapa din egen tavla" → `/create?ref=share`
  - `buildMetadata` med dynamisk titel + OG-bild
- [ ] `src/app/(marketing)/share/[orderId]/opengraph-image.tsx` via `next/og`:
  - 1200×630 composite: hero-mockup till vänster + "Aquacanvas" brand + stilnamn + tagline
  - Edge runtime, cacheable 1 år (orderId immutable)
- [ ] `src/components/shop/share-buttons.tsx`:
  - Native Web Share API (mobile-first) + fallback till explicit knappar
  - Kopiera länk (Clipboard API) + toast
  - X/Twitter, Facebook, Pinterest via `intent`-URLs (inga SDK:er)
- [ ] Integration i `GenerationResult` (sekundär CTA under checkout-knapp) + `/order/success`-sidan
- [ ] Opt-in: `orders.shareable boolean default false` — GDPR-säkert, kund måste aktivt välja att dela
- [ ] Migration `00024_share_opt_in.sql` för `shareable`-kolumnen
- [ ] i18n: `shop.share.*` (label, copyLink, copied, shareOn, enableSharing)
- [ ] Tracking: `?ref=share` i `/create` → mäta attribution i Batch E eller enkel counter

**Exit-kriterium:** OG-bilden renderar korrekt på Twitter Card validator + Facebook debugger, delningsknappar fungerar på mobile + desktop, `/share/[orderId]` är bara åtkomlig när `orders.shareable=true`.

#### Batch D — Newsletter-signup 📬

> **Status:** 🟦 Planerad · **Beroende:** — (oberoende av A/B/C, delar unsubscribe-flöde med B) · **Mål:** Long-game retention. Bygga e-postlista för återkommande kunder + säsongskampanjer (mors dag, jul).

- [ ] Migration `00025_newsletter.sql`:
  - Tabell `newsletter_subscribers (id, email unique, locale, source, confirmed_at, confirm_token, unsubscribe_token, created_at)` — double-opt-in via `confirmed_at`
  - RLS: admin full, anon insert-only, public ingen SELECT
- [ ] Server Actions:
  - `subscribeNewsletter(email, locale, source)` — rate-limitad (`newsletterSubscribe`-bucket, 3/h per IP), skickar confirm-mejl
  - `confirmSubscription(token)` — public route handler
  - `unsubscribeNewsletter(token)` — delar `/unsubscribe/[token]`-flöde med Batch B
- [ ] `src/components/shared/newsletter-form.tsx`:
  - Footer-version (email + submit inline)
  - Post-purchase-version (checkbox på success-sidan + auto-subscribe om Batch A-consent=true)
- [ ] Emails: `emails/newsletter-confirm.tsx` + `emails/newsletter-welcome.tsx` (sv + en)
- [ ] Admin `/admin/newsletter` — lista med filter (confirmed/pending), export CSV, manuell unsubscribe
- [ ] Sidebar-länk "Newsletter" + admin i18n-nycklar
- [ ] i18n: `footer.newsletter.*`, `pages.newsletterConfirm.*`, `emails.newsletter.*`, admin `newsletter*`

**Exit-kriterium:** Double-opt-in-flöde komplett (email → confirm-länk → welcome-mejl), admin kan exportera lista, unsubscribe-link fungerar, rate limiting skyddar mot spam.

#### Batch E (bonus) — Analytics-baseline 📊

> **Status:** 🟦 Planerad · **Beroende:** — (kan köras parallellt eller sist) · **Mål:** Mäta impact av A–D. Utan detta flyger vi blint efter lanseringen.

- [ ] Migration `00026_funnel_events.sql` — `funnel_events (id, session_id, order_id?, event text, locale, referrer, metadata jsonb, created_at)`
- [ ] `trackFunnelEvent` server action (fire-and-forget via `after()`)
- [ ] Tracked events: `create_opened`, `email_captured`, `generation_started`, `generation_succeeded`, `checkout_started`, `checkout_completed`, `share_clicked`, `newsletter_subscribed`, `abandoned_email_sent`, `abandoned_email_recovered`
- [ ] Admin `/admin/analytics`:
  - Funnel-visualisering (dropoff per steg, 7d/30d)
  - Top referrers (ref-param-aggregat)
  - Conversion rate email→paid + abandoned cart-recovery-rate
- [ ] Ingen cookie-consent behöver läggas till (first-party, anonymiserat session_id, ingen PII utöver befintlig order-koppling)

**Exit-kriterium:** Full funnel synlig i admin, events skrivs till DB utan att blockera UI, admin kan segmentera per locale.

### Admin & operations

- [ ] Refunds via Stripe API + status `refunded`
- [ ] Tracking-nummer + fraktbolag på order, länk i shipped-mejl
- [ ] Print-on-demand-integration (Printify/Gelato — automatisk fulfillment)
- [ ] Audit log för admin-åtgärder
- [ ] Analytics-dashboard: konverteringstratt, populära stilar, AI-kostnad i SEK vs intäkt
- [ ] Customer search (e-post) i admin
- [ ] Bildgalleri/mediabibliotek i admin
- [ ] Order notes (interna anteckningar per order)
- [ ] Bulk actions (markera som shipped, exportera filtrerade)

### Produktdifferentiering

- [ ] Multi-photo composite (par/familj kombinerat i en tavla)
- [ ] Custom prompt för avancerade användare
- [ ] Presentkort (Stripe Gift Cards)
- [ ] Prenumeration (X tavlor/månad)
- [ ] Fler produktformat: inramad poster, vykort
- [ ] Flera storlekar/material per beställning
- [ ] Batch-upload (flera bilder samtidigt)

### Kodkvalitet & process

- [ ] Vitest för validators + lib/actions
- [ ] Playwright E2E genom create-flödet (mock checkout)
- [x] **i18n-audit-script** — `scripts/i18n-audit.mjs` + `npm run i18n:audit`: scope-medveten scanner som verifierar att alla `t('...')`-referenser finns i båda `messages/{en,sv}.json`, plus driftkontroll (nycklar som bara finns i en locale). Exit code 1 vid fel → redo för CI-pipeline. (2026-04-22)
- [ ] Koppla in `npm run i18n:audit` i CI (GitHub Actions pre-merge-check)
- [ ] i18n-unused-keys-script i CI
- [ ] ESLint-regel mot hårdkodade JSX-strängar

### Auth (om kundkonton aktiveras — se Fas 9)

- [ ] Kundregistrering reaktiverad
- [ ] Lösenordsåterställning
- [ ] Google OAuth
- [ ] Radera konto / dataexport (UI för inloggade)

---

## Framtida idéer (parkerade)

- API för tredjepartsintegrationer
- Flerspråksstöd utöver sv/en (no, da, fi)

## DB Schema Status

Tables: profiles, styles (+ price_cents), products (+ faq JSONB), discount_codes, print_formats (canvas sizes + orientation), orders (+ product_id, customer_email, ai_model, ai_cost_time_ms, ai_task_id, discount_code_id, format_id, orientation, locale, print_image_path, print_dpi, upscale_task_id, upscale_cost_time_ms, upscale_status, generated_width_px, generated_height_px, hero_mockup_image_path, hero_mockup_status, hero_mockup_task_id, hero_mockup_ai_cost_time_ms), generated_images, environment_scenes (name, image_path, is_active, sort_order), environment_previews (order_id, scene_id, image_path, ai_task_id, status, metadata), product_reviews (product_id, order_id, customer_name/email, rating, title, body, status, locale), app_settings (key, value JSONB — upscale_trigger, upscale_enabled, environment_previews_enabled)
Enums: order_status (created/processing/generated/paid/shipped), user_role (customer/admin), preview_status (pending/processing/success/fail), review_status (pending/approved/rejected), upscale_status (pending/processing/success/fail/skipped)
Functions: is_admin(), handle_updated_at(), handle_new_user()
Storage: `images` bucket (10 MB limit, jpeg/png/webp) + `products/` folder for product images
Auth flows: email/password login (admin only), session refresh via proxy, callback route for OAuth
Payments: Stripe Checkout (redirect), webhook at /api/webhooks/stripe, SEK currency, Promotion Codes/Coupons for discounts
Email: Resend (order confirmation, admin notification, shipped notification)
Hosting: Vercel (https://aquacanvas.vercel.app), Supabase Cloud (EU West — xinnmqappqywcgzexapg)
Repo: github.com/Wamaya-se/aquacanvas (public)
