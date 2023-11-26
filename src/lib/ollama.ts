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
		prompt: session.messages[session.messages.length - 1].content
	};

	return await fetch(`${settings.ollamaServer}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'text/event-stream' },
		body: JSON.stringify(payload)
	});
}