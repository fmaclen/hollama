import semver from 'semver';
import { getUnixTime } from 'date-fns';

import { get } from 'svelte/store';
import { version } from '$app/environment';
import { settingsStore } from '$lib/store';
import { GITHUB_RELEASES_API } from './github';
import type { HollamaServerMetadata } from '../routes/api/metadata/+server';

const HOLLAMA_SERVER_METADATA_ENDPOINT = '/api/metadata';
const ONE_WEEK_IN_SECONDS = 604800;
const DEVELOPMENT_VERSION_SUFFIX = '-dev';

export interface UpdateStatus {
	canRefreshToUpdate: boolean;
	isCurrentVersionLatest: boolean;
	latestVersion: string;
}

export async function checkForUpdates(isUserInitiated = false): Promise<UpdateStatus | null> {
	let settings = get(settingsStore);
	if (!(settings.autoCheckForUpdates === false)) settings.autoCheckForUpdates = true;

	// If the user hasn't initiated the check, we check if the last update check was made more than a week ago.
	const oneWeekAgoInSeconds = getUnixTime(new Date()) - ONE_WEEK_IN_SECONDS;
	if (!settings.lastUpdateCheck) settings.lastUpdateCheck = oneWeekAgoInSeconds - 1;
	if (!isUserInitiated && settings.lastUpdateCheck > oneWeekAgoInSeconds) return null;

	// The server may have been already updated, so we need to fetch the metadata again.
	//
	// HACK: We don't HAVE TO fetch the metadata from a server endpoint,
	// we only do it this way because it allows us to mock the response in tests.
	let hollamaServerResponse: Response;
	try {
		hollamaServerResponse = await fetch(HOLLAMA_SERVER_METADATA_ENDPOINT);
	} catch (_) {
		console.error('Failed to fetch Hollama server metadata');
		return null;
	}
	const response = (await hollamaServerResponse.json()) as HollamaServerMetadata;
	settings.hollamaServerMetadata = response;

	const updateStatus = {
		canRefreshToUpdate: semver.lt(
			version.replace(DEVELOPMENT_VERSION_SUFFIX, ''),
			settings.hollamaServerMetadata.currentVersion
		),
		isCurrentVersionLatest: true,
		latestVersion: settings.hollamaServerMetadata.currentVersion
	};

	if (updateStatus.canRefreshToUpdate) {
		updateStatus.isCurrentVersionLatest = false;
	} else {
		let githubServerResponse: Response;
		try {
			githubServerResponse = await fetch(GITHUB_RELEASES_API);
		} catch (_) {
			console.error('Failed to fetch GitHub releases');
			return null;
		}

		const response = await githubServerResponse.json();
		const latestVersion = response[0]?.tag_name;
		if (!latestVersion) return null;

		updateStatus.latestVersion = latestVersion;
		updateStatus.isCurrentVersionLatest = semver.lt(
			latestVersion,
			settings.hollamaServerMetadata.currentVersion.replace(DEVELOPMENT_VERSION_SUFFIX, '')
		);
	}

	settings.lastUpdateCheck = getUnixTime(new Date());
	return updateStatus;
}
