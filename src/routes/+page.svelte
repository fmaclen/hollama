<script lang="ts">
	import { settingsStore } from '$lib/store';
	import { goto } from '$app/navigation';
	import { beforeUpdate } from 'svelte';

	// FIXME: This behavior may belong in hooks.client.ts
	beforeUpdate(() => {
		if (!$settingsStore?.ollamaServer) {
			// FIXME:
			// This should only rediect to /settings if the server is not connected
			goto('/settings');
		} else {
			goto('/sessions');
		}
	});
</script>

