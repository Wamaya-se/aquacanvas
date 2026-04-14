-- Aquacanvas — AI cost tracking columns on orders
-- Tracks model used, generation time, and Kie.ai task ID per order.

ALTER TABLE public.orders ADD COLUMN ai_model text;
ALTER TABLE public.orders ADD COLUMN ai_cost_time_ms integer;
ALTER TABLE public.orders ADD COLUMN ai_task_id text;

COMMENT ON COLUMN public.orders.ai_model IS 'AI model identifier used for generation (e.g. google/nano-banana-edit)';
COMMENT ON COLUMN public.orders.ai_cost_time_ms IS 'AI generation wall-clock time in milliseconds from Kie.ai';
COMMENT ON COLUMN public.orders.ai_task_id IS 'External task ID from Kie.ai';
