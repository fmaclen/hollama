<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import MarkdownIt from 'markdown-it/lib/index.mjs';

	export let data: { motd: string };

	const md = new MarkdownIt();
</script>

<Head title="Message of the day" />

<section class="motd">
	<div class="motd__container">
		{#if data.motd}
			{@html md.render(data.motd)} <!-- eslint-disable-line svelte/no-at-html-tags -->
		{/if}
	</div>
</section>

<style lang="postcss">
	.motd {
		@apply base-section flex border-spacing-1 flex-col bg-shade-1 p-8;
	}

	.motd__container {
		@apply mx-auto my-auto max-w-prose text-balance;
	}

	.motd__container :global(h1) {
		@apply my-10 text-4xl font-bold tracking-tight;
	}

	.motd__container :global(h2) {
		@apply mt-8 text-2xl font-bold tracking-tight;
	}

	.motd__container :global(h3) {
		@apply my-4 text-2xl font-light;
	}

	.motd__container :global(h4) {
		@apply mt-8 text-lg font-semibold;
	}

	.motd__container :global(h5) {
		@apply mt-8 text-base font-bold;
	}

	.motd__container :global(h6) {
		@apply mt-8 text-sm font-bold;
	}

	.motd__container :global(p) {
		@apply my-3 text-base;
	}

	.motd__container :global(ul) {
		@apply my-4 list-inside list-disc;
	}

	.motd__container :global(ol) {
		@apply my-4 list-inside list-decimal;
	}

	.motd__container :global(li) {
		@apply my-1 text-base;
	}

	.motd__container :global(blockquote) {
		@apply text-base italic;
	}

	.motd__container :global(code) {
		@apply font-mono text-base;
	}

	.motd__container :global(pre) {
		@apply font-mono text-base;
	}

	.motd__container :global(a) {
		@apply text-accent underline;
	}

	.motd__container :global(a code) {
		@apply text-accent;
	}
</style>
