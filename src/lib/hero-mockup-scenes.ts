/**
 * Hero mockup scenes — Fas 15 Batch A
 *
 * Static mapping from canvas orientation to the Storage path of the master
 * mockup image (canvas-on-wall). The server action in Batch B hydrates the
 * Kie `flux-2/flex-image-to-image` task with the master + the user's
 * artwork, producing a photorealistic "your canvas on a wall" composite.
 *
 * Masters are uploaded once per environment (dev + prod) under the
 * `hero-mockups/` prefix in the public `images` bucket. See
 * `scripts/seed-hero-mockups.ts`. Public-read is granted via migration
 * `00021_hero_mockup.sql`.
 */

import type { OrientationValue } from '@/validators/order'

export const HERO_MOCKUP_PATHS: Record<OrientationValue, string> = {
	portrait: 'hero-mockups/mockup-vertical.jpeg',
	landscape: 'hero-mockups/mockup-horizontal.jpeg',
	square: 'hero-mockups/mockup-square.jpeg',
}

/**
 * Resolve the orientation to use for a hero mockup. Prefers the explicit
 * column on the order (set at create-time from the orientation picker);
 * falls back to pixel dimensions from the AI output when the column is
 * missing (legacy rows).
 *
 * Returns `null` if orientation cannot be resolved — callers should treat
 * this as a soft failure (skip mockup generation, don't crash the order).
 */
export function resolveHeroMockupOrientation(
	orientation: string | null | undefined,
	width: number | null | undefined,
	height: number | null | undefined,
): OrientationValue | null {
	if (orientation === 'portrait' || orientation === 'landscape' || orientation === 'square') {
		return orientation
	}

	if (typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0) {
		const ratio = width / height
		// 5% tolerance around 1:1 so lightly-off-square outputs still land
		// on the square mockup.
		if (ratio > 0.95 && ratio < 1.05) return 'square'
		return ratio > 1 ? 'landscape' : 'portrait'
	}

	return null
}
