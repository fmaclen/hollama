import { getUnixTime } from 'date-fns';
import semver from 'semver';
import { get, writable } from 'svelte/store';

import { version } from '$app/environment';
import { settingsStore } from '$lib/localStorage';

import type { HollamaMetadata } from '../routes/api/metadata/+server';
import { GITHUB_RELEASES_API } from './github';

const HOLLAMA_DEV_VERSION_SUFFIX = '-dev';
const HOLLAMA_METADATA_ENDPOINT = '/api/metadata';
const ONE_WEEK_IN_SECONDS = 604800;

export interface UpdateStatus {
	canRefreshToUpdate: boolean;
	isCurrentVersionLatest: boolean;
	isCheckingForUpdates: boolean;
	showSidebarNotification: boolean;
	couldntCheckForUpdates: boolean;
	latestVersion: string;
}

export const updateStatusStore = writable<UpdateStatus>({
	canRefreshToUpdate: false,
	isCurrentVersionLatest: false,
	isCheckingForUpdates: false,
	showSidebarNotification: false,
	couldntCheckForUpdates: false,
	latestVersion: ''
});

// In development and test environments we append a '-dev' suffix to the version
// to indicate that it's a development version. This function strips the suffix
// so it can be compared using `semver`
function isCurrentVersionLatest(currentVersion: string, latestVersion: string): boolean {
	return (
		currentVersion === latestVersion ||
		semver.gt(
			currentVersion.replace(HOLLAMA_DEV_VERSION_SUFFIX, ''),
			latestVersion.replace(HOLLAMA_DEV_VERSION_SUFFIX, '')
		)
	);
}

export async function checkForUpdates(isUserInitiated = false): Promise<void> {
	const settings = get(settingsStore);
	if (!(settings.autoCheckForUpdates === false)) settings.autoCheckForUpdates = true;

	// If the user hasn't initiated the check we check if the last update check
	// was made more than a week ago
	const oneWeekAgoInSeconds = getUnixTime(new Date()) - ONE_WEEK_IN_SECONDS;
	if (!settings.lastUpdateCheck) settings.lastUpdateCheck = oneWeekAgoInSeconds - 1;
	if (!isUserInitiated && settings.lastUpdateCheck > oneWeekAgoInSeconds) return;

	const updateStatus = get(updateStatusStore);
	updateStatus.isCheckingForUpdates = true;

	// The server may have been already updated, so we fetch the latest metadata
	let hollamaMetadata: Response;

	try {
		hollamaMetadata = await fetch(HOLLAMA_METADATA_ENDPOINT);
		const metadata = (await hollamaMetadata.json()) as HollamaMetadata;
		settings.hollamaMetadata = metadata;
	} catch {
		console.error('Failed to fetch Hollama server metadata');
		updateStatus.couldntCheckForUpdates = true;
	}

	// Determine if the server has been updated, and if so, which version is the latest
	updateStatus.latestVersion = settings.hollamaMetadata.currentVersion;
	updateStatus.isCurrentVersionLatest = isCurrentVersionLatest(version, updateStatus.latestVersion);
	updateStatus.canRefreshToUpdate = !updateStatus.isCurrentVersionLatest;
	updateStatus.showSidebarNotification = !updateStatus.isCurrentVersionLatest;

	if (updateStatus.canRefreshToUpdate) {
		// The server has been updated, so we let the user know they can refresh to update
		updateStatusStore.set(updateStatus);
		updateStatus.isCheckingForUpdates = false;
	} else {
		// The server hasn't been updated, so we check if Github has a newer version
		let githubReleases: Response;

		try {
			githubReleases = await fetch(GITHUB_RELEASES_API);
			const releases = await githubReleases.json();
			if (releases[0]?.tag_name && releases[0].tag_name !== '')
				updateStatus.latestVersion = releases[0].tag_name;
		} catch {
			console.error('Failed to fetch GitHub releases');
			updateStatus.couldntCheckForUpdates = true;
		}

		updateStatus.isCurrentVersionLatest = isCurrentVersionLatest(
			settings.hollamaMetadata.currentVersion,
			updateStatus.latestVersion
		);
		updateStatus.showSidebarNotification = !updateStatus.isCurrentVersionLatest;
		updateStatus.isCheckingForUpdates = false;
		updateStatusStore.set(updateStatus);
	}

	// Update the settings store with today's date so we don't check again for updates
	settings.lastUpdateCheck = getUnixTime(new Date());
	settingsStore.set(settings);
}
