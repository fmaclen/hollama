<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { LOCAL_STORAGE_PREFIX, StorageKey } from '$lib/store';

	function deleteStorage(item: StorageKey): void {
		if (
			confirm(
				$LL.areYouSureYouWantToDeleteAll({
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
	<P><strong>{$LL.dangerZone()}</strong></P>
	<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaSessions)}>
		{$LL.deleteAllSessions()}
	</Button>
	<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaKnowledge)}>
		{$LL.deleteAllKnowledge()}
	</Button>
	<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaSettings)}>
		{$LL.deleteAllSettings()}
	</Button>
</Fieldset>
