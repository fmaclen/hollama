import { get } from "svelte/store";
import { settingsStore } from "$lib/store";
import type { Message } from "./sessions";

export type OllamaCompletionRequest = {
	prompt: string;
	model: string;
	context?: number[];
	system?: string;
}

export type OllamaCompletionResponse = {
	model: string;
	created_at: string;
	response: string;
	done: boolean;
	context: number[];
	total_duration: number;
	load_duration: number;
	prompt_eval_count: number;
	prompt_eval_duration: number;
	eval_count: number;
	eval_duration: number;
}

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

export async function ollamaGenerate(payload: OllamaCompletionRequest, abortSignal: AbortSignal) {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');

	return await fetch(`${settings.ollamaServer}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'text/event-stream' },
		body: JSON.stringify(payload),
		signal: abortSignal
	});
}

export type OllamaChatRequest = {
  model: string;
  messages: Message[];
  stream?: boolean;
  options?: Record<string, any>;
};

export type OllamaChatResponse = {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
};

export async function ollamaChat(payload: OllamaChatRequest, abortSignal: AbortSignal) {
  const settings = get(settingsStore);
  if (!settings) throw new Error('No Ollama server specified');

  return await fetch(`${settings.ollamaServer}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/event-stream' },
    body: JSON.stringify(payload),
    signal: abortSignal
  });
}
