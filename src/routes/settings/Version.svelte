<script lang="ts">
	import { version } from '$app/environment';

	import { settingsStore } from '$lib/store';
	import { checkForUpdates, updateStatusStore } from '$lib/updates';
	import { GITHUB_RELEASES_URL } from '$lib/github';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldHelp from '$lib/components/FieldHelp.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';

	// If this component is mounted, we always reset the sidebar notification badge to `false`
	$: if ($updateStatusStore) $updateStatusStore.showNotificationBadge = false;
</script>

<Fieldset>
	<P><strong>Current version</strong></P>

	<div class="field-version">
		<div class="field-version__updates">
			<Badge>{version}</Badge>

			<label class="field-version__label">
				<input
					type="checkbox"
					bind:checked={$settingsStore.autoCheckForUpdates}
					class="field-version__checkbox"
				/>
				Automatically check for updates
			</label>

			<Button
				variant="outline"
				disabled={$updateStatusStore.isCheckingForUpdates}
				on:click={async () => await checkForUpdates(true)}
			>
				Check now
			</Button>
		</div>

		<FieldHelp>
			{#if $updateStatusStore.isCheckingForUpdates}
				<P>Checking for updates...</P>
			{:else if $updateStatusStore.couldntCheckForUpdates}
				<P>
					Couldn't check for updates automatically.
					<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">Go to releases</Button>
				</P>
			{:else if $updateStatusStore.isCurrentVersionLatest}
				<P>
					You are on the latest version.
					<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">Release history</Button>
				</P>
			{:else if $updateStatusStore.latestVersion}
				<P>
					A newer version is available
					<Badge variant="warning">{$updateStatusStore.latestVersion}</Badge>
					{#if $updateStatusStore.canRefreshToUpdate}
						<Button variant="link" on:click={() => window.location.reload()}>
							Refresh to update
						</Button>
					{:else if $settingsStore.hollamaServerMetadata.isDocker}
						<Button
							variant="link"
							href="https://github.com/fmaclen/hollama/blob/main/SELF_HOSTING.md#updating-to-the-latest-version"
							target="_blank"
						>
							How to update Docker container?
						</Button>
					{:else}
						<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
							Go to downloads
						</Button>
					{/if}
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
