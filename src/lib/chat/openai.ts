import OpenAI from 'openai';
import { get } from 'svelte/store';

import { settingsStore } from '../localStorage';
import type { ChatStrategy } from './index';

export class OpenAIStrategy implements ChatStrategy {
	private openai: OpenAI;

	constructor() {
		const settings = get(settingsStore);

		this.openai = new OpenAI({
			baseURL: settings.openaiServer,
			apiKey: settings.openaiApiKey || undefined,
			dangerouslyAllowBrowser: true
		});
	}

	async chat(
		payload: any,
		abortSignal: AbortSignal,
		onChunk: (content: string) => void
	): Promise<void> {
		const response = await this.openai.chat.completions.create({
			model: payload.model,
			messages: payload.messages,
			stream: true
		});

		for await (const chunk of response) {
			if (abortSignal.aborted) break;
			onChunk(chunk.choices[0].delta.content || '');
		}
	}

	async getModels(): Promise<any> {
		const response = await this.openai.models.list();
		return response.data;
	}
}
