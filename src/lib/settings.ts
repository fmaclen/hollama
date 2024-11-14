import type { Locales } from '$i18n/i18n-types';
import { env } from '$env/dynamic/public';
import { version } from '$app/environment';

import type { HollamaMetadata } from '../routes/api/metadata/+server';
import type { Model } from './chat';

export interface Server {
	id: string;
	baseUrl: string;
	provider: 'ollama' | 'openai' | 'openai-compatible';
	isVerified: Date | null;
	isEnabled: boolean;
	name?: string;
	modelFilter?: string;
	apiKey?: string;
}

const DEFAULT_SERVER: Server = {
	id: crypto.randomUUID(),
	name: '',
	baseUrl: 'http://localhost:11434',
	provider: 'ollama',
	isVerified: null,
	isEnabled: false
};

export interface Settings {
	servers: Server[];
	models: Model[];
	lastUsedModels: Model[];
	lastUpdateCheck: number | null;
	autoCheckForUpdates: boolean;
	userTheme: 'light' | 'dark';
	userLanguage: Locales | null;
	hollamaMetadata: HollamaMetadata;
}

export const DEFAULT_SETTINGS: Settings = {
	servers: [DEFAULT_SERVER],
	models: [],
	lastUsedModels: [],
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
