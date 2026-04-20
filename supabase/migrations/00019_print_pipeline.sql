-- Aquacanvas — Print-ready image pipeline schema (Fas 14 Batch A)
--
-- Introduces:
-- 1. upscale_status enum — tracks per-order upscale job lifecycle
-- 2. New columns on public.orders for print-file metadata
-- 3. public.app_settings table — runtime-tunable admin toggles (no redeploy)
-- 4. Initial setting: upscale_trigger = 'post_checkout'

-- =============================================================================
-- 1. ENUM: upscale_status
-- =============================================================================

create type public.upscale_status as enum (
  'pending',     -- order exists, upscale not yet started
  'processing',  -- Kie.ai Topaz task running
  'success',     -- print.jpg ready in storage
  'fail',        -- Kie returned fail, admin may retry
  'skipped'      -- deliberately skipped (e.g. test mode, dev)
);

-- =============================================================================
-- 2. ORDERS: print pipeline columns
-- =============================================================================

alter table public.orders
  add column print_image_path       text,
  add column print_dpi              integer,
  add column upscale_task_id        text,
  add column upscale_cost_time_ms   bigint,
  add column upscale_status         public.upscale_status;

comment on column public.orders.print_image_path     is 'Storage path to AdobeRGB print-ready JPEG (post-upscale).';
comment on column public.orders.print_dpi            is 'Effective DPI of print.jpg measured against selected format cm.';
comment on column public.orders.upscale_task_id      is 'Kie.ai Topaz upscale task ID.';
comment on column public.orders.upscale_cost_time_ms is 'Time spent in upscale task (costTime from Kie response).';
comment on column public.orders.upscale_status       is 'Status of the Topaz upscale job for this order.';

-- =============================================================================
-- 3. APP_SETTINGS: runtime-tunable key/value config
-- =============================================================================

create table public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.app_settings is
  'Runtime-tunable admin settings (upscale trigger mode, feature flags). Writes admin-only, reads public for server-side use.';

alter table public.app_settings enable row level security;

-- Public read: settings are non-sensitive runtime config consumed server-side.
create policy "Anyone can read app_settings"
  on public.app_settings for select
  using (true);

-- Admin-only writes via is_admin() SECURITY DEFINER function.
create policy "Admins can insert app_settings"
  on public.app_settings for insert
  with check (public.is_admin());

create policy "Admins can update app_settings"
  on public.app_settings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete app_settings"
  on public.app_settings for delete
  using (public.is_admin());

create trigger handle_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.handle_updated_at();

-- =============================================================================
-- 4. SEED: default upscale trigger
-- =============================================================================

insert into public.app_settings (key, value)
values ('upscale_trigger', '"post_checkout"'::jsonb)
on conflict (key) do nothing;
