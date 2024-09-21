import type {
	ChatRequest,
	ChatResponse,
	ErrorResponse,
	ListResponse,
	ProgressResponse,
	PullRequest,
	StatusResponse
} from 'ollama/browser';
import { get } from 'svelte/store';

import { settingsStore } from '$lib/localStorage';

export interface OllamaOptions {
	numa?: boolean;
	num_ctx?: number;
	num_batch?: number;
	num_gpu?: number;
	main_gpu?: number;
	low_vram?: boolean;
	f16_kv?: boolean;
	logits_all?: boolean;
	vocab_only?: boolean;
	use_mmap?: boolean;
	use_mlock?: boolean;
	embedding_only?: boolean;
	num_thread?: number;
	num_keep?: number;
	seed?: number;
	num_predict?: number;
	top_k?: number;
	top_p?: number;
	min_p?: number; // Prop is supported but the type is missing in the Ollama types
	tfs_z?: number;
	typical_p?: number;
	repeat_last_n?: number;
	temperature?: number;
	repeat_penalty?: number;
	presence_penalty?: number;
	frequency_penalty?: number;
	mirostat?: number;
	mirostat_tau?: number;
	mirostat_eta?: number;
	penalize_newline?: boolean;
	stop?: string[]; // Should be an array of strings
}

function getServerFromSettings() {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');

	return settings.ollamaServer;
}

export async function ollamaChat(
	payload: ChatRequest,
	abortSignal: AbortSignal,
	onChunk: (content: string) => void
) {
	const response = await fetch(`${getServerFromSettings()}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'text/event-stream' },
		body: JSON.stringify(payload),
		signal: abortSignal
	});

	if (!response.body) throw new Error('Ollama response is missing body');

	const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
	let isCompletionDone = false;

	while (!isCompletionDone) {
		const { value, done } = await reader.read();

		if (done) {
			isCompletionDone = true;
			break;
		}

		if (!response.ok && value) throw new Error(JSON.parse(value).error);
		if (!value) continue;

		const chatResponses = value.split('\n').filter((line) => line);

		for (const chatResponse of chatResponses) {
			const { message } = JSON.parse(chatResponse) as ChatResponse;
			onChunk(message.content);
		}
	}
}

export async function ollamaTags() {
	const response = await fetch(`${getServerFromSettings()}/api/tags`);
	if (!response.ok) throw new Error('Failed to fetch Ollama tags');

	const data: ListResponse | undefined = await response.json();
	if (!data || !Array.isArray(data.models)) {
		throw new Error('Failed to parse Ollama tags', { cause: data });
	}

	// Sort alphabetically
	data.models = data.models.sort((a, b) => {
		const nameA = a.name;
		const nameB = b.name;
		// Compare ignoring case and accents
		return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
	});

	return data;
}

export async function ollamaPull(
	payload: PullRequest,
	onChunk: (progress: ProgressResponse | StatusResponse | ErrorResponse) => void
) {
	const response = await fetch(`${getServerFromSettings()}/api/pull`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

	if (!response.body) throw new Error('Ollama response is missing body');

	const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
	let isPullComplete = false;

	while (!isPullComplete) {
		const { value, done } = await reader.read();

		if (done) {
			isPullComplete = true;
			break;
		}

		if (!response.ok && value) throw new Error(JSON.parse(value).error);
		if (!value) continue;

		const progressUpdates = value.split('\n').filter((line) => line);

		for (const update of progressUpdates) {
			const progressResponse = JSON.parse(update) as ProgressResponse;
			onChunk(progressResponse);
		}
	}
}
