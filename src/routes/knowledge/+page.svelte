<script lang="ts">
	import { onMount } from 'svelte';

	import { knowledgeStore } from '$lib/store';
	import { generateStorageId } from '$lib/utils';
	import Button from '$lib/components/Button.svelte';

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
			{#each $knowledgeStore as template}
				<li>
					<strong><a href="/knowledge/{template.id}">{template.name}</a></strong>
				</li>
				<li>Lupdated on: {template.updated_at}</li>
				<li>
					<Button variant="secondary" on:click={() => deleteTemplate(template.id)}>Delete</Button>
				</li>
			{/each}
		</ul>
	{/if}

</div>
