import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Session } from '$lib/sessions';
import type { OllamaModel } from './ollama';
import type { Knowledge } from './knowledge';

function createLocalStorageStore<T>(key: string, initialValue: T | null = null) {
	const localStorageValue: string | null = browser ? window.localStorage.getItem(key) : null;
	let value: T | null = initialValue;
	const store = writable<T | null>(initialValue);

	// Read existing value from localStorage
	if (localStorageValue) {
		value = JSON.parse(localStorageValue);
		store.set(value);
	}

	// Write value to localStorage
	store.subscribe((newValue) => {
		if (browser) {
			window.localStorage.setItem(key, JSON.stringify(newValue));
		}
	});

	return store;
}

export function sortStore<T extends { updatedAt?: string }>(store: T[]) {
	return store.sort((a, b) => {
		if (!a.updatedAt && !b.updatedAt) return 0;
		if (!a.updatedAt) return 1;
		if (!b.updatedAt) return -1;
		return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
	});
}

export function deleteStoreItem<T extends { id: string }>(store: T[], id: string) {
	return store.filter((s) => s.id !== id);
}

export const LOCAL_STORAGE_PREFIX = 'hollama';

export interface Settings {
	ollamaServer: string | null;
	ollamaModel: string | null;
	ollamaModels: OllamaModel[];
	userTheme?: 'light' | 'dark';
}

export enum StorageKey {
	HollamaSettings = `${LOCAL_STORAGE_PREFIX}-settings`,
	HollamaSessions = `${LOCAL_STORAGE_PREFIX}-sessions`,
	HollamaKnowledge = `${LOCAL_STORAGE_PREFIX}-knowledge`
}

export const settingsStore = createLocalStorageStore<Settings>(StorageKey.HollamaSettings);
export const sessionsStore = createLocalStorageStore<Session[]>(StorageKey.HollamaSessions);
export const knowledgeStore = createLocalStorageStore<Knowledge[]>(StorageKey.HollamaKnowledge);
