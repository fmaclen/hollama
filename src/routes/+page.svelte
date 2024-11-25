<script lang="ts">
	import { goto } from '$app/navigation';
	import { serversStore } from '$lib/localStorage';

	$effect.pre(() => {
		// If at least one server is verified, redirect to the sessions page
		if ($serversStore.some((server) => server.isVerified !== null)) {
			goto('/sessions');
		} else {
			// Otherwise, redirect to the settings page to add or verify servers
			goto('/settings');
		}
	});
</script>
