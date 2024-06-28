<script lang="ts">
	import { onMount } from 'svelte';

	import { systemTemplatesStore } from '$lib/store';
	import { generateStorageId } from '$lib/utils';
	import Button from '$lib/components/Button.svelte';

	function deleteTemplate(id: string) {
		const confirmed = confirm('Are you sure you want to delete this template?');
		if (!confirmed) return;

		if ($systemTemplatesStore) {
			$systemTemplatesStore = $systemTemplatesStore.filter((s) => s.id !== id);
		}
	}

	let newSessionId: string;

	function setSessionId() {
		newSessionId = generateStorageId();
	}

	onMount(setSessionId);
</script>

<div class="container">
	<h1>System Templates</h1>

	{#if $systemTemplatesStore}
		<ul>
			{#each $systemTemplatesStore as template}
				<li>
					<Button href="/templates/{template.id}">{template.name}</Button> — updated on: {template.updated_at}
					<Button variant="secondary" on:click={() => deleteTemplate(template.id)}>Delete</Button>
				</li>
			{/each}
		</ul>
	{/if}

	<a href={`templates/${newSessionId}`} on:click={setSessionId}>Create New Template</a>
</div>
