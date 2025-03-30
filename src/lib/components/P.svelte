<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<p class="p">
	{@render children?.()}
</p>

<style lang="postcss">
	.p {
		@apply text-sm;

		:global(strong) {
			@apply font-medium leading-none;
		}
	}
</style>
