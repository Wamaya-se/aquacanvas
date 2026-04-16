-- Aquacanvas — Environment Scenes & Previews
-- Allows admin-managed room scenes and AI-generated composite previews
-- showing customer artwork placed in real room environments.

-- =============================================================================
-- ENVIRONMENT SCENES (admin-managed room images)
-- =============================================================================

create table public.environment_scenes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  image_path  text not null,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.environment_scenes enable row level security;

create trigger environment_scenes_updated_at
  before update on public.environment_scenes
  for each row execute function public.handle_updated_at();

create policy "Anyone can view active environment scenes"
  on public.environment_scenes for select
  using (is_active = true);

create policy "Admins have full access to environment scenes"
  on public.environment_scenes for all
  using (public.is_admin());

-- =============================================================================
-- ENVIRONMENT PREVIEWS (generated composites per order)
-- =============================================================================

create type public.preview_status as enum (
  'pending',
  'processing',
  'success',
  'fail'
);

create table public.environment_previews (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  scene_id        uuid not null references public.environment_scenes(id) on delete cascade,
  image_path      text,
  ai_task_id      text,
  ai_cost_time_ms integer,
  status          public.preview_status not null default 'pending',
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

alter table public.environment_previews enable row level security;

create index environment_previews_order_id_idx on public.environment_previews(order_id);

-- RLS: authenticated users read own (via order ownership)
create policy "Users can view own environment previews"
  on public.environment_previews for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = environment_previews.order_id
        and orders.user_id = (select auth.uid())
    )
  );

-- RLS: guest orders — accessible when order has guest_session_id
create policy "Guest environment previews accessible via order"
  on public.environment_previews for all
  using (
    exists (
      select 1 from public.orders
      where orders.id = environment_previews.order_id
        and orders.user_id is null
        and orders.guest_session_id is not null
    )
  );

-- RLS: admin full access
create policy "Admins have full access to environment previews"
  on public.environment_previews for all
  using (public.is_admin());

-- =============================================================================
-- STORAGE POLICIES for environment-related paths
-- =============================================================================

-- Public read for environment-scenes folder (admin-uploaded room images)
create policy "Public can read environment scene images"
  on storage.objects for select
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'environment-scenes'
  );

-- Public read for environment-previews folder (generated composites)
create policy "Public can read environment previews"
  on storage.objects for select
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[2] = 'environment-previews'
  );

-- =============================================================================
-- SEED: 3 initial environment scenes
-- =============================================================================

insert into public.environment_scenes (name, description, image_path, is_active, sort_order)
values
  (
    'Modern Living Room',
    'Bright, minimalist living room with neutral tones and natural light.',
    'environment-scenes/scene-1.jpeg',
    true,
    1
  ),
  (
    'Cozy Bedroom',
    'Warm bedroom setting with soft lighting and wooden accents.',
    'environment-scenes/scene-2.jpeg',
    true,
    2
  ),
  (
    'Creative Studio',
    'Contemporary studio space with industrial details and gallery walls.',
    'environment-scenes/scene-3.jpeg',
    true,
    3
  );
