<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { version } from '$app/environment';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldCheckbox from '$lib/components/FieldCheckbox.svelte';
	import FieldHelp from '$lib/components/FieldHelp.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { GITHUB_RELEASES_URL } from '$lib/github';
	import { settingsStore } from '$lib/localStorage';
	import { checkForUpdates, updateStatusStore } from '$lib/updates';

	// If this component is mounted we don't want the sidebar notification badge to be visible
	$: if ($updateStatusStore) $updateStatusStore.showSidebarNotification = false;
</script>

<Fieldset>
	<P><strong>{$LL.currentVersion()}</strong></P>

	<div class="field-version">
		<div class="field-version__updates">
			<Badge>{version}</Badge>
			<FieldCheckbox
				label={$LL.automaticallyCheckForUpdates()}
				bind:checked={$settingsStore.autoCheckForUpdates}
			/>
			<Button
				variant="outline"
				disabled={$updateStatusStore.isCheckingForUpdates}
				on:click={async () => await checkForUpdates(true)}
			>
				{$LL.checkNow()}
			</Button>
		</div>

		{#if $updateStatusStore.isCheckingForUpdates || $updateStatusStore.couldntCheckForUpdates || $updateStatusStore.isCurrentVersionLatest || $updateStatusStore.latestVersion}
			<FieldHelp>
				{#if $updateStatusStore.isCheckingForUpdates}
					<P>{$LL.checkingForUpdates()}</P>
				{:else if $updateStatusStore.couldntCheckForUpdates}
					<P>
						{$LL.couldntCheckForUpdates()}
						<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
							{$LL.goToReleases()}
						</Button>
					</P>
				{:else if $updateStatusStore.isCurrentVersionLatest}
					<P>
						{$LL.isCurrentVersionLatest()}
						<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
							{$LL.releaseHistory()}
						</Button>
					</P>
				{:else if $updateStatusStore.latestVersion}
					<P>
						{$LL.isLatestVersion()}
						<Badge variant="warning">{$updateStatusStore.latestVersion}</Badge>
						{#if $updateStatusStore.canRefreshToUpdate}
							<Button variant="link" on:click={() => window.location.reload()}>
								{$LL.refreshToUpdate()}
							</Button>
						{:else if $settingsStore.hollamaMetadata.isDocker}
							<Button
								variant="link"
								href="https://github.com/fmaclen/hollama/blob/main/SELF_HOSTING.md#updating-to-the-latest-version"
								target="_blank"
							>
								{$LL.howToUpdateDocker()}
							</Button>
						{:else}
							<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
								{$LL.goToDownloads()}
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
