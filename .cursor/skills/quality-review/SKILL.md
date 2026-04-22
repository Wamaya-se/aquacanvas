---
name: quality-review
description: >-
  Post-development quality checklist. Run after completing a feature, page, or
  significant refactor. Catches security, a11y, SEO, i18n, and code quality
  issues before they accumulate.
---

# Quality Review — Aquacanvas

## When to invoke

After completing any feature, page, component, or significant code change. Final gate before considering work "done".

## Checklist

---

### 1. Security

- [ ] **Auth guard**: Every protected route behind middleware AND layout-level `getUser()`.
- [ ] **Input validation**: All Server Actions validate with Zod. No `as string` on FormData.
- [ ] **UUID validation**: Every ID parameter validated with `z.string().uuid()`.
- [ ] **Safe error messages**: Never return raw error messages to client.
- [ ] **ActionResult pattern**: All Server Actions return `ActionResult<T>`.
- [ ] **No open redirects**: Validate URLs against allowlist.
- [ ] **Env vars**: No `!` assertions — use `src/lib/env.ts`.
- [ ] **AI API keys**: Never exposed to client. All AI calls server-side.
- [ ] **File uploads**: Validated for size and MIME type server-side.

### 2. Accessibility (WCAG 2.1 AA)

- [ ] **One `h1` per page**: Visible on all viewports.
- [ ] **Heading hierarchy**: No skips (h1 → h2 → h3).
- [ ] **Landmarks**: `<main>`, `<nav>`, `<header>`, `<footer>` used correctly.
- [ ] **Skip link**: Root layout has "Skip to main content".
- [ ] **Form errors**: `role="alert"`, `aria-invalid`, `aria-describedby`.
- [ ] **Keyboard**: All interactive elements reachable via Tab.
- [ ] **Decorative SVGs**: `aria-hidden="true"`.
- [ ] **Reduced motion**: `prefers-reduced-motion` respected.
- [ ] **Color contrast**: Meets 4.5:1 in both themes.
- [ ] **Links**: No `href="#"` as sole destination.
- [ ] **Images**: Meaningful `alt` text. Decorative = `alt=""`.

### 3. SEO

- [ ] **Metadata**: Every page has `generateMetadata` with localized title/description.
- [ ] **Open Graph + Twitter Cards**: Public pages include these.
- [ ] **JSON-LD**: Product pages, landing page have structured data.
- [ ] **Semantic HTML**: One h1, logical hierarchy, landmarks.
- [ ] **`sitemap.ts` + `robots.ts`**: Exist and are up to date.

### 4. Internationalization (i18n)

- [ ] **No hardcoded strings**: All text via next-intl.
- [ ] **Messages in BOTH locales**: New strings added to `messages/en.json` AND `messages/sv.json` (never only one).
- [ ] **Correct namespace**: Keys placed at the correct nested path (e.g. `admin.meta.dashboardTitle`, not `admin.dashboardTitle`). Check the `getTranslations(...)`/`useTranslations(...)` call in the file.
- [ ] **Locale-aware metadata**: `generateMetadata` uses `getTranslations`.
- [ ] **DB content**: System-defined content uses slug → locale pattern.
- [ ] **Audit passes**: `npm run i18n:audit` returns exit code 0 — no missing keys, no drift between locales.

### 5. Code quality

- [ ] **Shadcn components**: All primitives from `@/components/ui/`.
- [ ] **No variant overrides via className**: New looks → new variant.
- [ ] **Typography**: `font-heading` / `font-sans` only.
- [ ] **Design tokens**: No default Tailwind colors.
- [ ] **TypeScript**: No `any`, no unnecessary `as` casts.
- [ ] **No unused imports**.
- [ ] **File naming**: kebab-case files, PascalCase exports.

### 6. Config & infrastructure

- [ ] **`next/image` remote patterns**: New external image sources added to `next.config.ts`.
- [ ] **Server Actions body size**: Sufficient for file uploads in `next.config.ts`.

### 7. Lessons learned

- [ ] **New patterns?** Add concise rules to relevant files if genuinely reusable.
- [ ] **Keep it lean.** 1-2 sentences per rule.
- [ ] **Update ROADMAP.md** with completed work.

---

## How to use

1. Read through each section's checkboxes
2. For any ❌, fix immediately
3. If a fix requires discussion, raise with the user
4. Section 7: reflect and update rules/skills if needed
