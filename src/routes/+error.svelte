<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { page } from '$app/stores';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
</script>

{#if $page.status === 404}
	<EmptyMessage>
		<strong>{$LL.error()} {$page.status}</strong>
		— {$LL.notFound()}
	</EmptyMessage>
{:else if $page.status !== 200}
	<EmptyMessage>
		<strong>{$LL.error()} {$page.status}</strong>
		— {$LL.internalServerError()}
	</EmptyMessage>
{/if}
