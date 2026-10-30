import type { ClientInit } from '@sveltejs/kit/hooks';
import { get } from 'svelte/store';

import { settingsStore } from '#lib/localStorage.js';
import {
	assertIsLocale,
	defineCustomClientStrategy,
	getLocale,
	isLocale
} from '#lib/paraglide/runtime.js';

// The language is saved in the settings store with the rest of the preferences.
// Until the user picks one, Paraglide falls back to the browser's language and
// saves whatever it resolved through `setLocale` the first time it's asked.
defineCustomClientStrategy('custom-settings', {
	getLocale: () => {
		const { userLanguage } = get(settingsStore);
		return isLocale(userLanguage) ? userLanguage : undefined;
	},
	setLocale: (locale) =>
		settingsStore.update((settings) => ({ ...settings, userLanguage: assertIsLocale(locale) }))
});

export const init: ClientInit = () => {
	// Resolve the language before anything renders, so a first visit saves it
	// up front instead of in the middle of a render
	getLocale();
};
