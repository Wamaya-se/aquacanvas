import type { Orientation } from '@/types/supabase'
import type { Database } from '@/types/supabase'

/**
 * DB row parsers.
 *
 * Supabase-generated types keep `orientation` as `text` (no PG enum) and
 * `faq` as `Json`. These helpers narrow those values to the app-level
 * domain types so call sites stay type-safe without scattering `as` casts.
 */

const ORIENTATION_VALUES = ['portrait', 'landscape', 'square'] as const

export function parseOrientation(value: unknown): Orientation {
	if (typeof value === 'string' && (ORIENTATION_VALUES as readonly string[]).includes(value)) {
		return value as Orientation
	}
	return 'portrait'
}

export interface FaqItem {
	question: string
	answer: string
}

export function parseFaq(value: unknown): FaqItem[] {
	if (!Array.isArray(value)) return []
	return value.filter(
		(item): item is FaqItem =>
			typeof item === 'object' &&
			item !== null &&
			typeof (item as FaqItem).question === 'string' &&
			typeof (item as FaqItem).answer === 'string',
	)
}

// ──────────────────────────────────────────────────────────────────────
// Typed row parsers
// ──────────────────────────────────────────────────────────────────────

type PrintFormatRow = Database['public']['Tables']['print_formats']['Row']
type ProductRow = Database['public']['Tables']['products']['Row']

export interface FormatRowParsed extends Omit<PrintFormatRow, 'orientation'> {
	orientation: Orientation
}

export interface ProductRowParsed extends Omit<ProductRow, 'faq'> {
	faq: FaqItem[]
}

export function parseFormatRow(row: PrintFormatRow): FormatRowParsed {
	return {
		...row,
		orientation: parseOrientation(row.orientation),
	}
}

export function parseProductRow(row: ProductRow): ProductRowParsed {
	return {
		...row,
		faq: parseFaq(row.faq),
	}
}

// ──────────────────────────────────────────────────────────────────────
// Embedded relation helpers
// ──────────────────────────────────────────────────────────────────────

/**
 * Supabase's PostgREST-to-TS generator types embedded relations as
 * `{ ... }[]` even when `!inner` guarantees a single row. These helpers
 * extract a single object safely.
 */
export function unwrapSingleRelation<T>(relation: T | T[] | null | undefined): T | null {
	if (!relation) return null
	if (Array.isArray(relation)) return relation[0] ?? null
	return relation
}

export function getSceneName(
	relation: { name: string } | { name: string }[] | null | undefined,
): string {
	const row = unwrapSingleRelation(relation)
	return row?.name ?? 'Room'
}
