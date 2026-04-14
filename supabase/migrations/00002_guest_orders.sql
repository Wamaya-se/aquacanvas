-- Guest orders: allow unauthenticated visitors to generate artwork
-- Orders can now be created without a user account.
-- When a guest later signs up/logs in, their orders can be claimed via guest_session_id.

-- Make user_id nullable so guests can create orders
alter table public.orders
  alter column user_id drop not null;

-- Add guest_session_id for tracking guest orders
alter table public.orders
  add column guest_session_id text;

create index orders_guest_session_id_idx on public.orders(guest_session_id)
  where guest_session_id is not null;

-- RLS: allow insert with null user_id when guest_session_id is provided
-- (service-role bypasses RLS, but we add a policy for completeness)
create policy "Service role can manage guest orders"
  on public.orders for all
  using (user_id is null and guest_session_id is not null);

-- RLS: allow generated_images insert/select for guest orders
create policy "Guest generated images accessible via order"
  on public.generated_images for all
  using (
    exists (
      select 1 from public.orders
      where orders.id = generated_images.order_id
        and orders.user_id is null
        and orders.guest_session_id is not null
    )
  );

-- Storage: allow public uploads to guest/ folder
create policy "Guest uploads to guest folder"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'guest'
  );

-- Storage: allow public read of guest folder
create policy "Public can read guest images"
  on storage.objects for select
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'guest'
  );
