# Design System Document: Aquacanvas

## 1. Overview & Creative North Star

### The Creative North Star: "Warm Editorial"
This design system captures the feeling of a curated art print studio — warm, editorial, and considered. The interface should feel like a premium stationery brand: clean cream surfaces, confident typography, and a restrained palette that lets the artwork speak.

We achieve this through the **Warm Editorial** approach:
* **Cream Canvas:** The #FFFFEB base is warm and inviting, reminiscent of fine art paper or a gallery wall.
* **Deep Teal Anchor:** #034F46 brings sophistication and brand confidence — used for CTAs, links, and focus states.
* **Lavender Accent:** #F0D7FF adds a creative, modern spark to primary buttons without shouting.
* **Confident Typography:** EB Garamond for headings (editorial, timeless) + Figtree for body (modern, readable).

---

## 2. Colors & Surface Logic

The palette supports **light** (default) and **dark** themes via CSS variables in `globals.css`. All color references use theme-aware tokens — never hardcoded hex or `text-white`/`bg-black`.

### Light theme (default)
Warm cream surfaces inspired by fine art paper.

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#FFFFEB` | Page background — the canvas |
| `surface-dim` | `#FFFFEB` | Alias for body background |
| `surface-container-low` | `#F9F9D8` | Section backgrounds |
| `surface-container` | `#F2F2C4` | Content blocks |
| `surface-container-high` | `#EAEAB0` | Cards, elevated elements |
| `surface-container-highest` | `#E0E09A` | Highest elevation |
| `foreground` | `#1A1A1A` | Primary text |
| `muted-foreground` | `#5A5A4A` | Secondary text |
| `brand` | `#034F46` | Deep teal — links, focus, text CTAs |
| `brand-container` | `#025E52` | Brand gradient end |
| `on-brand` | `#FFFFEB` | Text on brand backgrounds |
| `accent` | `#F0D7FF` | Lavender — primary button background |
| `on-accent` | `#1A1A1A` | Text on accent backgrounds |
| `tertiary` | `#034F46` | Focus glow, interactive highlights |
| `outline-variant` | `#C8C89A` | Ghost border |
| `destructive` | `#DC2626` | Error, delete actions |
| `success` | `#16A34A` | Success states |
| `warning` | `#D97706` | Warning states |

### Dark theme
Warm near-black surfaces derived from the light palette.

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#0C0C08` | Page background |
| `surface-container-low` | `#141410` | Section backgrounds |
| `surface-container` | `#1C1C16` | Content blocks |
| `surface-container-high` | `#24241E` | Cards |
| `surface-container-highest` | `#2C2C24` | Highest elevation |
| `foreground` | `#F5F5E0` | Primary text — warm off-white |
| `muted-foreground` | `#9A9A80` | Secondary text |
| `brand` | `#1A9484` | Lighter teal for dark bg contrast |
| `on-brand` | `#F5F5E0` | Text on brand |
| `accent` | `#F0D7FF` | Lavender (same — works on dark) |
| `on-accent` | `#1A1A1A` | Text on accent |
| `tertiary` | `#4DD4C4` | Focus glow |
| `outline-variant` | `#3A3A28` | Ghost border |

### Signature Gradients

| Gradient | Light | Dark | Usage |
|----------|-------|------|-------|
| **Hero Background** | `#FFFFEB` → `#F8F0FF` → `#F0D7FF` | `#0C0C08` → `#0A1814` → `#0F2420` | Landing heroes |
| **Art Preview** | Transparent → `surface` (bottom) | Same concept, dark values | Image overlay |

### Theme Infrastructure
- **`@wrksz/themes`** (next-themes drop-in) with `attribute="class"`, `defaultTheme="light"`, `enableSystem`
- **ThemeProvider** wraps root layout
- **ThemeToggle** cycles light → dark → system
- **CSS variables** in `:root` (light) and `.dark` blocks in `globals.css`

### The "No-Line" Rule
Do not use `1px solid` borders to define sections. Boundaries are defined through **Background Color Shifts**. Exception: buttons use a visible `border-foreground` border by design (Wispr-style).

### Surface Hierarchy & Nesting
* **Base:** `surface-dim` — The foundation (cream)
* **Sectioning:** `surface-container` — Large content blocks
* **Interactive/Elevated:** `surface-container-high` — Cards, panels
* **Nesting Rule:** Child must always be one tier higher than parent

---

## 3. Typography: The Gallery Voice

Two typefaces balance creative expression with commercial trust.

* **Display & Headlines:** **EB Garamond** — elegant, timeless, editorial. Configure as `font-heading`.
* **Body & Labels:** **Figtree** — modern, highly legible, friendly. Configure as `font-sans`.

Both loaded via `next/font/google` with `display: swap`.

### Precise Values
* **Letter-spacing:** `-0.03em` on display/headline sizes
* **Line-height:** `1.7` on body text for generous readability
* **Hero h1:** `~7.5rem` (120px) on landing page hero only
* **Page h1:** `~3rem` on standard pages
* **Body:** `1rem` / `1.25rem` for labels

---

## 4. Elevation & Depth: Tonal Layering

* **Layering Principle:** Depth via background color shifts, not shadows
* **Ambient Shadows:** If a float effect is needed: `40px` blur, `6%` opacity, tinted with `#034F46` or warm black
* **Ghost Border:** `outline-variant` at full opacity for inputs. Focus state jumps to `tertiary`.

---

## 5. Components

### Buttons
* **Brand/Primary (default):** `bg-accent` (`#F0D7FF`) with `text-on-accent` (`#1A1A1A`) and `border border-foreground`. 12px radius.
* **Secondary:** `bg-surface` with `text-foreground` and `border border-foreground`. 12px radius.
* **Ghost:** Transparent with `foreground` text, hover: `surface-container-high` bg.
* **Outline:** `border-outline-variant` — subtler than secondary.
* **Destructive:** `bg-destructive` with `border-destructive`.
* All buttons: `active:scale-[0.97]`, `hover:brightness-95`, focus ring in `ring`.

### Cards
* **No hard borders** — depth via surface hierarchy
* **Corner radius:** `xl` (1rem) for containers, `md` (0.5rem) for internal elements
* **Image cards:** Always gradient overlay for text legibility

### Input Fields
* **Background:** `surface-dim`
* **Border:** `outline-variant` (full opacity — warm parchment tone)
* **Focus:** Border jumps to `tertiary`, ring glow in `tertiary/30`

### Interactive States
Every clickable element must define:
* **Hover:** `brightness-95` or lighten bg one surface tier
* **Focus-visible:** `tertiary` glow outline/ring
* **Active/Pressed:** `scale(0.97)`

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
* **Use the cream warmly** — it reads as artisanal and premium, not cheap
* **Keep buttons flat + bordered** — Wispr's confident editorial style

### Don't:
* **Don't use gradient fills on buttons** — flat + border is the language now
* **Don't use opaque borders for sections** — use surface shifts
* **Don't mix more than 2 typefaces** — EB Garamond + Figtree, that's it
* **Don't overcrowd** — every element needs breathing room
* **Don't let UI overshadow the product** — the generated art is the star

---

## 10. Shadcn/UI Component Mapping

All UI primitives built as **Shadcn/UI components** in `src/components/ui/`. After installing any Shadcn component, immediately customize it to match this design system.

| Component | Variants | Maps to |
|-----------|----------|---------|
| **Button** | `brand` (accent bg + border), `secondary` (cream bg + border), `ghost`, `outline`, `destructive`, `link` | Section 5: Buttons |
| **Input** | Single style: `bg-surface-dim`, `outline-variant` border, `tertiary` focus | Section 5: Input Fields |
| **Card** | No border, `surface-container-high` bg, `rounded-xl` | Section 5: Cards |
| **Label** | `text-foreground/70`, `font-sans` | Body typography |
| **Avatar** | `surface-container-highest` bg, brand fallback | Surface hierarchy |
| **Separator** | `outline-variant` | Ghost border applied horizontally |

### Typography aliases

| Tailwind class | Usage |
|----------------|-------|
| `font-heading` | All headings, display text (EB Garamond) |
| `font-sans` | Body, labels, UI text (Figtree) |

---

**Director's Note:** The interface is a gallery wall. The art is the painting — everything else is the frame. Keep the frame elegant, warm, and invisible.
