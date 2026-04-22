#!/usr/bin/env node
/**
 * i18n audit — scans the codebase for translation keys and verifies that each
 * one exists in both `messages/en.json` and `messages/sv.json`.
 *
 * Detects two classes of problems:
 *   1. Key referenced in code but missing from one or both message files.
 *   2. Keys defined in one locale but missing from the other (drift).
 *
 * Exits with code 1 if any real missing keys are found — suitable for CI.
 *
 * Usage:  node scripts/i18n-audit.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const ROOT = path.resolve(path.dirname(__filename), '..')

const en = JSON.parse(
	fs.readFileSync(path.join(ROOT, 'messages/en.json'), 'utf-8'),
)
const sv = JSON.parse(
	fs.readFileSync(path.join(ROOT, 'messages/sv.json'), 'utf-8'),
)

const resolveKey = (obj, key) => {
	const parts = key.split('.')
	let cur = obj
	for (const p of parts) {
		if (cur && typeof cur === 'object' && p in cur) cur = cur[p]
		else return undefined
	}
	return cur
}
const hasStringKey = (obj, key) => typeof resolveKey(obj, key) === 'string'

const walk = (dir, files = []) => {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === 'node_modules' || entry.name === '.next')
			continue
		if (entry.name.startsWith('.')) continue
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) walk(full, files)
		else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full)
	}
	return files
}

/**
 * Scope-aware scan of a single source file.
 *
 * next-intl binds a namespace to a variable:
 *   const t = useTranslations('shop')
 *   const t = await getTranslations('admin.meta')
 *
 * We treat every top-level function body as an isolated scope so that
 * two `const t = ...` declarations in sibling functions don't collide.
 */
const scanFile = (file) => {
	const src = fs.readFileSync(file, 'utf-8')
	const results = []

	// Split on function boundaries to approximate scope. We use a simple
	// heuristic: scan per-line, resetting the variable map on "function "
	// or "export default function" or arrow-function patterns at col 0.
	const lines = src.split('\n')
	let vars = {}
	const flush = () => {
		vars = {}
	}

	const varNsRe =
		/const\s+(\w+)\s*=\s*(?:await\s+)?(?:use|get)Translations\s*\(\s*(?:['"`]([a-zA-Z0-9_.]+)['"`])?\s*\)/g

	for (const line of lines) {
		if (/^(export\s+)?(async\s+)?function\s+\w+/.test(line))
			flush()
		if (/^(export\s+default\s+)?(async\s+)?function\s*\(/.test(line))
			flush()
		if (/^(export\s+)?const\s+\w+\s*=\s*(async\s*)?\(/.test(line))
			flush()

		let vm
		while ((vm = varNsRe.exec(line))) {
			vars[vm[1]] = vm[2] ?? ''
		}

		// Find translation calls: varName('key') or varName.rich('key', …)
		for (const name of Object.keys(vars)) {
			const callRe = new RegExp(
				`\\b${name}(?:\\.rich|\\.raw)?\\s*\\(\\s*['"\`]([a-zA-Z0-9_.]+)['"\`]`,
				'g',
			)
			let cm
			while ((cm = callRe.exec(line))) {
				const key = cm[1]
				const ns = vars[name]
				const fullKey = ns ? `${ns}.${key}` : key
				results.push({ key: fullKey, file })
			}
		}
	}

	return results
}

const files = walk(path.join(ROOT, 'src'))
const allRefs = files.flatMap(scanFile)

// Deduplicate by key (keep list of files per key)
const byKey = new Map()
for (const r of allRefs) {
	if (!byKey.has(r.key)) byKey.set(r.key, new Set())
	byKey.get(r.key).add(path.relative(ROOT, r.file))
}

const missingEn = []
const missingSv = []
for (const [key, fileSet] of byKey) {
	if (!hasStringKey(en, key))
		missingEn.push({ key, files: [...fileSet] })
	if (!hasStringKey(sv, key))
		missingSv.push({ key, files: [...fileSet] })
}

// Drift check: keys present in one locale but not the other.
const flatten = (obj, prefix = '', out = {}) => {
	for (const [k, v] of Object.entries(obj)) {
		const key = prefix ? `${prefix}.${k}` : k
		if (v && typeof v === 'object' && !Array.isArray(v))
			flatten(v, key, out)
		else out[key] = true
	}
	return out
}
const enFlat = flatten(en)
const svFlat = flatten(sv)
const onlyEn = Object.keys(enFlat).filter((k) => !(k in svFlat))
const onlySv = Object.keys(svFlat).filter((k) => !(k in enFlat))

let hasErrors = false

if (missingEn.length) {
	hasErrors = true
	console.error(
		`\n❌ Missing in messages/en.json (${missingEn.length}):`,
	)
	for (const m of missingEn)
		console.error(`   ${m.key}\n     used in: ${m.files.join(', ')}`)
}
if (missingSv.length) {
	hasErrors = true
	console.error(
		`\n❌ Missing in messages/sv.json (${missingSv.length}):`,
	)
	for (const m of missingSv)
		console.error(`   ${m.key}\n     used in: ${m.files.join(', ')}`)
}
if (onlyEn.length) {
	console.warn(
		`\n⚠️  Present in en.json but missing in sv.json (${onlyEn.length}):`,
	)
	for (const k of onlyEn) console.warn(`   ${k}`)
	hasErrors = true
}
if (onlySv.length) {
	console.warn(
		`\n⚠️  Present in sv.json but missing in en.json (${onlySv.length}):`,
	)
	for (const k of onlySv) console.warn(`   ${k}`)
	hasErrors = true
}

if (!hasErrors) {
	console.log('✅ i18n audit passed — all keys resolved, no drift.')
	process.exit(0)
}
process.exit(1)
