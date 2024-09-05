<script lang="ts">
	import { beforeUpdate } from 'svelte';

	import { goto } from '$app/navigation';
	import { settingsStore } from '$lib/store';

	beforeUpdate(() => {
		// If the server is connected, redirect to the sessions page
		if ($settingsStore.ollamaServerStatus === 'connected') {
			goto('/sessions');
		} else {
			// If the server is not connected, redirect to the settings page
			goto('/settings');
		}
	});
</script>
