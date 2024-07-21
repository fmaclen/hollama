<script lang="ts">
	import { writable } from 'svelte/store';
	import { afterNavigate } from '$app/navigation';
	import type { PageData } from './$types';

	import { type Knowledge, loadKnowledge, saveKnowledge } from '$lib/knowledge';
	import { formatTimestampToNow, getUpdatedAtDate } from '$lib/utils';
	import { Sitemap } from '$lib/sitemap';
	import Button from '$lib/components/Button.svelte';
	import Header from '$lib/components/Header.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import ButtonSubmit from '$lib/components/ButtonSubmit.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import ButtonDelete from '$lib/components/ButtonDelete.svelte';
	import Metadata from '$lib/components/Metadata.svelte';
	import { updatePageTitle } from '$lib/store';

	export let data: PageData;

	let knowledge: Knowledge = loadKnowledge(data.id);
	let name: string;
	let content: string;
	const shouldConfirmDeletion = writable(false);

	$: isNewKnowledge = !name || !content;

	function handleSubmit() {
		if (!name || !content) return;
		saveKnowledge({ id: data.id, name, content, updatedAt: getUpdatedAtDate() });
		knowledge = loadKnowledge(data.id);
	}

	afterNavigate(() => {
		knowledge = loadKnowledge(data.id);
		name = knowledge.name;
		content = knowledge.content;
		updatePageTitle([knowledge.name ? knowledge.name : 'New knowledge', 'Knowledge']);
	});
</script>

<div class="knowledge">
	<Header confirmDeletion={$shouldConfirmDeletion}>
		<p data-testid="knowledge-id" class="text-sm font-bold leading-none">
			Knowledge
			<Button variant="link" href={`/knowledge/${knowledge.id}`}>
				#{knowledge.id}
			</Button>
		</p>
		<Metadata dataTestid="knowledge-metadata">
			{isNewKnowledge ? 'New knowledge' : formatTimestampToNow(knowledge.updatedAt)}
		</Metadata>

		<svelte:fragment slot="nav">
			{#if !isNewKnowledge}
				<ButtonDelete sitemap={Sitemap.KNOWLEDGE} id={knowledge.id} {shouldConfirmDeletion} />
			{/if}
		</svelte:fragment>
	</Header>

	<Fieldset isFullscreen={true}>
		<FieldInput name="name" label="Name" bind:value={name} />

		{#key knowledge}
			<FieldTextEditor label="Content" {handleSubmit} bind:value={content} />
		{/key}

		<ButtonSubmit hasMetaKey={true} {handleSubmit} disabled={!name || !content}>Save</ButtonSubmit>
	</Fieldset>
</div>

<style lang="scss">
	.knowledge {
		@apply flex h-full w-full flex-col overflow-hidden;
	}
</style>
