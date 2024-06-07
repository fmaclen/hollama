<script lang="ts">
	import { onMount } from 'svelte';
	import MarkdownIt from 'markdown-it';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css';

	import { type Message } from '$lib/sessions';
	import Separator from '$lib/components/Separator.svelte';
	import CopyButton from './CopyButton.svelte';

	export let message: Message;
	let articleElement: HTMLElement;

	const CODE_SNIPPET_ID = 'code-snippet';
	const isUserRole = message.role === 'user';

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
				} catch (_) {}
			}

			return renderCodeSnippet(md.utils.escapeHtml(str));
		}
	});

	onMount(() => {
		const preElements = articleElement.querySelectorAll(`pre#${CODE_SNIPPET_ID}`);

		preElements.forEach((preElement) => {
			const codeElement = preElement.querySelector('code');
			if (codeElement)
				new CopyButton({ target: preElement, props: { content: codeElement.innerText } });
		});
	});
</script>

<article
	class="mx-auto mb-3 flex w-full max-w-[70ch] flex-col gap-y-3 last:mb-0"
	bind:this={articleElement}
>
	<nav class="grid grid-cols-[max-content_auto_max-content] items-center">
		<p
			data-testid="session-role"
			class="mr-3 text-center text-xs font-bold uppercase leading-7 text-muted-foreground"
		>
			{isUserRole ? 'You' : message.role}
		</p>
		<Separator />
		<CopyButton content={message.content} />
	</nav>

	<div id="markdown" class="text-md mx-auto w-full overflow-x-auto px-[4ch]">
		{#if message.content}
			{@html md.render(message.content)}
		{/if}
	</div>
</article>

<style lang="scss">
	#markdown {
		:global(> *) {
			@apply text-foreground;
		}

		:global(> *:not(:first-child)) {
			@apply mt-4;
		}

		:global(> *:not(:last-child)) {
			@apply mb-4;
		}

		:global(pre) {
			@apply relative;
		}

		:global(pre:hover > button) {
			@apply opacity-100;
		}

		:global(pre > button) {
			@apply opacity-0 absolute top-1 right-0 bg-white;
		}

		:global(pre > code) {
			@apply rounded-md p-4 text-sm pr-12;
		}

		:global(li > code),
		:global(p > code) {
			@apply rounded-md bg-code p-1 text-sm opacity-75;
		}

		:global(ol),
		:global(ul) {
			@apply mx-8 flex list-outside flex-col gap-y-1;
		}

		:global(ol) {
			@apply list-decimal;
		}

		:global(ul) {
			@apply list-disc;
		}

		:global(h1) {
			@apply text-3xl font-bold;
		}

		:global(h2) {
			@apply text-2xl font-bold;
		}

		:global(h3) {
			@apply text-xl font-bold;
		}

		:global(h4),
		:global(h5),
		:global(h5) {
			@apply text-lg font-bold;
		}
	}
</style>
