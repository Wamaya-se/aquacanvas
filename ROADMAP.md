# Aquacanvas — Roadmap

> Updated: 2026-04-10 (Fas 8 pågår — canvas klart) | Format: compact, token-efficient. Update after each session.

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
- [ ] Blog/innehållssidor (MDX)

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
- [ ] Fler produktformat: inramad poster, vykort (framtida)
- [ ] Stilförhandsvisning: live-preview med thumbnail

## Fas 9: Auth & GDPR (framtida, om kundkonton aktiveras)

- [ ] Kundregistrering (reaktivera)
- [ ] Lösenordsåterställning
- [ ] Google OAuth
- [ ] Cookie-consent banner
- [ ] Integritetspolicy + Användarvillkor
- [ ] Radera konto / dataexport

## Fas 10: Polish & Produktion

- [ ] Responsiv polish-pass
- [ ] Performance-pass (lazy loading, image optimization, cache)
- [ ] Monitoring: Sentry, uptime
- [ ] Rate limiting (login, register, bildgenerering)

## Framtida idéer

- Prenumeration (X transformationer/månad)
- Presentkort
- Flera storlekar/material per beställning
- Batch-upload (flera bilder)
- Delningsfunktion (dela sin konst på sociala medier)
- Print-on-demand integration (tredjepartstryckeri)
- API för tredjepartsintegrationer
- Flerespråksstöd (sv, en, no, da, fi)
- Audit log (admin-åtgärder)
- Bildgalleri/mediabibliotek i admin

## DB Schema Status

Tables: profiles, styles (+ price_cents), products (+ faq JSONB), discount_codes, print_formats (NEW — canvas sizes), orders (+ product_id, customer_email, ai_model, ai_cost_time_ms, ai_task_id, discount_code_id, format_id), generated_images
Enums: order_status (created/processing/generated/paid/shipped), user_role (customer/admin)
Functions: is_admin(), handle_updated_at(), handle_new_user()
Storage: `images` bucket (10 MB limit, jpeg/png/webp) + `products/` folder for product images
Auth flows: email/password login (admin only), session refresh via middleware, callback route for OAuth
Payments: Stripe Checkout (redirect), webhook at /api/webhooks/stripe, SEK currency, Promotion Codes/Coupons for discounts
Email: Resend (order confirmation, admin notification, shipped notification)
