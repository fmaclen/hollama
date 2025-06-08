<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<p
	class="align-center flex h-full w-full items-center justify-center text-balance p-4 text-center text-muted"
>
	{@render children?.()}
</p>
