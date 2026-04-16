-- Aquacanvas — Orientation support for print formats + orders
-- Adds orientation column, landscape & square seed data

-- =============================================================================
-- PRINT FORMATS: add orientation column
-- =============================================================================

alter table public.print_formats
  add column orientation text not null default 'portrait';

alter table public.print_formats
  add constraint print_formats_orientation_check
  check (orientation in ('portrait', 'landscape', 'square'));

update public.print_formats
  set orientation = 'portrait'
  where width_cm < height_cm;

-- =============================================================================
-- ORDERS: add orientation column
-- =============================================================================

alter table public.orders
  add column orientation text;

alter table public.orders
  add constraint orders_orientation_check
  check (orientation is null or orientation in ('portrait', 'landscape', 'square'));

comment on column public.orders.orientation is 'Canvas orientation chosen by customer before AI generation';

-- =============================================================================
-- SEED: Landscape formats (mirrored portrait dimensions, same pricing)
-- =============================================================================

insert into public.print_formats (name, slug, description, format_type, width_cm, height_cm, price_cents, is_active, sort_order, orientation)
values
  (
    'Canvas 40×30 cm',
    'canvas-40x30',
    'Compact landscape canvas, perfect for desks and small walls.',
    'canvas',
    40, 30,
    14900,
    true,
    4,
    'landscape'
  ),
  (
    'Canvas 70×50 cm',
    'canvas-70x50',
    'Popular landscape size — ideal for living rooms and offices.',
    'canvas',
    70, 50,
    24900,
    true,
    5,
    'landscape'
  ),
  (
    'Canvas 100×70 cm',
    'canvas-100x70',
    'Large landscape canvas for feature walls.',
    'canvas',
    100, 70,
    39900,
    true,
    6,
    'landscape'
  );

-- =============================================================================
-- SEED: Square formats
-- =============================================================================

insert into public.print_formats (name, slug, description, format_type, width_cm, height_cm, price_cents, is_active, sort_order, orientation)
values
  (
    'Canvas 30×30 cm',
    'canvas-30x30',
    'Small square canvas, great for compact spaces.',
    'canvas',
    30, 30,
    12900,
    true,
    7,
    'square'
  ),
  (
    'Canvas 50×50 cm',
    'canvas-50x50',
    'Medium square canvas — a modern classic.',
    'canvas',
    50, 50,
    19900,
    true,
    8,
    'square'
  ),
  (
    'Canvas 70×70 cm',
    'canvas-70x70',
    'Large square canvas for bold statement pieces.',
    'canvas',
    70, 70,
    32900,
    true,
    9,
    'square'
  );
