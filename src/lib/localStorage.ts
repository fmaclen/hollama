import { toast } from 'svelte-sonner';
import { get, writable, type Updater } from 'svelte/store';

import en from '$i18n/en';
import LL from '$i18n/i18n-svelte';
import { browser } from '$app/env';
import type { Session } from '#lib/sessions.js';

import type { Server } from './connections';
import type { Knowledge } from './knowledge';
import { DEFAULT_SETTINGS, type Settings } from './settings';

function createLocalStorageStore<T>(key: string, defaultValue: T) {
	function read(): T {
		return JSON.parse(localStorage.getItem(key) || 'null') || defaultValue;
	}

	const store = writable<T>(browser ? read() : defaultValue);

	// Pick up changes saved by other tabs, otherwise our next save would write
	// a stale copy over them.
	if (browser) {
		window.addEventListener('storage', (event) => {
			if (event.key === key) store.set(read());
		});
	}

	store.subscribe((value) => {
		if (browser) {
			try {
				localStorage.setItem(key, JSON.stringify(value));
			} catch (error) {
				// Handle localStorage quota exceeded error
				// The i18n store can still be empty while the app boots, so fall back to English
				const t = get(LL);
				if (error instanceof DOMException && error.name === 'QuotaExceededError') {
					toast.warning(t.localStorageIsFull() || en.localStorageIsFull, {
						id: 'localstorage-full-toast',
						description: t.localStorageFullDescription() || en.localStorageFullDescription
					});
				} else {
					// Handle other errors, such as JSON serialization issues
					toast.warning(t.localStorageSaveFailed() || en.localStorageSaveFailed, {
						id: 'localstorage-error-toast',
						description: (error as Error).message
					});
				}
			}
		}
	});

	return {
		...store,
		// Start from what's in localStorage right now, not the in-memory copy,
		// so a save can't drop changes another tab made a moment ago.
		update: (updater: Updater<T>) => store.set(updater(browser ? read() : get(store))),
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
