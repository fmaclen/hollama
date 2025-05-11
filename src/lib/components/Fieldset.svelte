<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		legend?: Snippet;
		children?: Snippet;
	}

	let { legend, children }: Props = $props();
</script>

<fieldset class="fieldset {legend ? 'fieldset--with-legend' : ''}">
	{#if legend}
		<legend class="fieldset__legend">
			{@render legend?.()}
		</legend>
	{/if}

	{@render children?.()}
</fieldset>

<style lang="postcss">
	.fieldset {
		@apply container mx-auto flex max-w-[80ch] flex-col gap-y-3;
	}

	.fieldset--with-legend {
		@apply rounded-md border border-shade-4 p-4;
	}

	.fieldset__legend {
		@apply flex items-stretch gap-x-2;
	}
</style>
