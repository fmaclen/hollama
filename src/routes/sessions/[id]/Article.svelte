<script lang="ts">
	import { onMount } from 'svelte';
	import MarkdownIt from 'markdown-it';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css';

	import { type Message } from '$lib/sessions';
	import CopyButton from './CopyButton.svelte';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import { Sitemap } from '$lib/sitemap';
	import Button from '$lib/components/Button.svelte';
	import Badge from '$lib/components/Badge.svelte';

	export let message: Message;
	let articleElement: HTMLElement;

	const CODE_SNIPPET_ID = 'code-snippet';
	const isUserRole = message.role === 'user';
	const isKnowledgeRole = message.role === 'system' && message.knowledge;

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

<article class="article article--{message.role}" bind:this={articleElement}>
	<nav class="article__nav">
		<div data-testid="session-role" class="article__role">
			<Badge variant="default">
				{#if isKnowledgeRole}
					Knowledge
				{:else if isUserRole}
					You
				{:else}
					{message.role}
				{/if}
			</Badge>
		</div>
		<div class="article__interactive">
			<CopyButton content={message.content} />
		</div>
	</nav>

	<div class="markdown">
		{#if message.knowledge}
			<Button
				variant="outline"
				href={generateNewUrl(Sitemap.KNOWLEDGE, message.knowledge.id)}
				aria-label="Go to knowledge"
			>
				{message.knowledge.name}
			</Button>
		{:else if message.content}
			{@html md.render(message.content)}
		{/if}
	</div>
</article>

<style lang="scss">
	.article {
		@apply mx-auto mb-2 flex w-full max-w-[80ch] flex-col rounded-md border border-shade-3;
		@apply hover:border-shade-6;
		@apply last:mb-0;
		@apply lg:mb-6;
	}

	.article--ai {
		@apply bg-shade-0;
	}

	.article__interactive {
		@apply opacity-0;
	}
	.article:hover .article__interactive {
		@apply opacity-100;
	}

	.article__nav {
		@apply ml-2 flex items-center justify-between text-muted;
		@apply md:mx-2 md:mt-3;
	}

	.article__role {
		@apply text-center text-xs font-bold uppercase leading-7;
		@apply md:pl-3;
	}

	.markdown {
		@apply mx-auto my-3 w-full px-3;
		@apply md:mb-6 md:px-6;

		:global(> *:not(:first-child)) {
			@apply mt-4;
		}

		:global(> *:not(:last-child)) {
			@apply mb-4;
		}

		:global(pre) {
			@apply relative border border-transparent hover:border-shade-2 rounded-md;
		}

		:global(pre:hover > .copy-button) {
			@apply bg-shade-0;
		}

		:global(pre > .copy-button) {
			@apply absolute right-0 top-0 rounded-tr-md rounded-bl-md;
		}

		:global(code) {
			@apply rounded-md text-sm;
		}

		:global(pre > code) {
			@apply p-4 pr-12 dark:invert ;
		}

		:global(li > code),
		:global(p > code) {
			@apply bg-amber-50 p-1 text-orange-600 dark:text-orange-500 dark:bg-amber-950;
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
