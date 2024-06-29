import { get } from "svelte/store";
import { settingsStore, knowledgeStore } from "$lib/store";

export interface Knowledge {
	id: string;
	name: string;
	content: string[];
  updated_at: string;
}

export const loadKnowledge = (id: string): Knowledge => {
	let knowledge: Knowledge | null = null;

	// Retrieve the current sessions
	const currentKnowledges = get(knowledgeStore);

	// Find the session with the given id
	if (currentKnowledges) {
		const existingKnowledge = currentKnowledges.find(s => s.id === id);
		existingKnowledge && (knowledge = existingKnowledge);
	}

	if (!knowledge) {
		// Get the current model
		const model = get(settingsStore)?.ollamaModel || "";

		// Create a new session
		knowledge = { id, name: "", content: [], updated_at: new Date().toISOString() };
	}

	return knowledge;
};

export const saveKnowledge = (Knowledge: Knowledge): void => {
	// Retrieve the current sessions
	const currentKnowledges = get(knowledgeStore) || [];

	// Find the index of the session with the same id, if it exists
	const existingKnowledge = currentKnowledges.findIndex(s => s.id === Knowledge.id);

	if (existingKnowledge !== -1) {
		// Update the existing session
		currentKnowledges[existingKnowledge] = Knowledge;
	} else {
		// Add the new session if it doesn't exist
		currentKnowledges.push(Knowledge);
	}

	// Update the store, which will trigger the localStorage update
	knowledgeStore.set(currentKnowledges);
};
