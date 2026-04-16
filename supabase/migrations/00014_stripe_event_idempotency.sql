-- Stripe webhook idempotency
-- Prevents duplicate processing of the same Stripe event (Stripe retries on
-- network failures and may deliver the same event multiple times).
-- The webhook route inserts the event id with `on conflict do nothing`; if no
-- row is returned, the event has already been processed and is skipped.

create table public.processed_stripe_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

comment on table public.processed_stripe_events is
  'Tracks Stripe webhook events that have been successfully processed. Used for idempotency.';

-- Index supports cleanup of old events (older than 30 days).
create index processed_stripe_events_processed_at_idx
  on public.processed_stripe_events (processed_at);

-- RLS: only the service role (used by the webhook route) may read/write.
-- Anon and authenticated users have no access.
alter table public.processed_stripe_events enable row level security;
