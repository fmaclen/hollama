import { get } from "svelte/store";
import { settingsStore, systemTemplatesStore } from "$lib/store";

export interface SystemTemplate {
	id: string;
	name: string;
	content: string[];
  updated_at: string;
}

export const loadSystemTemplate = (id: string): SystemTemplate => {
	let systemTemplate: SystemTemplate | null = null;

	// Retrieve the current sessions
	const currentSystemTemplates = get(systemTemplatesStore);

	// Find the session with the given id
	if (currentSystemTemplates) {
		const existingSystemTemplate = currentSystemTemplates.find(s => s.id === id);
		existingSystemTemplate && (systemTemplate = existingSystemTemplate);
	}

	if (!systemTemplate) {
		// Get the current model
		const model = get(settingsStore)?.ollamaModel || "";

		// Create a new session
		systemTemplate = { id, name: "", content: [], updated_at: new Date().toISOString() };
	}

	return systemTemplate;
};

export const saveSystemTemplate = (systemTemplate: SystemTemplate): void => {
	// Retrieve the current sessions
	const currentSystemTemplates = get(systemTemplatesStore) || [];

	// Find the index of the session with the same id, if it exists
	const existingSystemTemplate = currentSystemTemplates.findIndex(s => s.id === systemTemplate.id);

	if (existingSystemTemplate !== -1) {
		// Update the existing session
		currentSystemTemplates[existingSystemTemplate] = systemTemplate;
	} else {
		// Add the new session if it doesn't exist
		currentSystemTemplates.push(systemTemplate);
	}

	// Update the store, which will trigger the localStorage update
	systemTemplatesStore.set(currentSystemTemplates);
};
