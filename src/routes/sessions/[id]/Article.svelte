<script lang="ts">
	import { BrainIcon, ChevronDown, ChevronUp, Pencil, RefreshCw, Trash2 } from 'lucide-svelte';
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

	export let message: Message;
	export let retryIndex: number | undefined = undefined;
	export let handleRetry: ((index: number) => void) | undefined = undefined;
	export let handleEditMessage: ((message: Message) => void) | undefined = undefined;
	export let handleDeleteAttachment: ((message: Message) => void) | undefined = undefined;

	let isKnowledgeAttachment: boolean | undefined;
	let isUserRole: boolean | undefined;
	let isReasoningVisible: boolean = false;

	$: if (message) {
		isKnowledgeAttachment = message.knowledge?.name !== undefined;
		isUserRole = message.role === 'user' && !isKnowledgeAttachment;
	}
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

		{#if message.reasoning}
			<div class="reasoning" transition:slide={{ easing: quadInOut, duration: 200 }}>
				<button
					class="reasoning__button"
					on:click={() => (isReasoningVisible = !isReasoningVisible)}
				>
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
				{#each message.images as img, i}
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
		@apply mt-2 flex flex-wrap gap-2;
	}

	.article__image-attachment {
		@apply flex max-w-[8rem] flex-col items-center;
	}

	.article__image-thumbnail {
		@apply h-20 w-20 rounded border border-shade-3 object-cover;
	}

	.article__image-filename {
		@apply mt-1 max-w-full truncate text-xs text-muted;
	}
</style>
