<script lang="ts">
	import MarkdownIt from 'markdown-it';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css';
	import { Files } from 'lucide-svelte';

	import { type Message } from '$lib/sessions';
	import Separator from '$lib/components/Separator.svelte';
	import Button from '$lib/components/Button.svelte';

	const md: MarkdownIt = new MarkdownIt({
		highlight: function (str, lang) {
			if (lang && hljs.getLanguage(lang)) {
				try {
					return `<pre><code class="hljs">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
				} catch (__) {}
			}

			return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>
		`;
		}
	});

	export let message: Message;
	const isUserRole = message.role === 'user';

	function copyMessage() {
		navigator.clipboard.writeText(message.content);
	}
</script>

<article
	class="mx-auto flex w-full max-w-[70ch] flex-col gap-y-3 mb-3 last:mb-0"
>
	<nav class="grid grid-cols-[max-content_auto_max-content] items-center">
		<p
			data-testid="session-role"
			class="mr-3 text-center text-xs font-bold uppercase leading-7 text-muted-foreground"
		>
			{isUserRole ? 'You' : message.role}
		</p>
		<Separator />
		<Button title="Copy message" variant="icon" size="icon" on:click={copyMessage}>
			<Files class="h-4 w-4" />
		</Button>
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

		:global(pre > code) {
			@apply rounded-md p-4 text-sm;
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
