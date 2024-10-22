<script>
	import { onMount } from 'svelte';

	import LL from '$i18n/i18n-svelte';
	import { getLastUsedModels, listModels } from '$lib/chat';
	import Empty from '$lib/components/EmptyMessage.svelte';
	import Head from '$lib/components/Head.svelte';
	import { settingsStore } from '$lib/localStorage';

	onMount(async () => {
		$settingsStore.models = await listModels();
		$settingsStore.lastUsedModels = getLastUsedModels();
	});
</script>

<Head title={$LL.sessions()} />
<Empty>{$LL.noSessionChosen()}</Empty>
