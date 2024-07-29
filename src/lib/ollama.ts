import { get } from 'svelte/store';
import { settingsStore } from '$lib/store';

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

export async function ollamaTags() {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');

	const response = await fetch(`${settings.ollamaServer}/api/tags`);
	if (!response.ok) throw new Error('Failed to fetch Ollama tags');

	return response.json() as Promise<OllamaTagResponse>;
}
