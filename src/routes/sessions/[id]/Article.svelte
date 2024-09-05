<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { type Message } from '$lib/sessions';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import { Sitemap } from '$lib/sitemap';
	import Button from '$lib/components/Button.svelte';
	import ButtonCopy from '$lib/components/ButtonCopy.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { Brain, Pencil, RefreshCw } from 'lucide-svelte';
	import Markdown from '$lib/components/Markdown.svelte';

	export let message: Message;
	export let retryIndex: number | undefined = undefined;
	export let handleRetry: ((index: number) => void) | undefined = undefined;
	export let handleEditMessage: ((message: Message) => void) | undefined = undefined;

	const isUserRole = message.role === 'user';
</script>

<article class="article article--{message.role}">
	<nav class="article__nav">
		<div data-testid="session-role" class="article__role">
			<Badge>
				{#if isUserRole}
					{$LL.you()}
				{:else if message.role === 'assistant'}
					{$LL.assistant()}
				{:else}
					{$LL.system()}
				{/if}
			</Badge>
		</div>
		<div class="article__interactive">
			{#if retryIndex}
				<Button
					title={$LL.retry()}
					variant="icon"
					id="retry-index-{retryIndex}"
					on:click={() => handleRetry && handleRetry(retryIndex)}
				>
					<RefreshCw class="h-4 w-4" />
				</Button>
			{/if}
			{#if isUserRole}
				<Button
					title={$LL.edit()}
					variant="icon"
					on:click={() => handleEditMessage && handleEditMessage(message)}
				>
					<Pencil class="h-4 w-4" />
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
				aria-label={$LL.goToKnowledge()}
			>
				{message.knowledge.name}
				<Brain class="-mr-1 ml-2 h-4 w-4" />
			</Button>
		{:else if message.content}
			<Markdown markdown={message.content} />
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

	.article--assistant {
		@apply border-transparent bg-shade-0;
	}

	.article__interactive {
		@apply opacity-100;

		@media (hover: hover) {
			/* The interactive elements should be visible by default on mobile
			and hidden by default on desktop. */
			@apply opacity-0;
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
</style>
