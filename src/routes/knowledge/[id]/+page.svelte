<script lang="ts">
	import type { PageData } from '../$types';

	import { loadKnowledge, saveKnowledge } from '$lib/knowledge';
	import Button from '$lib/components/Button.svelte';
	import { getUpdatedAtDate } from '$lib/utils';

	export let data: PageData;

	let knowledge = loadKnowledge(data.id);
	let { id, name, content, updated_at } = knowledge;

	function handleSubmit() {
		saveKnowledge({ id, name, content, updated_at: getUpdatedAtDate() });
	}
</script>

{#if knowledge}
	<ul>
		<li>id: {id}</li>
		<li>created_at: {updated_at}</li>
		<li>name: <input class="border border-neutral-500" bind:value={name} /></li>
		<li>
			content:
			<textarea class="border border-neutral-500" bind:value={content}></textarea>
		</li>
		<li>
			<Button class="w-full" on:click={handleSubmit} disabled={!name && !content}>Save</Button>
		</li>
	</ul>
{/if}
