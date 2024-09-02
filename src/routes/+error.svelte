<script lang="ts">
	import { page } from '$app/stores';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import i18n from '$lib/i18n';
</script>

{#if $page.status === 404}
	<EmptyMessage>
		<strong>Error {$page.status}</strong>
		— {$i18n.t('errors.notFound')}
	</EmptyMessage>
{:else if $page.status !== 200}
	<EmptyMessage>
		<strong>Error {$page.status}</strong>
		— {$i18n.t('errors.internalServerError')}
	</EmptyMessage>
{/if}
