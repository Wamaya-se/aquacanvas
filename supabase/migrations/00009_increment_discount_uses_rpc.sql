CREATE OR REPLACE FUNCTION public.increment_discount_uses(discount_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.discount_codes
  SET current_uses = current_uses + 1
  WHERE id = discount_id;
$$;
