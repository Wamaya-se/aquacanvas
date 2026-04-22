import { z } from 'zod'

/**
 * When upscaling should be triggered in the order lifecycle.
 *
 * - `post_checkout`  → run after Stripe `payment_intent.succeeded` (default).
 *                      Avoids paying Topaz credits for abandoned carts.
 * - `post_generation`→ run immediately after AI generation finishes.
 *                      Gives admin instant print preview but costs credits
 *                      even if the customer never pays.
 */
export const upscaleTriggerSchema = z.enum(['post_checkout', 'post_generation'])

export type UpscaleTrigger = z.infer<typeof upscaleTriggerSchema>

export const DEFAULT_UPSCALE_TRIGGER: UpscaleTrigger = 'post_checkout'

/**
 * Feature flags stored in `app_settings` for runtime-togglable pipeline stages.
 *
 * Both default to `true` (enabled) so production keeps its current behaviour
 * on fresh deploys. Admin can pause expensive stages (Topaz upscale, Kie.ai
 * environment previews) during testing / incident response without requiring
 * a redeploy or code change.
 */
export const featureFlagSchema = z.boolean()

export const DEFAULT_UPSCALE_ENABLED = true
export const DEFAULT_ENVIRONMENT_PREVIEWS_ENABLED = true

/**
 * Input shape for manual admin-triggered upscale operations.
 * Order ID is validated as UUID to prevent path traversal / injection in
 * Storage paths and DB selects.
 */
export const triggerUpscaleSchema = z.object({
	orderId: z.string().uuid(),
})

export type TriggerUpscaleInput = z.infer<typeof triggerUpscaleSchema>

export const checkUpscaleStatusSchema = z.object({
	orderId: z.string().uuid(),
})

export type CheckUpscaleStatusInput = z.infer<typeof checkUpscaleStatusSchema>
