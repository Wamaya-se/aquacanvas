-- Aquacanvas — Seed Data
-- MVP style: Watercolor

insert into public.styles (name, slug, description, prompt_template, model_id, is_active, sort_order)
values
  (
    'Watercolor',
    'watercolor',
    'Transform your photo into a beautiful watercolor painting with soft, flowing colors and delicate brushstrokes.',
    'Transform this photograph into a traditional watercolor painting. Use soft wet-on-wet washes, visible pigment granulation, subtle cold-press paper texture, and gentle color bleeds at edges. Add delicate ink linework on key contours. Let white paper show through in highlights. Use a muted, natural, slightly desaturated Nordic-inspired palette. Keep the style loose and painterly but clearly representational. Preserve the exact composition, perspective, proportions, and placement of all elements from the original photo. Keep the same lighting, time of day, and season. High resolution, suitable for canvas printing.',
    'google/nano-banana-edit',
    true,
    1
  ),
  (
    'Oil Painting',
    'oil-painting',
    'Rich, textured oil painting style with bold colors and visible canvas texture.',
    'Transform this photo into an oil painting. Rich colors, thick brushstrokes, canvas texture, classical oil painting technique.',
    'stability-ai/stable-diffusion',
    false,
    2
  ),
  (
    'Charcoal Sketch',
    'charcoal-sketch',
    'Dramatic charcoal sketch with deep shadows and expressive linework.',
    'Transform this photo into a charcoal sketch. Black and white, expressive lines, dramatic shadows, textured paper.',
    'stability-ai/stable-diffusion',
    false,
    3
  ),
  (
    'Anime',
    'anime',
    'Japanese anime-inspired art style with vibrant colors and clean lines.',
    'Transform this photo into anime art style. Vibrant colors, clean lines, anime aesthetic, Studio Ghibli inspired.',
    'stability-ai/stable-diffusion',
    false,
    4
  ),
  (
    'Impressionism',
    'impressionism',
    'Inspired by Monet and Renoir — light-filled scenes with visible, energetic brushstrokes.',
    'Transform this photo into impressionist painting style. Visible brushstrokes, light effects, vibrant colors, Monet inspired.',
    'stability-ai/stable-diffusion',
    false,
    5
  );
