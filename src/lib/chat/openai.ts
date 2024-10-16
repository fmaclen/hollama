import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { get } from 'svelte/store';

import { settingsStore } from '../localStorage';
import type { ChatRequest, ChatStrategy, Model } from './index';

export class OpenAIStrategy implements ChatStrategy {
	private openai: OpenAI;

	constructor() {
		const settings = get(settingsStore);

		this.openai = new OpenAI({
			baseURL: settings.openaiServer,
			apiKey: settings.openaiApiKey || '',
			dangerouslyAllowBrowser: true
		});
	}

	config(params: { server: string; apiKey: string }): void {
		this.openai = new OpenAI({
			baseURL: params.server,
			apiKey: params.apiKey,
			dangerouslyAllowBrowser: true
		});
	}

	async chat(
		payload: ChatRequest,
		abortSignal: AbortSignal,
		onChunk: (content: string) => void
	): Promise<void> {
		const response = await this.openai.chat.completions.create({
			model: payload.model,
			messages: payload.messages as ChatCompletionMessageParam[],
			stream: true
		});

		for await (const chunk of response) {
			if (abortSignal.aborted) break;
			onChunk(chunk.choices[0].delta.content || '');
		}
	}

	async getModels(): Promise<Model[]> {
		const response = await this.openai.models.list();
		return response.data?.map((model) => ({
			api: 'openai',
			name: model.id
		}));
	}
}
