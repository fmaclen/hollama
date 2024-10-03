import { writable } from 'svelte/store';

import type { Locales } from '$i18n/i18n-types';
import { env } from '$env/dynamic/public';
import { browser, version } from '$app/environment';
import type { Session } from '$lib/sessions';

import type { HollamaMetadata } from '../routes/api/metadata/+server';
import type { Model } from './chat';
import type { Knowledge } from './knowledge';

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
	ollamaServerStatus: 'connected' | 'disconnected';
	openaiApiKey: string | null;
	models: Model[];
	lastUpdateCheck: number | null;
	autoCheckForUpdates: boolean;
	userTheme: 'light' | 'dark';
	userLanguage: Locales | null;
	hollamaMetadata: HollamaMetadata;
}

const defaultSettings: Settings = {
	ollamaServer: 'http://localhost:11434',
	ollamaServerStatus: 'disconnected',
	openaiApiKey: null,
	models: [],
	lastUpdateCheck: null,
	autoCheckForUpdates: false,
	userTheme: 'light',
	userLanguage: null,
	hollamaMetadata: {
		currentVersion: version,
		isDesktop: env.PUBLIC_ADAPTER === 'electron-node',
		isDocker: env.PUBLIC_ADAPTER === 'docker-node'
	}
};

export const settingsStore = createLocalStorageStore<Settings>(
	StorageKey.HollamaSettings,
	defaultSettings
);
export const sessionsStore = createLocalStorageStore<Session[]>(StorageKey.HollamaSessions, []);
export const knowledgeStore = createLocalStorageStore<Knowledge[]>(StorageKey.HollamaKnowledge, []);
