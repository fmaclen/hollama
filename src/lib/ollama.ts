import { get } from "svelte/store";
import type { Session } from "$lib/sessions";
import { settingsStore } from "$lib/store";

type OllamaCompletionRequest = {
	context: number[];
	prompt: string;
	model: string;
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

export async function ollamaGenerate(session: Session, abortSignal: AbortSignal) {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');
	

	let payload: OllamaCompletionRequest = {
		model: session.model,
		context: session.context,
		prompt: session.messages[session.messages.length - 1].content,

		// HACK: we need to be sure that the system prompt is only sent once per session
		system: session.messages[session.messages.length - 2].knowledge?.content
	};

	return await fetch(`${settings.ollamaServer}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'text/event-stream' },
		body: JSON.stringify(payload),
		signal: abortSignal
	});
}
