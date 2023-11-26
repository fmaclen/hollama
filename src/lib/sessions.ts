import { get } from "svelte/store";
import { settingsStore, sessionsStore } from "$lib/store";

export interface Message {
	role: 'user' | 'ai' | 'system';
	content: string;
}

export interface Session {
	id: string;
	model: string;
	messages: Message[];
	context: number[];
}

export const loadSession = (id: string): Session => {
	let session: Session | null = null;

	// Retrieve the current sessions
	const currentSessions = get(sessionsStore);

	// Find the session with the given id
	if (currentSessions) {
		const existingSession = currentSessions.find(s => s.id === id);
		existingSession && (session = existingSession);
	}

	if (!session) {
		// Get the current model
		const model = get(settingsStore)?.ollamaModel;

		// Create a new session with the default model
		if (model) {
			session = { id, model, messages: [], context: [] };
		} else {
			session = { id, model: "Not set", messages: [{ role: 'system', content: 'No model selected, choose one in the settings.' }], context: [] };
		}
	}

	return session;
};

export const saveSession = (session: Session): void => {
	// Retrieve the current sessions
	const currentSessions = get(sessionsStore) || [];

	// Find the index of the session with the same id, if it exists
	const existingSessionIndex = currentSessions.findIndex(s => s.id === session.id);

	if (existingSessionIndex !== -1) {
		// Update the existing session
		currentSessions[existingSessionIndex] = session;
	} else {
		// Add the new session if it doesn't exist
		currentSessions.push(session);
	}

	// Update the store, which will trigger the localStorage update
	sessionsStore.set(currentSessions);
};