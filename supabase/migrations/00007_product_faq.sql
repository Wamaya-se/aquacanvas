-- Aquacanvas — FAQ column on products
-- Stores FAQ items as JSON array: [{"question": "...", "answer": "..."}, ...]

ALTER TABLE public.products ADD COLUMN faq jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.faq IS 'FAQ items for product page. JSON array of {question, answer} objects.';
