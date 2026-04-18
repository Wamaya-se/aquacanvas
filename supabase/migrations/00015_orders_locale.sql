-- Order locale — drives email template language.
-- Populated from Stripe checkout session metadata in the webhook at payment
-- time. Existing rows default to 'sv' (project default locale).

alter table public.orders
  add column if not exists locale text not null default 'sv'
    check (locale in ('sv', 'en'));

comment on column public.orders.locale is
  'Customer-facing locale captured at payment time. Drives email template language.';

create index if not exists orders_locale_idx on public.orders (locale);
