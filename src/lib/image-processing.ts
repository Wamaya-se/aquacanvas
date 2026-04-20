import 'server-only'

import path from 'node:path'
import sharp from 'sharp'

/**
 * Aquacanvas image pipeline helpers.
 *
 * Two output profiles:
 * 1. `preview.jpg` → sRGB, q=85, for browser display and email previews.
 * 2. `print.jpg`   → AdobeRGB (1998), q=92, chroma 4:4:4, for production hand-off.
 *
 * The tryckeri requires AdobeRGB with embedded ICC profile, 8-bit RGB JPEG,
 * no extra channels, ratio-based sizing (exact cm dimensions not required).
 */

const ADOBE_RGB_ICC_PATH = path.join(process.cwd(), 'src/lib/icc/AdobeRGB1998.icc')

export interface NormalizedImage {
	buffer: Buffer
	width: number
	height: number
	mime: 'image/jpeg'
}

export interface NormalizeOptions {
	/** Max longest-side pixel cap before AI (default 4096). */
	maxLongestSide?: number
	/** JPEG quality for intermediate normalized file (default 92). */
	quality?: number
}

/**
 * Normalize a raw uploaded image before it enters the AI pipeline.
 *
 * Steps:
 * 1. Auto-rotate from EXIF so pixels match visual orientation.
 * 2. Convert any input color space to sRGB (working space for the AI step).
 * 3. Cap longest side at maxLongestSide (default 4096) to keep AI input sane.
 * 4. Strip all metadata except the inlined sRGB ICC profile.
 * 5. Encode as high-quality JPEG (chroma 4:4:4) — lossless for next step.
 *
 * Output is always JPEG so downstream paths are deterministic.
 */
export async function normalizeInput(
	input: Buffer | ArrayBuffer | Uint8Array,
	options: NormalizeOptions = {},
): Promise<NormalizedImage> {
	const { maxLongestSide = 4096, quality = 92 } = options
	const sourceBuffer = toBuffer(input)

	const pipeline = sharp(sourceBuffer, { failOn: 'none' })
		.rotate()
		.toColorspace('srgb')
		.resize({
			width: maxLongestSide,
			height: maxLongestSide,
			fit: 'inside',
			withoutEnlargement: true,
		})

	const { data, info } = await pipeline
		.jpeg({
			quality,
			chromaSubsampling: '4:4:4',
			mozjpeg: true,
		})
		.withMetadata({ icc: 'srgb' })
		.toBuffer({ resolveWithObject: true })

	return {
		buffer: data,
		width: info.width,
		height: info.height,
		mime: 'image/jpeg',
	}
}

/**
 * Read only width/height/format of an image buffer.
 * Cheaper than normalizeInput when we only need dimensions.
 */
export async function probeDimensions(
	input: Buffer | ArrayBuffer | Uint8Array,
): Promise<{ width: number; height: number; format: string | undefined }> {
	const meta = await sharp(toBuffer(input), { failOn: 'none' }).metadata()
	if (!meta.width || !meta.height) {
		throw new Error('Unable to read image dimensions')
	}
	return { width: meta.width, height: meta.height, format: meta.format }
}

export interface PrintFileOptions {
	/** JPEG quality for print file (default 92). */
	quality?: number
}

export interface PrintFile {
	buffer: Buffer
	width: number
	height: number
	mime: 'image/jpeg'
}

/**
 * Convert an upscaled image to the production-ready AdobeRGB JPEG.
 *
 * Steps:
 * 1. Transform pixel values from sRGB working space into AdobeRGB gamut
 *    using LittleCMS (via sharp), preserving the wider color range.
 * 2. Embed the full AdobeRGB1998 ICC profile so the printer has a known,
 *    unambiguous color reference — no guessing, no silent sRGB assumption.
 * 3. Encode 8-bit RGB JPEG, chroma 4:4:4, q=92 ("compressed sensibly").
 * 4. Strip every other metadata tag (no EXIF leftovers, no thumbnail).
 *
 * Input is expected to be the upscaled AI output (sRGB). Can also be called
 * directly on the AI output to produce a print file without upscaling, for
 * sizes where the raw pixel count is already enough.
 */
export async function convertToAdobeRgb(
	input: Buffer | ArrayBuffer | Uint8Array,
	options: PrintFileOptions = {},
): Promise<PrintFile> {
	const { quality = 92 } = options

	const { data, info } = await sharp(toBuffer(input), { failOn: 'none' })
		.toColorspace('srgb')
		.jpeg({
			quality,
			chromaSubsampling: '4:4:4',
			mozjpeg: true,
		})
		.withMetadata({ icc: ADOBE_RGB_ICC_PATH })
		.toBuffer({ resolveWithObject: true })

	return {
		buffer: data,
		width: info.width,
		height: info.height,
		mime: 'image/jpeg',
	}
}

/**
 * Compute the effective DPI of an image at a given physical print size.
 *
 * Canvas formats are stored in cm. DPI is dots-per-inch at physical size:
 *   dpi = (longest_side_px / (longest_side_cm / 2.54))
 *
 * Use the longest-side ratio to avoid ambiguity when image orientation
 * and format orientation differ. Returns integer DPI, floor-rounded so
 * "200 dpi" guarantees at least 200 — never rounded up optimistically.
 */
export function computePrintDpi(
	imageWidthPx: number,
	imageHeightPx: number,
	formatLongestCm: number,
): number {
	const longestPx = Math.max(imageWidthPx, imageHeightPx)
	const longestInches = formatLongestCm / 2.54
	return Math.floor(longestPx / longestInches)
}

/**
 * Minimum-longest-side in pixels required to hit a given target DPI
 * at a given format size. Useful for eligibility checks in FormatPicker.
 */
export function requiredLongestPx(formatLongestCm: number, targetDpi: number): number {
	return Math.ceil((formatLongestCm / 2.54) * targetDpi)
}

function toBuffer(input: Buffer | ArrayBuffer | Uint8Array): Buffer {
	if (Buffer.isBuffer(input)) return input
	if (input instanceof Uint8Array) return Buffer.from(input)
	return Buffer.from(input)
}
