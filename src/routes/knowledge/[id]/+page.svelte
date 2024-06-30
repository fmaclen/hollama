<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { Trash2 } from 'lucide-svelte';

	import Field from '$lib/components/Field.svelte';
	import Button from '$lib/components/Button.svelte';
	import Separator from '$lib/components/Separator.svelte';
	import { type Knowledge, loadKnowledge, saveKnowledge } from '$lib/knowledge';
	import { getUpdatedAtDate } from '$lib/utils';
	import { knowledgeStore } from '$lib/store';

	export let data: PageData;

	let knowledge: Knowledge = loadKnowledge(data.id);
	let name: string;
	let content: string;

	$: isNewKnowledge = !name || !content;

	function handleSubmit() {
		saveKnowledge({ id: data.id, name, content, updatedAt: getUpdatedAtDate() });
		knowledge = loadKnowledge(data.id);
	}

	function deleteKnowledge() {
		const confirmed = confirm('Are you sure you want to delete this session?');
		if (!confirmed) return;

		if ($knowledgeStore) {
			const updatedSessions = $knowledgeStore.filter((s) => s.id !== knowledge.id);
			$knowledgeStore = updatedSessions;
		}
		goto('/knowledge');
	}

	afterNavigate(() => {
		knowledge = loadKnowledge(data.id)
		name = knowledge.name;
		content = knowledge.content;
	});
</script>

<div class="flex h-full w-full flex-col">
	<header class="flex items-center justify-between px-6 py-4">
		<div class="space-y-1">
			<p data-testid="knowledge-id" class="text-sm font-bold leading-none text-foreground">
				Knowledge
				<Button size="link" variant="link" href={`/knowledge/${knowledge.id}`}>
					#{knowledge.id}
				</Button>
			</p>
			<p data-testid="knowledge-name" class="text-sm text-muted-foreground">
				{isNewKnowledge ? 'New knowledge' : knowledge.updatedAt}
			</p>
		</div>
		{#if !isNewKnowledge}
			<Button title="Delete knowledge" variant="outline" size="icon" on:click={deleteKnowledge}>
				<Trash2 class="h-4 w-4" />
			</Button>
		{/if}
	</header>

	<Separator />

	<div class="flex h-full flex-col p-6">
		<Field class="mb-6 flex" name="name">
			<span slot="title">Name</span>
			<input class="input" bind:value={name} />
		</Field>
		<Field class="mb-6 flex h-full" name="content">
			<span slot="title">Content</span>
			<textarea class="input input--textarea" bind:value={content}></textarea>
		</Field>
		<Button class="w-full" on:click={handleSubmit} disabled={!name || !content}>Save</Button>
	</div>
</div>

<style lang="scss">
	.input {
		@apply flex min-h-[2em] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;

		&--textarea {
			@apply h-full min-h-[10em];
		}
	}
</style>
