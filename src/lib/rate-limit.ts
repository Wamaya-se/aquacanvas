const MAX_REQUESTS_AUTH = 5
const MAX_REQUESTS_GUEST = 3
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

const store = new Map<string, number[]>()

export function checkRateLimit(
	identifier: string,
	isGuest = false,
): {
	allowed: boolean
	remaining: number
} {
	const maxRequests = isGuest ? MAX_REQUESTS_GUEST : MAX_REQUESTS_AUTH
	const now = Date.now()
	const windowStart = now - WINDOW_MS
	const key = isGuest ? `guest:${identifier}` : identifier
	const timestamps = store.get(key) ?? []

	const recent = timestamps.filter((ts) => ts > windowStart)

	if (recent.length >= maxRequests) {
		store.set(key, recent)
		return { allowed: false, remaining: 0 }
	}

	recent.push(now)
	store.set(key, recent)

	return { allowed: true, remaining: maxRequests - recent.length }
}
