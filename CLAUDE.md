# CLAUDE.md — Project Rules

## Required Reading
At session start, read these documents:
- **`ROADMAP.md`** — Project status, current sprint, what's done and what's next. **Update after completing work.**
- **`TECHSTACK.md`** — Decided tech stack, versions, architecture. Never deviate without user approval.
- **`brand_assets/DESIGN.md`** — Design system. All UI must follow these tokens.

## Token Efficiency
- Keep responses concise. No unnecessary repetition.
- Read only the sections you need from project docs.
- ROADMAP.md: read at session start, update at session end.
- Prefer compact diffs over rewriting entire files.
- Don't add verbose comments to code — self-documenting.
- Skills: invoke only the relevant skill for the current task.

## Skills (`.cursor/skills/`)
Before writing code, invoke the relevant skill:
- **`frontend-design`** — Before any UI work. Loads design tokens, surface hierarchy, typography, and component rules from DESIGN.md.
- **`supabase-patterns`** — Before any database, auth, storage, or Edge Function work.
- **`component-scaffold`** — Before creating new components. File naming, folder structure, TypeScript patterns.
- **`i18n-patterns`** — Before writing any user-facing text. All strings must go through next-intl.
- **`error-handling`** — Before building any page or flow that fetches data or handles user input.
- **`api-patterns`** — Before writing Server Actions, Route Handlers, or data-fetching logic.
- **`quality-review`** — After completing a feature, page, or significant refactor. Final quality gate.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft following DESIGN.md.
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. At least 2 comparison rounds.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `npm run dev` (Next.js dev server at `http://localhost:3000`)
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Use the browser MCP tool to navigate to `http://localhost:3000` and take screenshots.
- Check: spacing/padding, font size/weight, colors (exact hex), alignment, border-radius, shadows, image sizing.

## Output Defaults
- **Next.js App Router** with TypeScript — follow the structure in `TECHSTACK.md`
- **Tailwind CSS v4** — via `@tailwindcss/postcss`
- **Shadcn/UI for all UI primitives** — After installing a new Shadcn component, immediately customize it in `src/components/ui/` to match DESIGN.md. **Caution:** Shadcn install may overwrite existing customized components — always verify with `git diff` after install.
- **Typography:** Use `font-heading` and `font-sans` — never verbose arbitrary font syntax.
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive
- Server Components by default — only add `'use client'` when required

## Security Standards
- **Env validation:** Use `src/lib/env.ts` getters — never `process.env.VAR!`. Exception: `src/lib/supabase/client.ts` must use inline `process.env.NEXT_PUBLIC_*!`.
- **Lazy SDK initialization:** Server-only SDK clients (Stripe, Replicate, Resend, etc.) must use lazy singletons — never instantiate at module scope.
- **Zod validation:** All Server Actions validate input with Zod before processing. **Never `as string` on `formData.get()`** — always Zod-parse. **All ID params must pass `z.string().uuid()`**.
- **ActionResult pattern:** All Server Actions return `ActionResult<T>` from `@/types/actions`. Error strings must be i18n keys from the `errors` namespace. Client components translate via `useActionError()` hook.
- **Safe error messages:** Never return raw DB error messages to client.
- **File uploads:** Send files as FormData to Server Actions. Validate size + MIME type server-side, upload to Supabase Storage. Storage path: `{user.id}/{purpose}/{orderId}.{ext}`.
- **AI API keys:** Never expose AI service API keys to the client. All AI calls are server-side only.
- **Open redirect prevention:** Validate redirect URLs against allowlist.
- **OAuth redirectTo:** Must point to the app's own callback URL.
- **Role-based routing:** Read role from `user.app_metadata.role` (JWT) — never DB queries in middleware.
- **Admin reads/writes:** Use `createClient()` everywhere — RLS `is_admin()` policies grant admin access. Only `createAdminClient()` for Auth Admin API calls.
- **RLS admin policies:** Use `public.is_admin()` SECURITY DEFINER function. Never inline subqueries on profiles in RLS policies.

## Engineering Standards
- **Confirm before coding.** Only start writing code when you are 95% confident that you and the user agree on what to build and the best approach. If there is any ambiguity — about requirements, architecture, trade-offs, or scope — stop and clarify first. It is always cheaper to discuss than to rewrite.
- **`revalidatePath`/`revalidateTag` only in mutations:** Never during Server Component rendering.
- **Error boundaries required:** `error.tsx` at root and each route group level.
- **Avoid N+1 queries:** Never query inside a loop. Batch with `Promise.all` + `.in()`.
- **No workarounds.** Solve problems the correct way. If stuck, say so.
- **Understand before fixing.** Diagnose root cause before writing code.

## SEO — High Priority
Every page must have proper metadata via `generateMetadata` using `getTranslations`. Public pages must include:
- Unique `title` + `description` from translation files
- Open Graph + Twitter Card meta tags
- JSON-LD structured data (`Product`, `Organization`, `BreadcrumbList`, `FAQPage`)
- Semantic HTML: one `h1` per page, logical heading hierarchy, landmarks
- `sitemap.ts` + `robots.ts` in `src/app/`

## Accessibility (a11y) — High Priority
- WCAG 2.1 AA as minimum.
- Semantic HTML first, ARIA only when semantics are insufficient.
- **Skip-to-content link** in root layout.
- **`<main id="main-content">`** on every route group layout.
- **One visible h1 per page** on all viewport sizes.
- All interactive elements: visible focus indicator, hover/active states.
- Forms: associated `<label>`, error messages with `role="alert"`, `aria-invalid` + `aria-describedby`.
- Images: meaningful `alt` text, decorative images `alt=""`.
- Respect `prefers-reduced-motion`.
- No `href="#"` as sole destination.

## i18n — All Strings via next-intl
- **No hardcoded user-facing strings.** All text via `useTranslations()` (client) or `getTranslations()` (server).
- **Messages file:** All strings in `messages/en.json`, organized by namespace.
- **Metadata:** `generateMetadata` uses `getTranslations` for title/description on every page.
- **`lang` attribute:** `<html lang>` set dynamically from `getLocale()`.

## Brand Assets
- Always check the `brand_assets/` folder before designing.
- If assets exist there, use them. Do not use placeholders where real assets are available.

## Design Guardrails
- **Shadcn/UI first** — All buttons, inputs, cards, labels etc. use Shadcn components.
- **Don't override variant styles via className** — add new variants instead.
- Never use default Tailwind palette — use design tokens only.
- **Theme-aware colors only**: `text-foreground`, `bg-surface-dim`, `text-muted-foreground`. All via CSS variables.
- Never use `transition-all` — animate `transform` and `opacity` only.
- Every interactive element needs hover, focus-visible, and active states.
- Use `font-heading` / `font-sans` — never verbose arbitrary font syntax.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
