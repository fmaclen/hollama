import { get } from "svelte/store";
import { settingsStore, knowledgeStore } from "$lib/store";

export interface Knowledge {
	id: string;
	name: string;
	content: string[];
  updatedAt: string;
}

export const loadKnowledge = (id: string): Knowledge => {
	let knowledge: Knowledge | null = null;

	// Retrieve the current knowledges
	const currentKnowledges = get(knowledgeStore);

	// Find the knowledge with the given id
	if (currentKnowledges) {
		const existingKnowledge = currentKnowledges.find(s => s.id === id);
		existingKnowledge && (knowledge = existingKnowledge);
	}

	if (!knowledge) {
		// Create a new knowledge
		knowledge = { id, name: "", content: [], updatedAt: new Date().toISOString() };
	}

	return knowledge;
};

export const saveKnowledge = (Knowledge: Knowledge): void => {
	// Retrieve the current knowledges
	const currentKnowledges = get(knowledgeStore) || [];

	// Find the index of the knowledge with the same id, if it exists
	const existingKnowledge = currentKnowledges.findIndex(s => s.id === Knowledge.id);

	if (existingKnowledge !== -1) {
		// Update the existing knowledge
		currentKnowledges[existingKnowledge] = Knowledge;
	} else {
		// Add the new knowledge if it doesn't exist
		currentKnowledges.push(Knowledge);
	}

	// Update the store, which will trigger the localStorage update
	knowledgeStore.set(currentKnowledges);
};
