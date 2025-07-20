import { toast } from 'svelte-sonner';
import { writable } from 'svelte/store';

import { browser } from '$app/environment';
import type { Session } from '$lib/sessions';

import type { Server } from './connections';
import type { Knowledge } from './knowledge';
import { DEFAULT_SETTINGS, type Settings } from './settings';

function createLocalStorageStore<T>(key: string, defaultValue: T) {
	const initialValue: T = browser
		? JSON.parse(localStorage.getItem(key) || 'null') || defaultValue
		: defaultValue;

	const store = writable<T>(initialValue);

	store.subscribe((value) => {
		if (browser) {
			try {
				localStorage.setItem(key, JSON.stringify(value));
			} catch (error) {
				// Handle localStorage quota exceeded error
				if (error instanceof DOMException && error.name === 'QuotaExceededError') {
					toast.warning('Local storage is full', {
						id: 'localstorage-full-toast',
						description:
							'You have reached the storage limit for your browser. Please delete some sessions, knowledge, or preferences to free up space.'
					});
				} else {
					// Handle other errors, such as JSON serialization issues
					toast.warning('Failed to save to localStorage', {
						id: 'localstorage-error-toast',
						description: (error as Error).message
					});
				}
			}
		}
	});

	return {
		...store,
		reset: () => {
			store.set(defaultValue);
		}
	};
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
export enum StorageKey {
	HollamaPreferences = `${LOCAL_STORAGE_PREFIX}-settings`,
	HollamaServers = `${LOCAL_STORAGE_PREFIX}-servers`,
	HollamaSessions = `${LOCAL_STORAGE_PREFIX}-sessions`,
	HollamaKnowledge = `${LOCAL_STORAGE_PREFIX}-knowledge`
}

export const settingsStore = createLocalStorageStore<Settings>(
	StorageKey.HollamaPreferences,
	DEFAULT_SETTINGS
);
export const serversStore = createLocalStorageStore<Server[]>(StorageKey.HollamaServers, []);
export const sessionsStore = createLocalStorageStore<Session[]>(StorageKey.HollamaSessions, []);
export const knowledgeStore = createLocalStorageStore<Knowledge[]>(StorageKey.HollamaKnowledge, []);
