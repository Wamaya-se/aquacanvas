import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { guestSessionIdSchema } from '@/validators/order'

/**
 * Ownership/authorization helpers for per-order server actions.
 *
 * Two-step pattern to avoid coupling the auth check to a specific SELECT
 * statement:
 *
 *   const ctx = await getOrderAuthContext(guestSessionId)
 *   if (!ctx.success) return { success: false, error: ctx.error }
 *
 *   const { data: order } = await adminDb
 *     .from('orders')
 *     .select('id, user_id, guest_session_id, ...custom fields...')
 *     .eq('id', orderId)
 *     .single()
 *
 *   const check = verifyOrderAccess(order, ctx.data)
 *   if (!check.success) return { success: false, error: check.error }
 *
 * This keeps each action in control of what columns it needs while still
 * sharing the auth + guest-UUID + ownership-comparison logic.
 */

export interface OrderAuthContext {
	userId: string | null
	validGuestId: string | null
	storagePrefix: string
}

export async function getOrderAuthContext(
	guestSessionId: string | undefined,
): Promise<
	| { success: true; data: OrderAuthContext }
	| { success: false; error: string }
> {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	if (user) {
		return {
			success: true,
			data: { userId: user.id, validGuestId: null, storagePrefix: user.id },
		}
	}

	const parsedGuestId = guestSessionIdSchema.safeParse(guestSessionId)
	if (!parsedGuestId.success) {
		return { success: false, error: 'errors.invalidInput' }
	}

	return {
		success: true,
		data: {
			userId: null,
			validGuestId: parsedGuestId.data,
			storagePrefix: 'guest',
		},
	}
}

interface OrderOwnerFields {
	user_id: string | null
	guest_session_id: string | null
}

export function verifyOrderAccess(
	order: OrderOwnerFields | null | undefined,
	ctx: OrderAuthContext,
): { success: true } | { success: false; error: string } {
	if (!order) {
		return { success: false, error: 'errors.orderNotFound' }
	}

	if (ctx.userId && order.user_id !== ctx.userId) {
		return { success: false, error: 'errors.forbidden' }
	}

	if (!ctx.userId && order.guest_session_id !== ctx.validGuestId) {
		return { success: false, error: 'errors.forbidden' }
	}

	return { success: true }
}
