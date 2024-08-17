import { get } from 'svelte/store';
import { settingsStore } from '$lib/store';
import type {
	ErrorResponse,
	ListResponse,
	ProgressResponse,
	PullRequest,
	StatusResponse
} from 'ollama/browser';

export type OllamaModel = {
	name: string;
	model: string;
	modified_at: string;
	size: number;
	digest: string;
	details: {
		parent_model: string;
		format: string;
		family: string;
		families: string[] | null;
		parameter_size: string;
		quantization_level: string;
	};
};

export type OllamaTagResponse = {
	models: OllamaModel[];
};

function getServerFromSettings() {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');

	return settings.ollamaServer;
}

export async function ollamaTags() {
	const ollamaServer = getServerFromSettings();
	const response = await fetch(`${ollamaServer}/api/tags`);
	if (!response.ok) throw new Error('Failed to fetch Ollama tags');

	return response.json() as Promise<OllamaTagResponse>;
}

export async function ollamaPull(
	payload: PullRequest,
	abortSignal: AbortSignal,
	onChunk: (progress: ProgressResponse | StatusResponse | ErrorResponse) => void
) {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');

	const response = await fetch(`${settings.ollamaServer}/api/pull`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
		signal: abortSignal
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
