/**
 * Kie.ai credit accounting.
 *
 * Kie.ai bills per task in "credits", where 1 credit ≈ $0.005 USD based on
 * their public pricing pages (https://kie.ai/pricing, /nano-banana,
 * /topaz-image-upscale). Their API does not return the cost per task, so
 * we estimate consumption from the model + parameters we actually send.
 *
 * This module is the single source of truth for per-model pricing. If Kie
 * changes their rates, update the constants below and every surface that
 * reports credits (admin order detail today, aggregate dashboards later)
 * stays consistent.
 */
import 'server-only'
import type { PreviewStatus, UpscaleStatus } from '@/types/supabase'

const MODEL_NANO_BANANA_EDIT = 'google/nano-banana-edit'
const MODEL_FLUX_IMAGE_TO_IMAGE = 'flux-2/flex-image-to-image'
const MODEL_TOPAZ_IMAGE_UPSCALE = 'topaz/image-upscale'

/**
 * USD per Kie credit. Derived from the public pricing table
 * (10 credits = $0.05 for Topaz ≤2K → $0.005 per credit).
 */
export const USD_PER_CREDIT = 0.005

/**
 * Nano Banana Edit — 4 credits per generated image
 * (https://kie.ai/nano-banana). We use it for both the main artwork and
 * the hero mockup.
 */
export const CREDITS_NANO_BANANA_EDIT = 4

/**
 * Flux-2 Flex Image-to-Image at 2K — approximately 14 credits per image
 * (megapixel-based billing, Kie.ai pricing page + r/FluxAI comparison).
 * We always request `resolution: '2K'` for environment previews, so this
 * constant matches our actual usage.
 */
export const CREDITS_FLUX_FLEX_I2I_2K = 14

/**
 * Topaz Image Upscale — tiered by the longest output side
 * (https://kie.ai/topaz-image-upscale):
 *  - ≤2048 px → 10 credits
 *  - ≤4096 px → 20 credits
 *  - ≤8192 px (Kie cap is 20 000) → 40 credits
 */
export const CREDITS_TOPAZ_UPSCALE_2K = 10
export const CREDITS_TOPAZ_UPSCALE_4K = 20
export const CREDITS_TOPAZ_UPSCALE_8K = 40

/** Default upscale factor we send today (`DEFAULT_UPSCALE_FACTOR` in pipeline). */
const DEFAULT_UPSCALE_FACTOR = 4

export type UpscaleTier = '2K' | '4K' | '8K'

interface UpscaleCreditResult {
	credits: number
	tier: UpscaleTier
}

/**
 * Pick the Topaz credit tier from the longest side of the UPSCALED output.
 * Falls back to the 4K tier when we don't know the generated dimensions —
 * that matches what Kie charges for a 1024 px → 4096 px run, which is the
 * single most common path for us.
 */
export function estimateUpscaleCredits(
	generatedWidthPx: number | null,
	generatedHeightPx: number | null,
	factor: number = DEFAULT_UPSCALE_FACTOR,
): UpscaleCreditResult {
	const longestInput =
		generatedWidthPx != null && generatedHeightPx != null
			? Math.max(generatedWidthPx, generatedHeightPx)
			: null

	if (longestInput == null) {
		return { credits: CREDITS_TOPAZ_UPSCALE_4K, tier: '4K' }
	}

	const longestOutput = longestInput * factor
	if (longestOutput <= 2048) return { credits: CREDITS_TOPAZ_UPSCALE_2K, tier: '2K' }
	if (longestOutput <= 4096) return { credits: CREDITS_TOPAZ_UPSCALE_4K, tier: '4K' }
	return { credits: CREDITS_TOPAZ_UPSCALE_8K, tier: '8K' }
}

export interface OrderCreditsInput {
	aiModel: string | null
	aiTaskId: string | null
	generatedImagePath: string | null
	generatedWidthPx: number | null
	generatedHeightPx: number | null
	heroMockupStatus: PreviewStatus
	heroMockupTaskId: string | null
	upscaleStatus: UpscaleStatus | null
	upscaleTaskId: string | null
}

export interface EnvironmentPreviewCreditsInput {
	status: PreviewStatus
	taskId: string | null
}

export interface CreditsLineItem {
	key: 'generation' | 'heroMockup' | 'upscale' | 'environmentPreviews'
	model: string
	credits: number
	count: number
}

export interface OrderCreditsSummary {
	generation: CreditsLineItem & { used: boolean }
	heroMockup: CreditsLineItem & { used: boolean }
	upscale: CreditsLineItem & { used: boolean; tier: UpscaleTier | null }
	environmentPreviews: CreditsLineItem & {
		used: boolean
		successCount: number
		failCount: number
	}
	totalCredits: number
	estimatedUsd: number
}

/**
 * Estimate the Kie.ai credits that were actually charged for an order.
 *
 * We count a stage as billed when there's evidence Kie accepted a task —
 * i.e. there's a task ID OR the status is beyond `pending`. Fails still
 * count because Kie typically debits credits on task creation regardless
 * of the final `state`. `skipped` upscales are free (we short-circuit
 * before createTask).
 */
export function estimateOrderCredits(
	order: OrderCreditsInput,
	environmentPreviews: readonly EnvironmentPreviewCreditsInput[],
): OrderCreditsSummary {
	const generationUsed = Boolean(order.aiTaskId || order.generatedImagePath)
	const generation: OrderCreditsSummary['generation'] = {
		key: 'generation',
		model: order.aiModel || MODEL_NANO_BANANA_EDIT,
		credits: generationUsed ? CREDITS_NANO_BANANA_EDIT : 0,
		count: generationUsed ? 1 : 0,
		used: generationUsed,
	}

	const heroMockupBilled =
		Boolean(order.heroMockupTaskId) ||
		order.heroMockupStatus === 'processing' ||
		order.heroMockupStatus === 'success' ||
		order.heroMockupStatus === 'fail'
	const heroMockup: OrderCreditsSummary['heroMockup'] = {
		key: 'heroMockup',
		model: MODEL_NANO_BANANA_EDIT,
		credits: heroMockupBilled ? CREDITS_NANO_BANANA_EDIT : 0,
		count: heroMockupBilled ? 1 : 0,
		used: heroMockupBilled,
	}

	const upscaleBilled =
		Boolean(order.upscaleTaskId) ||
		order.upscaleStatus === 'processing' ||
		order.upscaleStatus === 'success' ||
		order.upscaleStatus === 'fail'
	const upscaleTier = upscaleBilled
		? estimateUpscaleCredits(order.generatedWidthPx, order.generatedHeightPx)
		: null
	const upscale: OrderCreditsSummary['upscale'] = {
		key: 'upscale',
		model: MODEL_TOPAZ_IMAGE_UPSCALE,
		credits: upscaleTier?.credits ?? 0,
		count: upscaleBilled ? 1 : 0,
		used: upscaleBilled,
		tier: upscaleTier?.tier ?? null,
	}

	let envSuccess = 0
	let envFail = 0
	let envBilledCount = 0
	for (const ep of environmentPreviews) {
		const billed =
			Boolean(ep.taskId) ||
			ep.status === 'processing' ||
			ep.status === 'success' ||
			ep.status === 'fail'
		if (!billed) continue
		envBilledCount += 1
		if (ep.status === 'success') envSuccess += 1
		else if (ep.status === 'fail') envFail += 1
	}

	const environmentPreviewsLine: OrderCreditsSummary['environmentPreviews'] = {
		key: 'environmentPreviews',
		model: MODEL_FLUX_IMAGE_TO_IMAGE,
		credits: envBilledCount * CREDITS_FLUX_FLEX_I2I_2K,
		count: envBilledCount,
		used: envBilledCount > 0,
		successCount: envSuccess,
		failCount: envFail,
	}

	const totalCredits =
		generation.credits +
		heroMockup.credits +
		upscale.credits +
		environmentPreviewsLine.credits

	return {
		generation,
		heroMockup,
		upscale,
		environmentPreviews: environmentPreviewsLine,
		totalCredits,
		estimatedUsd: totalCredits * USD_PER_CREDIT,
	}
}
