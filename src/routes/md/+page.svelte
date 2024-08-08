<script lang="ts">
	import MarkdownIt from 'markdown-it/lib/index.mjs';

	export let data: { motd: string };

	const md = new MarkdownIt();
</script>

<section class="motd">
	<div class="motd__container">
		{@html md.render(data.motd)}
	</div>
</section>

<style lang="postcss">
	.motd {
		@apply base-section flex border-spacing-1 flex-col bg-shade-1 p-8;
	}

	.motd__container {
		@apply mx-auto my-auto flex flex-col;
	}

	.motd__container :global(h1) {
		@apply text-4xl font-bold tracking-tight mt-4;
	}

	.motd__container :global(h2) {
		@apply text-2xl font-bold tracking-tight mt-3;
	}

	.motd__container :global(h3) {
		@apply text-xl font-bold  mb-2;
	}

	.motd__container :global(h4) {
		@apply text-lg font-bold mb-2;
	}

	.motd__container :global(h5) {
		@apply text-base font-bold mb-1;
	}

	.motd__container :global(h6) {
		@apply text-sm font-bold;
	}

	.motd__container :global(p) {
		@apply text-base my-4;
	}

	.motd__container :global(ul) {
		@apply list-disc list-inside my-4;
	}

	.motd__container :global(ol) {
		@apply list-decimal list-inside my-4;
	}

	.motd__container :global(li) {
		@apply text-base my-1;
	}

	.motd__container :global(blockquote) {
		@apply text-base italic;
	}

	.motd__container :global(code) {
		@apply text-base font-mono;
	}

	.motd__container :global(pre) {
		@apply text-base font-mono;
	}
</style>
