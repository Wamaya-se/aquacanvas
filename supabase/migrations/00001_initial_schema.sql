-- Aquacanvas — Initial Schema
-- Tables: profiles, styles, orders, generated_images
-- Includes RLS policies, triggers, and helper functions

-- =============================================================================
-- ENUMS
-- =============================================================================

create type public.order_status as enum (
  'created',
  'processing',
  'generated',
  'paid',
  'shipped'
);

create type public.user_role as enum (
  'customer',
  'admin'
);

-- =============================================================================
-- HELPER FUNCTIONS (that don't reference tables)
-- =============================================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- PROFILES
-- =============================================================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  display_name text,
  avatar_url  text,
  role        public.user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- is_admin() must be created AFTER profiles table exists (SQL language validates at creation)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  )
$$;

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: users read/update own row (single policy with subselect for auth.uid())
create policy "Users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- RLS: admin full access
create policy "Admins have full access to profiles"
  on public.profiles for all
  using (public.is_admin());

-- =============================================================================
-- STYLES
-- =============================================================================

create table public.styles (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text,
  thumbnail_url   text,
  prompt_template text not null,
  model_id        text not null,
  is_active       boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.styles enable row level security;

-- RLS: public read
create policy "Anyone can view active styles"
  on public.styles for select
  using (is_active = true);

-- RLS: admin write
create policy "Admins have full access to styles"
  on public.styles for all
  using (public.is_admin());

-- =============================================================================
-- ORDERS
-- =============================================================================

create table public.orders (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  style_id             uuid not null references public.styles(id),
  status               public.order_status not null default 'created',
  original_image_path  text,
  generated_image_path text,
  price_cents          integer,
  stripe_session_id    text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.orders enable row level security;

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- RLS: users manage own orders (consolidated per operation for fewer permissive policies)
create policy "Users can view own orders"
  on public.orders for select
  using ((select auth.uid()) = user_id);

create policy "Users can create own orders"
  on public.orders for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own orders"
  on public.orders for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- RLS: admin full access
create policy "Admins have full access to orders"
  on public.orders for all
  using (public.is_admin());

-- =============================================================================
-- GENERATED IMAGES
-- =============================================================================

create table public.generated_images (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  image_path text not null,
  metadata   jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.generated_images enable row level security;

create index generated_images_order_id_idx on public.generated_images(order_id);

-- RLS: users read own (via order ownership, subselect for auth.uid())
create policy "Users can view own generated images"
  on public.generated_images for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = generated_images.order_id
        and orders.user_id = (select auth.uid())
    )
  );

-- RLS: admin full access
create policy "Admins have full access to generated images"
  on public.generated_images for all
  using (public.is_admin());

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Storage RLS: users upload to own folder
create policy "Users can upload own images"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

-- Storage RLS: users read own images
create policy "Users can read own images"
  on storage.objects for select
  using (
    bucket_id = 'images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

-- Storage RLS: public read for generated images (sharing)
create policy "Public can read generated images"
  on storage.objects for select
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[2] = 'generated'
  );

-- Storage RLS: admin full access
create policy "Admins have full storage access"
  on storage.objects for all
  using (public.is_admin());
