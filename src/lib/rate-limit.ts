import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export interface RateLimitResult {
	allowed: boolean
	remaining: number
	maxRequests: number
	retryAfterSeconds: number | null
}

export interface RateLimitBucket {
	name: string
	maxRequests: number
	/** Window length, passed to Upstash slidingWindow. e.g. '1 h', '15 m', '1 d'. */
	window: `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`
}

// ──────────────────────────────────────────────────────────────────────
// Rate limit buckets — source of truth for all Server Action rate limits.
// Add a new bucket here whenever you protect a new action.
// ──────────────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
	aiAuth: { name: 'ai:auth', maxRequests: 5, window: '1 h' },
	aiGuest: { name: 'ai:guest', maxRequests: 3, window: '1 h' },
	login: { name: 'login', maxRequests: 10, window: '15 m' },
	register: { name: 'register', maxRequests: 5, window: '1 h' },
	contact: { name: 'contact', maxRequests: 5, window: '1 h' },
	reviewSubmit: { name: 'review:submit', maxRequests: 3, window: '1 h' },
} as const satisfies Record<string, RateLimitBucket>

export type RateLimitKey = keyof typeof RATE_LIMITS

// ──────────────────────────────────────────────────────────────────────
// Upstash Redis client (lazy, optional)
// ──────────────────────────────────────────────────────────────────────

let redisClient: Redis | null = null
let redisInitTried = false

function getRedis(): Redis | null {
	if (redisClient) return redisClient
	if (redisInitTried) return null
	redisInitTried = true

	const url = process.env.UPSTASH_REDIS_REST_URL
	const token = process.env.UPSTASH_REDIS_REST_TOKEN
	if (!url || !token) return null

	try {
		redisClient = new Redis({ url, token })
		return redisClient
	} catch (err) {
		console.warn('[rate-limit] Failed to init Upstash Redis:', err)
		return null
	}
}

const limiterCache = new Map<string, Ratelimit>()

function getUpstashLimiter(bucket: RateLimitBucket): Ratelimit | null {
	const redis = getRedis()
	if (!redis) return null
	const cached = limiterCache.get(bucket.name)
	if (cached) return cached
	const limiter = new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(bucket.maxRequests, bucket.window),
		analytics: true,
		prefix: `aquacanvas:${bucket.name}`,
	})
	limiterCache.set(bucket.name, limiter)
	return limiter
}

// ──────────────────────────────────────────────────────────────────────
// In-memory fallback (dev + tests)
//
// Used when UPSTASH_REDIS_REST_* env vars are not configured. Safe for
// single-instance dev servers; NOT safe for serverless/multi-region
// production — configure Upstash for prod.
// ──────────────────────────────────────────────────────────────────────

const WINDOW_UNIT_TO_MS: Record<string, number> = {
	ms: 1,
	s: 1000,
	m: 60_000,
	h: 3_600_000,
	d: 86_400_000,
}

function parseWindowMs(window: RateLimitBucket['window']): number {
	const [count, unit] = window.split(' ')
	return Number(count) * (WINDOW_UNIT_TO_MS[unit] ?? 3_600_000)
}

const memStore = new Map<string, number[]>()

function checkInMemory(
	bucket: RateLimitBucket,
	identifier: string,
): RateLimitResult {
	const now = Date.now()
	const windowMs = parseWindowMs(bucket.window)
	const windowStart = now - windowMs
	const key = `${bucket.name}:${identifier}`
	const timestamps = memStore.get(key) ?? []
	const recent = timestamps.filter((ts) => ts > windowStart)

	if (recent.length >= bucket.maxRequests) {
		memStore.set(key, recent)
		const oldestInWindow = recent[0]
		const retryAfterMs = oldestInWindow + windowMs - now
		return {
			allowed: false,
			remaining: 0,
			maxRequests: bucket.maxRequests,
			retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
		}
	}

	recent.push(now)
	memStore.set(key, recent)
	return {
		allowed: true,
		remaining: bucket.maxRequests - recent.length,
		maxRequests: bucket.maxRequests,
		retryAfterSeconds: null,
	}
}

// ──────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────

export async function checkRateLimit(
	key: RateLimitKey,
	identifier: string,
	options?: { disabled?: boolean },
): Promise<RateLimitResult> {
	const bucket = RATE_LIMITS[key]

	if (options?.disabled) {
		return {
			allowed: true,
			remaining: bucket.maxRequests,
			maxRequests: bucket.maxRequests,
			retryAfterSeconds: null,
		}
	}

	const limiter = getUpstashLimiter(bucket)
	if (limiter) {
		try {
			const result = await limiter.limit(identifier)
			const retryAfterSeconds = result.success
				? null
				: Math.max(0, Math.ceil((result.reset - Date.now()) / 1000))
			return {
				allowed: result.success,
				remaining: Math.max(0, result.remaining),
				maxRequests: bucket.maxRequests,
				retryAfterSeconds,
			}
		} catch (err) {
			console.warn('[rate-limit] Upstash failed, falling back to memory:', err)
		}
	}

	return checkInMemory(bucket, identifier)
}
