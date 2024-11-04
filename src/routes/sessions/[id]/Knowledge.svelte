<script lang="ts">
	import { Brain } from 'lucide-svelte';

	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import { type Knowledge } from '$lib/knowledge';
	import { knowledgeStore } from '$lib/localStorage';
	import { Sitemap } from '$lib/sitemap';

	export let knowledge: Knowledge | undefined;
	export let showNav: boolean = false;
	export let showLabel: boolean = true;
	export let onChange: ((knowledgeId: string) => void) | undefined = undefined;

	let knowledgeId: string | undefined;

	$: {
		if (knowledge) knowledgeId = knowledge.id;
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
	onChange={(option) => onChange?.(option.value)}
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
