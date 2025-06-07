import type { Locales } from '$i18n/i18n-types';
import { env } from '$env/dynamic/public';
import { version } from '$app/environment';

import type { HollamaMetadata } from '../routes/api/metadata/+server';

export interface Model {
	serverId: string;
	name: string;
	size?: number;
	parameterSize?: string;
	modifiedAt?: Date;
}

export interface Settings {
	models: Model[];
	lastUsedModels: Model[];
	lastUpdateCheck: number | null;
	autoCheckForUpdates: boolean;
	userTheme: 'light' | 'dark';
	userLanguage: Locales | null;
	sidebarExpanded: boolean;
	hollamaMetadata: HollamaMetadata;
}

export const DEFAULT_SETTINGS: Settings = {
	models: [],
	lastUsedModels: [],
	lastUpdateCheck: null,
	autoCheckForUpdates: false,
	userTheme: 'light',
	userLanguage: null,
	sidebarExpanded: true,
	hollamaMetadata: {
		currentVersion: version,
		isDesktop: env.PUBLIC_ADAPTER === 'electron-node',
		isDocker: env.PUBLIC_ADAPTER === 'docker-node'
	}
};
