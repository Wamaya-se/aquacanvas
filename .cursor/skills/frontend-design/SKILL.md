---
name: frontend-design
description: >-
  Enforces the Aquacanvas design system when building UI. Loads color tokens,
  typography rules, surface hierarchy, and component patterns from DESIGN.md.
  Use before writing any frontend component, page, or layout.
---

# Frontend Design — Aquacanvas

## When to invoke

Every time you create or edit a `.tsx` file that renders UI.

## Step 1 — Load the design system

Read `brand_assets/DESIGN.md` and internalize:

| Token group | Dark theme | Light theme |
|-------------|-----------|-------------|
| **Surfaces** | `#0c0f14` → `#121620` → `#1a1e2a` → `#222736` → `#2a3044` | `#fafbfc` → `#f5f6f8` → `#eef0f4` → `#e8eaef` → `#e0e3ea` |
| **Primary** | `#5eb5c4` (brand), `#4a9fad` (brand_container), `#0c2a30` (on_brand) | `#3a9aab` (brand), `#2d8a99` (brand_container), `#ffffff` (on_brand) |
| **Secondary** | `#2a1f4e` (secondary_container), `#c9b8f0` (on_secondary_container) | Adapted light values |
| **Tertiary** | `#7dd3fc` (focus glow) | `#0891b2` (focus glow) |
| **Outline** | `#3a3f52` at 20% opacity (Ghost Border) | `#d1d5e0` (Ghost Border) |
| **Gradients** | `#0c0f14` → `#121a2e` → `#1a1f4e` | `#f0f4ff` → `#e8f0fe` → `#f5f0ff` |
| **Fonts** | `font-heading` + `font-sans` (configure during setup) | Same |
| **Radii** | `xl` = 0.75rem (containers), `md` = 0.375rem (internal) | Same |

**Theme-aware classes:** Always use `text-foreground` (not `text-white`), `bg-surface-dim` (not `bg-black`), `text-muted-foreground` (not `text-white/50`).

## Step 2 — Check brand assets

Read the `brand_assets/` folder. Use real logos and assets — never placeholder where a real file exists.

## Step 3 — Use Shadcn/UI components

**All UI must be built with Shadcn/UI components.** Never write raw `<button>`, `<input>`, `<div>` cards when a Shadcn component exists.

### Available components (customize after install)

| Component | Import | Key variants |
|-----------|--------|-------------|
| `Button` | `@/components/ui/button` | `brand` (default), `secondary`, `ghost`, `outline`, `destructive`, `link` |
| `Input` | `@/components/ui/input` | Single style: `bg-surface-dim`, ghost border, tertiary focus glow |
| `Label` | `@/components/ui/label` | `text-foreground/70`, `font-sans` |
| `Card` | `@/components/ui/card` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `Avatar` | `@/components/ui/avatar` | `Avatar`, `AvatarImage`, `AvatarFallback` |
| `Textarea` | `@/components/ui/textarea` | Matches Input style |
| `Badge` | `@/components/ui/badge` | `default`, `secondary`, `outline` |
| `Separator` | `@/components/ui/separator` | `outline-variant/20` |

### Rules

- **Never override variant styles via `className`.** Add a new variant if a different look is needed.
- **Minor layout adjustments OK** via `className`: width, margin, etc.
- **New Shadcn component?** Install → immediately customize to match DESIGN.md → verify with `git diff`.
- **Never raw HTML** for buttons, inputs, cards, labels, avatars, textareas, badges, or dividers.

### Typography shorthand

| Role | Class | Maps to |
|------|-------|---------|
| Headings | `font-heading` | Configured heading font |
| Body/UI | `font-sans` | Configured body font |

Never use verbose arbitrary font syntax.

## Step 4 — Design system rules

### Surfaces
- Depth via background color shifts, never borders
- Nesting rule: child must be one surface tier higher than parent
- Glass elements: `backdrop-blur-[24px]` + surface at 70% opacity

### Typography
- `font-heading` for all headings, tight letter-spacing (`tracking-[-0.03em]`)
- `font-sans` for body, generous line-height (`leading-[1.7]`)
- Large size jumps between heading and body

### Shadows
- Never flat grey shadows
- Ambient only: `40px` blur, `6%` opacity, tinted

### Borders
- Never `1px solid` to define sections
- Ghost Border for inputs only: `outline-variant` at 20%
- Focus: border to `tertiary` at 100%

### Spacing
- No divider lines — use spacing or `<Separator />`
- `1rem` between list items, `2.75rem` between major sections
- White space is a luxury — use generously

### Animation
- Only `transform` and `opacity`
- Never `transition-all`
- Spring-style easing via Motion

### Image Treatment (critical for Aquacanvas)
- Artwork is the hero — give it maximum space
- Before/after comparisons: side-by-side or slider
- Gradient overlays for text legibility over images
- Subtle frame/shadow to make art feel "mounted"

## Step 5 — Verify

After building:

1. Take a screenshot via browser MCP at `http://localhost:3000`
2. Compare against reference image (if provided) or design system
3. Check: correct surface colors, font pairing, no default Tailwind colors, no hard borders, Shadcn used
4. Fix any mismatches
5. Repeat at least once more
