import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

import type { Server } from '$lib/settings';

import type { ChatRequest, ChatStrategy, Model } from './index';

export class OpenAIStrategy implements ChatStrategy {
	private openai: OpenAI;

	constructor(private server: Server) {
		this.openai = new OpenAI({
			baseURL: this.server.baseUrl,
			apiKey: this.server.apiKey || '',
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
		return response.data
			?.filter((model) => model.id.startsWith(this.server.modelFilter || ''))
			.map((model) => ({
				serverId: this.server.id,
				name: model.id
			}));
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
