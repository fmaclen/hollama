<script lang="ts">
	import MarkdownIt from 'markdown-it';
	import { Files } from 'lucide-svelte';

	import { type Message } from '$lib/sessions';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const md = new MarkdownIt();

	export let message: Message;

	function copyMessage() {
		navigator.clipboard.writeText(message.content);
	}
</script>

<article class="mx-auto flex w-full max-w-[70ch] flex-col gap-y-3">
	<nav class="grid grid-cols-[max-content_auto_max-content] items-center">
		<p
			data-testid="session-role"
			class="
			mr-3
			text-center
			text-xs
			font-bold
			uppercase
			leading-7
			text-muted-foreground
		"
		>
			{message.role === 'user' ? 'You' : message.role}
		</p>
		<Separator />
		<Button
			class="opacity-25 hover:opacity-100"
			title="Copy message"
			variant="ghost"
			size="icon"
			on:click={copyMessage}
		>
			<Files class="h-4 w-4" />
		</Button>
	</nav>

	<div id="markdown" class="text-md mx-auto w-full overflow-x-auto px-[3ch]">
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
			@apply rounded-md bg-code p-4 text-sm opacity-75;
		}

		:global(p > code) {
			@apply rounded-md bg-code p-1 text-sm opacity-75;
		}

		:global(ol),
		:global(ul) {
			@apply flex list-outside flex-col gap-y-1 mx-8;
		}

		:global(ol) {
			@apply list-decimal;
		}

		:global(ul) {
			@apply list-disc;
		}

		:global(h1) {
			@apply font-bold text-4xl;
		}

		:global(h2) {
			@apply font-bold text-3xl;
		}

		:global(h3) {
			@apply font-bold text-2xl;
		}

		:global(h4) {
			@apply font-bold text-xl;
		}

		:global(h3),
		:global(h4),
		:global(h5) {
			@apply font-bold text-lg;
		}
	}
</style>
