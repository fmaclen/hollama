<script lang="ts">
	import { onMount } from 'svelte';
	import MarkdownIt from 'markdown-it';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css';

	import { type Message } from '$lib/sessions';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import { Sitemap } from '$lib/sitemap';
	import Button from '$lib/components/Button.svelte';
	import ButtonCopy from '$lib/components/ButtonCopy.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { Brain, RefreshCw } from 'lucide-svelte';

	export let message: Message;
	export let retryIndex: number | undefined = undefined;
	export let handleRetry: ((index: number) => void) | undefined = undefined;
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
				} catch (error) {
					console.error('Error in renderCodeSnippet:', error);
				}
			}

			return renderCodeSnippet(md.utils.escapeHtml(str));
		}
	});

	onMount(() => {
		const preElements = articleElement.querySelectorAll(`pre#${CODE_SNIPPET_ID}`);

		preElements.forEach((preElement) => {
			const codeElement = preElement.querySelector('code');
			if (codeElement)
				new ButtonCopy({ target: preElement, props: { content: codeElement.innerText } });
		});
	});
</script>

<article class="article article--{message.role}" bind:this={articleElement}>
	<nav class="article__nav">
		<div data-testid="session-role" class="article__role">
			<Badge>
				{#if isUserRole}
					You
				{:else}
					{message.role}
				{/if}
			</Badge>
		</div>
		<div class="article__interactive">
			{#if retryIndex}
				<Button
					title="Retry"
					variant="icon"
					id="retry-index-{retryIndex}"
					on:click={() => handleRetry && handleRetry(retryIndex)}
				>
					<RefreshCw class="h-4 w-4" />
				</Button>
			{/if}
			<ButtonCopy content={message.content} />
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
				<Brain class="-mr-1 ml-2 h-4 w-4" />
			</Button>
		{:else if message.content}
			{@html md.render(message.content)} <!-- eslint-disable-line svelte/no-at-html-tags -->
		{/if}
	</div>
</article>

<style lang="postcss">
	.article {
		@apply mx-auto mb-2 flex w-full max-w-[80ch] flex-col gap-y-2 rounded-md border border-shade-3 p-3;
		@apply md:mb-4 md:gap-y-4 md:p-4;
		@apply lg:mb-6 lg:p-6;
		@apply last:mb-0;
	}

	.article--ai {
		@apply border-transparent bg-shade-0;
	}

	.article__interactive {
		@apply opacity-100;

		@media (hover: hover) {
			/* The interactive elements should be visible by default on mobile and hidden by default on desktop.	*/
			& {
				@apply opacity-0;
			}
		}
	}

	.article:hover .article__interactive {
		@apply opacity-100;
	}

	.article__nav {
		@apply flex items-center justify-between text-muted;
		@apply -mt-1; /* Visually reduce the spacing between the top of the article and the nav */
	}

	.article__role {
		@apply text-center text-xs font-bold uppercase leading-7;
	}

	.markdown {
		@apply mx-auto w-full text-sm;
		@apply md:text-base;

		:global(a) {
			@apply underline underline-offset-4 hover:text-active;
		}

		:global(> *:not(:first-child)) {
			@apply mt-4;
		}

		:global(> *:not(:last-child)) {
			@apply mb-4;
		}

		:global(pre) {
			@apply relative overflow-auto rounded-md border border-shade-2 dark:border-none;
		}

		:global(pre > .copy-button) {
			@apply absolute right-1 top-2 rounded-bl-md rounded-tr-md bg-shade-0 opacity-0;
		}

		:global(pre:hover > .copy-button) {
			@apply opacity-100;
		}

		:global(code) {
			@apply rounded-md text-xs;
			@apply md:text-sm;
		}

		:global(pre > code) {
			@apply p-4 pr-12;
			@apply dark:invert;
		}

		:global(li > code),
		:global(p > code) {
			@apply bg-amber-50 p-1 text-orange-600 dark:bg-amber-950 dark:text-orange-500;
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
