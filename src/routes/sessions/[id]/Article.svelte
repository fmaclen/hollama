<script lang="ts">
	import { Brain, ChevronDown, ChevronUp, Pencil, RefreshCw, Trash2 } from 'lucide-svelte';
	import { quadInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	import LL from '$i18n/i18n-svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import ButtonCopy from '$lib/components/ButtonCopy.svelte';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import Markdown from '$lib/components/Markdown.svelte';
	import { type Message } from '$lib/sessions';
	import { Sitemap } from '$lib/sitemap';

	import AttachmentImage from './AttachmentImage.svelte';

	let {
		message,
		retryIndex = undefined,
		handleRetry = undefined,
		handleEditMessage = undefined,
		handleDeleteAttachment = undefined,
		isStreamingArticle = false,
		currentRawReasoning,
		currentRawCompletion
	}: {
		message: Message;
		retryIndex?: number;
		handleRetry?: (index: number) => void;
		handleEditMessage?: (message: Message) => void;
		handleDeleteAttachment?: (message: Message) => void;
		isStreamingArticle?: boolean;
		currentRawReasoning?: string;
		currentRawCompletion?: string;
	} = $props();

	const isKnowledgeAttachment = $derived(message.knowledge?.name !== undefined);
	const isUserRole = $derived(message.role === 'user' && !isKnowledgeAttachment);
	let isReasoningVisible = $state(false);
	let userHasInteractedWithToggle = $state(false);

	function toggleReasoningVisibility() {
		isReasoningVisible = !isReasoningVisible;
		userHasInteractedWithToggle = true;
	}

	$effect(() => {
		if (isStreamingArticle && !userHasInteractedWithToggle) {
			const hasReasoning = currentRawReasoning && currentRawReasoning.trim() !== '';
			const hasCompletion = currentRawCompletion && currentRawCompletion.trim() !== '';

			if (hasReasoning && !hasCompletion) {
				isReasoningVisible = true;
			} else if (hasCompletion) {
				isReasoningVisible = false;
			}
		}
	});

	// Reset user interaction state if this component instance is reused for a non-streaming to streaming transition
	// or if the message fundamentally changes, indicating a new context.
	$effect(() => {
		if (!isStreamingArticle) {
			userHasInteractedWithToggle = false;
			// Also ensure reasoning is collapsed for non-streaming articles by default unless it already has content
			if (!message.reasoning || message.reasoning.trim() === '') {
				isReasoningVisible = false;
			}
		}
	});
</script>

{#if isKnowledgeAttachment}
	<article class="attachment">
		<div class="attachment__content">
			<div class="attachment__icon">
				<Brain class="base-icon" />
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
				onclick={() => handleDeleteAttachment && handleDeleteAttachment(message)}
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
						onclick={() => handleRetry && handleRetry(retryIndex)}
					>
						<RefreshCw class="base-icon" />
					</Button>
				{/if}
				{#if isUserRole}
					<Button
						title={$LL.edit()}
						variant="icon"
						onclick={() => handleEditMessage && handleEditMessage(message)}
					>
						<Pencil class="base-icon" />
					</Button>
				{/if}
				<ButtonCopy content={message.content} />
			</div>
		</nav>

		{#if message.reasoning}
			<div class="reasoning" transition:slide={{ easing: quadInOut, duration: 200 }}>
				<button class="reasoning__button" onclick={toggleReasoningVisibility}>
					{$LL.reasoning()}
					{#if isReasoningVisible}
						<ChevronUp class="base-icon" />
					{:else}
						<ChevronDown class="base-icon" />
					{/if}
				</button>
				{#if isReasoningVisible}
					<article
						class="article article--reasoning"
						transition:slide={{ easing: quadInOut, duration: 200 }}
					>
						<Markdown markdown={message.reasoning} />
					</article>
				{/if}
			</div>
		{/if}
		{#if message.content}
			<Markdown markdown={message.content} />
		{/if}
		{#if message.images && message.images.length}
			<div class="article__images">
				{#each message.images as img (img.filename)}
					<AttachmentImage dataUrl={`data:image/png;base64,${img.data}`} name={img.filename} />
				{/each}
			</div>
		{/if}
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

	.article--reasoning {
		@apply max-w-full border-b-0 border-l-0 border-r-0;
	}

	.article__interactive,
	.attachment__interactive {
		@apply -mr-2 opacity-100;
		@apply md:-mr-3;

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
		@apply flex items-center justify-between px-3 py-1;
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

	.reasoning {
		@apply rounded bg-shade-1 text-xs;
	}

	.reasoning__button {
		@apply flex w-full items-center justify-between gap-2 p-2;
	}

	.article__images {
		@apply mt-2 flex flex-wrap gap-1;
	}
</style>
