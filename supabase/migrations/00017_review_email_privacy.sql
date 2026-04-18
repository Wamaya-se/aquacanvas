-- Aquacanvas — Lock down customer_email on product_reviews.
--
-- Migration 00016 grants public SELECT on approved reviews via RLS. The
-- row-level policy returns the entire row — including customer_email —
-- to any PostgREST caller using the anon key. That's a PII leak even
-- though our own UI never queries that column publicly.
--
-- Fix: revoke column-level SELECT/UPDATE on customer_email from the
-- anon and authenticated roles. Admin reads of the email must go
-- through createAdminClient() (service_role bypasses column grants).
-- INSERT on the full row stays allowed (server action + Zod gates it).

revoke select (customer_email), update (customer_email)
	on public.product_reviews from anon, authenticated;

comment on column public.product_reviews.customer_email is
	'PII. Only readable by service_role (admin UI via createAdminClient). Never exposed to anon/authenticated callers.';
