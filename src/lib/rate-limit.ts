const MAX_REQUESTS_AUTH = 5
const MAX_REQUESTS_GUEST = 3
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

const store = new Map<string, number[]>()

export interface RateLimitResult {
	allowed: boolean
	remaining: number
	maxRequests: number
	retryAfterSeconds: number | null
}

export function checkRateLimit(
	identifier: string,
	isGuest = false,
	options?: { disabled?: boolean },
): RateLimitResult {
	const maxRequests = isGuest ? MAX_REQUESTS_GUEST : MAX_REQUESTS_AUTH

	if (options?.disabled) {
		return { allowed: true, remaining: maxRequests, maxRequests, retryAfterSeconds: null }
	}

	const now = Date.now()
	const windowStart = now - WINDOW_MS
	const key = isGuest ? `guest:${identifier}` : identifier
	const timestamps = store.get(key) ?? []

	const recent = timestamps.filter((ts) => ts > windowStart)

	if (recent.length >= maxRequests) {
		store.set(key, recent)
		const oldestInWindow = recent[0]
		const retryAfterMs = oldestInWindow + WINDOW_MS - now
		const retryAfterSeconds = Math.ceil(retryAfterMs / 1000)
		return { allowed: false, remaining: 0, maxRequests, retryAfterSeconds }
	}

	recent.push(now)
	store.set(key, recent)

	return { allowed: true, remaining: maxRequests - recent.length, maxRequests, retryAfterSeconds: null }
}
