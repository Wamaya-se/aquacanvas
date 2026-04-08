---
name: supabase-patterns
description: >-
  Provides patterns for Supabase integration in Aquacanvas: client setup,
  Row Level Security policies, Edge Functions, type generation, and storage.
  Use when writing database queries, auth logic, RLS policies, or Edge Functions.
---

# Supabase Patterns — Aquacanvas

## Client setup

### Server-side (Server Components, Route Handlers, Server Actions)

Uses `src/lib/env.ts` for validated env access — never `process.env.VAR!`.

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'
import { env } from '@/lib/env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from Server Component — safe to ignore
          }
        },
      },
    }
  )
}
```

### Client-side (components with `'use client'`)

Must use inline `process.env.NEXT_PUBLIC_*!` — Next.js bundler replaces at build time.

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

### Middleware (auth session refresh + role-based routing)

Role-based routing reads from `user.app_metadata.role` — no DB query needed:

```typescript
const { data: { user } } = await supabase.auth.getUser()
const role = (user?.app_metadata?.role as string) ?? 'customer'
```

## Type generation

Always generate types after schema changes:

```bash
npx supabase gen types typescript --linked > src/types/supabase.ts
```

Use the `Database` type everywhere — never `any`.

## Row Level Security (RLS)

Every table must have RLS enabled. Common patterns:

### Users manage their own data

```sql
create policy "Users manage own orders"
  on orders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### Public read, authenticated write

```sql
create policy "Anyone can view styles"
  on styles for select
  using (true);
```

### Role-based access (admin)

Always use `is_admin()` SECURITY DEFINER function:

```sql
create policy "Admins have full access"
  on any_table for all
  using (public.is_admin());
```

## Query optimization

### Avoid N+1 queries

```typescript
// BAD — N+1
for (const order of orders) {
  const { data } = await supabase.from('generated_images').select('*').eq('order_id', order.id)
}

// GOOD — batched
const orderIds = orders.map((o) => o.id)
const { data: images } = await supabase.from('generated_images').select('*').in('order_id', orderIds)
const imageMap = new Map(images?.map((i) => [i.order_id, i]))
```

## Storage

### Upload pattern (for user photos)

```typescript
const { data, error } = await supabase.storage
  .from('images')
  .upload(`${userId}/originals/${orderId}.${ext}`, file, {
    cacheControl: '3600',
    upsert: false,
  })
```

### Get public URL

```typescript
const { data } = supabase.storage
  .from('images')
  .getPublicUrl(`${userId}/originals/${orderId}.${ext}`)
```

### Storage paths for Aquacanvas

| Purpose | Path | Example |
|---------|------|---------|
| Original upload | `{userId}/originals/{orderId}.{ext}` | `abc123/originals/order456.jpg` |
| Generated art | `{userId}/generated/{orderId}.{ext}` | `abc123/generated/order456.png` |
| Avatar | `{userId}/avatar.{ext}` | `abc123/avatar.jpg` |

## Edge Functions

Place in `supabase/functions/function-name/index.ts`. Use Deno runtime.

## Migrations

Place SQL migrations in `supabase/migrations/` with timestamp prefix:

```bash
npx supabase migration new create_orders_table
```

Always include `alter table ... enable row level security;` in every create table migration.

## Admin client (service-role)

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { env } from '@/lib/env'

export function createAdminClient() {
  return createSupabaseClient<Database>(
    env.supabaseUrl,
    env.supabaseServiceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
```

### When to use `createAdminClient()` vs `createClient()`

| Scenario | Client | Why |
|----------|--------|-----|
| Admin reads/writes | `createClient()` | RLS `is_admin()` grants access |
| Role check | `app_metadata.role` | JWT — no DB needed |
| Auth Admin API (`deleteUser`, `updateUserById`) | `createAdminClient()` | Requires service-role |

**Default to `createClient()`.** Only use admin client for Auth Admin API calls. Never import `createAdminClient` in `'use client'` files.

## RLS admin policies — avoid infinite recursion

```sql
-- GOOD — SECURITY DEFINER function
create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = '' as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
$$;

create policy "Admins have full access"
  on public.profiles for all
  using (public.is_admin());
```

Never inline subqueries on profiles in RLS policies — causes infinite recursion.

## Environment variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=     # Server-only
REPLICATE_API_TOKEN=           # Server-only, for AI
STRIPE_SECRET_KEY=             # Server-only
STRIPE_WEBHOOK_SECRET=         # Server-only
```

Access via `src/lib/env.ts` — never `process.env.VAR!`.
