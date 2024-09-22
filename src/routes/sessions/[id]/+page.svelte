<script lang="ts">
	import type { ChatRequest } from 'ollama/browser';
	import { afterUpdate, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { writable, type Writable } from 'svelte/store';

	import LL from '$i18n/i18n-svelte';
	import { beforeNavigate } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import ButtonCopy from '$lib/components/ButtonCopy.svelte';
	import ButtonDelete from '$lib/components/ButtonDelete.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import Head from '$lib/components/Head.svelte';
	import Header from '$lib/components/Header.svelte';
	import Metadata from '$lib/components/Metadata.svelte';
	import { settingsStore } from '$lib/localStorage';
	import { ollamaChat, ollamaTags } from '$lib/ollama';
	import {
		formatSessionMetadata,
		getSessionTitle,
		loadSession,
		saveSession,
		type Message,
		type Prompt,
		type Session
	} from '$lib/sessions';
	import { Sitemap } from '$lib/sitemap';

	import type { PageData } from './$types';
	import Article from './Article.svelte';
	import Controls from './Controls.svelte';
	import PromptEditor from './PromptEditor.svelte';

	export let data: PageData;

	let session: Writable<Session> = writable(loadSession(data.id));
	let prompt: Writable<Prompt> = writable({
		content: '',
		view: 'messages',
		messageIndexToEdit: null,
		isCodeEditor: false,
		isCompletionInProgress: false,
		shouldFocusTextarea: false
	});

	$: console.log('$session', $session);
	$: console.log('$prompt', $prompt);

	let messageWindow: HTMLElement;
	let completion: string;
	let userScrolledUp = false;
	const shouldConfirmDeletion = writable(false);

	$: isNewSession = !$session?.messages.length;
	$: if ($settingsStore.ollamaModel) $session.model = $settingsStore.ollamaModel;
	$: if (messageWindow) messageWindow.addEventListener('scroll', handleScroll);
	$: if (data.id) handleSessionChange();

	async function handleSessionChange() {
		try {
			$settingsStore.ollamaModels = (await ollamaTags()).models;
		} catch {
			$settingsStore.ollamaModels = [];
			toast.warning($LL.cantConnectToOllamaServer());
		}
		session = writable(loadSession(data.id));
		scrollToBottom();
	}

	function handleScroll() {
		const { scrollTop, scrollHeight, clientHeight } = messageWindow;
		userScrolledUp = scrollTop + clientHeight < scrollHeight;
	}

	async function handleSubmitNewMessage() {
		const message: Message = { role: 'user', content: $prompt.content };
		$session.messages = [...$session.messages, message];

		await scrollToBottom(true); // Force scroll after submitting prompt
		await handleCompletion([...$session.messages, message]);
	}

	async function handleSubmitEditMessage() {
		if ($prompt.messageIndexToEdit === null) return;

		$session.messages[$prompt.messageIndexToEdit].content = $prompt.content;

		// Remove all messages after the edited message
		$session.messages = $session.messages.slice(0, $prompt.messageIndexToEdit + 1);

		$prompt.messageIndexToEdit = null;
		$prompt.content = '';

		await handleCompletion($session.messages);
	}

	function handleSubmit() {
		if (!$prompt.content) return;
		$prompt.isCodeEditor = false;

		if ($prompt.messageIndexToEdit !== null) handleSubmitEditMessage();
		else handleSubmitNewMessage();
	}

	async function handleRetry(index: number) {
		// Remove all the messages after the index
		$session.messages = $session.messages.slice(0, index);

		const mostRecentUserMessage = $session.messages.filter((m) => m.role === 'user').at(-1);
		if (!mostRecentUserMessage) throw new Error('No user message to retry');

		await handleCompletion($session.messages);
	}

	async function handleCompletion(messages: Message[]) {
		$prompt.abortController = new AbortController();
		$prompt.isCompletionInProgress = true;
		$prompt.content = ''; // Reset the prompt form field
		completion = '';

		const ollamaChatRequest: ChatRequest = {
			model: $session.model,
			options: $session.options,
			messages: [$session.systemPrompt, ...messages]
		};

		try {
			await ollamaChat(ollamaChatRequest, $prompt.abortController.signal, async (chunk) => {
				completion += chunk;
				await scrollToBottom();
			});

			// After the completion save the session
			const message: Message = { role: 'assistant', content: completion };
			$session.messages = [...$session.messages, message];
			$session.updatedAt = new Date().toISOString();
			saveSession({ ...$session });

			// Final housekeeping
			completion = '';
			$prompt.shouldFocusTextarea = true;
			$prompt.isCompletionInProgress = false;
			await scrollToBottom();
		} catch (error) {
			const typedError = error instanceof Error ? error : new Error(String(error));
			if (typedError.name === 'AbortError') return; // User aborted the request
			handleError(typedError);
		}
	}

	function handleEditMessage(message: Message) {
		$prompt.messageIndexToEdit = $session.messages.findIndex((m) => m === message);
		$prompt.isCodeEditor = true;
		$prompt.content = message.content;
		$prompt.promptTextarea?.focus();
	}

	async function scrollToBottom(shouldForceScroll = false) {
		if (!shouldForceScroll && (!messageWindow || userScrolledUp)) return;
		await tick();
		requestAnimationFrame(() => (messageWindow.scrollTop = messageWindow.scrollHeight));
	}

	function handleError(error: Error) {
		let content: string;
		if (error.message === 'Failed to fetch') {
			content = $LL.ollamaConnectionError();
		} else {
			content = $LL.genericError({ error: error.toString() });
		}

		const message: Message = { role: 'system', content };
		$session.messages = [...$session.messages, message];
	}

	function stopCompletion() {
		$prompt.content = $session.messages[$session.messages.length - 1].content; // Reset the prompt to the last sent message
		$prompt.abortController?.abort();
		completion = '';
		$prompt.isCompletionInProgress = false;
		$session.messages = $session.messages.slice(0, -1); // Remove the "incomplete" AI response
	}

	beforeNavigate((navigation) => {
		if (!$prompt.isCompletionInProgress) return;
		const userConfirmed = confirm($LL.areYouSureYouWantToLeave());
		if (userConfirmed) {
			stopCompletion();
			return;
		}
		navigation.cancel();
	});

	afterUpdate(() => {
		if ($prompt.shouldFocusTextarea && $prompt.promptTextarea) {
			$prompt.promptTextarea.focus();
			$prompt.shouldFocusTextarea = false;
		}
	});
</script>

<div class="session">
	<Head title={[isNewSession ? $LL.newSession() : getSessionTitle($session), $LL.sessions()]} />
	<Header confirmDeletion={$shouldConfirmDeletion}>
		<p data-testid="session-id" class="text-sm font-bold leading-none">
			{$LL.session()}
			<Button variant="link" href={`/sessions/${$session.id}`}>#{$session.id}</Button>
		</p>
		<Metadata dataTestid="session-metadata">
			{isNewSession ? $LL.newSession() : formatSessionMetadata($session)}
		</Metadata>

		<svelte:fragment slot="nav">
			{#if !isNewSession}
				{#if !$shouldConfirmDeletion}
					<ButtonCopy content={JSON.stringify($session.messages, null, 2)} />
				{/if}
				<ButtonDelete sitemap={Sitemap.SESSIONS} id={$session.id} {shouldConfirmDeletion} />
			{/if}
		</svelte:fragment>
	</Header>

	<div class="session__history" bind:this={messageWindow}>
		{#if $prompt.view === 'options'}
			<Controls {session} />
		{:else}
			<div class="session__articles {$prompt.isCodeEditor ? 'session__articles--fullscreen' : ''}">
				{#if isNewSession}
					<EmptyMessage>{$LL.writePromptToStart()}</EmptyMessage>
				{/if}

				{#each $session.messages as message, i ($session.id + i)}
					{#key message.role}
						<Article
							{message}
							retryIndex={['assistant', 'system'].includes(message.role) ? i : undefined}
							{handleRetry}
							{handleEditMessage}
						/>
					{/key}
				{/each}

				{#if $prompt.isCompletionInProgress}
					<Article message={{ role: 'assistant', content: completion || '...' }} />
				{/if}
			</div>
		{/if}

		<PromptEditor {session} {prompt} {handleSubmit} {stopCompletion} />
	</div>
</div>

<style lang="postcss">
	.session {
		@apply overflow-scrollbar flex h-full w-full flex-col;
	}

	.session__history {
		@apply overflow-scrollbar flex h-full flex-grow flex-col;
	}

	.session__articles {
		@apply flex-grow p-4;
		@apply lg:p-8;
	}

	.session__articles--fullscreen {
		@apply h-max flex-grow;
	}
</style>
