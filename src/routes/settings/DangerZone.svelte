<script lang="ts">
	import i18n from '$lib/i18n';
	import Button from '$lib/components/Button.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { LOCAL_STORAGE_PREFIX, StorageKey } from '$lib/store';

	function deleteStorage(item: StorageKey): void {
		if (
			confirm(
				$i18n.t('dialogs.areYouSureYouWantToDeleteAll', {
					type: item.replace(`${LOCAL_STORAGE_PREFIX}-`, '')
				})
			)
		) {
			localStorage.removeItem(item);
			location.reload();
		}
	}
</script>

<Fieldset>
	<P><strong>{$i18n.t('settingsPage.dangerZone')}</strong></P>
	<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaSessions)}>
		{$i18n.t('settingsPage.deleteAllSessions')}
	</Button>
	<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaKnowledge)}>
		{$i18n.t('settingsPage.deleteAllKnowledge')}
	</Button>
	<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaSettings)}>
		{$i18n.t('settingsPage.deleteAllSettings')}
	</Button>
</Fieldset>
