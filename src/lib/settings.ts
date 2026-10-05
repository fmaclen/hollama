import type { Locales } from '$i18n/i18n-types';
import { version } from '$app/env';
import { PUBLIC_ADAPTER } from '$app/env/public';

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
		isDocker: PUBLIC_ADAPTER === 'docker-node'
	}
};
