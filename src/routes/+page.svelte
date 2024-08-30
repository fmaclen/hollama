<script lang="ts">
	import { settingsStore } from '$lib/store';
	import { goto } from '$app/navigation';
	import { beforeUpdate } from 'svelte';

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
