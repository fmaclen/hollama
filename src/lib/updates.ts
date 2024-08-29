import semver from 'semver';
import { getUnixTime } from 'date-fns';

import { get, writable } from 'svelte/store';
import { version } from '$app/environment';
import { settingsStore } from '$lib/store';
import { GITHUB_RELEASES_API } from './github';
import type { HollamaServerMetadata } from '../routes/api/metadata/+server';

const HOLLAMA_SERVER_METADATA_ENDPOINT = '/api/metadata';
const ONE_WEEK_IN_SECONDS = 604800;
const DEVELOPMENT_VERSION_SUFFIX = '-dev';

export interface UpdateStatus {
	latestVersion: string;
	canRefreshToUpdate: boolean;
	isCurrentVersionLatest: boolean;
	isCheckingForUpdates: boolean;
	showNotificationBadge: boolean;
	couldntCheckForUpdates: boolean;
}

export const updateStatusStore = writable<UpdateStatus>({
	canRefreshToUpdate: false,
	isCurrentVersionLatest: true,
	isCheckingForUpdates: false,
	showNotificationBadge: false,
	couldntCheckForUpdates: false,
	latestVersion: '',
});

export async function checkForUpdates(isUserInitiated = false): Promise<void> {
	const settings = get(settingsStore);
	if (!(settings.autoCheckForUpdates === false)) settings.autoCheckForUpdates = true;

	// If the user hasn't initiated the check, we check if the last update check was made more than a week ago.
	const oneWeekAgoInSeconds = getUnixTime(new Date()) - ONE_WEEK_IN_SECONDS;
	if (!settings.lastUpdateCheck) settings.lastUpdateCheck = oneWeekAgoInSeconds - 1;
	if (!isUserInitiated && settings.lastUpdateCheck > oneWeekAgoInSeconds) return;

	const updateStatus = get(updateStatusStore);
	updateStatus.isCheckingForUpdates = true;

	// The server may have been already updated, so we need to fetch the metadata again.
	let hollamaServerResponse: Response;

	try {
			hollamaServerResponse = await fetch(HOLLAMA_SERVER_METADATA_ENDPOINT);
			const response = (await hollamaServerResponse.json()) as HollamaServerMetadata;
			settings.hollamaServerMetadata = response;
	} catch (_) {
			console.error('Failed to fetch Hollama server metadata');
			updateStatus.couldntCheckForUpdates = true;
	}

	// Update the status store
	updateStatus.canRefreshToUpdate = semver.lt(
			version.replace(DEVELOPMENT_VERSION_SUFFIX, ''),
			settings.hollamaServerMetadata.currentVersion
	);
	updateStatus.isCurrentVersionLatest = !updateStatus.canRefreshToUpdate;
	updateStatus.latestVersion = settings.hollamaServerMetadata.currentVersion;
	updateStatus.showNotificationBadge = !updateStatus.isCurrentVersionLatest;

	if (updateStatus.canRefreshToUpdate) {
			updateStatusStore.set(updateStatus);
			updateStatus.isCheckingForUpdates = false;
	} else {
			let githubServerResponse: Response;

			try {
					githubServerResponse = await fetch(GITHUB_RELEASES_API);
					const response = await githubServerResponse.json();
					if (response[0]?.tag_name && response[0].tag_name !== '') updateStatus.latestVersion = response[0].tag_name;
			} catch (_) {
					console.error('Failed to fetch GitHub releases');
					updateStatus.couldntCheckForUpdates = true;
			}

			updateStatus.isCurrentVersionLatest = semver.lt(
					updateStatus.latestVersion,
					settings.hollamaServerMetadata.currentVersion.replace(DEVELOPMENT_VERSION_SUFFIX, '')
			);
			updateStatus.showNotificationBadge = !updateStatus.isCurrentVersionLatest;
			updateStatus.isCheckingForUpdates = false;
			updateStatusStore.set(updateStatus);
	}

	// Update the settings store
	settings.lastUpdateCheck = getUnixTime(new Date());
	settingsStore.set(settings);
}
