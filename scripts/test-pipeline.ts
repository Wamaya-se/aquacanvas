/**
 * Worst-case corpus test for the Fas 14 print pipeline (Batch E).
 *
 * For each image in `test-images/worst-case/`:
 *   1. `normalizeInput`    → sRGB JPEG, EXIF-rotated, capped at 4096 px
 *   2. Simulated 4x upscale (sharp bilinear stand-in for Topaz)
 *   3. `convertToAdobeRgb` → AdobeRGB-tagged print JPEG, chroma 4:4:4
 *   4. Per-format DPI check against the 3 live format sizes (30×40, 40×30, 30×30)
 *      + 2 currently-disabled sizes (50×70, 70×100) for forward-looking context.
 *
 * Generates synthetic fixtures on first run so a fresh clone (or CI) can
 * execute immediately without binary blobs in git. Real-world fixtures
 * (iPhone HEIC, Instagram screenshots, etc.) go in the same folder — see
 * `test-images/worst-case/README.md`.
 *
 * Output per image is written to `test-images/output/<filename>.print.jpg`
 * for visual inspection. Exit code is non-zero if any file fails a gate.
 *
 * Run:
 *   npx tsx scripts/test-pipeline.ts
 */

import './_shim-server-only'

import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import {
	normalizeInput,
	convertToAdobeRgb,
	computePrintDpi,
} from '../src/lib/image-processing'

const WORST_CASE_DIR = path.join(process.cwd(), 'test-images/worst-case')
const OUTPUT_DIR = path.join(process.cwd(), 'test-images/output')
const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

/**
 * Live canvas formats we must be able to print today. If any input drops
 * below the min DPI here at 30×40 (the smallest format), the pipeline is
 * failing its purpose — we guard on 150 DPI as the absolute floor for
 * the tryckeri (their recommended floor is 300 for 30×40, but 150 is the
 * "readable print" hard-stop).
 */
const MIN_ACCEPTABLE_DPI_30X40 = 150

/**
 * Formats we evaluate DPI against. `active` marks which are currently
 * sellable in production; the disabled ones are shown for context so
 * the script doubles as a decision-support tool when we consider
 * re-enabling large formats.
 */
const FORMAT_TARGETS = [
	{ label: '30×40', longestCm: 40, active: true, targetDpi: 300 },
	{ label: '30×30', longestCm: 30, active: true, targetDpi: 300 },
	{ label: '50×70', longestCm: 70, active: false, targetDpi: 200 },
	{ label: '70×100', longestCm: 100, active: false, targetDpi: 150 },
] as const

interface FixtureResult {
	file: string
	ok: boolean
	notes: string[]
	dpi: Record<string, number>
}

async function ensureDir(dir: string): Promise<void> {
	await fs.mkdir(dir, { recursive: true })
}

async function fileExists(p: string): Promise<boolean> {
	try {
		await fs.access(p)
		return true
	} catch {
		return false
	}
}

/**
 * Generate synthetic fixtures if they're missing. Each covers one failure
 * mode of the real-world corpus without needing binary blobs in git. None
 * are *representative* of real worst-case — they exist to keep the test
 * script self-sufficient on fresh checkouts.
 */
async function ensureSyntheticFixtures(): Promise<void> {
	const fixtures = [
		{
			name: 'synth-tiny-thumbnail.jpg',
			build: () =>
				sharp({
					create: {
						width: 480,
						height: 640,
						channels: 3,
						background: { r: 70, g: 120, b: 180 },
					},
				})
					.jpeg({ quality: 80 })
					.toBuffer(),
		},
		{
			name: 'synth-png-screenshot.png',
			build: () =>
				sharp({
					create: {
						width: 900,
						height: 1600,
						channels: 3,
						background: { r: 240, g: 240, b: 240 },
					},
				})
					.png({ compressionLevel: 6 })
					.toBuffer(),
		},
		{
			name: 'synth-stripped-metadata.jpg',
			build: () =>
				sharp({
					create: {
						width: 2000,
						height: 1500,
						channels: 3,
						background: { r: 200, g: 80, b: 80 },
					},
				})
					.jpeg({ quality: 75, mozjpeg: true })
					.toBuffer(),
		},
		{
			name: 'synth-large-landscape.jpg',
			build: () =>
				sharp({
					create: {
						width: 5000,
						height: 3000,
						channels: 3,
						background: { r: 30, g: 60, b: 30 },
					},
				})
					.jpeg({ quality: 70 })
					.toBuffer(),
		},
	]

	for (const f of fixtures) {
		const p = path.join(WORST_CASE_DIR, f.name)
		if (await fileExists(p)) continue
		const buf = await f.build()
		await fs.writeFile(p, buf)
		console.log(`  + generated ${f.name}`)
	}
}

async function listInputImages(): Promise<string[]> {
	await ensureDir(WORST_CASE_DIR)
	const entries = await fs.readdir(WORST_CASE_DIR)
	return entries
		.filter((name) => SUPPORTED_EXTS.has(path.extname(name).toLowerCase()))
		.sort()
}

async function processOne(fileName: string): Promise<FixtureResult> {
	const srcPath = path.join(WORST_CASE_DIR, fileName)
	const notes: string[] = []
	const dpi: Record<string, number> = {}

	const source = await fs.readFile(srcPath)
	const srcMeta = await sharp(source).metadata()
	notes.push(
		`input: ${srcMeta.format} ${srcMeta.width}×${srcMeta.height}` +
			(srcMeta.icc ? ' (ICC embedded)' : ' (no ICC)'),
	)

	// Step 1: normalize
	const normalized = await normalizeInput(source)
	if (normalized.mime !== 'image/jpeg') {
		return { file: fileName, ok: false, notes: [...notes, 'normalize did not produce JPEG'], dpi }
	}

	// Step 2: simulated 4x upscale (bilinear stand-in for Topaz).
	// This is *not* a quality test — just plumbing. Topaz's perceptual
	// upscale is qualitatively different; we only need a larger buffer
	// so the AdobeRGB conversion step has realistic pixel counts to chew on.
	const upscaled = await sharp(normalized.buffer)
		.resize({
			width: normalized.width * 4,
			height: normalized.height * 4,
			kernel: sharp.kernel.lanczos3,
		})
		.jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true })
		.toBuffer()

	// Step 3: convert to AdobeRGB print file
	const printFile = await convertToAdobeRgb(upscaled)
	const printMeta = await sharp(printFile.buffer).metadata()

	// Gate: ICC embedded
	if (!printMeta.icc) {
		return { file: fileName, ok: false, notes: [...notes, 'print file missing ICC profile'], dpi }
	}
	const iccText = (printMeta.icc as Buffer).toString('ascii').toLowerCase()
	if (!iccText.includes('adobe')) {
		notes.push('WARN: ICC description does not mention Adobe — verify profile')
	}

	// Gate: chroma subsampling
	if (printMeta.chromaSubsampling !== '4:4:4') {
		return {
			file: fileName,
			ok: false,
			notes: [...notes, `chroma is ${printMeta.chromaSubsampling}, expected 4:4:4`],
			dpi,
		}
	}

	notes.push(`print: ${printFile.width}×${printFile.height} (ICC ${(printMeta.icc as Buffer).length} B)`)

	// Step 4: DPI gates per format
	for (const fmt of FORMAT_TARGETS) {
		const d = computePrintDpi(printFile.width, printFile.height, fmt.longestCm)
		dpi[fmt.label] = d
		if (fmt.active && fmt.label === '30×40' && d < MIN_ACCEPTABLE_DPI_30X40) {
			return {
				file: fileName,
				ok: false,
				notes: [
					...notes,
					`DPI at 30×40 is ${d}, below floor ${MIN_ACCEPTABLE_DPI_30X40}`,
				],
				dpi,
			}
		}
	}

	// Write output for visual inspection
	const outName = fileName.replace(/\.[^.]+$/, '') + '.print.jpg'
	await fs.writeFile(path.join(OUTPUT_DIR, outName), printFile.buffer)

	return { file: fileName, ok: true, notes, dpi }
}

function formatDpiLine(dpi: Record<string, number>): string {
	return FORMAT_TARGETS.map((fmt) => {
		const d = dpi[fmt.label]
		const marker = fmt.active
			? d >= fmt.targetDpi
				? '✓'
				: d >= MIN_ACCEPTABLE_DPI_30X40
					? '~'
					: '✗'
			: d >= fmt.targetDpi
				? '✓'
				: '·'
		return `${fmt.label}: ${d} dpi ${marker}${fmt.active ? '' : ' (disabled)'}`
	}).join('  ')
}

async function main() {
	await ensureDir(WORST_CASE_DIR)
	await ensureDir(OUTPUT_DIR)

	console.log('🧪 Ensuring synthetic fixtures…')
	await ensureSyntheticFixtures()

	const inputs = await listInputImages()
	if (inputs.length === 0) {
		console.error('No input images found in test-images/worst-case/')
		process.exit(1)
	}

	console.log(`\n📂 Running pipeline against ${inputs.length} image(s)…\n`)

	const results: FixtureResult[] = []
	for (const name of inputs) {
		process.stdout.write(`• ${name}\n`)
		try {
			const res = await processOne(name)
			results.push(res)
			for (const n of res.notes) console.log(`    ${n}`)
			console.log(`    dpi: ${formatDpiLine(res.dpi)}`)
			console.log(`    ${res.ok ? '✓ PASS' : '✗ FAIL'}\n`)
		} catch (err) {
			console.log(`    ✗ ERROR: ${err instanceof Error ? err.message : String(err)}\n`)
			results.push({ file: name, ok: false, notes: ['threw'], dpi: {} })
		}
	}

	const passed = results.filter((r) => r.ok).length
	const failed = results.length - passed
	console.log(`\n──────────────────────────────────────`)
	console.log(`${passed}/${results.length} passed, ${failed} failed`)
	console.log(`Output files: ${OUTPUT_DIR}`)

	process.exit(failed === 0 ? 0 : 1)
}

main().catch((err) => {
	console.error('\n❌ test-pipeline crashed:', err)
	process.exit(1)
})
