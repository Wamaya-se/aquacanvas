---
name: error-handling
description: >-
  Enforces consistent error handling, loading states, empty states, and error
  boundaries across Aquacanvas. Use when building pages, forms, data-fetching
  components, or any flow that can fail.
---

# Error Handling — Aquacanvas

## Golden rule

**Every data-fetching path must account for three states: loading, error, and empty.** Never render a page that silently fails or shows a blank screen.

---

## 1. Server-side errors

### Never expose internal details

```tsx
// BAD
if (error) return { error: error.message }

// GOOD
if (error) {
  console.error('[createOrder]', error)
  return { success: false, error: 'errors.orderCreationFailed' }
}
```

### Typed result pattern

All Server Actions return:

```tsx
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string }
```

### Sensitive operations — fail closed

For auth, payments, and AI generation: deny access on any error, never fail open.

---

## 2. Client-side error handling

### Form submissions

```tsx
'use client'

const [error, setError] = useState<string | null>(null)

async function handleSubmit(formData: FormData) {
  setError(null)
  const result = await createOrder(formData)
  if (!result.success) {
    setError(result.error)
  }
}
```

### AI generation errors

Image generation can fail for various reasons. Always handle:
- **Timeout** — generation took too long
- **Content policy** — AI rejected the image
- **Rate limit** — too many requests
- **API error** — service unavailable

Show specific, helpful error messages for each case.

---

## 3. Error boundaries

### Required `error.tsx` locations

```
src/app/error.tsx                    — root
src/app/(shop)/error.tsx             — shop pages
src/app/(dashboard)/error.tsx        — dashboard
src/app/(admin)/error.tsx            — admin
src/app/(auth)/error.tsx             — auth pages
```

Pattern:

```tsx
'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RouteGroupError({ error, reset }: ErrorPageProps) {
  const t = useTranslations('common')

  useEffect(() => {
    console.error('[Error]', error)
  }, [error])

  return (
    <main id="main-content" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
      <h1 className="font-heading text-2xl font-bold tracking-[-0.03em] text-foreground">
        {t('errorTitle')}
      </h1>
      <p className="max-w-md text-center font-sans text-sm leading-[1.7] text-muted-foreground">
        {t('errorDescription')}
      </p>
      <Button onClick={reset}>{t('tryAgain')}</Button>
    </main>
  )
}
```

---

## 4. Loading states

### Skeleton components over spinners

```tsx
export function OrderCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-surface-container-high p-6">
      <div className="h-48 rounded-lg bg-surface-container-highest" />
      <div className="mt-4 h-5 w-2/3 rounded bg-surface-container-highest" />
      <div className="mt-2 h-4 w-1/3 rounded bg-surface-container-highest" />
    </div>
  )
}
```

### AI generation loading

Image generation takes time (10-60s). Show:
- Progress indicator (if the AI API provides progress)
- Estimated time remaining
- "Processing your artwork..." message
- Never a blank screen

### `loading.tsx` convention

Place alongside `page.tsx` for automatic Suspense:

```
src/app/(shop)/create/loading.tsx
src/app/(shop)/create/page.tsx
```

---

## 5. Empty states

```tsx
interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <h3 className="font-heading text-lg font-bold tracking-[-0.03em] text-foreground">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm font-sans text-sm leading-[1.7] text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
```

---

## Checklist

- [ ] Server Actions return `ActionResult` — never throw to client
- [ ] Internal errors logged, safe i18n key returned
- [ ] Auth/payment/AI failures: fail closed
- [ ] Every data-fetching component handles loading, error, and empty
- [ ] `error.tsx` at root and in key route groups
- [ ] `loading.tsx` with skeletons for pages with async data
- [ ] AI generation has specific error handling (timeout, content policy, rate limit)
- [ ] Buttons disabled during async operations
- [ ] Form error containers have `role="alert"`
- [ ] User-facing text uses next-intl translations
