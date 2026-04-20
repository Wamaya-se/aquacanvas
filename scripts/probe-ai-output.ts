/**
 * Probe actual pixel dimensions of AI-generated images in Supabase Storage.
 *
 * Purpose: determine nano-banana-edit output resolution so we can decide
 * whether 4x Topaz upscale is sufficient for the tryckeri DPI targets,
 * or whether we need to switch to nano-banana-pro (1K/2K/4K explicit).
 *
 * Run:
 *   npx tsx scripts/probe-ai-output.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import probe from 'probe-image-size'

config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
	console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
	process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE)

interface OrderRow {
	id: string
	orientation: string | null
	ai_model: string | null
	generated_image_path: string | null
	created_at: string
}

const FORMATS = [
	{ name: '30×40', long: 40, short: 30, dpi: 300 },
	{ name: '50×70', long: 70, short: 50, dpi: 200 },
	{ name: '70×100', long: 100, short: 70, dpi: 150 },
]

function cmToTargetPx(cm: number, dpi: number): number {
	return Math.ceil((cm / 2.54) * dpi)
}

function evaluateForFormats(longestPx: number, upscaleFactor = 4) {
	const finalLongest = longestPx * upscaleFactor
	return FORMATS.map((f) => {
		const required = cmToTargetPx(f.long, f.dpi)
		const pct = Math.round((finalLongest / required) * 100)
		const status = pct >= 100 ? '✅' : pct >= 80 ? '⚠️ ' : '❌'
		return `${status} ${f.name} @${f.dpi}dpi (${pct}%)`
	}).join('  ')
}

async function main() {
	console.log('Fetching latest AI-generated orders...\n')

	const { data, error } = await db
		.from('orders')
		.select('id, orientation, ai_model, generated_image_path, created_at')
		.not('generated_image_path', 'is', null)
		.order('created_at', { ascending: false })
		.limit(15)

	if (error) {
		console.error('DB error:', error)
		process.exit(1)
	}

	const orders = data as OrderRow[]
	if (!orders?.length) {
		console.log('No generated images found in orders table.')
		process.exit(0)
	}

	console.log(`Found ${orders.length} orders. Probing dimensions...\n`)
	console.log('─'.repeat(140))

	const results: Array<{ width: number; height: number; longest: number }> = []

	for (const o of orders) {
		if (!o.generated_image_path) continue

		const { data: urlData } = db.storage
			.from('images')
			.getPublicUrl(o.generated_image_path)

		try {
			const meta = await probe(urlData.publicUrl)
			const longest = Math.max(meta.width, meta.height)
			results.push({ width: meta.width, height: meta.height, longest })

			const date = new Date(o.created_at).toISOString().slice(0, 10)
			const dims = `${meta.width}×${meta.height}`.padEnd(11)
			const orient = (o.orientation ?? 'n/a').padEnd(9)
			const model = (o.ai_model ?? '?').padEnd(26)
			console.log(
				`${date}  ${orient} ${model} ${dims} [${meta.type}]  →  ${evaluateForFormats(longest)}`,
			)
		} catch (err) {
			console.log(`${o.id}  probe failed: ${(err as Error).message}`)
		}
	}

	if (!results.length) {
		console.log('\nNo dimensions could be probed.')
		return
	}

	console.log('─'.repeat(140))

	const longestValues = results.map((r) => r.longest)
	const min = Math.min(...longestValues)
	const max = Math.max(...longestValues)
	const avg = Math.round(longestValues.reduce((s, v) => s + v, 0) / longestValues.length)

	console.log(`\nLongest-side stats across ${results.length} samples:`)
	console.log(`  min: ${min} px`)
	console.log(`  max: ${max} px`)
	console.log(`  avg: ${avg} px`)
	console.log(`\nAt 4x upscale these become: min=${min * 4}, max=${max * 4}, avg=${avg * 4} px`)
	console.log(`\nConclusion hint:`)
	if (avg * 4 < 5906) {
		console.log('  ❌ Current output × 4x is insufficient for 70×100 @ 150dpi.')
		console.log('     Consider switching to nano-banana-pro (2K/4K) or dropping large format.')
	} else if (avg * 4 < 4724) {
		console.log('  ⚠️  Current output × 4x is just enough for 50×70 but tight for 30×40 @ 300dpi.')
	} else {
		console.log('  ✅ Current output × 4x is sufficient for all tryckeri DPI targets.')
	}
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
