<script lang="ts">
	import { onMount } from 'svelte';
	import MarkdownIt from 'markdown-it';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css';

	import { type Message } from '$lib/sessions';
	import Separator from '$lib/components/Separator.svelte';
	import CopyButton from './CopyButton.svelte';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import { Sitemap } from '$lib/sitemap';
	import Button from '$lib/components/Button.svelte';

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

<article class="article" bind:this={articleElement}>
	<nav class="article__nav">
		<p data-testid="session-role" class="article__role">
			{#if isKnowledgeRole}
				Knowledge
			{:else if isUserRole}
				You
			{:else}
				{message.role}
			{/if}
		</p>
		<Separator />
		<CopyButton content={message.content} />
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
		@apply mx-auto flex w-full max-w-[96ch] flex-col last:mb-0;

		&__nav {
			@apply grid grid-cols-[max-content_auto_max-content] items-center;
		}

		&__role {
			@apply mr-3 text-center text-xs font-bold uppercase leading-7 text-muted-foreground;
		}
	}

	.markdown {
		@apply mx-auto my-3 w-full overflow-x-auto px-[4ch];

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
			@apply absolute right-0 top-1 bg-white opacity-0;
		}

		:global(pre > code) {
			@apply rounded-md p-4 pr-12 text-sm;
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
