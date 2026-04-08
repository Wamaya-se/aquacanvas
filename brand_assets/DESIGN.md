# Design System Document: Aquacanvas

## 1. Overview & Creative North Star

### The Creative North Star: "Digital Atelier"
This design system captures the feeling of a modern art studio — clean, spacious, and refined. The interface should feel like a curated gallery where technology serves the art, not the other way around. It balances the warmth of watercolor art with the precision of a premium e-commerce experience.

We achieve this through the **Digital Atelier** approach:
* **Generous Whitespace:** Letting the artwork breathe. Every element has room to exist without feeling crowded.
* **Warm Depth:** Using deep indigo and warm teal tones to create a sense of depth, punctuated by watercolor-inspired accent colors.
* **Confident Simplicity:** Clean typography that doesn't compete with the art. The UI frames the product, never overshadows it.

---

## 2. Colors & Surface Logic

The palette supports both **dark** (default) and **light** themes via CSS variables in `globals.css`. All color references use theme-aware tokens — never hardcoded hex or `text-white`/`bg-black`.

### Dark theme (default)
A deep, gallery-like environment that makes artwork pop.

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#0c0f14` | Page background — the void |
| `surface-dim` | `#0c0f14` | Alias for body background |
| `surface-container-low` | `#121620` | Section backgrounds |
| `surface-container` | `#1a1e2a` | Content blocks |
| `surface-container-high` | `#222736` | Cards, elevated elements |
| `surface-container-highest` | `#2a3044` | Highest elevation |
| `foreground` | `#f0f0f5` | Primary text |
| `muted-foreground` | `#8a8fa0` | Secondary text |
| `primary` / `brand` | `#5eb5c4` | Brand accent — teal watercolor |
| `brand-container` | `#4a9fad` | Brand gradient end |
| `on-brand` | `#0c2a30` | Text on brand backgrounds |
| `secondary-container` | `#2a1f4e` | Purple accent backgrounds |
| `on-secondary-container` | `#c9b8f0` | Text on purple backgrounds |
| `tertiary` | `#7dd3fc` | Focus glow, interactive highlights |
| `outline-variant` | `#3a3f52` | Ghost border (at 20% opacity) |
| `destructive` | `#f87171` | Error, delete actions |
| `success` | `#4ade80` | Success states |
| `warning` | `#fbbf24` | Warning states |

### Light theme
Clean, paper-like surfaces inspired by watercolor paper.

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#fafbfc` | Page background |
| `surface-dim` | `#fafbfc` | Alias |
| `surface-container-low` | `#f5f6f8` | Section backgrounds |
| `surface-container` | `#eef0f4` | Content blocks |
| `surface-container-high` | `#e8eaef` | Cards |
| `surface-container-highest` | `#e0e3ea` | Highest elevation |
| `foreground` | `#1a1e2a` | Primary text |
| `muted-foreground` | `#6b7085` | Secondary text |
| `primary` / `brand` | `#3a9aab` | Brand accent (darker for contrast) |
| `brand-container` | `#2d8a99` | Brand gradient end |
| `on-brand` | `#ffffff` | Text on brand backgrounds |
| `tertiary` | `#0891b2` | Focus glow |
| `outline-variant` | `#d1d5e0` | Ghost border |

### Signature Gradients

| Gradient | Dark | Light | Usage |
|----------|------|-------|-------|
| **Brand CTA** | `#5eb5c4` → `#4a9fad` | `#3a9aab` → `#2d8a99` | Primary buttons |
| **Hero Background** | `#0c0f14` → `#121a2e` → `#1a1f4e` | `#f0f4ff` → `#e8f0fe` → `#f5f0ff` | Landing hero |
| **Art Preview** | Transparent → `surface` (bottom) | Same concept, light values | Image overlay |

### Theme Infrastructure
- **`next-themes`** with `attribute="class"`, `defaultTheme="dark"`, `enableSystem`
- **ThemeProvider** wraps root layout
- **ThemeToggle** cycles light → dark → system
- **CSS variables** in `:root` (light) and `.dark` (dark) blocks in `globals.css`

### The "No-Line" Rule
Do not use `1px solid` borders to define sections. Boundaries are defined through **Background Color Shifts**. To separate a section, transition from `surface` to `surface-container-low`.

### Surface Hierarchy & Nesting
* **Base:** `surface-dim` — The foundation
* **Sectioning:** `surface-container` — Large content blocks
* **Interactive/Elevated:** `surface-container-high` — Cards, panels
* **Nesting Rule:** Child must always be one tier higher than parent

---

## 3. Typography: The Gallery Voice

Two typefaces balance creative expression with commercial trust.

* **Display & Headlines:** A modern geometric sans-serif (e.g. **Inter**, **Epilogue**, or **DM Sans**) — clean, confident, editorial. Configure as `font-heading`.
* **Body & Labels:** A highly legible sans-serif (e.g. **Manrope**, **Inter**, or **DM Sans**). Configure as `font-sans`.

> Choose your exact fonts during project setup and configure them as `font-heading` and `font-sans` in Tailwind/globals.css. The names above are suggestions.

### Precise Values
* **Letter-spacing:** `-0.03em` on display/headline sizes
* **Line-height:** `1.7` on body text for generous readability
* **Size scale:** Maintain large jumps between headings (3rem+) and body (1rem) — premium feel

---

## 4. Elevation & Depth: Tonal Layering

* **Layering Principle:** Depth via background color shifts, not shadows
* **Ambient Shadows:** If a float effect is needed: `40px` blur, `6%` opacity, tinted (never pure black)
* **Ghost Border:** `outline-variant` at 20% opacity for inputs and complex cards. Focus state jumps to 100% in `tertiary`.

---

## 5. Components

### Buttons
* **Brand/Primary:** Gradient fill (`brand` to `brand-container`) with `on-brand` text. Full rounded for CTAs.
* **Secondary:** `surface-container-highest` background with `brand` text.
* **Ghost:** Transparent with `foreground` text, hover: surface-container-high bg.
* **Destructive:** `destructive` background with white text.

### Cards
* **No hard borders** — depth via surface hierarchy
* **Corner radius:** `xl` (0.75rem) for containers, `md` (0.375rem) for internal elements
* **Image cards:** Always gradient overlay for text legibility

### Input Fields
* **Background:** `surface-dim`
* **Border:** Ghost border (outline-variant at 20%)
* **Focus:** Border jumps to `tertiary` at 100%, ring glow

### Interactive States
Every clickable element must define:
* **Hover:** Lighten bg one surface tier, or increase opacity
* **Focus-visible:** `tertiary` glow outline/ring
* **Active/Pressed:** `scale(0.97)` or darken one tier

---

## 6. Animation & Motion

* **Only animate `transform` and `opacity`** — GPU-composited
* **Never `transition-all`** — animate specific properties
* **Easing:** Spring-style `cubic-bezier(0.22, 1, 0.36, 1)`
* **Entrances:** Fade in + translateY (under 400ms)
* **Micro-interactions:** Button press scale(0.97), hover lift translateY(-2px)

---

## 7. Image Treatment

Artwork is the hero — treat images with care:
* **Gradient overlay:** For text legibility over images
* **Frame effect:** Subtle shadow/border to make art feel "mounted"
* **Before/After:** Side-by-side or slider showing original vs. transformed
* **Gallery grid:** Masonry or uniform grid with generous gaps

---

## 8. Tailwind Integration

**Never use default Tailwind palette colors** (blue-500, gray-400, etc.). Every color comes from the design tokens. Configure Tailwind to use CSS custom properties as the single source of truth.

---

## 9. Do's and Don'ts

### Do:
* **Let the art be the hero** — UI should frame, not compete
* **Use generous whitespace** — treat empty space as intentional luxury
* **Show transformations prominently** — before/after comparisons, large previews
* **Use the gradient subtly** — hero backgrounds and CTA buttons, not everywhere

### Don't:
* **Don't use opaque borders** — kills the gallery feel
* **Don't use standard drop shadows** — tint them or use surface shifts
* **Don't mix more than 2 typefaces** — heading + body, that's it
* **Don't overcrowd** — every element needs breathing room
* **Don't let UI overshadow the product** — the generated art is the star

---

## 10. Shadcn/UI Component Mapping

All UI primitives built as **Shadcn/UI components** in `src/components/ui/`. After installing any Shadcn component, immediately customize it to match this design system.

| Component | Variants | Maps to |
|-----------|----------|---------|
| **Button** | `brand` (gradient CTA), `secondary`, `ghost`, `outline`, `destructive`, `link` | Section 5: Buttons |
| **Input** | Single style: `bg-surface-dim`, ghost border, tertiary focus | Section 5: Input Fields |
| **Card** | No border, `surface-container-high` bg, `rounded-xl` | Section 5: Cards |
| **Label** | `text-foreground/70`, `font-sans` | Body typography |
| **Avatar** | `surface-container-highest` bg, brand fallback | Surface hierarchy |
| **Separator** | `outline-variant/20` | Ghost border applied horizontally |

### Typography aliases

| Tailwind class | Usage |
|----------------|-------|
| `font-heading` | All headings, display text |
| `font-sans` | Body, labels, UI text |

---

**Director's Note:** The interface is a gallery wall. The art is the painting — everything else is the frame. Keep the frame elegant and invisible.
