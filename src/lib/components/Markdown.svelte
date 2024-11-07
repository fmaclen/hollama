<script lang="ts">
	import hljs from 'highlight.js';
	import MarkdownIt from 'markdown-it/lib/index.mjs';
	import { onMount } from 'svelte';

	import 'highlight.js/styles/github.min.css';

	import ButtonCopy from './ButtonCopy.svelte';

	export let markdown: string;
	const CODE_SNIPPET_ID = 'code-snippet';

	function renderCodeSnippet(code: string) {
		return `<pre id="${CODE_SNIPPET_ID}"><code class="hljs">${code}</code></pre>`;
	}

	const md: MarkdownIt = new MarkdownIt({
		highlight: function (str, lang) {
			if (lang && hljs.getLanguage(lang)) {
				try {
					return renderCodeSnippet(
						hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
					);
				} catch (error) {
					console.error('Error in renderCodeSnippet:', error);
				}
			}

			return renderCodeSnippet(md.utils.escapeHtml(str));
		}
	});

	onMount(() => {
		const preElements = document.querySelectorAll(`pre#${CODE_SNIPPET_ID}`);

		preElements.forEach((preElement) => {
			const codeElement = preElement.querySelector('code');
			if (codeElement)
				new ButtonCopy({ target: preElement, props: { content: codeElement.innerText } });
		});
	});
</script>

<div class="markdown">
	<!--
		HACK: `{#if markdown}` is needed to prevent the `eslint-disable` comment from
		getting formatted on auto-formatting.
	-->
	{#if markdown}
		{@html md.render(markdown)} <!-- eslint-disable-line svelte/no-at-html-tags -->
	{/if}
</div>

<style lang="postcss">
	.markdown :global(> *:first-child) {
		@apply mt-0;
	}

	.markdown :global(> *:last-child) {
		@apply mb-0;
	}

	.markdown :global(h1),
	.markdown :global(h2),
	.markdown :global(h3),
	.markdown :global(h4),
	.markdown :global(h5),
	.markdown :global(h6) {
		@apply max-w-[35ch] tracking-tight;
	}

	.markdown :global(h1) {
		@apply my-10 max-w-[22ch] text-4xl font-bold;
	}

	.markdown :global(h2) {
		@apply mt-8 text-2xl font-semibold;
	}

	.markdown :global(h3) {
		@apply my-2 text-2xl font-light;
	}

	.markdown :global(h4) {
		@apply mt-8 text-lg font-semibold;
	}

	.markdown :global(h5),
	.markdown :global(h6) {
		@apply mt-8 font-semibold;
	}

	.markdown :global(p),
	.markdown :global(li) {
		@apply max-w-prose;
	}

	.markdown :global(p) {
		@apply my-3 text-sm;
		@apply md:text-base;
	}

	.markdown :global(ul),
	.markdown :global(ol) {
		@apply mx-7 my-2 flex list-outside flex-col gap-y-1;
	}

	.markdown :global(ol) {
		@apply list-decimal;
	}

	.markdown :global(ul) {
		@apply list-disc;
	}

	.markdown :global(blockquote) {
		@apply my-3 border-l-4 border-l-shade-3 pl-4 italic text-muted;
	}

	.markdown :global(blockquote > p) {
		@apply text-inherit;
	}

	.markdown :global(strong) {
		@apply font-semibold;
	}

	.markdown :global(a) {
		@apply text-link;
	}

	.markdown :global(table) {
		@apply w-full border-separate border-spacing-0 rounded-md;
	}

	.markdown :global(th),
	.markdown :global(td) {
		@apply border-b border-l border-shade-3 px-3 py-1 text-left text-sm;
	}

	.markdown :global(th) {
		@apply border-t;
	}

	.markdown :global(th:first-child) {
		@apply rounded-tl-md;
	}

	.markdown :global(th:last-child) {
		@apply rounded-tr-md border-r;
	}

	.markdown :global(td:last-child) {
		@apply border-r;
	}

	.markdown :global(tbody tr:last-child td:first-child) {
		@apply rounded-bl-md;
	}

	.markdown :global(tbody tr:last-child td:last-child) {
		@apply rounded-br-md;
	}

	.markdown :global(th) {
		@apply bg-shade-2;
	}

	/* Code */

	.markdown :global(pre) {
		@apply overflow-scrollbar relative my-6 rounded-md border border-shade-2;
		@apply first:mt-0;
	}

	.markdown :global(code) {
		@apply rounded-md bg-amber-50 p-1 text-xs text-orange-600;
		@apply dark:bg-amber-950 dark:text-orange-500;
		@apply md:text-sm;
		font-variant-ligatures: none;
	}

	.markdown :global(pre code) {
		@apply block bg-neutral-50/50 p-4 pr-12 text-base text-xs text-neutral-700;
		@apply md:text-sm;
		@apply dark:invert;
	}

	.markdown :global(a:has(code)) {
		@apply decoration-accent;
	}

	.markdown :global(a > code) {
		@apply hover:bg-shade-0;
	}

	.markdown :global(pre > .copy-button) {
		@apply absolute right-2 top-2 rounded-md bg-shade-1 opacity-0;
	}

	.markdown :global(pre:hover > .copy-button) {
		@apply opacity-100;
	}
</style>
