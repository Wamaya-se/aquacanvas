-- Aquacanvas — Hero mockup (Fas 15 Batch A)
--
-- Adds a per-order "hero mockup" image that places the AI-generated artwork
-- onto one of three canvas-on-wall master images (vertical/horizontal/square)
-- via the same Kie `flux-2/flex-image-to-image` pipeline that powers the
-- environment previews.
--
-- The master files live in Supabase Storage under `hero-mockups/`. The
-- generated composites land under `hero-mockup-previews/${orderId}.png`.
-- Both folders get public-read policies so the `images` bucket stays
-- consistent with `environment-scenes/` and `environment-previews/`.
--
-- The `preview_status` enum (defined in 00012) is reused for status
-- tracking on the order row — no new enum needed.

-- =============================================================================
-- ORDERS COLUMNS
-- =============================================================================

alter table public.orders
  add column hero_mockup_image_path    text,
  add column hero_mockup_status        public.preview_status not null default 'pending',
  add column hero_mockup_task_id       text,
  add column hero_mockup_ai_cost_time_ms integer;

comment on column public.orders.hero_mockup_image_path is
  'Storage path to the AI-composited canvas-on-wall mockup for this order.';
comment on column public.orders.hero_mockup_status is
  'Lifecycle of the hero mockup generation: pending → processing → success|fail.';
comment on column public.orders.hero_mockup_task_id is
  'Kie task ID for the in-flight or last hero mockup generation.';
comment on column public.orders.hero_mockup_ai_cost_time_ms is
  'Kie-reported cost time (ms) for the hero mockup task. Used for metrics.';

-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================

-- Public read for hero-mockups folder (static master images uploaded once via
-- seed script or admin dashboard — the three orientation variants).
create policy "Public can read hero mockup masters"
  on storage.objects for select
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'hero-mockups'
  );

-- Public read for hero-mockup-previews folder (per-order generated composites,
-- stored under {userId|guest}/hero-mockup-previews/{orderId}.png — the depth-2
-- lookup mirrors environment-previews).
create policy "Public can read hero mockup previews"
  on storage.objects for select
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[2] = 'hero-mockup-previews'
  );
