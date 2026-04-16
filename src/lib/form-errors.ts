import { z } from 'zod'

/**
 * Convert Zod issues into a `fieldErrors` map keyed by top-level field name.
 * Values are i18n error keys (from the `errors` namespace) so clients can
 * render localized messages via `useActionError()` or similar.
 *
 * The `fieldMapping` argument lets callers override the default error key
 * for specific fields (e.g. email → 'errors.invalidEmail').
 */
export function zodIssuesToFieldErrors(
	error: z.ZodError,
	fieldMapping: Record<string, string> = {},
): Record<string, string> {
	const fieldErrors: Record<string, string> = {}

	for (const issue of error.issues) {
		const key = issue.path[0]
		if (typeof key !== 'string' || fieldErrors[key]) continue

		fieldErrors[key] = fieldMapping[key] ?? defaultErrorKey(key, issue)
	}

	return fieldErrors
}

function defaultErrorKey(field: string, issue: z.ZodIssue): string {
	if (field === 'email') return 'errors.invalidEmail'
	if (field === 'password') return 'errors.passwordTooShort'
	if (field === 'confirmPassword') return 'errors.passwordMismatch'

	if (issue.code === 'too_small' || issue.code === 'too_big') {
		return 'errors.invalidInput'
	}

	return 'errors.invalidInput'
}
