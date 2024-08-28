import type { ModelResponse } from 'ollama/browser';
import { browser, version } from '$app/environment';
import { writable } from 'svelte/store';
import type { Session } from '$lib/sessions';
import type { Knowledge } from './knowledge';
import { env } from '$env/dynamic/public';
import type { HollamaServerMetadata } from '../routes/api/metadata/+server';

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
	HollamaSessions = `${LOCAL_STORAGE_PREFIX}-sessions`,
	HollamaKnowledge = `${LOCAL_STORAGE_PREFIX}-knowledge`
}

export interface Settings {
	ollamaServer: string | null;
	ollamaModel: string | null;
	ollamaModels: ModelResponse[];
	ollamaServerStatus: 'connected' | 'disconnected';
	lastUpdateCheck: number | null;
	autoCheckForUpdates: boolean;
	userTheme: 'light' | 'dark';
	hollamaServerMetadata: HollamaServerMetadata;
}

const defaultSettings: Settings = {
	ollamaServer: 'http://localhost:11434',
	ollamaModel: null,
	ollamaModels: [],
	ollamaServerStatus: 'disconnected',
	lastUpdateCheck: null,
	autoCheckForUpdates: false,
	userTheme: 'light',
	hollamaServerMetadata: {
		currentVersion: version,
		isDesktop: env.PUBLIC_ADAPTER === 'electron-node',
		isDocker: env.PUBLIC_ADAPTER === 'docker-node',
	}
};

export const settingsStore = createLocalStorageStore<Settings>(StorageKey.HollamaSettings, defaultSettings);
export const sessionsStore = createLocalStorageStore<Session[]>(StorageKey.HollamaSessions, []);
export const knowledgeStore = createLocalStorageStore<Knowledge[]>(StorageKey.HollamaKnowledge, []);
