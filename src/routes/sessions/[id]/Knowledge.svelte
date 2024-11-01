<script lang="ts">
	import { Brain } from 'lucide-svelte';

	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import { loadKnowledge } from '$lib/knowledge';
	import { knowledgeStore } from '$lib/localStorage';
	import type { Message } from '$lib/sessions';
	import { Sitemap } from '$lib/sitemap';

	export let systemPrompt: Message;
	export let showNav: boolean = false;
	export let showLabel: boolean = true;

	let knowledgeId: string | undefined;

	$: {
		if (systemPrompt.knowledge && !knowledgeId) {
			// Initial load: set knowledgeId if knowledge exists
			knowledgeId = systemPrompt.knowledge.id;
		} else if (knowledgeId !== systemPrompt.knowledge?.id) {
			// Knowledge selection changed
			if (knowledgeId) {
				const knowledge = loadKnowledge(knowledgeId);
				systemPrompt.knowledge = knowledge;
				systemPrompt.content = knowledge.content;
			} else {
				// Clear knowledge if knowledgeId is undefined
				systemPrompt.knowledge = undefined;
				systemPrompt.content = '';
			}
		}
	}
</script>

<FieldSelect
	label={$LL.knowledge()}
	isLabelVisible={showLabel}
	name="knowledge"
	disabled={!$knowledgeStore.length}
	placeholder={!$knowledgeStore.length ? $LL.emptyKnowledge() : !showLabel ? $LL.knowledge() : ''}
	options={$knowledgeStore?.map((k) => ({ value: k.id, label: k.name }))}
	bind:value={knowledgeId}
>
	<svelte:fragment slot="nav">
		{#if showNav}
			<Button
				aria-label={$LL.newKnowledge()}
				variant="outline"
				href={generateNewUrl(Sitemap.KNOWLEDGE)}
				class="h-full text-muted"
			>
				<Brain class="base-icon" />
			</Button>
		{/if}
	</svelte:fragment>
</FieldSelect>
