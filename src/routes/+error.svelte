<script lang="ts">
	import { page } from '$app/stores';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
</script>

{#if $page.status === 404}
	<EmptyMessage><strong>Error {$page.status}</strong> — The page you are looking for does not exist.</EmptyMessage>
{:else if $page.status !== 200}
	<EmptyMessage><strong>Error {$page.status}</strong> — There was an internal server error. Please try again later.</EmptyMessage>
{/if}
