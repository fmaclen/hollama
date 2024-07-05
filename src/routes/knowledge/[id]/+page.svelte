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
	import Header from '$lib/components/Header.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import ButtonSubmit from '$lib/components/ButtonSubmit.svelte';

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
		const confirmed = confirm('Are you sure you want to delete this knowledge?');
		if (!confirmed) return;

		if ($knowledgeStore) {
			const updatedKnowledge = $knowledgeStore.filter((s) => s.id !== knowledge.id);
			$knowledgeStore = updatedKnowledge;
		}
		goto('/knowledge');
	}

	afterNavigate(() => {
		knowledge = loadKnowledge(data.id);
		name = knowledge.name;
		content = knowledge.content;
	});
</script>

<div class="flex h-full w-full flex-col">
	<Header>
		<div class="space-y-4">
			<p data-testid="knowledge-id" class="text-sm font-bold leading-none text-foreground">
				Knowledge
				<Button size="link" variant="link" href={`/knowledge/${knowledge.id}`}>
					#{knowledge.id}
				</Button>
			</p>
			<p data-testid="knowledge-timestamp" class="text-sm text-muted-foreground">
				{#if isNewKnowledge}
					New knowledge
				{:else}
					{knowledge.updatedAt}
				{/if}
			</p>
		</div>
		{#if !isNewKnowledge}
			<Button title="Delete knowledge" variant="outline" size="icon" on:click={deleteKnowledge}>
				<Trash2 class="h-4 w-4" />
			</Button>
		{/if}
	</Header>

	<Separator />

	<Fieldset isFullscreen={true}>
		<Field name="name">
			<svelte:fragment slot="label">Name</svelte:fragment>
			<input id="name" class="input" bind:value={name} />
		</Field>
		<Field name="content" class="h-full">
			<svelte:fragment slot="label">Content</svelte:fragment>
			{#key knowledge}
				<FieldTextEditor {handleSubmit} bind:value={content} />
			{/key}
		</Field>

		<ButtonSubmit {handleSubmit} disabled={!name || !content} >Save</ButtonSubmit>
	</Fieldset>
</div>

<style lang="scss">
	.input {
		@apply flex min-h-[2em] w-full resize-none rounded-md border border-input bg-elevation-0 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
	}
</style>
