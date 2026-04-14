-- Aquacanvas — Add pricing to styles
-- Allows per-style pricing (future: different prices for oil, anime, etc.)

alter table public.styles
  add column price_cents integer not null default 34900;

comment on column public.styles.price_cents is 'Price in öre (SEK cents). 34900 = 349 SEK';
