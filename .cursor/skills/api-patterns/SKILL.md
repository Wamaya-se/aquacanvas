---
name: api-patterns
description: >-
  Defines patterns for Server Actions, Route Handlers, and data fetching in
  Aquacanvas. Covers validation, auth guards, error format, caching, revalidation,
  and security. Use when building any server-side data flow.
---

# API Patterns — Aquacanvas

## Golden rule

**All server-side mutations go through Server Actions. Route Handlers are only for webhooks, external API integrations, and streaming responses.**

---

## 1. Server Actions

### File convention

```
src/app/(shop)/create/
├── page.tsx
├── actions.ts       ← Server Actions for this page
└── loading.tsx

src/lib/actions/
├── auth.ts          ← Shared auth actions
├── orders.ts        ← Order CRUD
├── ai.ts            ← AI generation actions
└── stripe.ts        ← Payment actions
```

### Consistent return type

```tsx
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string }
```

### Complete action template

```tsx
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { orderSchema } from '@/validators/order'
import type { ActionResult } from '@/types/actions'

export async function createOrder(formData: FormData): Promise<ActionResult<{ id: string }>> {
  // 1. Auth guard
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Validate input
  const raw = Object.fromEntries(formData)
  const parsed = orderSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: 'errors.invalidInput',
      field: parsed.error.issues[0]?.path[0] as string,
    }
  }

  // 3. Mutation
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      style_id: parsed.data.styleId,
      status: 'created',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[createOrder]', error)
    return { success: false, error: 'errors.orderCreationFailed' }
  }

  // 4. Revalidate and return
  revalidatePath('/dashboard/orders')
  return { success: true, data: { id: data.id } }
}
```

### Security rules

1. **Always authenticate** — `supabase.auth.getUser()`
2. **Always validate** — Zod parse all input
3. **Always authorize** — verify user has permission
4. **Never trust client data** — IDs, prices from server only
5. **Never expose internals** — log error, return safe message
6. **Fail closed** — deny on any auth/permission error
7. **Error keys, not strings** — `ActionResult.error` must be i18n key from `errors` namespace
8. **Validate all UUIDs** — `z.string().uuid()` before query use
9. **HTML ↔ Zod alignment** — HTML attrs must match Zod constraints

### AI generation action pattern

```tsx
'use server'

export async function generateArtwork(formData: FormData): Promise<ActionResult<{ imageUrl: string }>> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  // Validate file
  const file = formData.get('photo')
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: 'errors.noFileUploaded', field: 'photo' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'errors.fileTooLarge', field: 'photo' }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'errors.invalidFileType', field: 'photo' }
  }

  // Upload original to Storage
  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
  const path = `${user.id}/originals/${orderId}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(path, file, { contentType: file.type })

  if (uploadError) {
    console.error('[generateArtwork] upload', uploadError)
    return { success: false, error: 'errors.uploadFailed' }
  }

  // Call AI service (server-side only)
  const replicate = getReplicate()
  const output = await replicate.run('model/version', {
    input: { image: publicUrl, prompt: 'watercolor painting style' }
  })

  // Save generated image and update order...
  return { success: true, data: { imageUrl: generatedUrl } }
}
```

### Admin action template

```tsx
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')
  if (user.app_metadata?.role !== 'admin') redirect('/dashboard')
  return { user, supabase }
}
```

### `'use server'` + unguarded helpers — NEVER mix

**Rule:** Every exported async function in a `'use server'` file is auto-exposed
as an RPC endpoint the browser can invoke. Do NOT put unguarded helpers (e.g.
"called from webhook after signature check", "called from auth'd action") in
the same file as `'use server'` actions.

**Pattern:** Split internal helpers into a dedicated `server-only` module.

```tsx
// src/lib/print-pipeline/trigger-upscale.ts
import 'server-only'

export async function triggerUpscaleInternal(orderId: string) {
  // No auth check — callers must authorize.
  // Cannot be invoked from the browser because this module lacks `'use server'`
  // AND carries `server-only` so it errors at build time if a client tree
  // ever imports it.
}

// src/lib/actions/upscale.ts
'use server'
import { triggerUpscaleInternal } from '@/lib/print-pipeline/trigger-upscale'

// Admin-guarded wrapper — the only RPC-exposed path.
export async function triggerUpscale(orderId: string) {
  await requireAdmin()
  return triggerUpscaleInternal(orderId)
}

// Route handlers / other server actions import triggerUpscaleInternal
// directly — they have their own authorization context.
```

---

## 2. Route Handlers

### When to use

- Webhooks (Stripe, Replicate)
- File downloads
- Streaming responses (AI generation progress)

### Webhook security

Always verify signatures. Never trust payloads without verification.

---

## 3. Data fetching

### Server Components — direct queries (preferred)

```tsx
export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, status, style:styles(name, slug), created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Failed to load orders')
  if (!orders.length) return <EmptyState title="No orders yet" />
  return <OrderList orders={orders} />
}
```

### `revalidatePath` — render-safe rule

**Never call `revalidatePath` during Server Component rendering.** Only in Server Actions or Route Handlers.

---

## Checklist

- [ ] Server Action starts with auth guard
- [ ] All input validated through Zod — no `as string` on FormData
- [ ] Returns `ActionResult` with i18n error keys
- [ ] Internal errors logged, safe message returned
- [ ] `revalidatePath` only in mutations
- [ ] Webhook signatures verified
- [ ] AI API calls are server-side only
- [ ] File uploads validated for size and type
- [ ] Env vars via `src/lib/env.ts`
