<script lang="ts">
	import { toast } from 'svelte-sonner';

	import LL from '$i18n/i18n-svelte';
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
	import { loadKnowledge, saveKnowledge, type Knowledge } from '$lib/knowledge';
	import { Sitemap } from '$lib/sitemap';
	import { formatTimestampToNow, getUpdatedAtDate } from '$lib/utils';

	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let knowledge: Knowledge = $state(loadKnowledge(data.id));
	let name: string | undefined = $state();
	let content: string = $state('');
	let shouldConfirmDeletion = $state(false);

	const isNewKnowledge = $derived(!name || !content);

	function handleSubmit() {
		if (!name || !content) return;
		saveKnowledge({ id: data.id, name, content, updatedAt: getUpdatedAtDate() });
		knowledge = loadKnowledge(data.id);
		toast.success($LL.knowledgeSaved());
	}

	afterNavigate(() => {
		knowledge = loadKnowledge(data.id);
		name = knowledge.name;
		content = knowledge.content;
	});
</script>

<Head title={[knowledge.name ? knowledge.name : $LL.newKnowledge(), $LL.knowledge()]} />
<div class="knowledge">
	<Header confirmDeletion={shouldConfirmDeletion}>
		{#snippet headline()}
			<p data-testid="knowledge-id" class="font-bold leading-none">
				{$LL.knowledge()}
				<Button variant="link" href={`/knowledge/${knowledge.id}`}>
					#{knowledge.id}
				</Button>
			</p>
			<Metadata dataTestid="knowledge-metadata">
				{isNewKnowledge ? $LL.newKnowledge() : formatTimestampToNow(knowledge.updatedAt)}
			</Metadata>
		{/snippet}

		{#snippet nav()}
			{#if !isNewKnowledge}
				<ButtonDelete sitemap={Sitemap.KNOWLEDGE} id={knowledge.id} bind:shouldConfirmDeletion />
			{/if}
		{/snippet}
	</Header>

	<div class="knowledge__form">
		<Fieldset>
			<FieldInput name="name" label={$LL.name()} bind:value={name} />

			{#key knowledge}
				<FieldTextEditor label={$LL.content()} {handleSubmit} bind:value={content} />
			{/key}

			<ButtonSubmit hasMetaKey={true} {handleSubmit} disabled={!name || !content}>
				{$LL.save()}
			</ButtonSubmit>
		</Fieldset>
	</div>
</div>

<style lang="postcss">
	.knowledge {
		@apply flex h-full w-full flex-col;
	}

	.knowledge__form {
		@apply base-fieldset-container overflow-scrollbar flex h-full;
	}
</style>
