import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

import type { ChatRequest, ChatStrategy, Model } from './index';

export class OpenAIStrategy implements ChatStrategy {
	private openai: OpenAI;

	constructor(params: { server: string; apiKey: string }) {
		this.openai = new OpenAI({
			baseURL: params.server,
			apiKey: params.apiKey,
			dangerouslyAllowBrowser: true
		});
	}

	config(params: { server: string; apiKey: string }): void {
		this.openai.baseURL = params.server;
		this.openai.apiKey = params.apiKey;
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
		return response.data
			?.filter((model) => model.id.startsWith('gpt'))
			.map((model) => ({
				api: 'openai',
				name: model.id
			}));
	}
}
