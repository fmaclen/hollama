import type {
	ChatRequest,
	ChatResponse,
	ErrorResponse,
	ListResponse,
	ProgressResponse,
	PullRequest,
	StatusResponse
} from 'ollama/browser';

import type { Server } from '$lib/connections';
import type { Model } from '$lib/settings';

import type { ChatStrategy } from './index';

export interface OllamaOptions {
	numa: boolean;
	num_ctx: number;
	num_batch: number;
	num_gpu: number;
	main_gpu: number;
	low_vram: boolean;
	f16_kv: boolean;
	// logits_all: boolean; // REF https://github.com/ollama/ollama-js/issues/145
	vocab_only: boolean;
	use_mmap: boolean;
	use_mlock: boolean;
	// embedding_only: boolean; // REF https://github.com/ollama/ollama-js/issues/145
	num_thread: number;

	// Runtime options
	num_keep: number;
	seed: number;
	num_predict: number;
	top_k: number;
	top_p: number;
	min_p: number; // REF https://github.com/ollama/ollama-js/issues/145
	tfs_z: number;
	typical_p: number;
	repeat_last_n: number;
	temperature: number;
	repeat_penalty: number;
	presence_penalty: number;
	frequency_penalty: number;
	mirostat: number;
	mirostat_tau: number;
	mirostat_eta: number;
	penalize_newline: boolean;
	stop: string[];
}

export class OllamaStrategy implements ChatStrategy {
	constructor(private server: Server) {}

	async chat(
		payload: ChatRequest,
		abortSignal: AbortSignal,
		onChunk: (content: string) => void
	): Promise<void> {
		const response = await fetch(`${this.server.baseUrl}/api/chat`, {
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

	async getModels(): Promise<Model[]> {
		const response = await fetch(`${this.server.baseUrl}/api/tags`);
		if (!response.ok) throw new Error('Failed to fetch Ollama tags');

		const data: ListResponse | undefined = await response.json();
		if (!data || !Array.isArray(data.models)) {
			throw new Error('Failed to parse Ollama tags', { cause: data });
		}

		return data.models
			?.filter((model) => model.name.startsWith(this.server.modelFilter || ''))
			.map((model) => ({
				...model,
				serverId: this.server.id,
				parameterSize: model.details.parameter_size,
				modifiedAt: new Date(model.modified_at)
			}));
	}

	async pull(
		payload: PullRequest,
		onChunk: (progress: ProgressResponse | StatusResponse | ErrorResponse) => void
	): Promise<void> {
		const response = await fetch(`${this.server.baseUrl}/api/pull`, {
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

	async verifyServer(): Promise<boolean> {
		try {
			await this.getModels();
			return true;
		} catch {
			return false;
		}
	}
}
