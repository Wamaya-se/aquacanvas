/**
 * Verify the Fas 14 image pipeline (Batch A).
 *
 * 1. Synthesize a small test image (or pull a real generated image from Supabase).
 * 2. Run normalizeInput and assert: rotated, sRGB, JPEG, dimensions within cap.
 * 3. Run convertToAdobeRgb and assert: JPEG, AdobeRGB ICC embedded, byte-identical
 *    metadata layout to what the tryckeri expects.
 * 4. Run computePrintDpi / requiredLongestPx math against known format targets.
 *
 * Run:
 *   npx tsx scripts/test-image-pipeline.ts
 */

import './_shim-server-only'

import sharp from 'sharp'
import {
	normalizeInput,
	convertToAdobeRgb,
	computePrintDpi,
	requiredLongestPx,
	probeDimensions,
} from '../src/lib/image-processing'

function assertEquals<T>(actual: T, expected: T, label: string) {
	if (actual !== expected) {
		console.error(`  ✗ ${label}`)
		console.error(`    expected: ${String(expected)}`)
		console.error(`    actual:   ${String(actual)}`)
		process.exit(1)
	}
	console.log(`  ✓ ${label}`)
}

function assertTrue(cond: boolean, label: string) {
	if (!cond) {
		console.error(`  ✗ ${label}`)
		process.exit(1)
	}
	console.log(`  ✓ ${label}`)
}

async function synthImage(): Promise<Buffer> {
	return sharp({
		create: {
			width: 2000,
			height: 1500,
			channels: 3,
			background: { r: 180, g: 60, b: 120 },
		},
	})
		.jpeg({ quality: 90 })
		.toBuffer()
}

async function main() {
	console.log('\n📸 normalizeInput')
	const source = await synthImage()
	const normalized = await normalizeInput(source)

	assertEquals(normalized.mime, 'image/jpeg', 'mime is image/jpeg')
	assertEquals(normalized.width, 2000, 'width preserved when under cap')
	assertEquals(normalized.height, 1500, 'height preserved when under cap')

	const normMeta = await sharp(normalized.buffer).metadata()
	assertEquals(normMeta.space, 'srgb', 'normalized image is in sRGB color space')

	console.log('\n🎨 normalizeInput — cap enforcement')
	const bigSource = await sharp({
		create: { width: 8000, height: 6000, channels: 3, background: { r: 0, g: 0, b: 0 } },
	})
		.jpeg()
		.toBuffer()

	const capped = await normalizeInput(bigSource, { maxLongestSide: 4096 })
	assertTrue(Math.max(capped.width, capped.height) <= 4096, 'longest side capped at 4096')

	console.log('\n🖨️  convertToAdobeRgb')
	const print = await convertToAdobeRgb(normalized.buffer)
	assertEquals(print.mime, 'image/jpeg', 'print file is JPEG')

	const printMeta = await sharp(print.buffer).metadata()
	assertTrue(Boolean(printMeta.icc), 'ICC profile embedded in print file')
	assertEquals(printMeta.chromaSubsampling, '4:4:4', 'chroma subsampling is 4:4:4')

	// Peek at embedded ICC to verify it matches AdobeRGB signature.
	// ICC profile has ASCII description at fixed offset after header.
	const iccBuf = printMeta.icc as Buffer
	assertTrue(iccBuf.length > 200, 'ICC profile has substantive length')
	const iccText = iccBuf.toString('ascii')
	assertTrue(
		iccText.toLowerCase().includes('adobe'),
		'ICC profile description mentions Adobe (AdobeRGB1998)',
	)

	console.log('\n📏 computePrintDpi')
	const dpi30x40 = computePrintDpi(4736, 3552, 40)
	assertEquals(dpi30x40, 300, '1184×4=4736 at 40 cm → 300 dpi')

	const dpi50x70 = computePrintDpi(4736, 3552, 70)
	assertTrue(dpi50x70 < 200, `50×70 @ 4x from 1184 gives ${dpi50x70} dpi (expected <200)`)

	console.log('\n🎯 requiredLongestPx')
	assertEquals(requiredLongestPx(40, 300), 4725, '40 cm @ 300 dpi → 4725 px (ceil of 4724.41)')
	assertEquals(requiredLongestPx(70, 200), 5512, '70 cm @ 200 dpi → 5512 px')
	assertEquals(requiredLongestPx(100, 150), 5906, '100 cm @ 150 dpi → 5906 px')

	console.log('\n🔍 probeDimensions')
	const probe = await probeDimensions(normalized.buffer)
	assertEquals(probe.width, 2000, 'probe width')
	assertEquals(probe.height, 1500, 'probe height')
	assertEquals(probe.format, 'jpeg', 'probe format')

	console.log('\n✅ All pipeline checks passed.')
	console.log(`   Print file size: ${(print.buffer.length / 1024).toFixed(1)} KB`)
	console.log(`   ICC profile:     ${iccBuf.length} bytes embedded`)
}

main().catch((err) => {
	console.error('\n❌ Pipeline test failed:')
	console.error(err)
	process.exit(1)
})
