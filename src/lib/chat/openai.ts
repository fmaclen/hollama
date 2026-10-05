import OpenAI from 'openai';
import type {
	ChatCompletionChunk,
	ChatCompletionContentPart,
	ChatCompletionMessageParam
} from 'openai/resources/index.mjs';

import type { Server } from '#lib/connections.js';
import type { Model } from '#lib/settings.js';

import type { ChatChunk, ChatRequest, ChatStrategy, Message } from './index';

// Not part of OpenAI's spec: Ollama and OpenRouter stream reasoning as `reasoning`,
// DeepSeek and vLLM as `reasoning_content`.
type OpenAICompatibleDelta = ChatCompletionChunk.Choice.Delta & {
	reasoning?: string;
	reasoning_content?: string;
};

export class OpenAIStrategy implements ChatStrategy {
	private openai: OpenAI;

	constructor(private server: Server) {
		this.openai = new OpenAI({
			baseURL: this.server.baseUrl,
			// The SDK rejects an empty key, but servers like llama.cpp don't need one
			apiKey: this.server.apiKey || 'none',
			dangerouslyAllowBrowser: true
		});
	}

	async chat(
		payload: ChatRequest,
		abortSignal: AbortSignal,
		onChunk: (chunk: ChatChunk) => void
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

			const delta = chunk.choices[0]?.delta as OpenAICompatibleDelta | undefined;
			if (!delta) continue;

			const reasoning = delta.reasoning || delta.reasoning_content;
			if (delta.content || reasoning) onChunk({ content: delta.content ?? undefined, reasoning });
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
