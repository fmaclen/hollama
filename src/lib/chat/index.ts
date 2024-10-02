import type { ChatRequest, ListResponse } from 'ollama/browser';

import { OllamaStrategy } from './ollama';
import { OpenAIStrategy } from './openai';

interface ModelStrategy {
	api: 'ollama' | 'openai';
	model: string;
}

export interface ChatStrategy {
	chat(payload: any, abortSignal: AbortSignal, onChunk: (content: string) => void): Promise<void>;

	getModels(): Promise<any>;

	pull?(payload: any, onChunk: (progress: any) => void): Promise<void>;
}

function getChatStrategy(model: ModelStrategy): ChatStrategy {
	if (model.api === 'ollama') return new OllamaStrategy();
	else if (model.api === 'openai') return new OpenAIStrategy();

	throw new Error('Invalid API type specified');
}

export async function chat(
	model: ModelStrategy,
	payload: ChatRequest,
	abortSignal: AbortSignal,
	onChunk: (content: string) => void
): Promise<void> {
	const strategy = getChatStrategy(model);
	return strategy.chat(payload, abortSignal, onChunk);
}

export async function listModels(): Promise<ListResponse> {
	// TODO fix
	const strategy = getChatStrategy({} as ModelStrategy);
	return await strategy.getModels();
}
