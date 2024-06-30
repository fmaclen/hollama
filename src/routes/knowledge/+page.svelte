<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	import { knowledgeStore } from '$lib/store';
	import { generateStorageId } from '$lib/utils';
	import Button from '$lib/components/Button.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';

	function deleteTemplate(id: string) {
		const confirmed = confirm('Are you sure you want to delete this template?');
		if (!confirmed) return;

		if ($knowledgeStore) {
			$knowledgeStore = $knowledgeStore.filter((s) => s.id !== id);
		}
	}

	let newSessionId: string;

	function setSessionId() {
		newSessionId = generateStorageId();
	}

	onMount(setSessionId);
</script>

<div class="container">
	<h1>Knowledge</h1>

	<Button href={`/knowledge/${newSessionId}`} on:click={setSessionId}>New knowledge</Button>

	{#if $knowledgeStore}
		<ul>
			{#each $knowledgeStore as knowledge}
				<li>
					<strong><a href="/knowledge/{knowledge.id}">{knowledge.name}</a></strong>
				</li>
				<li>Lupdated on: {knowledge.updated_at}</li>
				<li>
					<Button variant="secondary" on:click={() => deleteTemplate(knowledge.id)}>Delete</Button>
				</li>
			{/each}
		</ul>
	{:else}
		<EmptyMessage>Create a new knowlege or choose one from the list</EmptyMessage>
	{/if}

	{#if $knowledgeStore}
		{#each $knowledgeStore as knowledge}
			{#if knowledge.id === $page.params.id}
				<p>{knowledge.name}</p>
				<p>{knowledge.content}</p>
			{/if}
		{/each}
	{/if}

</div>
