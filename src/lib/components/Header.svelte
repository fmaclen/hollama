<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		confirmDeletion?: boolean;
		headline: Snippet;
		nav: Snippet;
	}

	let { confirmDeletion = false, headline, nav }: Props = $props();
</script>

<header class="flex py-4 items-center justify-between border-b bg-shade-1 pl-16 pr-3 text-xs rounded-tl-xl rounded-tr-xl {confirmDeletion ? 'confirm-deletion' : ''}">
	<div class="flex flex-start gap-1 flex-col">
		{@render headline()}
	</div>

	<nav class="flex flex-row items-center">
		{@render nav()}
	</nav>
</header>
