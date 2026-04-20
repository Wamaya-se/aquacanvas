/**
 * Shim `server-only` for Node scripts.
 *
 * The `server-only` package throws on import outside a React Server Components
 * context. That protection is designed for bundler-time enforcement; when we
 * run `npx tsx scripts/…` against files that import server-only modules
 * (e.g. `src/lib/image-processing.ts`), the unconditional throw blocks us.
 *
 * This shim pre-populates Node's require cache with an empty module under the
 * `server-only` specifier, so downstream `import 'server-only'` resolves to a
 * no-op. Safe for scripts only — do NOT import this from app code.
 */

import Module from 'node:module'

const req = Module.createRequire(import.meta.url)
try {
	const resolved = req.resolve('server-only')
	// biome-ignore lint/suspicious/noExplicitAny: node require cache is typed loosely
	;(req as unknown as { cache: Record<string, unknown> }).cache[resolved] = {
		id: resolved,
		filename: resolved,
		loaded: true,
		exports: {},
	}
} catch {
	// server-only not installed (shouldn't happen in this repo) — nothing to shim.
}
