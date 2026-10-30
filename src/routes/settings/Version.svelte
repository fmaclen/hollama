<script lang="ts">
	import { version } from '$app/env';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import FieldCheckbox from '#lib/components/FieldCheckbox.svelte';
	import FieldHelp from '#lib/components/FieldHelp.svelte';
	import Fieldset from '#lib/components/Fieldset.svelte';
	import P from '#lib/components/P.svelte';
	import { GITHUB_RELEASES_URL } from '#lib/github.js';
	import { settingsStore } from '#lib/localStorage.js';
	import { m } from '#lib/paraglide/messages.js';
	import { checkForUpdates, updateStatusStore } from '#lib/updates.js';

	// If this component is mounted we don't want the sidebar notification badge to be visible
	$: if ($updateStatusStore) $updateStatusStore.showSidebarNotification = false;
</script>

<Fieldset>
	<P><strong>{m.currentVersion()}</strong></P>

	<div class="field-version">
		<div class="field-version__updates">
			<Badge>{version}</Badge>
			<FieldCheckbox
				label={m.automaticallyCheckForUpdates()}
				bind:checked={$settingsStore.autoCheckForUpdates}
			/>
			<Button
				variant="outline"
				disabled={$updateStatusStore.isCheckingForUpdates}
				on:click={async () => await checkForUpdates(true)}
			>
				{m.checkNow()}
			</Button>
		</div>

		{#if $updateStatusStore.isCheckingForUpdates || $updateStatusStore.couldntCheckForUpdates || $updateStatusStore.isCurrentVersionLatest || $updateStatusStore.latestVersion}
			<FieldHelp>
				{#if $updateStatusStore.isCheckingForUpdates}
					<P>{m.checkingForUpdates()}</P>
				{:else if $updateStatusStore.couldntCheckForUpdates}
					<P>
						{m.couldntCheckForUpdates()}
						<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
							{m.goToReleases()}
						</Button>
					</P>
				{:else if $updateStatusStore.isCurrentVersionLatest}
					<P>
						{m.isCurrentVersionLatest()}
						<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
							{m.releaseHistory()}
						</Button>
					</P>
				{:else if $updateStatusStore.latestVersion}
					<P>
						{m.isLatestVersion()}
						<Badge variant="warning">{$updateStatusStore.latestVersion}</Badge>
						{#if $updateStatusStore.canRefreshToUpdate}
							<Button variant="link" on:click={() => window.location.reload()}>
								{m.refreshToUpdate()}
							</Button>
						{:else if $settingsStore.hollamaMetadata.isDocker}
							<Button
								variant="link"
								href="https://github.com/fmaclen/hollama/blob/main/SELF_HOSTING.md#updating-to-the-latest-version"
								target="_blank"
							>
								{m.howToUpdateDocker()}
							</Button>
						{:else}
							<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
								{m.goToDownloads()}
							</Button>
						{/if}
					</P>
				{/if}
			</FieldHelp>
		{/if}
	</div>
</Fieldset>

<style lang="postcss">
	.field-version {
		@apply flex flex-col;
	}

	.field-version__updates {
		@apply flex items-stretch gap-x-2;
	}
</style>
