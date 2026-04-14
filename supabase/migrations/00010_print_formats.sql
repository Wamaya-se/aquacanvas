-- Aquacanvas — Print formats (canvas sizes, framed posters, etc.)
-- Phase 8: start with canvas prints only

-- =============================================================================
-- PRINT FORMATS
-- =============================================================================

create table public.print_formats (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  format_type text not null default 'canvas',
  width_cm    integer not null,
  height_cm   integer not null,
  price_cents integer not null default 0,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.print_formats enable row level security;

create policy "Anyone can view active print formats"
  on public.print_formats for select
  using (is_active = true);

create policy "Admins have full access to print formats"
  on public.print_formats for all
  using (public.is_admin());

-- =============================================================================
-- ORDERS: add format_id
-- =============================================================================

alter table public.orders
  add column format_id uuid references public.print_formats(id);

comment on column public.orders.format_id is 'Selected print format (canvas size, poster, etc.)';

-- =============================================================================
-- SEED: Canvas sizes (SEK pricing)
-- =============================================================================

insert into public.print_formats (name, slug, description, format_type, width_cm, height_cm, price_cents, is_active, sort_order)
values
  (
    'Canvas 30×40 cm',
    'canvas-30x40',
    'Compact canvas print, perfect for desks and small walls.',
    'canvas',
    30, 40,
    14900,
    true,
    1
  ),
  (
    'Canvas 50×70 cm',
    'canvas-50x70',
    'Our most popular size — ideal for living rooms and offices.',
    'canvas',
    50, 70,
    24900,
    true,
    2
  ),
  (
    'Canvas 70×100 cm',
    'canvas-70x100',
    'Statement piece for feature walls.',
    'canvas',
    70, 100,
    39900,
    true,
    3
  );
