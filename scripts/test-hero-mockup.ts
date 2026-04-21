/**
 * Manual E2E driver for the hero-mockup pipeline (Fas 15 Batch B).
 *
 * Runs the full Kie flow against a real order: fetches master + artwork,
 * uploads to Kie, creates task, polls until success/fail, downloads result
 * to Supabase Storage, and prints the final public URL.
 *
 * This bypasses the Next.js server-action layer (no auth, no guest session)
 * so it's a backend sanity-check only — don't expose logic here that the
 * real action doesn't run.
 *
 * Usage:
 *   npx tsx scripts/test-hero-mockup.ts <orderId>
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * and KIE_API_KEY.
 */

import './_shim-server-only'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
	console.error(
		'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
	)
	process.exit(1)
}

const orderId = process.argv[2]
if (!orderId) {
	console.error('Usage: npx tsx scripts/test-hero-mockup.ts <orderId>')
	process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE)

async function main(): Promise<void> {
	const { createEnvironmentPreviewTask, getTaskStatus, uploadFileToKie } =
		await import('../src/lib/ai')
	const { HERO_MOCKUP_PATHS, resolveHeroMockupOrientation } = await import(
		'../src/lib/hero-mockup-scenes'
	)

	console.log(`Fetching order ${orderId}…`)
	const { data: order, error } = await db
		.from('orders')
		.select(
			'id, orientation, generated_image_path, generated_width_px, generated_height_px, user_id',
		)
		.eq('id', orderId)
		.single()

	if (error || !order) {
		console.error('Order not found:', error?.message)
		process.exit(1)
	}

	if (!order.generated_image_path) {
		console.error('Order has no generated_image_path')
		process.exit(1)
	}

	const orientation = resolveHeroMockupOrientation(
		order.orientation,
		order.generated_width_px,
		order.generated_height_px,
	)
	if (!orientation) {
		console.error('Could not resolve orientation')
		process.exit(1)
	}

	const masterPath = HERO_MOCKUP_PATHS[orientation]
	console.log(`Orientation: ${orientation} → master: ${masterPath}`)

	const { data: masterData } = db.storage.from('images').getPublicUrl(masterPath)
	const masterRes = await fetch(masterData.publicUrl)
	if (!masterRes.ok) throw new Error(`Master fetch failed: ${masterRes.status}`)
	const masterBuffer = await masterRes.arrayBuffer()
	const masterKieUrl = await uploadFileToKie(
		masterBuffer,
		'image/jpeg',
		`hero-mockup-${orientation}.jpeg`,
	)
	console.log(`Master uploaded to Kie: ${masterKieUrl}`)

	const { data: artworkData } = db.storage
		.from('images')
		.getPublicUrl(order.generated_image_path)
	const artworkRes = await fetch(artworkData.publicUrl)
	if (!artworkRes.ok) throw new Error(`Artwork fetch failed: ${artworkRes.status}`)
	const artworkBuffer = await artworkRes.arrayBuffer()
	const artworkKieUrl = await uploadFileToKie(
		artworkBuffer,
		'image/png',
		'artwork.png',
	)
	console.log(`Artwork uploaded to Kie: ${artworkKieUrl}`)

	const { taskId } = await createEnvironmentPreviewTask(artworkKieUrl, masterKieUrl)
	console.log(`Task created: ${taskId}`)

	let attempt = 0
	while (attempt < 30) {
		await new Promise((r) => setTimeout(r, 4000))
		const status = await getTaskStatus(taskId)
		console.log(`  [${String(attempt).padStart(2)}] state=${status.state}`)

		if (status.state === 'success' && status.resultUrls?.length) {
			console.log(`\nSuccess. Result URL: ${status.resultUrls[0]}`)
			console.log(`Cost time: ${status.costTime}ms`)
			return
		}
		if (status.state === 'fail') {
			console.error(`\nFailed: ${status.failCode} ${status.failMsg}`)
			process.exit(1)
		}
		attempt += 1
	}
	console.error('Timed out after 30 polls')
	process.exit(1)
}

main().catch((err) => {
	console.error('Fatal:', err)
	process.exit(1)
})
