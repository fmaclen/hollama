<script lang="ts">
	import type { Writable } from 'svelte/store';

	import LL from '$i18n/i18n-svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import type { Editor, Message, Session } from '$lib/sessions';

	import Article from './Article.svelte';

	export let session: Writable<Session>;
	export let editor: Writable<Editor>;
	export let handleRetry: (index: number) => void;

	function handleEditMessage(message: Message) {
		$editor.messageIndexToEdit = $session.messages.findIndex((m) => m === message);
		$editor.isCodeEditor = true;
		$editor.content = message.content;
		$editor.promptTextarea?.focus();
	}
</script>

<div class="session__articles">
	{#if $editor.isNewSession}
		<EmptyMessage>{$LL.writePromptToStart()}</EmptyMessage>
	{/if}

	{#each $session.messages as message, i ($session.id + i)}
		{#key message.role}
			<Article
				{message}
				retryIndex={['assistant', 'system'].includes(message.role) ? i : undefined}
				{handleRetry}
				handleEditMessage={() => handleEditMessage(message)}
			/>
		{/key}
	{/each}

	{#if $editor.isCompletionInProgress}
		<Article message={{ role: 'assistant', content: $editor.completion || '...' }} />
	{/if}
</div>

<style lang="postcss">
	.session__articles {
		@apply flex-grow p-4;
		@apply lg:p-8;
	}
</style>
