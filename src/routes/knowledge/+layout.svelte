<script lang="ts">
	import ButtonNew from '$lib/components/ButtonNew.svelte';
	import Separator from '$lib/components/Separator.svelte';
	import Button from '$lib/components/Button.svelte';

	import { knowledgeStore } from '$lib/store';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';

	function deleteTemplate(id: string) {
		const confirmed = confirm('Are you sure you want to delete this template?');
		if (!confirmed) return;

		if ($knowledgeStore) {
			$knowledgeStore = $knowledgeStore.filter((s) => s.id !== id);
		}
	}
</script>

<div class="grid grid-cols-[max-content,max-content,auto]">
	<aside class="flex h-screen min-w-80 flex-col">
		<ButtonNew section="knowledge"></ButtonNew>

		{#if $knowledgeStore && $knowledgeStore.length > 0}
			<ul>
				{#each $knowledgeStore as knowledge}
					<li>
						<strong><a href="/knowledge/{knowledge.id}">{knowledge.name}</a></strong>
					</li>
					<li>Lupdated on: {knowledge.updated_at}</li>
					<li>
						<Button variant="secondary" on:click={() => deleteTemplate(knowledge.id)}>Delete</Button
						>
					</li>
				{/each}
			</ul>
		{:else}
			<EmptyMessage>No knowledge</EmptyMessage>
		{/if}
	</aside>

	<Separator orientation="vertical" />

	<slot />
</div>
