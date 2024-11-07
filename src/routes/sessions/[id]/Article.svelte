<script lang="ts">
	import { BrainIcon, Pencil, RefreshCw, Trash2 } from 'lucide-svelte';

	import LL from '$i18n/i18n-svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import ButtonCopy from '$lib/components/ButtonCopy.svelte';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import Markdown from '$lib/components/Markdown.svelte';
	import { type Message } from '$lib/sessions';
	import { Sitemap } from '$lib/sitemap';

	export let message: Message;
	export let retryIndex: number | undefined = undefined;
	export let handleRetry: ((index: number) => void) | undefined = undefined;
	export let handleEditMessage: ((message: Message) => void) | undefined = undefined;
	export let handleDeleteAttachment: ((message: Message) => void) | undefined = undefined;

	const isKnowledgeAttachment = message.role === 'system' && message.knowledge?.name;
	const isUserRole = message.role === 'user';
</script>

{#if isKnowledgeAttachment}
	<article class="attachment">
		<div class="attachment__content">
			<div class="attachment__icon">
				<BrainIcon class="base-icon" />
			</div>
			<div class="attachment__name">
				<Button variant="link" href={generateNewUrl(Sitemap.KNOWLEDGE, message.knowledge?.id)}>
					{message.knowledge?.name}
				</Button>
			</div>
		</div>
		<div class="attachment__interactive">
			<Button
				variant="icon"
				on:click={() => handleDeleteAttachment && handleDeleteAttachment(message)}
			>
				<Trash2 class="base-icon" />
			</Button>
		</div>
	</article>
{:else}
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
						<RefreshCw class="base-icon" />
					</Button>
				{/if}
				{#if isUserRole}
					<Button
						title={$LL.edit()}
						variant="icon"
						on:click={() => handleEditMessage && handleEditMessage(message)}
					>
						<Pencil class="base-icon" />
					</Button>
				{/if}
				<ButtonCopy content={message.content} />
			</div>
		</nav>

		<div class="markdown">
			{#if message.knowledge}
				<!-- <Button
					variant="outline"
					href={generateNewUrl(Sitemap.KNOWLEDGE, message.knowledge.id)}
					aria-label={$LL.goToKnowledge()}
				>
					{message.knowledge.name}
					<Brain class="base-icon -mr-1 ml-2" />
				</Button> -->
			{:else if message.content}
				<Markdown markdown={message.content} />
			{/if}
		</div>
	</article>
{/if}

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

	.article__interactive,
	.attachment__interactive {
		@apply opacity-100;

		@media (hover: hover) {
			/* The interactive elements should be visible by default on mobile
			and hidden by default on desktop. */
			@apply opacity-0;
		}
	}

	.article:hover .article__interactive,
	.attachment:hover .attachment__interactive {
		@apply opacity-100;
	}

	.article__nav {
		@apply flex items-center justify-between text-muted;
		@apply -mt-1; /* Visually reduce the spacing between the top of the article and the nav */
	}

	.article__role {
		@apply text-center text-xs font-bold uppercase leading-7;
	}

	.attachment {
		@apply mx-auto mb-2 flex w-full max-w-[80ch] gap-2 rounded-md border border-shade-3;
		@apply flex items-center justify-between px-3 py-2;
		@apply md:px-4;
		@apply lg:px-6;
	}

	.attachment__icon {
		@apply text-muted;
	}

	.attachment__name {
		@apply text-sm;
	}

	.attachment__content {
		@apply flex items-center gap-2;
	}
</style>
