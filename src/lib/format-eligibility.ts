/**
 * Aquacanvas — DPI eligibility for canvas print formats.
 *
 * Pure math, no I/O. Safe to import from both server (checkout guard) and
 * client (FormatPicker badges) — keeps `image-processing.ts` server-only
 * for its sharp/ICC dependencies while the eligibility math stays shared.
 *
 * Target DPI comes from the tryckeri spec locked in Fas 14:
 *   ≤ 40 cm longest  → 300 DPI (portrait/landscape/square up to 30×40)
 *   ≤ 70 cm longest  → 200 DPI (medium)
 *   >  70 cm longest → 150 DPI (large)
 *
 * Grades:
 *   green  — effective DPI ≥ target (recommended print quality)
 *   yellow — ≥ 80 % of target (acceptable, visible softness possible)
 *   red    — < 80 % (refuse: visible pixelation / blocked in checkout)
 */

export type EligibilityGrade = 'green' | 'yellow' | 'red'

export interface FormatEligibility {
	grade: EligibilityGrade
	/** DPI delivered after upscaling against the chosen format. Floor-rounded. */
	effectiveDpi: number
	/** DPI required by the tryckeri for this format. */
	targetDpi: number
	/** Longest physical side of the format in cm (used for DPI math + bucketing). */
	longestCm: number
	/** Multiplier used when computing `effectiveDpi` (post-upscale). */
	upscaleFactor: number
}

export interface FormatDimensions {
	widthCm: number
	heightCm: number
}

/**
 * Default multiplier applied to the raw AI output before DPI is measured.
 * Mirrors `DEFAULT_UPSCALE_FACTOR` in `print-pipeline/trigger-upscale.ts` —
 * keep them in sync. A smaller factor fed in here simply downgrades badges,
 * so defaulting to 4 matches what every current order actually receives.
 */
export const DEFAULT_ELIGIBILITY_UPSCALE_FACTOR = 4

/**
 * Threshold under which a format is refused outright (red). Intentionally
 * generous (80 %) because a 200 DPI target at 160 DPI is still acceptable
 * on a canvas surface — customers only get blocked when the result would
 * be visibly pixelated.
 */
const RED_THRESHOLD = 0.8

export function targetDpiForLongestCm(longestCm: number): number {
	if (longestCm <= 40) return 300
	if (longestCm <= 70) return 200
	return 150
}

/**
 * Given the raw AI output dimensions and a candidate print format, compute
 * the DPI the customer would see after our standard upscale pipeline and
 * grade the result.
 *
 * Orientation is ignored on purpose: `FormatPicker` already filters by
 * `selectedOrientation`, and the DPI math only cares about longest-side
 * pixels vs longest-side cm.
 */
export function computeFormatEligibility(
	generatedWidthPx: number,
	generatedHeightPx: number,
	format: FormatDimensions,
	upscaleFactor: number = DEFAULT_ELIGIBILITY_UPSCALE_FACTOR,
): FormatEligibility {
	const longestPx = Math.max(generatedWidthPx, generatedHeightPx) * upscaleFactor
	const longestCm = Math.max(format.widthCm, format.heightCm)
	const effectiveDpi = Math.floor(longestPx / (longestCm / 2.54))
	const targetDpi = targetDpiForLongestCm(longestCm)
	const ratio = effectiveDpi / targetDpi

	let grade: EligibilityGrade
	if (ratio >= 1) grade = 'green'
	else if (ratio >= RED_THRESHOLD) grade = 'yellow'
	else grade = 'red'

	return { grade, effectiveDpi, targetDpi, longestCm, upscaleFactor }
}

/**
 * True when at least one format in the list is not red. Used by the
 * client-side "upload bigger image" empty state — if every option would
 * ship blurry, we block the whole flow instead of letting the customer
 * choose the least-bad option.
 */
export function hasAnyEligibleFormat(
	eligibility: Record<string, FormatEligibility>,
): boolean {
	for (const entry of Object.values(eligibility)) {
		if (entry.grade !== 'red') return true
	}
	return false
}
