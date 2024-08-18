<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { version } from '$app/environment';

	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldHelp from '$lib/components/FieldHelp.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';

	const releasesUrl = 'https://github.com/fmaclen/hollama/releases';
	const dockerInstructionsUrl = 'https://github.com/fmaclen/hollama/blob/main/docs/docker.md';

	let latestVersion: string | null = null;
	let isCurrentVersionLatest = true;
	let isCheckingForUpdates = false;
	let isError = true;

	let isDesktop = false;
	let isDocker = false;
	// let isDesktop = ADAPTER === 'electron-node';
	// let isDocker = ADAPTER === 'docker-node';

	$: if (isCheckingForUpdates) toast.loading('Checking for updates');
</script>

<Fieldset>
	<P>
		<strong>Current version</strong>
		<Button variant="icon" href={releasesUrl} target="_blank">
			<Badge>{version}</Badge>
		</Button>
	</P>
	{#if isCheckingForUpdates}
		<P>
			Couldn't check for updates automatically.
			<Button variant="link" href={releasesUrl} target="_blank">Releases</Button>
		</P>
	{:else}
		<div class="flex gap-x-4">
			<FieldHelp>
				{#if isError}
					<P>
						Couldn't check for updates automatically.
						<Button variant="link" href={releasesUrl} target="_blank">Releases</Button>
					</P>
				{:else if isCurrentVersionLatest}
					<P>
						You are on the latest version.
						<Button variant="link" href={releasesUrl} target="_blank">Earlier versions</Button>
					</P>
				{:else if !isCurrentVersionLatest && latestVersion}
					<P>
						A new version is available.
						{#if isDesktop}
							<Button variant="link" href={releasesUrl} target="_blank">
								Download {latestVersion}
							</Button>
						{:else if isDocker}
							<Button variant="link" href={dockerInstructionsUrl} target="_blank">
								Update to {latestVersion}
							</Button>
						{:else}
							<Button variant="link" on:click={() => window.location.reload()}>
								Refresh to update
							</Button>
						{/if}
					</P>
				{/if}
			</FieldHelp>
		</div>
	{/if}
</Fieldset>
