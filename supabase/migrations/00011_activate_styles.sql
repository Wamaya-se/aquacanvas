-- Aquacanvas — Activate all art styles with tuned prompts
-- Phase 8: all 5 styles active

update public.styles set
  is_active = true,
  model_id = 'google/nano-banana-edit',
  prompt_template = 'Transform this photograph into a rich oil painting. Use thick impasto brushstrokes with visible canvas texture, deep saturated colors, and dramatic chiaroscuro lighting. Build up layers like a classical oil painting — rich darks, warm mid-tones, and luminous highlights. Keep the palette bold and slightly warm. Preserve the exact composition, perspective, proportions, and placement of all elements from the original photo. Maintain the same lighting direction, time of day, and season. High resolution, suitable for canvas printing.',
  price_cents = 39900
where slug = 'oil-painting';

update public.styles set
  is_active = true,
  model_id = 'google/nano-banana-edit',
  prompt_template = 'Transform this photograph into a charcoal sketch on heavy drawing paper. Use expressive, gestural charcoal strokes with a range from soft grey to deep velvety blacks. Create dramatic contrast with strong shadows and bright white highlights where paper shows through. Add subtle smudging and blending for atmospheric depth. Keep the style loose yet representational, like a skilled artist''s studio sketch. Preserve the exact composition, perspective, proportions, and placement of all elements from the original photo. Maintain the same lighting and mood. High resolution, monochrome, suitable for printing.',
  price_cents = 29900
where slug = 'charcoal-sketch';

update public.styles set
  is_active = true,
  model_id = 'google/nano-banana-edit',
  prompt_template = 'Transform this photograph into a high-quality anime illustration. Use clean, precise linework with smooth cel-shading. Apply vibrant, saturated colors with soft gradient highlights and defined shadow edges. Style inspired by modern anime feature films — detailed backgrounds, expressive character rendering, and atmospheric lighting effects like lens flares and bokeh. Preserve the exact composition, perspective, proportions, and placement of all elements from the original photo. Maintain the same lighting and time of day. High resolution, suitable for printing.',
  price_cents = 34900
where slug = 'anime';

update public.styles set
  is_active = true,
  model_id = 'google/nano-banana-edit',
  prompt_template = 'Transform this photograph into an Impressionist painting inspired by Claude Monet and Pierre-Auguste Renoir. Use visible, energetic brushstrokes with a focus on capturing light and atmosphere. Apply a luminous, slightly warm palette with dappled sunlight effects. Let colors blend optically through adjacent brushstrokes rather than smooth gradients. Convey a sense of movement and fleeting beauty. Preserve the exact composition, perspective, proportions, and placement of all elements from the original photo. Maintain the same time of day, season, and lighting. High resolution, suitable for canvas printing.',
  price_cents = 39900
where slug = 'impressionism';
