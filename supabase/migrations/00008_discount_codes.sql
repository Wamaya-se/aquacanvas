-- Aquacanvas — Discount codes with Stripe Promotion Code integration

CREATE TABLE public.discount_codes (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                  text NOT NULL UNIQUE,
  stripe_coupon_id      text NOT NULL,
  stripe_promo_id       text,
  discount_percent      integer,
  discount_amount_cents integer,
  max_uses              integer,
  current_uses          integer NOT NULL DEFAULT 0,
  is_active             boolean NOT NULL DEFAULT true,
  expires_at            timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage discount codes"
  ON public.discount_codes FOR ALL
  USING (public.is_admin());

COMMENT ON TABLE public.discount_codes IS 'Discount/promo codes synced with Stripe Coupons and Promotion Codes.';
COMMENT ON COLUMN public.discount_codes.discount_percent IS 'Percentage discount (e.g. 20 for 20%). Mutually exclusive with discount_amount_cents.';
COMMENT ON COLUMN public.discount_codes.discount_amount_cents IS 'Fixed amount discount in öre. Mutually exclusive with discount_percent.';

-- Link orders to discount codes
ALTER TABLE public.orders ADD COLUMN discount_code_id uuid REFERENCES public.discount_codes(id);

CREATE INDEX orders_discount_code_id_idx ON public.orders(discount_code_id)
  WHERE discount_code_id IS NOT NULL;
