-- Aquacanvas — Product reviews
-- Customer-submitted reviews per product with admin moderation.
-- Approved rows are publicly readable and power aggregateRating in
-- Product JSON-LD on /p/[slug]. Submissions are rate-limited at the
-- Server Action layer; this migration enforces data integrity + RLS.

create type public.review_status as enum (
	'pending',
	'approved',
	'rejected'
);

create table public.product_reviews (
	id             uuid primary key default gen_random_uuid(),
	product_id     uuid not null references public.products(id) on delete cascade,
	order_id       uuid references public.orders(id) on delete set null,
	customer_name  text not null,
	customer_email text not null,
	rating         smallint not null check (rating between 1 and 5),
	title          text,
	body           text not null,
	status         public.review_status not null default 'pending',
	locale         text not null default 'sv' check (locale in ('sv', 'en')),
	created_at     timestamptz not null default now(),
	updated_at     timestamptz not null default now()
);

alter table public.product_reviews enable row level security;

create trigger product_reviews_updated_at
	before update on public.product_reviews
	for each row execute function public.handle_updated_at();

create index product_reviews_product_status_idx
	on public.product_reviews (product_id, status);

create index product_reviews_status_created_idx
	on public.product_reviews (status, created_at desc);

create index product_reviews_order_id_idx
	on public.product_reviews (order_id)
	where order_id is not null;

-- RLS: public read approved only. Pending/rejected rows are invisible to
-- anon + authenticated customers. customer_email is in the same row and
-- selectable — Server Actions must never return it to unauthenticated
-- callers (only admin UI exposes it).
create policy "Anyone can view approved reviews"
	on public.product_reviews for select
	using (status = 'approved');

-- RLS: public insert. Server Action gates with Zod + rate limiting and
-- always forces status = 'pending' server-side.
create policy "Anyone can submit a review"
	on public.product_reviews for insert
	with check (status = 'pending');

-- RLS: admin full access for moderation
create policy "Admins have full access to reviews"
	on public.product_reviews for all
	using (public.is_admin());

comment on table public.product_reviews is
	'Customer reviews per product. Pending on insert, admin moderates to approved/rejected. Approved rows power aggregateRating JSON-LD.';
comment on column public.product_reviews.order_id is
	'Optional link to the order that generated this review — powers verified-purchase badge.';
comment on column public.product_reviews.customer_email is
	'Captured for moderation + rate limiting. Never rendered to the public.';
