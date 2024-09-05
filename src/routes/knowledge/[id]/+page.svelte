<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { writable } from 'svelte/store';

	import { afterNavigate } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import ButtonDelete from '$lib/components/ButtonDelete.svelte';
	import ButtonSubmit from '$lib/components/ButtonSubmit.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import Head from '$lib/components/Head.svelte';
	import Header from '$lib/components/Header.svelte';
	import Metadata from '$lib/components/Metadata.svelte';
	import i18n from '$lib/i18n';
	import { loadKnowledge, saveKnowledge, type Knowledge } from '$lib/knowledge';
	import { Sitemap } from '$lib/sitemap';
	import { formatTimestampToNow, getUpdatedAtDate } from '$lib/utils';

	import type { PageData } from './$types';

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
		toast.success($i18n.t('knowledgeSaved'));
	}

	afterNavigate(() => {
		knowledge = loadKnowledge(data.id);
		name = knowledge.name;
		content = knowledge.content;
	});
</script>

<Head
	title={[
		knowledge.name ? knowledge.name : $i18n.t('newKnowledge'),
		$i18n.t('knowledge', { count: 0 })
	]}
/>
<div class="knowledge">
	<Header confirmDeletion={$shouldConfirmDeletion}>
		<p data-testid="knowledge-id" class="text-sm font-bold leading-none">
			{$i18n.t('knowledge', { count: 1 })}
			<Button variant="link" href={`/knowledge/${knowledge.id}`}>
				#{knowledge.id}
			</Button>
		</p>
		<Metadata dataTestid="knowledge-metadata">
			{isNewKnowledge ? $i18n.t('newKnowledge') : formatTimestampToNow(knowledge.updatedAt)}
		</Metadata>

		<svelte:fragment slot="nav">
			{#if !isNewKnowledge}
				<ButtonDelete sitemap={Sitemap.KNOWLEDGE} id={knowledge.id} {shouldConfirmDeletion} />
			{/if}
		</svelte:fragment>
	</Header>

	<Fieldset isFullscreen={true}>
		<FieldInput name="name" label={$i18n.t('name')} bind:value={name} />

		{#key knowledge}
			<FieldTextEditor label={$i18n.t('content')} {handleSubmit} bind:value={content} />
		{/key}

		<ButtonSubmit hasMetaKey={true} {handleSubmit} disabled={!name || !content}>
			{$i18n.t('save')}
		</ButtonSubmit>
	</Fieldset>
</div>

<style lang="postcss">
	.knowledge {
		@apply flex h-full w-full flex-col overflow-hidden;
	}
</style>
