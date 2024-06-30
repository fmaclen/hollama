<script lang="ts">
	import type { PageData } from './$types';

	import Button from '$lib/components/Button.svelte';
	import Separator from '$lib/components/Separator.svelte';
	import { loadKnowledge, saveKnowledge } from '$lib/knowledge';
	import { getUpdatedAtDate } from '$lib/utils';

	export let data: PageData;
	let name: string;
	let content: string;

	$: knowledge = loadKnowledge(data.id);
	$: isNewKnowledge = !knowledge.name || !knowledge.content;

	$: {
		name = knowledge.name;
		content = knowledge.content[0];
	}

	function handleSubmit() {
		saveKnowledge({ id: data.id, name, content: [content], updatedAt: getUpdatedAtDate() });
	}
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
		<!-- <Button title="Delete knowledge" variant="outline" size="icon" on:click={deleteSession}>
			<Trash2 class="h-4 w-4" />
		</Button> -->
	</header>

	<Separator />

	<ul>
		<li>created_at: {knowledge.updatedAt}</li>
		<li>name: <input class="border border-neutral-500" bind:value={name} /></li>
		<li>
			content:
			<textarea class="border border-neutral-500" bind:value={content}></textarea>
		</li>
		<li>
			<Button class="w-full" on:click={handleSubmit} disabled={!name && !content}>Save</Button>
		</li>
	</ul>
</div>
