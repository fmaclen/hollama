import { get } from 'svelte/store';
import { settingsStore } from '$lib/store';
import type { ListResponse } from 'ollama/browser';

export async function ollamaTags() {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');

	const response = await fetch(`${settings.ollamaServer}/api/tags`);
	if (!response.ok) throw new Error('Failed to fetch Ollama tags');

	const data: ListResponse | undefined = await response.json();
	if (!data || !Array.isArray(data.models)) {
		throw new Error('Failed to parse Ollama tags', { cause: data });
	}

	// Sort alphabetically
	data.models = data.models.sort((a, b) => {
		const nameA = a.name;
		const nameB = b.name;

		return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' }); // compare ignoring case and accents
	});

	return data;
}
