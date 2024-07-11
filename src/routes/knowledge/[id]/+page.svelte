<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { Trash2 } from 'lucide-svelte';

	import Button from '$lib/components/Button.svelte';
	import { type Knowledge, loadKnowledge, saveKnowledge } from '$lib/knowledge';
	import { getUpdatedAtDate } from '$lib/utils';
	import { knowledgeStore } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import ButtonSubmit from '$lib/components/ButtonSubmit.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { formatDistanceToNow } from 'date-fns';

	export let data: PageData;

	let knowledge: Knowledge = loadKnowledge(data.id);
	let name: string;
	let content: string;

	$: isNewKnowledge = !name || !content;

	function handleSubmit() {
		if (!name || !content) return;
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

<div class="flex h-full w-full flex-col overflow-hidden">
	<Header>
		<p data-testid="knowledge-id" class="text-sm font-bold leading-none">
			Knowledge
			<Button size="link" variant="link" href={`/knowledge/${knowledge.id}`}>
				#{knowledge.id}
			</Button>
		</p>
		<p class="text-sm text-muted">
			{#if isNewKnowledge}
				New knowledge
			{:else}
				<Badge variant="default" capitalize={false}>
					<p data-testid="knowledge-timestamp">
						{formatDistanceToNow(new Date(knowledge.updatedAt), { addSuffix: true })}
					</p>
				</Badge>
			{/if}
		</p>

		<svelte:fragment slot="nav">
			{#if !isNewKnowledge}
				<Button title="Delete knowledge" variant="outline" size="icon" on:click={deleteKnowledge}>
					<Trash2 class="h-4 w-4" />
				</Button>
			{/if}
		</svelte:fragment>
	</Header>

	<Fieldset isFullscreen={true}>
		<FieldInput name="name" label="Name" bind:value={name} />

		{#key knowledge}
			<FieldTextEditor label="Content" {handleSubmit} bind:value={content} />
		{/key}

		<ButtonSubmit {handleSubmit} disabled={!name || !content}>Save</ButtonSubmit>
	</Fieldset>
</div>
