---
name: i18n-patterns
description: >-
  Enforces internationalization patterns using next-intl. Ensures all
  user-facing strings go through the translation system, never hardcoded.
  Use when creating or editing any component that renders text.
---

# i18n Patterns — Aquacanvas

## Golden rule

**Never hardcode user-facing strings in JSX.** Every visible text must come from `messages/{locale}.json` via `next-intl`.

## How to use translations

### Server Components (default)

```tsx
import { getTranslations } from 'next-intl/server'

export default async function HeroSection() {
  const t = await getTranslations('hero')

  return (
    <>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </>
  )
}
```

### Client Components

```tsx
'use client'

import { useTranslations } from 'next-intl'

export function UploadForm() {
  const t = useTranslations('shop')

  return <Button>{t('uploadPhoto')}</Button>
}
```

### With variables

```json
{ "orderCount": "{count} orders completed" }
```

```tsx
<span>{t('orderCount', { count: stats.totalOrders })}</span>
```

## Message file structure

```
messages/
├── en.json    (English — default & fallback)
└── sv.json    (Swedish — added when needed)
```

### Namespace convention

```json
{
  "common": { },      // Shared: nav, buttons, footer, brand name
  "nav": { },         // Navigation links
  "hero": { },        // Landing page hero
  "shop": { },        // Upload, style selection, preview
  "checkout": { },    // Payment flow
  "auth": { },        // Login, register
  "dashboard": { },   // User account, orders
  "admin": { },       // Admin panel
  "footer": { },      // Footer content
  "metadata": { },    // Page titles/descriptions
  "errors": { },      // Error messages (i18n keys from Server Actions)
  "styles": { }       // Art style names and descriptions
}
```

### Key naming

- **camelCase** for all keys: `uploadPhoto`, not `upload_photo`
- **Descriptive**: `emailPlaceholder`, not `placeholder1`
- **Action verbs for buttons**: `createOrder`, `uploadPhoto`, `chooseStyle`

## Validation error messages and aria-labels

Client-side errors and `aria-label` values must use `useTranslations()`:

```tsx
const t = useTranslations('shop')
<button aria-label={t('removeImage')}>...</button>
```

## What NOT to translate

- Brand names (`Aquacanvas`)
- Technical identifiers
- Numbers and dates — use `next-intl` formatters

## SEO + i18n

Every public page must have localized metadata:

```tsx
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('shop')

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
    },
  }
}
```

## Database-driven i18n (the slug pattern)

Art style names stored in DB as slugs, display text in locale files:

```
// Database: styles.slug = 'watercolor'
// messages/en.json: { "styles": { "watercolor": "Watercolor", "oilPainting": "Oil Painting" } }
// messages/sv.json: { "styles": { "watercolor": "Akvarell", "oilPainting": "Oljemålning" } }

const t = useTranslations('styles')
<span>{t(style.slug)}</span>
```

## Server Action error messages

Server Actions return i18n keys from the `errors` namespace:

```tsx
return { success: false, error: 'errors.orderNotFound' }
```

Client components translate via `useActionError()` hook.

## Checklist

- [ ] No hardcoded user-facing strings in JSX
- [ ] Server Action errors use `errors.*` i18n keys
- [ ] New strings added to `messages/en.json`
- [ ] Correct namespace used
- [ ] Variables use `{name}` syntax
- [ ] Dates and numbers use `useFormatter()`
- [ ] Page has `generateMetadata` with localized title/description
- [ ] DB-driven display content uses slug → locale pattern
- [ ] Public pages include Open Graph meta from locale files
