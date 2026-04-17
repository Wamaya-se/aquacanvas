'use client'

import { useCallback, useEffect, useRef } from 'react'

export interface UsePollingTaskOptions {
	/** Max attempts before `onTimeout` is fired. Default 60. */
	maxAttempts?: number
	/** Initial delay between attempts in ms. Default 3000. */
	initialDelay?: number
	/** Maximum delay between attempts in ms. Default 15000. */
	maxDelay?: number
	/** Exponential backoff factor. Default 1.3. */
	backoff?: number
}

function useLatest<T>(value: T) {
	const ref = useRef(value)
	useEffect(() => {
		ref.current = value
	})
	return ref
}

/**
 * Generic polling hook for async task status checks (AI generation,
 * environment preview status, Stripe session lookups, etc.).
 *
 * The hook owns the lifecycle (timer, attempt counter, cleanup on unmount)
 * while the caller owns the actual fetch + state mutation. Return `'done'`
 * from `handleResult` to stop polling; return `'continue'` to keep going.
 *
 * @example
 *   const { start, stop } = usePollingTask<StatusResult>(
 *     () => checkStatus(taskId),
 *     (result) => (result.state === 'success' ? 'done' : 'continue'),
 *     () => setError('timeout'),
 *     { maxAttempts: 60, initialDelay: 3000 }
 *   )
 */
export function usePollingTask<T>(
	pollFn: () => Promise<T>,
	handleResult: (result: T) => 'continue' | 'done',
	onTimeout: () => void,
	options?: UsePollingTaskOptions,
): {
	start: () => void
	stop: () => void
} {
	const {
		maxAttempts = 60,
		initialDelay = 3000,
		maxDelay = 15000,
		backoff = 1.3,
	} = options ?? {}

	const pollFnRef = useLatest(pollFn)
	const handleResultRef = useLatest(handleResult)
	const onTimeoutRef = useLatest(onTimeout)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const attemptRef = useRef(0)

	const stop = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const start = useCallback(() => {
		stop()
		attemptRef.current = 0

		const poll = async () => {
			attemptRef.current += 1

			if (attemptRef.current > maxAttempts) {
				onTimeoutRef.current()
				return
			}

			const result = await pollFnRef.current()
			const decision = handleResultRef.current(result)
			if (decision === 'done') return

			const delay = Math.min(
				initialDelay * Math.pow(backoff, attemptRef.current - 1),
				maxDelay,
			)
			timerRef.current = setTimeout(() => {
				void poll()
			}, delay)
		}

		timerRef.current = setTimeout(() => {
			void poll()
		}, initialDelay)
	}, [
		backoff,
		handleResultRef,
		initialDelay,
		maxAttempts,
		maxDelay,
		onTimeoutRef,
		pollFnRef,
		stop,
	])

	useEffect(() => {
		return () => stop()
	}, [stop])

	return { start, stop }
}
