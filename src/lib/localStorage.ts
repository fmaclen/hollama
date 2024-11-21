import { writable } from 'svelte/store';

import { browser } from '$app/environment';
import type { Session } from '$lib/sessions';

import type { Knowledge } from './knowledge';
import { DEFAULT_SETTINGS, type Settings } from './settings';
import type { Server } from './connections';

function createLocalStorageStore<T>(key: string, defaultValue: T) {
	const initialValue: T = browser
		? JSON.parse(localStorage.getItem(key) || 'null') || defaultValue
		: defaultValue;

	const store = writable<T>(initialValue);

	store.subscribe((value) => {
		if (browser) {
			localStorage.setItem(key, JSON.stringify(value));
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
	HollamaSettings = `${LOCAL_STORAGE_PREFIX}-settings`,
	HollamaServers = `${LOCAL_STORAGE_PREFIX}-servers`,
	HollamaSessions = `${LOCAL_STORAGE_PREFIX}-sessions`,
	HollamaKnowledge = `${LOCAL_STORAGE_PREFIX}-knowledge`
}

export const settingsStore = createLocalStorageStore<Settings>(
	StorageKey.HollamaSettings,
	DEFAULT_SETTINGS
);
export const serversStore = createLocalStorageStore<Server[]>(StorageKey.HollamaServers, []);
export const sessionsStore = createLocalStorageStore<Session[]>(StorageKey.HollamaSessions, []);
export const knowledgeStore = createLocalStorageStore<Knowledge[]>(StorageKey.HollamaKnowledge, []);
