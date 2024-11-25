<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { StorageKey } from '$lib/localStorage';

	function deleteStorage(item: StorageKey): void {
		const dialogText: Partial<Record<StorageKey, string>> = {
			[StorageKey.HollamaSessions]: $LL.areYouSureYouWantToDeleteAllSessions(),
			[StorageKey.HollamaKnowledge]: $LL.areYouSureYouWantToDeleteAllKnowledge(),
			[StorageKey.HollamaSettings]: $LL.areYouSureYouWantToDeleteAllSettings()
		};
		if (confirm(dialogText[item])) {
			localStorage.removeItem(item);
			if (item === StorageKey.HollamaSettings) localStorage.removeItem(StorageKey.HollamaServers);
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
