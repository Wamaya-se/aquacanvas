import 'server-only'
import { getKieApiKey } from '@/lib/env'

const KIE_BASE_URL = 'https://api.kie.ai'
const KIE_FILE_UPLOAD_URL = 'https://kieai.redpandaai.co/api/file-base64-upload'
const MODEL_NANO_BANANA_EDIT = 'google/nano-banana-edit'
const MODEL_FLUX_IMAGE_TO_IMAGE = 'flux-2/flex-image-to-image'

export type KieTaskState =
	| 'waiting'
	| 'queuing'
	| 'generating'
	| 'success'
	| 'fail'

export type AspectRatio = '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '3:2' | '2:3' | '4:5' | '5:4' | '21:9' | 'auto'

export interface CreateTaskOptions {
	outputFormat?: 'png' | 'jpeg'
	imageSize?: AspectRatio
}

export interface FluxTaskOptions {
	aspectRatio?: AspectRatio
	resolution?: '1K' | '2K'
}

interface KieCreateTaskResponse {
	code: number
	msg: string
	data: {
		taskId: string
	}
}

interface KieFileUploadResponse {
	code: number
	msg: string
	data: {
		downloadUrl: string
	}
}

interface KieTaskResultUrls {
	resultUrls: string[]
}

export interface KieTaskDetails {
	taskId: string
	model: string
	state: KieTaskState
	param: string
	resultJson: string | null
	failCode: string
	failMsg: string
	costTime: number
	completeTime: number
	createTime: number
	updateTime: number
}

interface KieGetTaskResponse {
	code: number
	msg: string
	data: KieTaskDetails
}

function getHeaders(): Record<string, string> {
	return {
		'Authorization': `Bearer ${getKieApiKey()}`,
		'Content-Type': 'application/json',
	}
}

export async function uploadFileToKie(
	fileBuffer: ArrayBuffer,
	contentType: string,
	fileName: string,
): Promise<string> {
	const base64 = Buffer.from(fileBuffer).toString('base64')
	const dataUrl = `data:${contentType};base64,${base64}`

	const res = await fetch(KIE_FILE_UPLOAD_URL, {
		method: 'POST',
		headers: getHeaders(),
		body: JSON.stringify({
			base64Data: dataUrl,
			uploadPath: `aquacanvas/${Date.now()}`,
			fileName,
		}),
	})

	if (!res.ok) {
		const text = await res.text().catch(() => 'Unknown error')
		throw new Error(`Kie.ai file upload failed (${res.status}): ${text}`)
	}

	const json = (await res.json()) as KieFileUploadResponse

	if (json.code !== 200) {
		throw new Error(`Kie.ai file upload error (${json.code}): ${json.msg}`)
	}

	return json.data.downloadUrl
}

export async function createImageTask(
	imageUrl: string,
	prompt: string,
	options: CreateTaskOptions = {},
): Promise<{ taskId: string }> {
	const body = {
		model: MODEL_NANO_BANANA_EDIT,
		input: {
			prompt,
			image_urls: [imageUrl],
			output_format: options.outputFormat ?? 'png',
			image_size: options.imageSize ?? 'auto',
		},
	}

	const res = await fetch(`${KIE_BASE_URL}/api/v1/jobs/createTask`, {
		method: 'POST',
		headers: getHeaders(),
		body: JSON.stringify(body),
	})

	if (!res.ok) {
		const text = await res.text().catch(() => 'Unknown error')
		throw new Error(`Kie.ai createTask failed (${res.status}): ${text}`)
	}

	const json = (await res.json()) as KieCreateTaskResponse

	if (json.code !== 200) {
		throw new Error(`Kie.ai createTask error (${json.code}): ${json.msg}`)
	}

	return { taskId: json.data.taskId }
}

export async function getTaskStatus(taskId: string): Promise<{
	state: KieTaskState
	resultUrls: string[] | null
	failMsg: string | null
	costTime: number
}> {
	const url = new URL(`${KIE_BASE_URL}/api/v1/jobs/recordInfo`)
	url.searchParams.set('taskId', taskId)

	const res = await fetch(url.toString(), {
		method: 'GET',
		headers: getHeaders(),
	})

	if (!res.ok) {
		const text = await res.text().catch(() => 'Unknown error')
		throw new Error(`Kie.ai getTask failed (${res.status}): ${text}`)
	}

	const json = (await res.json()) as KieGetTaskResponse

	if (json.code !== 200) {
		throw new Error(`Kie.ai getTask error (${json.code}): ${json.msg}`)
	}

	const { state, resultJson, failMsg, costTime } = json.data

	let resultUrls: string[] | null = null
	if (state === 'success' && resultJson) {
		try {
			const parsed = JSON.parse(resultJson) as KieTaskResultUrls
			resultUrls = parsed.resultUrls ?? null
		} catch {
			console.error('[ai] Failed to parse resultJson:', resultJson)
		}
	}

	return {
		state,
		resultUrls,
		failMsg: failMsg || null,
		costTime,
	}
}

export const ENVIRONMENT_PREVIEW_PROMPT = [
	'STRICT IMAGE COMPOSITING TASK. No creative interpretation allowed.',
	'Reference image 1 is the artwork. Reference image 2 is the room scene with a canvas on the wall.',
	'TASK: Replace ONLY the painted surface inside the canvas frame in reference image 2 with the artwork from reference image 1.',
	'RULES:',
	'1. The artwork MUST fill 100% of the canvas surface, edge to edge, corner to corner. No margins, no borders, no blank space. The entire canvas area must be covered by the new artwork.',
	'2. The canvas frame MUST remain pixel-identical to reference image 2. Same exact color, material, thickness, shape, and position. Do NOT alter, redraw, or reimagine the frame.',
	'3. Every single pixel outside the canvas surface MUST be identical to reference image 2. Walls, furniture, lighting, shadows, reflections, decor, ceiling, floor — all frozen and immutable.',
	'4. Apply correct perspective transformation so the artwork matches the exact angle, tilt, and foreshortening of the canvas as it appears in the room.',
	'5. Match the room ambient lighting on the artwork surface so it looks physically present.',
	'6. Do NOT add, remove, resize, reposition, or reshape the canvas or frame.',
	'7. Do NOT change the canvas aspect ratio or dimensions.',
	'8. Do NOT add any new elements to the scene.',
	'9. Do NOT change any colors, textures, or materials of the frame or room.',
	'This is purely a compositing operation. The ONLY change is the image content within the canvas boundaries.',
].join(' ')

export async function createEnvironmentPreviewTask(
	artworkUrl: string,
	sceneUrl: string,
	prompt: string = ENVIRONMENT_PREVIEW_PROMPT,
	options: FluxTaskOptions = {},
): Promise<{ taskId: string }> {
	const body = {
		model: MODEL_FLUX_IMAGE_TO_IMAGE,
		input: {
			prompt,
			input_urls: [artworkUrl, sceneUrl],
			aspect_ratio: options.aspectRatio ?? 'auto',
			resolution: options.resolution ?? '2K',
		},
	}

	const res = await fetch(`${KIE_BASE_URL}/api/v1/jobs/createTask`, {
		method: 'POST',
		headers: getHeaders(),
		body: JSON.stringify(body),
	})

	if (!res.ok) {
		const text = await res.text().catch(() => 'Unknown error')
		throw new Error(`Kie.ai createTask (env preview) failed (${res.status}): ${text}`)
	}

	const json = (await res.json()) as KieCreateTaskResponse

	if (json.code !== 200) {
		throw new Error(`Kie.ai createTask (env preview) error (${json.code}): ${json.msg}`)
	}

	return { taskId: json.data.taskId }
}
