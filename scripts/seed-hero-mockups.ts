/**
 * Seed hero mockup master images to Supabase Storage.
 *
 * Uploads the three canvas-on-wall master images from public/images/ to the
 * public `images` bucket under `hero-mockups/`. These become the "scene"
 * input for the Kie `flux-2/flex-image-to-image` hero mockup pipeline
 * (Fas 15 Batch B).
 *
 * Run once per environment (dev + prod):
 *   npx tsx scripts/seed-hero-mockups.ts
 *
 * Idempotent: `upsert: true` overwrites existing files so the script can be
 * rerun after master image updates. Public-read policy is granted via
 * migration `00021_hero_mockup.sql`.
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
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

const db = createClient(SUPABASE_URL, SERVICE_ROLE)

interface MockupUpload {
	orientation: 'portrait' | 'landscape' | 'square'
	sourceFile: string
	storagePath: string
}

const MOCKUPS: MockupUpload[] = [
	{
		orientation: 'portrait',
		sourceFile: 'public/images/mockup-vertical.jpeg',
		storagePath: 'hero-mockups/mockup-vertical.jpeg',
	},
	{
		orientation: 'landscape',
		sourceFile: 'public/images/mockup-horizontal.jpeg',
		storagePath: 'hero-mockups/mockup-horizontal.jpeg',
	},
	{
		orientation: 'square',
		sourceFile: 'public/images/mockup-square.jpeg',
		storagePath: 'hero-mockups/mockup-square.jpeg',
	},
]

async function uploadOne(mockup: MockupUpload): Promise<void> {
	const absPath = path.resolve(process.cwd(), mockup.sourceFile)
	const buffer = await readFile(absPath)

	const { error } = await db.storage.from('images').upload(mockup.storagePath, buffer, {
		contentType: 'image/jpeg',
		cacheControl: '31536000',
		upsert: true,
	})

	if (error) {
		throw new Error(`Upload failed for ${mockup.storagePath}: ${error.message}`)
	}

	const { data } = db.storage.from('images').getPublicUrl(mockup.storagePath)
	console.log(`  ✓ ${mockup.orientation.padEnd(9)} → ${data.publicUrl}`)
}

async function main(): Promise<void> {
	console.log('Seeding hero mockup masters to Supabase Storage…\n')

	for (const mockup of MOCKUPS) {
		try {
			await uploadOne(mockup)
		} catch (err) {
			console.error(`  ✗ ${mockup.orientation}:`, err instanceof Error ? err.message : err)
			process.exitCode = 1
		}
	}

	console.log('\nDone. Verify public URLs above open in a browser.')
}

main().catch((err) => {
	console.error('Fatal:', err)
	process.exit(1)
})
