import OpenAI from 'openai';
import type {
	ChatCompletionContentPart,
	ChatCompletionMessageParam
} from 'openai/resources/index.mjs';

import type { Server } from '$lib/connections';
import type { Model } from '$lib/settings';

import type { ChatRequest, ChatStrategy, Message } from './index';

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
		const formattedMessages = payload.messages.map(
			(message: Message): ChatCompletionMessageParam => {
				if (message.images && message.images.length > 0) {
					const content: ChatCompletionContentPart[] = [{ type: 'text', text: message.content }];
					message.images.forEach((img) => {
						let mimeType = 'image/jpeg';
						let base64Data = img;
						const dataUrlMatch = img.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.*)$/);
						if (dataUrlMatch) {
							mimeType = dataUrlMatch[1];
							base64Data = dataUrlMatch[2];
						}
						content.push({
							type: 'image_url',
							image_url: {
								url: `data:${mimeType};base64,${base64Data}`
							}
						});
					});
					// Vision API only supports user role for images currently
					// Cast role explicitly to satisfy TypeScript
					return { role: 'user' as const, content };
				} else {
					// Explicitly cast roles for non-image messages too
					if (message.role === 'user') {
						return { role: 'user', content: message.content };
					} else if (message.role === 'assistant') {
						return { role: 'assistant', content: message.content };
					} else {
						return { role: 'system', content: message.content };
					}
				}
			}
		);

		const response = await this.openai.chat.completions.create({
			model: payload.model,
			messages: formattedMessages,
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
