<script lang="ts">
	import i18n from '$lib/i18n';

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
				{$i18n.t('automatcallyCheckForUpdates')}
			</label>

			<Button
				variant="outline"
				disabled={$updateStatusStore.isCheckingForUpdates}
				on:click={async () => await checkForUpdates(true)}
			>
				{$i18n.t('checkNow')}
			</Button>
		</div>

		<FieldHelp>
			{#if $updateStatusStore.isCheckingForUpdates}
				<P>{$i18n.t('checkingForUpdates')}</P>
			{:else if $updateStatusStore.couldntCheckForUpdates}
				<P>
					{$i18n.t('couldntCheckForUpdates')}
					<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
						{$i18n.t('goToReleases')}
					</Button>
				</P>
			{:else if $updateStatusStore.isCurrentVersionLatest}
				<P>
					{$i18n.t('isCurrentVersionLatest')}
					<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
						{$i18n.t('releaseHistory')}
					</Button>
				</P>
			{:else if $updateStatusStore.latestVersion}
				<P>
					{$i18n.t('isLatestVersion')}
					<Badge variant="warning">{$updateStatusStore.latestVersion}</Badge>
					{#if $updateStatusStore.canRefreshToUpdate}
						<Button variant="link" on:click={() => window.location.reload()}>
							{$i18n.t('refreshToUpdate')}
						</Button>
					{:else if $settingsStore.hollamaServerMetadata.isDocker}
						<Button
							variant="link"
							href="https://github.com/fmaclen/hollama/blob/main/SELF_HOSTING.md#updating-to-the-latest-version"
							target="_blank"
						>
							{$i18n.t('howToUpdateDocker')}
						</Button>
					{:else}
						<Button variant="link" href={GITHUB_RELEASES_URL} target="_blank">
							{$i18n.t('goToDownloads')}
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
