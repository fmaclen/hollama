import { get } from "svelte/store";
import type { Session } from "$lib/sessions";
import { settingsStore } from "$lib/store";

interface OllamaCompletionRequest {
	model: string;
	prompt: string;
	context: number[];
}

export async function ollamaGenerate(session: Session) {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');

	const payload: OllamaCompletionRequest = {
		model: session.model,
		context: session.context,
		prompt: session.messages.map(m => m.content).join('\n')
	};

	const response = await fetch(`${settings.ollamaServer}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

	return response.json();
}