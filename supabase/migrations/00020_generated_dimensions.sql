-- Aquacanvas — AI-generated image dimensions (Fas 14 Batch F)
--
-- Captures the pixel dimensions of the AI output so we can compute DPI
-- eligibility per print format both in the UI (badges) and server-side
-- (defense-in-depth guard in checkout).
--
-- Filled in during `checkGenerationStatus` via `sharp.metadata()` on the
-- downloaded Kie result. Nullable for pre-existing rows; new rows get
-- populated as soon as the Kie task resolves.

alter table public.orders
  add column generated_width_px  integer,
  add column generated_height_px integer;

comment on column public.orders.generated_width_px  is
  'Pixel width of the raw AI output (pre-upscale). Used for DPI eligibility.';
comment on column public.orders.generated_height_px is
  'Pixel height of the raw AI output (pre-upscale). Used for DPI eligibility.';
