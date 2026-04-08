# Aquacanvas — Roadmap

> Updated: 2026-04-08 | Format: compact, token-efficient. Update after each session.

## Completed

- [x] Project setup (Next.js 16.2.2, Tailwind 4, Shadcn/UI, TypeScript 5)
- [x] Design system + tokens (globals.css — dark/light, surfaces, gradients, fonts)
- [x] Font setup (DM Sans heading, Manrope body — `font-heading` / `font-sans`)
- [x] Shadcn/UI installed + customized (Button, Card, Input, Label, Textarea, Badge, Separator, Avatar, Skeleton, Switch, AlertDialog, Progress)
- [x] next-themes (ThemeProvider, ThemeToggle — dark default, system support)
- [x] i18n: next-intl setup, messages/en.json, NextIntlClientProvider
- [x] Grundläggande projektstruktur (route groups: marketing, auth, shop, dashboard, admin — layouts + error boundaries)
- [x] Skills: all 7 skills skapade och refererade i .cursorrules
- [x] Env-validering: src/lib/env.ts (getters för Supabase, Stripe, Replicate)
- [x] SEO: robots.ts, sitemap.ts, generateMetadata med i18n
- [x] a11y: skip-to-content, reduced-motion, focus-visible, semantic HTML
- [x] Utilities: lib/utils.ts (cn), types/actions.ts (ActionResult<T>), hooks/use-action-error.ts

## Current Sprint — Fas 1: Projektsetup (resterande)

- [ ] Supabase CLI linked, config.toml
- [ ] Auth flow (login, register, middleware, session refresh)
- [ ] DB: Initial schema (profiles, orders, styles, generated_images)

## Fas 2: Landing Page & Produktsida

- [ ] Landing page (hero med exempel-transformationer, hur-det-funkar, CTA, footer)
- [ ] Produktsida: bilduppladdning, stilval, förhandsgranskning
- [ ] Upload-komponent: drag & drop, bildvalidering, förhandsgranskning
- [ ] Stilväljare: vattenmålning (Fas 1), visuella thumbnails per stil
- [ ] Responsiv design, dark/light theme

## Fas 3: AI-integration & Bildgenerering

- [ ] AI-service setup (Replicate eller OpenAI Images)
- [ ] Server Action: processImage (upload → AI → storage)
- [ ] Bildgenereringsflöde: upload → processing-spinner → preview av resultat
- [ ] Polling/webhook för generering-status
- [ ] Lagring: original + genererad bild i Supabase Storage
- [ ] Rate limiting / kostnadskontroll

## Fas 4: Checkout & Betalning

- [ ] Stripe setup: env vars, server-only client
- [ ] Produktkonfiguration: storlek, format (poster, canvas — framtida)
- [ ] Checkout flow: Stripe Checkout Session
- [ ] Webhooks: payment_intent.succeeded → uppdatera orderstatus
- [ ] Orderbekräftelse: e-post + dashboard-vy
- [ ] Orderstatus-flöde: created → processing → generated → paid → shipped

## Fas 5: Kundkonto & Dashboard

- [ ] Dashboard layout + navigation
- [ ] Orderhistorik: lista med status, bilder, datum
- [ ] Orderdetalj: original + genererad bild, status, betalning
- [ ] Kontoinställningar: profil, e-post, lösenord
- [ ] Re-order: beställ om med annat format/storlek

## Fas 6: Admin Panel

- [ ] Admin dashboard: orderstatus, intäkter, AI-användning
- [ ] Orderhantering: lista, detalj, statusändring
- [ ] Användarhantering
- [ ] Innehållshantering: stilar, priser, produktbeskrivningar
- [ ] AI-kostnadsöverblick

## Fas 7: Publik frontend & SEO

- [ ] Landing page förbättringar: testimonials, FAQ, social proof
- [ ] Galleri: visa exempel på transformationer (med kundens tillstånd)
- [ ] Om oss, kontakt, FAQ-sidor
- [ ] SEO: JSON-LD (Product, Organization), sitemap, Open Graph
- [ ] Blog/innehållssidor (MDX)

## Fas 8: Fler stilar & produkter

- [ ] Fler AI-stilar: oljemålning, kolskiss, anime, impressionism
- [ ] Fler produktformat: canvastavla, inramad poster, vykort
- [ ] Prisstrategi per stil + format
- [ ] Stilförhandsvisning: live-preview med thumbnail

## Fas 9: Auth & GDPR

- [ ] Lösenordsåterställning
- [ ] E-postverifiering
- [ ] Google OAuth
- [ ] Cookie-consent banner
- [ ] Integritetspolicy + Användarvillkor
- [ ] Radera konto / dataexport
- [ ] Orderkvitton (PDF)

## Fas 10: Polish & Produktion

- [ ] Responsiv polish-pass
- [ ] Performance-pass (lazy loading, image optimization, cache)
- [ ] Monitoring: Sentry, uptime
- [ ] Rate limiting (login, register, bildgenerering)
- [ ] Onboarding-guide för nya besökare

## Framtida idéer

- Prenumeration (X transformationer/månad)
- Presentkort
- Flera storlekar/material per beställning
- Batch-upload (flera bilder)
- Delningsfunktion (dela sin konst på sociala medier)
- Print-on-demand integration (tredjepartstryckeri)
- API för tredjepartsintegrationer
- Flerespråksstöd (sv, en, no, da, fi)

## DB Schema Status

Tables: (inga ännu — skapas i Fas 1)
Enums: (inga ännu)
Storage: (konfigureras i Fas 1)
Auth flows: (konfigureras i Fas 1)
