import OpenAI from 'openai';
import { get } from 'svelte/store';

import { settingsStore } from '../localStorage';
import type { ChatStrategy } from './index';

export class OpenAIStrategy implements ChatStrategy {
	private openai: OpenAI;

	constructor() {
		const settings = get(settingsStore);
		if (!settings) throw new Error('No OpenAI API key specified');
		// if (!settings.openaiApiKey) throw new Error('No OpenAI API key specified');
		settings.openaiApiKey = 'sk-proj-933434-1234567890';

		this.openai = new OpenAI({ apiKey: settings.openaiApiKey, dangerouslyAllowBrowser: true });
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
			onChunk(chunk.choices[0].delta.content || '');
		}
	}

	async getModels(): Promise<any> {
		const response = await this.openai.models.list();
		return response.data;
	}
}
