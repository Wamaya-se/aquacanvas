import { getKieApiKey } from '@/lib/env'

const KIE_BASE_URL = 'https://api.kie.ai'
const KIE_FILE_UPLOAD_URL = 'https://kieai.redpandaai.co/api/file-base64-upload'
const MODEL_NANO_BANANA_EDIT = 'google/nano-banana-edit'

export type KieTaskState =
	| 'waiting'
	| 'queuing'
	| 'generating'
	| 'success'
	| 'fail'

export interface CreateTaskOptions {
	outputFormat?: 'png' | 'jpeg'
	imageSize?: '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '3:2' | '2:3' | '4:5' | '5:4' | '21:9' | 'auto'
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
