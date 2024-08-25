<script lang="ts">
	import semver from 'semver';
	import { onMount } from 'svelte';
	import { getUnixTime } from 'date-fns';
	import { version } from '$app/environment';

	import { settingsStore } from '$lib/store';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldHelp from '$lib/components/FieldHelp.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';

	const GITHUB_RELEASES_API = 'https://api.github.com/repos/fmaclen/hollama/releases';
	const GITHUB_RELEASES_URL = 'https://github.com/fmaclen/hollama/releases';
	const DOCKER_INSTRUCTIONS_URL = 'https://github.com/fmaclen/hollama/blob/main/docs/docker.md';
	const ONE_WEEK_IN_SECONDS = 604800;

	let latestVersion: string | undefined;
	let canRefreshToUpdate = false;
	let isCurrentVersionLatest = false;
	let isError = false;
	let isCheckingForUpdates = false;

	async function checkForUpdates(isUserInitiated = false) {
		const oneWeekAgoInSeconds = getUnixTime(new Date()) - ONE_WEEK_IN_SECONDS;

		if (!$settingsStore) return;
		if (!$settingsStore.lastUpdateCheck) $settingsStore.lastUpdateCheck = oneWeekAgoInSeconds - 1;
		if (!isUserInitiated && $settingsStore.lastUpdateCheck > oneWeekAgoInSeconds) return;

		latestVersion = undefined;
		canRefreshToUpdate = false;
		isCurrentVersionLatest = false;
		isError = false;
		isCheckingForUpdates = true;

		// First we check if the current Hollama server has already been updated so we can
		// prompt the user to refresh the page.
		const hollamaServerResponse = await fetch(`/api/metadata`);
		if (hollamaServerResponse.ok) {
			const response = await hollamaServerResponse.json();
			latestVersion = response?.currentVersion;
			$settingsStore.isDesktop = response?.isDesktop;
			$settingsStore.isDocker = response?.isDocker;

			if (latestVersion) {
				canRefreshToUpdate = semver.lt(version.replace('-dev', ''), latestVersion);
			} else {
				isError = true;
			}
		}

		// Then we get the latest version from the GitHub releases API
		if (!canRefreshToUpdate) {
			const githubServerResponse = await fetch(GITHUB_RELEASES_API);
			if (githubServerResponse.ok) {
				const response = await githubServerResponse.json();
				latestVersion = response[0]?.tag_name;
			} else {
				isError = true;
			}
		}

		isCheckingForUpdates = false;
		$settingsStore.lastUpdateCheck = getUnixTime(new Date());

		if (latestVersion)
			isCurrentVersionLatest = semver.lt(latestVersion, version.replace('-dev', ''));
	}

	onMount(() => {
		checkForUpdates();
	});
</script>

<Fieldset>
	<P><strong>Current version</strong></P>

	<div class="field-version">
		<div class="field-version__updates">
			<Badge>{version}</Badge>

			{#if $settingsStore}
				<label class="field-version__label">
					<input
						type="checkbox"
						bind:checked={$settingsStore.shouldAutoCheckForUpdates}
						class="field-version__checkbox"
					/>
					Automatically check for updates
				</label>
			{/if}
			<Button
				variant="outline"
				disabled={isCheckingForUpdates}
				on:click={() => checkForUpdates(true)}
			>
				Check now
			</Button>
		</div>

		<FieldHelp>
			{#if isCheckingForUpdates}
				<P>Checking for updates...</P>
			{:else if isCurrentVersionLatest}
				<P>
					You are on the latest version.
					<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">Release history</Button>
				</P>
			{:else if latestVersion}
				<P>
					A newer version is available <Badge>{latestVersion}</Badge>
					{#if canRefreshToUpdate}
						<Button variant="link" on:click={() => window.location.reload()}>
							Refresh to update
						</Button>
					{:else if $settingsStore?.isDocker}
						<Button variant="link" href={DOCKER_INSTRUCTIONS_URL} target="_blank">
							How to update Docker image?
						</Button>
					{:else}
						<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
							Go to downloads
						</Button>
					{/if}
				</P>
			{:else if isError}
				<P>
					Couldn't check for updates automatically.
					<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">Go to releases</Button>
				</P>
			{/if}

			{#if !isCheckingForUpdates && !latestVersion && $settingsStore?.lastUpdateCheck}
				<P>
					Last update check
					<Badge>
						{new Date($settingsStore.lastUpdateCheck * 1000).toLocaleString()}
					</Badge>
				</P>
			{/if}
		</FieldHelp>
	</div>
</Fieldset>

<style lang="postcss">
	.field-version {
		@apply flex flex-col;
	}

	.field-version__updates {
		@apply flex items-stretch gap-x-2;
	}

	.field-version__label {
		@apply inline-flex flex-grow items-center gap-x-2 rounded-md border border-shade-4 px-3 py-2 text-sm;
		@apply hover:border-shade-6 hover:text-active;
	}

	.field-version__checkbox {
		@apply accent-accent;
	}
</style>
