# Aquacanvas — Säkerhets- & kvalitetsaudit

> **Skapad:** 2026-04-16 efter djupanalys av kodbasen.
> **Syfte:** Detaljerad referens till alla fynd som ska åtgärdas i Fas 12 (se `ROADMAP.md`).
> **Hur den används:** Innan du börjar en batch, läs motsvarande sektion här. Markera items som klara med `[x]` både i denna fil och i `ROADMAP.md`.

---

## Sammanfattning

| Batch | Antal items | Status | Kategori |
|-------|-------------|--------|----------|
| 1 — Kritiska säkerhetsfixar | 8 | ✅ Klar (2026-04-16) | 🔴 Critical |
| 2 — Juridik & GDPR | 7 | ✅ Klar (2026-04-16) | 🟠 Compliance |
| 3 — i18n & a11y-städning | 12 | ⏳ Ej startad | 🟡 Quality |
| 4 — SEO + observability | 12 | ⏳ Ej startad | 🟡 Production-readiness |

---

## Batch 1 — Kritiska säkerhetsfixar 🔴 ✅ KLAR

> Genomförd 2026-04-16. Alla 8 items åtgärdade. Migration `00014_stripe_event_idempotency.sql` deployad till Supabase Cloud. Build + typecheck verifierade.

### 1.1 Open redirect i login ✅

**Fil:** `src/lib/actions/auth.ts:43-50`
**Problem:** `redirectTo.startsWith('/')` är `true` även för `'//evil.com'` (protokoll-relativ URL). Användaren kan därmed skickas till extern domän efter inloggning.

```typescript
// nuvarande
if (redirectTo && typeof redirectTo === 'string' && redirectTo.startsWith('/')) {
  redirect(redirectTo)
}
```

**Fix:**
```typescript
const isSafeRedirect = (path: string) =>
  typeof path === 'string' &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.startsWith('/\\')
```
Överväg också att flytta logiken till en delad helper i `src/lib/safe-redirect.ts`.

---

### 1.2 Open redirect i OAuth callback ✅

**Fil:** `src/app/(auth)/callback/route.ts:7-18`
**Problem:** Samma som 1.1. `next.startsWith('/')` släpper igenom `//host`.
**Fix:** använd samma `isSafeRedirect`-helper. Defaulta till `/admin` vid fail.

---

### 1.3 Rate-limit-bypass cookie kan sättas av vem som helst ✅

**Filer:**
- `src/lib/actions/admin-settings.ts:65-67` (read)
- `src/lib/actions/ai.ts:57-59` (use)

**Problem:** `getRateLimitBypassEnabled()` läser bara cookie-värde. Vem som helst kan sätta `aquacanvas-rate-limit-bypass=true` i devtools och stänga av rate limit för dyra Kie.ai-anrop.

**Fix-alternativ A (rekommenderat):** verifiera admin-roll vid varje read.
```typescript
export async function getRateLimitBypassEnabled(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role
  if (role !== 'admin') return false
  const cookieStore = await cookies()
  return cookieStore.get(RATE_LIMIT_BYPASS_COOKIE)?.value === 'true'
}
```

**Fix-alternativ B:** signera cookien med HMAC + serverhemlighet.

Kolla samma mönster för `getTestModeEnabled()` (`TEST_MODE_COOKIE`) — om testläge påverkar betalning/AI ska den också kräva admin.

---

### 1.4 Stripe webhook saknar idempotens ✅

**Fil:** `src/app/api/webhooks/stripe/route.ts:36-114`
**Problem:** Stripe levererar samma event flera gånger (vid retries, network glitches). Vi:
- uppdaterar order
- skickar order-bekräftelse + admin-notis (Resend)
- inkrementerar `discount_codes.current_uses`

…utan att kontrollera om `event.id` redan processerats. Risk: dubbla mejl, fel rabattanvändning, dubbla statusuppdateringar.

**Fix:**
1. Ny migration `00014_stripe_event_idempotency.sql`:
```sql
create table public.processed_stripe_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);
-- RLS: bara service-role får skriva (anon = no access)
alter table public.processed_stripe_events enable row level security;
```
2. I webhook-route: först `insert ... on conflict (event_id) do nothing returning event_id`. Om inget returneras → skippa (redan processerat).
3. Cleanup-job (valfritt): radera events äldre än 30 dagar.

---

### 1.5 `createProduct` returnerar `success: true` vid uppladdningsfel ✅

**Fil:** `src/lib/actions/admin-products.ts:174-195`
**Problem:**
```typescript
try {
  // bilduppladdning
} catch (err) {
  console.error('[createProduct] image upload', err)
}
return { success: true, data: { id: data.id } }
```
Adminen tror produkten är OK men har inga bilder.

**Fix:** ta bort silent catch. Vid uppladdningsfel — antingen rulla tillbaka produkten (delete) eller returnera `success: false, error: 'errors.uploadFailed'` med info om att produkten skapats men bilder saknas.

---

### 1.6 `updateProduct` läcker rå exception-text ✅

**Fil:** `src/lib/actions/admin-products.ts:239-242`
```typescript
const message = err instanceof Error ? err.message : 'errors.uploadFailed'
return { success: false, error: message }
```
**Fix:** logga `err` server-side, returnera alltid en i18n-nyckel.

---

### 1.7 Provider `failMsg` läcker till klient ✅

**Fil:** `src/lib/actions/ai.ts:307-314`
```typescript
return {
  success: true,
  data: { state: 'fail', generatedImageUrl: null, failMsg: status.failMsg },
}
```
**Problem:** Kie.ai:s rå-felmeddelande exponeras i klienten — kan avslöja interna API-detaljer.
**Fix:** logga `failMsg` server-side, returnera generisk i18n-nyckel (t.ex. `errors.generationFailed`).

---

### 1.8 `as string` på `formData.get('guestSessionId')` ✅

**Fil:** `src/lib/actions/ai.ts:48-55`
```typescript
const guestSessionId = isGuest
  ? (formData.get('guestSessionId') as string | null)
  : null
```
**Problem:** Bryter projektregeln "never `as string` on `formData.get()`". Dessutom ingen längd-/format-validering.
**Fix:** Zod-schema `z.string().min(8).max(64).regex(/^[a-zA-Z0-9_-]+$/)` (eller UUID om vi byter format).

---

## Batch 2 — Juridik & GDPR 🟠 ✅ KLAR

> Genomförd 2026-04-16. Alla 7 items åtgärdade. Policy-texter på engelska (konsekvent med `messages/en.json`; svensk översättning i Fas 13). Företagsuppgifter som placeholders (`[Company Name]`, `[Org.nr]`, postadress) — fylls i innan marknadsföring. Dataradering på minimum-nivå per GDPR Art. 12(3): email-flöde dokumenterat i `/privacy`, ingen ny DB-tabell eller admin-vy (flaggad till Fas 13 om volym kräver).

### 2.1 Skapa `/privacy` ✅

**Var:** `src/app/(marketing)/privacy/page.tsx`
**Innehåll (mall):** vad vi samlar (foton, e-post, ordrar), varför, hur länge, third parties (Supabase EU, Stripe, Kie.ai, Resend, Vercel), användarens rättigheter (radering, export), kontakt.
**i18n:** namespace `privacy.*` i `messages/en.json`.
**SEO:** `generateMetadata`, JSON-LD `WebPage`.
**Sitemap:** lägg till i `src/app/sitemap.ts`.

### 2.2 Skapa `/terms` ✅

**Var:** `src/app/(marketing)/terms/page.tsx`
**Innehåll:** beställning, leverans, ångerrätt (svensk konsumentlagstiftning — distansavtalslag 14 dagar), reklamation, immaterialrätt (kunden äger uppladdat foto, vi får inte återanvända det), force majeure.
**i18n:** namespace `terms.*`.

### 2.3 Skapa `/cookies` ✅

**Var:** `src/app/(marketing)/cookies/page.tsx`
**Innehåll:** vilka cookies vi sätter (`sb-*` för session, `aquacanvas-test-mode`, `aquacanvas-rate-limit-bypass`, `theme`), funktion vs analytics.
**Notera:** om vi inte har analytics-cookies kan vi argumentera att ingen banner krävs (bara funktionella cookies).

### 2.4 Ta bort eller skapa `/forgot-password` ✅

**Fil:** `src/components/auth/login-form.tsx`
**Beslut:** Länken borttagen eftersom kundkonton är inaktiva (Fas 5 pivot). `auth.forgotPassword`-nyckeln borttagen från `messages/en.json`. Reintroduceras när Fas 9 aktiveras.

### 2.5 Cookie-banner — beslut ✅

**Beslut:** Ingen banner krävs. Alla cookies vi sätter är strikt nödvändiga eller funktionella (Supabase-session `sb-*`, `theme`, admin-cookies för test-mode och rate-limit-bypass). Under EU ePrivacy-direktivet och svenska LEK 2003:389 kap 6 §18 krävs samtycke endast för icke-essentiella cookies. Beslutet är publikt dokumenterat på `/cookies`. Om Sentry, Plausible, eller annan analytics tillkommer i Batch 4 → introducera consent-mekanism innan analytics laddas.

### 2.6 Dataradering-flöde ✅

**Beslut:** Minimum-nivå (GDPR-compliant per Art. 12(3) och 17). Dokumenterat på `/privacy` under "How to Request Data Deletion": kunden mailar `support@aquacanvas.com` med order-ID + e-post som användes vid ordern, admin raderar manuellt inom 30 dagar. Motiv: låg volym, ingen inloggad kund-UI, fast 7-års lagring på orderregister krävs enligt Bokföringslagen.
**Uppgradering till full self-service (Fas 13 om volym kräver):**
- Ny tabell `data_deletion_requests` (id, order_id, email, status, requested_at, completed_at)
- Server Action `requestDataDeletion(orderId, email)` med signerad e-postlänk (HMAC + 24h expiry)
- Admin-vy `/admin/data-requests`

### 2.7 Verifiera footer-länkar ✅

**Fil:** `src/components/shared/footer.tsx`
**Åtgärd:** `/privacy`, `/terms` och den nytillagda `/cookies` länkar nu alla till existerande sidor. `footer.cookies`-nyckel tillagd i `messages/en.json`.

---

## Batch 3 — i18n & a11y-städning 🟡

### 3.1 Auth-rubriker

- `src/app/(auth)/login/page.tsx:17` → `t('login.title')`
- `src/app/(auth)/register/page.tsx:16` → `t('register.title')`
- Lägg `auth.login.title` och `auth.register.title` i `messages/en.json`.

### 3.2 Hero/gallery/product `alt`-texter

**Filer:**
- `src/app/(marketing)/page.tsx:151-152`
- `src/app/(marketing)/gallery/page.tsx:151-152, 164-165`
- `src/app/(marketing)/p/[slug]/page.tsx:210-211`

**Mönster:** alla `alt`-attribut på `<Image>` via `t('alt.heroBefore')` etc.

### 3.3 Nav `aria-label`

- `src/components/shared/header.tsx:36` → `t('nav.main')`
- `src/components/shared/mobile-nav.tsx:35` → `t('nav.mobile')`

### 3.4 Theme toggle `aria-label`

**Fil:** `src/components/shared/theme-toggle.tsx:44`
Använd `useTranslations('common')` med `t('themeToggle', { theme })`.

### 3.5 Loading-knapptext

- `src/components/auth/login-form.tsx:96` — `"..."` → `t('common.loading')`
- `src/components/auth/register-form.tsx:92` — samma

### 3.6 JSON-LD breadcrumbs + domän

**Filer:**
- `src/app/(marketing)/p/[slug]/page.tsx:103-118`
- `src/app/(marketing)/gallery/page.tsx:80-95`
- `src/app/(marketing)/about/page.tsx:43-58`
- `src/app/(marketing)/faq/page.tsx:82-97`
- `src/app/(marketing)/contact/page.tsx` (sök efter `BreadcrumbList`)

**Fix:**
- Domän: ersätt `https://aquacanvas.com` med `getSiteUrl()`
- Labels (`'Home'`, `'Gallery'`, etc.): hämta via `getTranslations('breadcrumbs')`

### 3.7 Organization JSON-LD

**Fil:** `src/app/(marketing)/page.tsx:362-376`
- `url`, `email`, `contactType` ska komma från env / i18n
- Lägg `getSiteUrl()` + `getAdminEmail()` (eller dedikerad `getContactEmail()`)

### 3.8 Nästlad `<main>` i error-boundaries

**Filer:**
- `src/app/(marketing)/error.tsx:14-16`
- `src/app/(shop)/error.tsx:14-16`
- `src/app/(auth)/error.tsx:13-15`

**Fix:** byt `<main id="main-content">` mot `<div>` (admin/dashboard error.tsx gör redan rätt — kopiera mönstret).
**Verifiera även:** `src/app/error.tsx:14-15` — root-error renderar utanför layouts så `<main>` är OK där, men dubbel-id om den ändå renderas inom layouts. Testa.

### 3.9 Konsekvent `aria-invalid` + `aria-describedby` på forms

**Status:** finns bara i `login-form.tsx:67-71`.
**Behöver fixas i:**
- `src/components/auth/register-form.tsx`
- alla admin-formulär (`format-form.tsx`, `scene-form.tsx`, `product-form.tsx`, etc.)
- `src/components/shop/*-form.tsx`

**Mönster:**
```tsx
<Input
  id="email"
  aria-invalid={Boolean(fieldErrors.email)}
  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
/>
{fieldErrors.email && (
  <p id="email-error" role="alert" className="text-destructive text-sm">
    {t(fieldErrors.email)}
  </p>
)}
```

### 3.10 Brittling `state.error?.includes('email')`

**Fil:** `src/components/auth/login-form.tsx:67-70`
**Fix:** server action returnerar strukturerat fält-fel, t.ex. `{ field: 'email', error: 'errors.invalidEmail' }`. Klient läser `fieldErrors.email`.

### 3.11 FAQ `as string`

**Fil:** `src/lib/actions/admin-products.ts:99-100`
**Fix:** Zod-parsa hela formData inkl. dynamiska FAQ-fält. Använd `z.record(z.string())` eller iterera + parsa varje par.

### 3.12 `text-white` hårdkodat

**Fil:** `src/components/shop/generation-result.tsx:334-335, 401-404`
**Fix:** byt mot semantisk token. Om det är overlay på bild → `text-foreground` med `bg-black/60`-bakgrund, eller skapa ny token `--color-overlay-foreground` i `globals.css`.

---

## Batch 4 — SEO + observability 🟡

### 4.1 Sentry-integration

**Steg:**
1. `npm install @sentry/nextjs`
2. `npx @sentry/wizard@latest -i nextjs`
3. Konfigurera `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts`
4. Wrappa Server Actions: `Sentry.captureException(err, { tags: { orderId, taskId } })`
5. Lägg till `SENTRY_DSN` i Vercel env
6. Test: kasta ett fel i en Server Action, verifiera i Sentry-dashboard

### 4.2 Distributed rate limiting

**Verktyg:** Upstash Redis (gratis tier räcker långt) eller Vercel KV.
**Bibliotek:** `@upstash/ratelimit` + `@upstash/redis`.
**Steg:**
1. Skapa Upstash-konto, hämta REST URL + token
2. Lägg `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` i `env.ts` och Vercel
3. Ny `src/lib/rate-limit.ts`:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5/h för gäster
  analytics: true,
})
```
4. Lägg på rate limit för: `login`, `register`, `sendContactMessage` (utöver befintlig AI-gen)

### 4.3 `metadataBase`

**Fil:** `src/app/layout.tsx`
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  // ...
}
```

### 4.4 `alternates.canonical`

På varje publik sida i `generateMetadata`:
```typescript
alternates: { canonical: `/p/${slug}` }, // resolveras mot metadataBase
```

### 4.5 Twitter card

På varje publik sida:
```typescript
twitter: {
  card: 'summary_large_image',
  title: t('title'),
  description: t('description'),
  images: [`${getSiteUrl()}/og-image.png`],
}
```

### 4.6 OG-image för auth/checkout

Använd Next.js OG image generation (`opengraph-image.tsx` per route) eller statisk `public/og-default.png`.

### 4.7 `loading.tsx` per route group

Skapa:
- `src/app/(marketing)/loading.tsx`
- `src/app/(shop)/loading.tsx`
- `src/app/(admin)/loading.tsx`
- `src/app/(dashboard)/loading.tsx`

Använd Skeleton-komponent från Shadcn.

### 4.8 `usePollingTask`-hook

**Filer som ska refaktoreras:**
- `src/components/shop/create-flow.tsx:110-156`
- `src/components/shop/environment-preview-gallery.tsx:95-129`

**Ny fil:** `src/hooks/use-polling-task.ts`
```typescript
export function usePollingTask<T>({
  fetcher,
  isComplete,
  maxAttempts = 60,
  initialDelay = 2000,
  backoff = 1.1,
}: UsePollingTaskOptions<T>) { /* ... */ }
```

### 4.9 `getSiteUrl()` i sitemap/robots

- `src/app/sitemap.ts:6` → `getSiteUrl()`
- `src/app/robots.ts:10` → `getSiteUrl()`

### 4.10 Type-safe Supabase-relationer

**Status efter Batch 1:** Typerna är nu regenererade från cloud (auktoritativ). Detta gjorde att `orientation` (DB: `text`) och `faq` (DB: `Json`) inte längre auto-matchar app-typerna (`Orientation` literal / `FaqItem[]`). 4 callsites cast:ar nu manuellt — bör hanteras strukturellt.

**Problemfiler (cast tillagda i Batch 1):**
- `src/app/(admin)/admin/formats/[id]/page.tsx` — `as FormatData`
- `src/app/(admin)/admin/products/[id]/page.tsx` — `as ProductData`
- `src/app/(marketing)/p/[slug]/page.tsx` — `as 'portrait' | 'landscape' | 'square'`
- `src/app/(shop)/create/page.tsx` — samma

**Pre-existerande casts (kvarvarande):**
- `src/app/(admin)/admin/orders/[id]/page.tsx:68` (`as unknown as { name: string }` på `environment_scenes`)
- `src/lib/actions/environment-preview.ts:234` (samma)
- Övriga: grep efter `as unknown as` i `src/`

**Fix-alternativ:**
1. **DB-nivå:** ändra `orientation`-kolumnen från `text` till en riktig PostgreSQL enum → typgenereringen ger automatiskt literal type
2. **App-nivå:** validera Supabase-resultat via Zod-schema vid query-resultatet (mer kod men säkrast)
3. **Helper:** wrappa-cast i `src/lib/db-helpers.ts` med en typed `parseFormatRow()` etc.

### 4.11 Lägg på rate limit på resterande Server Actions

Se 4.2 — täck `auth.ts` (login, register), `contact.ts` (sendContactMessage).

---

## Sessionshandbok

**När du börjar en ny session och ska jobba på audit:**

1. Läs `## 🎯 Aktiv prioritet` i `ROADMAP.md`
2. Öppna motsvarande batch-sektion i denna fil
3. Plocka första `[ ]`-item, läs filen som refereras
4. Implementera → kör quality-review-skill för batchen
5. Markera `[x]` här + i `ROADMAP.md`
6. När hela batchen är klar:
   - Uppdatera `## Status:` raden i `ROADMAP.md` till `✅ Klar (YYYY-MM-DD)`
   - Uppdatera `## 🎯 Aktiv prioritet` till nästa batch
   - Commit: `chore(audit): complete Batch N — <kort beskrivning>`

**Vid avbrott mid-batch:** lägg en kommentar `<!-- in-progress: <kort note> -->` vid sista item du jobbade på. Nästa session kan plocka upp direkt.
