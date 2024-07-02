import { get } from "svelte/store";
import { settingsStore, sessionsStore } from "$lib/store";
import type { Knowledge } from "./knowledge";

export interface Message {
	role: 'user' | 'ai' | 'system' | 'knowledge';
	content: string;
	name?: string;
}

export interface Session {
	id: string;
	model: string;
	messages: Message[];
	context: number[];
	knowledge?: Knowledge;
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
		const model = get(settingsStore)?.ollamaModel || "";

		// Create a new session
		session = { id, model, messages: [], context: [] };
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
