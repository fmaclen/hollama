import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Session } from '$lib/sessions';

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

const LOCAL_STORAGE_PREFIX = 'hollama';

export interface Settings {
	ollamaServer: string | null;
	ollamaModel: string | null;
}

export const settingsStore = createLocalStorageStore<Settings>(`${LOCAL_STORAGE_PREFIX}-settings`);
export const sessionsStore = createLocalStorageStore<Session[]>(`${LOCAL_STORAGE_PREFIX}-sessions`);
