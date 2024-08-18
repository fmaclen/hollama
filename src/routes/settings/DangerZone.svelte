<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { LOCAL_STORAGE_PREFIX, StorageKey } from '$lib/store';

	function deleteStorage(item: StorageKey): void {
		if (
			confirm(
				`Are you sure you want to delete all ${item.replace(`${LOCAL_STORAGE_PREFIX}-`, '')}?`
			)
		) {
			localStorage.removeItem(item);
			location.reload();
		}
	}
</script>

<Fieldset>
	<P><strong>Danger zone</strong></P>
	<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaSessions)}>
		Delete all sessions
	</Button>
	<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaKnowledge)}>
		Delete all knowledge
	</Button>
	<Button variant="outline" on:click={() => deleteStorage(StorageKey.HollamaSettings)}>
		Delete server settings
	</Button>
</Fieldset>
