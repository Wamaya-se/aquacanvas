/**
 * Validates a redirect path to prevent open-redirect attacks.
 *
 * Rejects:
 * - Non-strings or empty strings
 * - Protocol-relative URLs (`//evil.com`) — these pass `startsWith('/')` but
 *   browsers resolve them as absolute URLs to a different host.
 * - Backslash-prefixed paths (`/\evil.com`) — some legacy parsers normalize
 *   these to protocol-relative URLs.
 * - Absolute URLs (anything containing `://`)
 * - Paths with control characters or whitespace at the start
 */
export function isSafePath(path: unknown): path is string {
	if (typeof path !== 'string') return false
	if (path.length === 0) return false
	if (!path.startsWith('/')) return false
	if (path.startsWith('//')) return false
	if (path.startsWith('/\\')) return false
	if (path.includes('://')) return false
	return true
}

/**
 * Returns the input path if it's safe, otherwise returns the fallback.
 */
export function safePathOr(path: unknown, fallback: string): string {
	return isSafePath(path) ? path : fallback
}
