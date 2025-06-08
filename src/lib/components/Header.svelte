<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		confirmDeletion?: boolean;
		headline: Snippet;
		nav: Snippet;
	}

	let { confirmDeletion = false, headline, nav }: Props = $props();
</script>

<header
	class="flex items-center justify-between rounded-tl-xl rounded-tr-xl border-b bg-shade-1 py-4 pl-16 pr-3 text-xs {confirmDeletion
		? 'confirm-deletion'
		: ''}"
>
	<div class="flex-start flex flex-col gap-1">
		{@render headline()}
	</div>

	<nav class="flex flex-row items-center">
		{@render nav()}
	</nav>
</header>
