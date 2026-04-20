-- Aquacanvas — Disable print formats larger than what nano-banana-edit can serve
--
-- Background: nano-banana-edit outputs ~1184 px longest side deterministically.
-- After 4x Topaz upscale (~4736 px) the following formats cannot meet the
-- tryckeri DPI spec (300/200/150 ppi depending on size), so they must not be
-- orderable until we either (a) switch to nano-banana-pro at 2K, or
-- (b) re-negotiate DPI thresholds with the printing partner.
--
-- Formats kept active: 30×40 (portrait), 40×30 (landscape), 30×30 (square).
-- All clear 100%+ of tryckeri target at 4x upscale.
--
-- Re-activation path: flip is_active back to true, or re-seed rows if deleted.

update public.print_formats
set is_active = false
where slug in (
  'canvas-50x70',
  'canvas-70x100',
  'canvas-70x50',
  'canvas-100x70',
  'canvas-50x50',
  'canvas-70x70'
);
