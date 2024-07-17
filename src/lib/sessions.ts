import { get } from 'svelte/store';
import { settingsStore, sessionsStore, sortStore } from '$lib/store';
import type { Knowledge } from './knowledge';
import { formatTimestampToNow } from './utils';

export interface Message {
	role: 'user' | 'ai' | 'system';
	content: string;
	knowledge?: Knowledge;
}

export interface Session {
	id: string;
	model: string;
	messages: Message[];
	context: number[];
	updatedAt?: string;
	knowledge?: Knowledge;
}

export const loadSession = (id: string): Session => {
	let session: Session | null = null;

	// Retrieve the current sessions
	const currentSessions = get(sessionsStore);

	// Find the session with the given id
	if (currentSessions) {
		const existingSession = currentSessions.find((s) => s.id === id);
		existingSession && (session = existingSession);
	}

	if (!session) {
		// Get the current model
		const model = get(settingsStore)?.ollamaModel || '';

		// Create a new session
		session = { id, model, messages: [], context: [], updatedAt: new Date().toISOString() };
	}

	return session;
};

export const saveSession = (session: Session): void => {
	// Retrieve the current sessions
	const currentSessions = get(sessionsStore) || [];

	// Find the index of the session with the same id, if it exists
	const existingIndex = currentSessions.findIndex((k) => k.id === session.id);

	if (existingIndex !== -1) {
		// Update the existing session
		currentSessions[existingIndex] = session;
	} else {
		// Add the new session if it doesn't exist
		currentSessions.push(session);
	}

	// Sort the sessions by updatedAt in descending order (most recent first)
	const sortedSessions = sortStore(currentSessions);

	// Update the store with the sorted sessions
	sessionsStore.set(sortedSessions);
};

export function getSessionMetadata(session: Session) {
	const metadata: { model: string; updatedAt?: string; knowledge?: string } = {
		model: session.model
	};
	if (session.updatedAt) metadata.updatedAt = formatTimestampToNow(session.updatedAt);
	if (session.knowledge?.name) metadata.knowledge = session.knowledge?.name;
	return metadata;
}

export function formatSessionMetadata(session: Session) {
	const subtitles: string[] = Object.values(getSessionMetadata(session));
	return subtitles.join(' • ');
}
