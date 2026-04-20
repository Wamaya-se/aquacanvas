# Aquacanvas — Roadmap

> Updated: 2026-04-20 (Fas 14 Batch E klar — worst-case testpipeline, factor-tag på Sentry-fel, Pipeline Health-widget på admin dashboard, TECHSTACK-dokumentation) | Format: compact, token-efficient. Update after each session.

## 🎯 Aktiv prioritet

**Nästa upp:** **Fas 14 Batch F — DPI pre-checkout gate** (valfri — infrastruktur redo för när stora format återaktiveras) *eller* Fas 13 parallellt (email capture, abandoned cart, newsletter, delning). Batch A–E ✅ klara.
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

### Batch F — DPI pre-checkout gate (valfri, efter Batch C) 🛡️

> **Session-scope:** Hård spärr i FormatPicker om valt format inte kan levereras i tillräcklig DPI.
> **Notering:** Med nuvarande aktiva format (30×40, 40×30, 30×30) är alla alltid i grön zon — denna batch blir tekniskt redundant tills större format återaktiveras. Byggs ändå för att infrastrukturen ska vara redo.

- [ ] Kolumner `generated_width_px`, `generated_height_px` på `orders` (fyll i vid `checkGenerationStatus` via `sharp.metadata()`)
- [ ] Server-helper `computeFormatEligibility(genW, genH, formats, upscaleFactor)` i `src/lib/image-processing.ts`
- [ ] `FormatPicker` uppdaterad: disabled-state, grön/gul/röd badges, tooltip med förklaring
- [ ] `createCheckoutSession` validerar server-side att vald format är eligible (defense in depth)
- [ ] Om alla format faller i röd zon: blockera checkout helt, visa uppmaning att ladda upp större bild
- [ ] i18n-nycklar i `messages/sv.json` + `en.json` (errors + shop)

### Öppna frågor (kan lösas parallellt med batcharna)

- [ ] Utvärdera `nano-banana-pro` (2K native) mot `nano-banana-edit`: kostnad/call + kvalitetsjämförelse för era 5 stilar. Om Pro levererar likvärdig kvalitet till rimlig kostnad → byta modell och återaktivera 50×70/70×100.
- [ ] Följ upp med tryckeriet: absolut minimum-DPI per storlek. Kan 50×70 tryckas @ 170 DPI? 70×100 @ 120 DPI? Det kan låsa upp stora format utan modellbyte.
- [ ] Smart upscale-factor (1/2/4/8 baserat på behov istället för alltid 4x) — följer-upp-optimering efter Batch E
- [ ] HEIC-stöd klient-side (`heic2any`) — separat Fas 15 om det blir frekvent kundklagomål

---

## Fas 13: Strategiska produktidéer

> Inte audit-arbete — produktbeslut. Plocka när Fas 12 är klar och du vill prioritera tillväxt/differentiering.

### Tillväxt & konvertering

- [x] **Svenska översättning** (`messages/sv.json`) + `hreflang`-implementation — path-based routing (sv default på `/`, en på `/en/*`), `next-intl` middleware komponerad med Supabase session-refresh, admin förblir engelska, locale switcher i header, `buildMetadata` + `sitemap.ts` genererar `hreflang` automatiskt. `NextIntlClientProvider` flyttad till `[locale]/layout.tsx` så switcher fungerar stabilt över navigering. Stripe checkout använder `getLocale()` för UI-språk, `success_url`/`cancel_url` och produktnamn; locale skickas med i session-metadata för senare email-flöden. OAuth callback-URL bygger rätt path via `getPathname`. Alla error-boundaries återställer via `common.tryAgain`; root `error.tsx` använder statisk tvåspråkig fallback för att undvika provider-krasch. (2026-04-17)
- [x] **Email-templates på svenska** — Migration 00015 tillade `locale`-kolumn på `orders` (default `'sv'`, check `('sv','en')`). Webhook läser `locale` från Stripe session-metadata och sparar på order. Templates (`order-confirmation`, `order-shipped`, `admin-order-notification`) refaktorerade till rena string-prop-komponenter; `send.ts` pre-resolvar via `getTranslations({ locale, namespace: 'emails.*' })`. `admin-orders.ts` läser `locale` från order vid shipped-mejl. `i18n/request.ts` uppdaterad att respektera explicit `requestLocale` först (så admin-actions och webhook kan rendera annan locale än `/admin`-default `'en'`). Nya översättningsnycklar i `emails.*`-namespace i både `sv.json` och `en.json`. (2026-04-18)
- [x] **Kundrecensioner/betyg på produktsidor** — Migration 00016 tillade `product_reviews`-tabell + `review_status`-enum (`pending`/`approved`/`rejected`). RLS: publik läsning av godkända, publik insert med `status='pending'`-tvång, admin full via `is_admin()`. Server Actions: `submitReview` (Zod, rate-limitad via ny `reviewSubmit`-bucket på IP+email, 3/h), `moderateReview` (admin approve/reject/delete + `revalidatePath('/p/[slug]')`), `getPublicReviewStats`. Admin-UI: `/admin/reviews` med statusfilter + moderation-knappar (approve/reject/delete) + sidebar-länk. Publik UI: `ReviewsSection` server-komponent med snittbetyg + lista, `ReviewForm` klientkomponent med interaktiv stjärnväljare och i18n-fel. Product JSON-LD utökat med `aggregateRating` (ratingValue + reviewCount) när godkända omdömen finns — SEO-boost via rich results. Nya i18n-nycklar: `reviews`-namespace (sv + en) + admin `review*`-nycklar. (2026-04-18)
- [x] **Next.js 16 deprecations åtgärdade** — `src/middleware.ts` omdöpt till `src/proxy.ts` (funktion `middleware` → `proxy`) per Next.js 16 filkonvention (matcher och logik oförändrade; `next-intl`-import kvar på paketets `next-intl/middleware`-export). Sentry-options i `next.config.ts` flyttade: `disableLogger` → `webpack.treeshake.removeDebugLogging`, `automaticVercelMonitors` → `webpack.automaticVercelMonitors`. Verifierat: lint + `tsc --noEmit` grönt; `/`, `/en`, `/login`, `/sitemap.xml`, `/robots.txt` svarar 200; `/admin` utan session ger 307 → `/login?redirect=%2Fadmin`. (2026-04-20)
- [ ] E-post-capture innan generering (för abandoned cart + lead gen)
- [ ] Abandoned cart e-post-sekvens (Resend + cron / Supabase Edge Function)
- [ ] Delningsfunktion: dela genererat verk på sociala medier (med dynamisk OG-bild)
- [ ] Newsletter-signup (footer + post-purchase)
- [ ] DPI/kvalitetsindikator vid formatval (höjd från Fas 11)

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

Tables: profiles, styles (+ price_cents), products (+ faq JSONB), discount_codes, print_formats (canvas sizes + orientation), orders (+ product_id, customer_email, ai_model, ai_cost_time_ms, ai_task_id, discount_code_id, format_id, orientation, locale), generated_images, environment_scenes (name, image_path, is_active, sort_order), environment_previews (order_id, scene_id, image_path, ai_task_id, status, metadata), product_reviews (product_id, order_id, customer_name/email, rating, title, body, status, locale)
Enums: order_status (created/processing/generated/paid/shipped), user_role (customer/admin), preview_status (pending/processing/success/fail), review_status (pending/approved/rejected)
Functions: is_admin(), handle_updated_at(), handle_new_user()
Storage: `images` bucket (10 MB limit, jpeg/png/webp) + `products/` folder for product images
Auth flows: email/password login (admin only), session refresh via proxy, callback route for OAuth
Payments: Stripe Checkout (redirect), webhook at /api/webhooks/stripe, SEK currency, Promotion Codes/Coupons for discounts
Email: Resend (order confirmation, admin notification, shipped notification)
Hosting: Vercel (https://aquacanvas.vercel.app), Supabase Cloud (EU West — xinnmqappqywcgzexapg)
Repo: github.com/Wamaya-se/aquacanvas (public)
