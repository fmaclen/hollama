import { get } from "svelte/store";
import { settingsStore } from "$lib/store";

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
