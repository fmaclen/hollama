import { formatDistanceToNow } from 'date-fns';
import { ca, type Locale } from 'date-fns/locale';
import { get } from 'svelte/store';

import { locale as localeStore } from '$i18n/i18n-svelte';
import type { Locales } from '$i18n/i18n-types';

// Languages that format relative timestamps in their own language.
// Any locale missing here keeps date-fns' English default.
const dateFnsLocales: Partial<Record<Locales, Locale>> = { ca };

export function generateRandomId() {
	return Math.random().toString(36).substring(2, 8); // E.g. `z7avx9`
}

export function getUpdatedAtDate() {
	return new Date().toISOString();
}

export function formatTimestampToNow(timestamp: string) {
	return formatDistanceToNow(new Date(timestamp), {
		addSuffix: true,
		locale: dateFnsLocales[get(localeStore)]
	});
}
