-- Aquacanvas — Products table + orders.product_id
-- Products represent niche landing pages (e.g. "Stuga", "Husdjur", "Fordon")
-- Each product is tied to a style and has its own SEO content.

-- =============================================================================
-- PRODUCTS
-- =============================================================================

create table public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  headline        text not null,
  description     text,
  body            text,
  hero_image_url  text,
  example_before  text,
  example_after   text,
  style_id        uuid not null references public.styles(id),
  price_cents     integer,
  is_active       boolean not null default true,
  sort_order      integer not null default 0,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.products enable row level security;

create index products_slug_idx on public.products(slug);
create index products_style_id_idx on public.products(style_id);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

comment on column public.products.price_cents is 'Override price in öre. NULL = use style default price.';

-- RLS: public read active products
create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

-- RLS: admin full CRUD
create policy "Admins have full access to products"
  on public.products for all
  using (public.is_admin());

-- =============================================================================
-- ORDERS: add product_id (nullable FK)
-- =============================================================================

alter table public.orders
  add column product_id uuid references public.products(id);

create index orders_product_id_idx on public.orders(product_id)
  where product_id is not null;

-- =============================================================================
-- ORDERS: add customer_email (captured from Stripe webhook)
-- =============================================================================

alter table public.orders
  add column customer_email text;

-- =============================================================================
-- STORAGE: product images bucket policies
-- =============================================================================

-- Allow public reads of product-images folder
create policy "Public can read product images"
  on storage.objects for select
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'products'
  );

-- Admin can upload product images
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'products'
    and public.is_admin()
  );

-- Admin can delete product images
create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'products'
    and public.is_admin()
  );
