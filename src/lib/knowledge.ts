import { get } from 'svelte/store';

import { knowledgeStore, sortStore } from '$lib/localStorage';

export interface Knowledge {
	id: string;
	name: string;
	content: string;
	updatedAt: string;
}

export const loadKnowledge = (id: string): Knowledge => {
	let knowledge: Knowledge | null = null;

	// Retrieve the current knowledges
	const currentKnowledges = get(knowledgeStore);

	// Find the knowledge with the given id
	if (currentKnowledges) {
		const existingKnowledge = currentKnowledges.find((s) => s.id === id);
		if (existingKnowledge) knowledge = existingKnowledge;
	}

	if (!knowledge) {
		// Create a new knowledge
		knowledge = { id, name: '', content: '', updatedAt: new Date().toISOString() };
	}

	return knowledge;
};

export const saveKnowledge = (knowledge: Knowledge): void => {
	// Retrieve the current knowledges
	const currentKnowledges = get(knowledgeStore) || [];

	// Find the index of the knowledge with the same id, if it exists
	const existingIndex = currentKnowledges.findIndex((k) => k.id === knowledge.id);

	if (existingIndex !== -1) {
		// Update the existing knowledge
		currentKnowledges[existingIndex] = knowledge;
	} else {
		// Add the new knowledge if it doesn't exist
		currentKnowledges.push(knowledge);
	}

	// Sort the knowledges by updatedAt in descending order (most recent first)
	const sortedKnowledges = sortStore(currentKnowledges);

	// Update the store with the sorted knowledges
	knowledgeStore.set(sortedKnowledges);
};
