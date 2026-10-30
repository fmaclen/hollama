<script lang="ts">
	import { Brain } from '@lucide/svelte';

	import Button from '#lib/components/Button.svelte';
	import { generateNewUrl } from '#lib/components/ButtonNew.js';
	import FieldSelect from '#lib/components/FieldSelect.svelte';
	import { type Knowledge } from '#lib/knowledge.js';
	import { m } from '#lib/paraglide/messages.js';
	import { Sitemap } from '#lib/sitemap.js';

	export let value: string | undefined = undefined;
	export let options: Knowledge[] = [];
	export let showNav: boolean = false;
	export let showLabel: boolean = true;
	export let allowClear: boolean = true;
	export let onChange: ((knowledgeId: string) => void) | undefined = undefined;
	export let fieldId: string = 'knowledge';
</script>

<FieldSelect
	bind:value
	label={m.knowledge()}
	isLabelVisible={showLabel}
	name={fieldId}
	disabled={!options.length}
	placeholder={!options.length ? m.emptyKnowledge() : !showLabel ? m.knowledge() : ''}
	options={options?.map((k) => ({ value: k.id, label: k.name }))}
	onChange={(option) => onChange?.(option.value)}
	{allowClear}
>
	<svelte:fragment slot="nav">
		{#if showNav}
			<Button
				aria-label={m.newKnowledge()}
				variant="outline"
				href={generateNewUrl(Sitemap.KNOWLEDGE)}
				class="h-full text-muted"
			>
				<Brain class="base-icon" />
			</Button>
		{/if}
	</svelte:fragment>
</FieldSelect>
