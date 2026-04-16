# Aquacanvas — Roadmap

> Updated: 2026-04-16 (Batch 3 — i18n & a11y-städning klar) | Format: compact, token-efficient. Update after each session.

## 🎯 Aktiv prioritet

**Nästa upp:** Fas 12 · Batch 4 — SEO + observability (se nedan).
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
- [x] Middleware: src/middleware.ts (sessionsrefresh, admin-guard — kundroutes borttagna)
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

### Batch 4 — SEO + observability 🟡

> **Status:** ⏳ Ej startad · **Mål:** Sajten är produktionsmogen för trafik & felövervakning.

- [ ] Sentry-integration (server + client) med `orderId`/`taskId`-tags
- [ ] Distributed rate limiting (Upstash Redis eller Vercel KV) — ersätt `src/lib/rate-limit.ts`
- [ ] Lägg på rate limiting på `login`, `register`, `sendContactMessage` Server Actions
- [ ] `metadataBase` i root layout
- [ ] `alternates.canonical` på alla publika sidor
- [ ] Twitter card metadata på alla publika sidor
- [ ] OG-image för auth/checkout-sidor
- [ ] `loading.tsx` per route group (marketing, shop, admin, dashboard)
- [ ] Bryt ut `usePollingTask`-hook (DRY mellan `create-flow.tsx` och `environment-preview-gallery.tsx`)
- [ ] `getSiteUrl()` i `sitemap.ts` + `robots.ts` (ersätt `process.env.NEXT_PUBLIC_SITE_URL`-fallback)
- [ ] Type-safe Supabase-relationer — antingen DB-enum för `orientation`, Zod-parse vid query, eller `db-helpers.ts` med typed parsers (ersätter både pre-existerande `as unknown as`-cast och de 4 cast som tillkom i Batch 1)

---

## Fas 13: Strategiska produktidéer

> Inte audit-arbete — produktbeslut. Plocka när Fas 12 är klar och du vill prioritera tillväxt/differentiering.

### Tillväxt & konvertering

- [ ] **Svenska översättning** (`messages/sv.json`) + `hreflang`-implementation — sajten är svensk, stor SEO-vinst
- [ ] E-post-capture innan generering (för abandoned cart + lead gen)
- [ ] Abandoned cart e-post-sekvens (Resend + cron / Supabase Edge Function)
- [ ] Kundrecensioner/betyg på produktsidor (social proof + SEO)
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

Tables: profiles, styles (+ price_cents), products (+ faq JSONB), discount_codes, print_formats (canvas sizes + orientation), orders (+ product_id, customer_email, ai_model, ai_cost_time_ms, ai_task_id, discount_code_id, format_id, orientation), generated_images, environment_scenes (name, image_path, is_active, sort_order), environment_previews (order_id, scene_id, image_path, ai_task_id, status, metadata)
Enums: order_status (created/processing/generated/paid/shipped), user_role (customer/admin), preview_status (pending/processing/success/fail)
Functions: is_admin(), handle_updated_at(), handle_new_user()
Storage: `images` bucket (10 MB limit, jpeg/png/webp) + `products/` folder for product images
Auth flows: email/password login (admin only), session refresh via middleware, callback route for OAuth
Payments: Stripe Checkout (redirect), webhook at /api/webhooks/stripe, SEK currency, Promotion Codes/Coupons for discounts
Email: Resend (order confirmation, admin notification, shipped notification)
Hosting: Vercel (https://aquacanvas.vercel.app), Supabase Cloud (EU West — xinnmqappqywcgzexapg)
Repo: github.com/Wamaya-se/aquacanvas (public)
