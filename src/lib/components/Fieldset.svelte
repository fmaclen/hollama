<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		children?: Snippet;
	}
	
	let { children }: Props = $props();
</script>

<fieldset class="fieldset">
	{@render children?.()}
</fieldset>

<style lang="postcss">
	.fieldset {
		@apply container mx-auto flex max-w-[80ch] flex-col gap-y-3;
	}
</style>
