<script lang="ts">
	import semver from 'semver';
	import { onMount } from 'svelte';
	import { getUnixTime } from 'date-fns';
	import { toast } from 'svelte-sonner';
	import { env } from '$env/dynamic/public';
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

	const isDesktop = env.PUBLIC_ADAPTER === 'electron-node';
	const isDocker = env.PUBLIC_ADAPTER !== 'docker-node';

	let latestVersion: string | null = null;
	let isCurrentVersionLatest = false;
	let isCheckingForUpdates = false;

	async function checkForUpdates(isUserInitiated = false) {
		const oneWeekAgoInSeconds = getUnixTime(new Date()) - ONE_WEEK_IN_SECONDS;

		if (!$settingsStore) return;
		if (!$settingsStore.lastUpdateCheck) $settingsStore.lastUpdateCheck = oneWeekAgoInSeconds - 1;
		if (!isUserInitiated && $settingsStore.lastUpdateCheck > oneWeekAgoInSeconds) return;

		isCheckingForUpdates = true;
		toast.loading('Checking for updates');

		try {
			const githubRelease = await (await fetch(GITHUB_RELEASES_API)).json();
			latestVersion = githubRelease[0]?.tag_name;

			if (!latestVersion) {
				const thisHollamaServer = await (await fetch(`http://localhost:5173/api/metadata`)).json();
				latestVersion = thisHollamaServer?.currentVersion;
			}
		} catch (error) {
			console.error(error);
		}

		if (!latestVersion) return;
		isCurrentVersionLatest = semver.lt(latestVersion, version.replace('-dev', ''));
		$settingsStore.lastUpdateCheck = getUnixTime(new Date());
		isCheckingForUpdates = false;
	}

	$: console.log('isCurrentVersionLatest', isCurrentVersionLatest);

	onMount(() => {
		checkForUpdates();
	});
</script>

<Fieldset>
	<P><strong>Current version</strong></P>

	{#if !isCheckingForUpdates}
		<div class="flex gap-x-2">
			<a href={GITHUB_RELEASES_URL} target="_blank" class="flex items-stretch gap-x-2">
				<Badge>0.10.2</Badge>
			</a>
			<Button variant="outline" on:click={() => checkForUpdates(true)}>Check for updates</Button>
		</div>
		<FieldHelp>
			{#if isCurrentVersionLatest}
				<P>
					You are on the latest version.
					<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
						Earlier versions
					</Button>
				</P>
			{:else if !isCurrentVersionLatest && latestVersion}
				<P>
					A new version is available: {latestVersion}.
					{#if isDesktop}
						<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">Download</Button>
					{:else if isDocker}
						<Button variant="link" href={DOCKER_INSTRUCTIONS_URL} target="_blank">
							How to update Docker image?
						</Button>
					{:else}
						<Button variant="link" on:click={() => window.location.reload()}>
							Refresh to update
						</Button>
					{/if}
				</P>
			{:else}
				<P>
					Couldn't check for updates automatically.
					<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">Go to releases</Button>
				</P>
			{/if}
		</FieldHelp>
	{/if}
</Fieldset>
