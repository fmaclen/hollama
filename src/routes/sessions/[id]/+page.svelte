<script lang="ts">
	import { afterUpdate, onMount, tick } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	import LL from '$i18n/i18n-svelte';
	import { beforeNavigate } from '$app/navigation';
	import { chat, type ChatRequest, type Model } from '$lib/chat';
	import Button from '$lib/components/Button.svelte';
	import ButtonCopy from '$lib/components/ButtonCopy.svelte';
	import ButtonDelete from '$lib/components/ButtonDelete.svelte';
	import Head from '$lib/components/Head.svelte';
	import Header from '$lib/components/Header.svelte';
	import Metadata from '$lib/components/Metadata.svelte';
	import { settingsStore } from '$lib/localStorage';
	import {
		formatSessionMetadata,
		getSessionTitle,
		loadSession,
		saveSession,
		type Editor,
		type Message,
		type Session
	} from '$lib/sessions';
	import { Sitemap } from '$lib/sitemap';

	import type { PageData } from './$types';
	import Controls from './Controls.svelte';
	import Messages from './Messages.svelte';
	import PromptEditor from './Prompt.svelte';

	const shouldConfirmDeletion = writable(false);

	export let data: PageData;

	let session: Writable<Session> = writable(loadSession(data.id));
	let editor: Writable<Editor> = writable({
		prompt: '',
		view: 'messages',
		messageIndexToEdit: null,
		isCodeEditor: false,
		isCompletionInProgress: false,
		shouldFocusTextarea: false,
		isNewSession: true
	});
	let messagesWindow: HTMLDivElement;
	let userScrolledUp = false;

	$: if (data.id) handleSessionChange();

	onMount(() => {
		messagesWindow.addEventListener('scroll', handleScroll);
	});

	beforeNavigate((navigation) => {
		if (!$editor.isCompletionInProgress) return;
		const userConfirmed = confirm($LL.areYouSureYouWantToLeave());
		if (userConfirmed) {
			stopCompletion();
			return;
		}
		navigation.cancel();
	});

	afterUpdate(() => {
		if ($editor.shouldFocusTextarea && $editor.promptTextarea) {
			$editor.promptTextarea.focus();
			$editor.shouldFocusTextarea = false;
		}
	});

	async function handleSessionChange() {
		session = writable(loadSession(data.id));
		$editor.view = 'messages';
		$editor.isNewSession = !$session?.messages.length;
		scrollToBottom();
	}

	async function handleSubmitNewMessage() {
		const message: Message = { role: 'user', content: $editor.prompt };
		$session.messages = [...$session.messages, message];
		await scrollToBottom(true); // Force scroll after submitting prompt
		await handleCompletion($session.messages);
	}

	async function handleSubmitEditMessage() {
		if ($editor.messageIndexToEdit === null) return;

		$session.messages[$editor.messageIndexToEdit].content = $editor.prompt;

		// Remove all messages after the edited message
		$session.messages = $session.messages.slice(0, $editor.messageIndexToEdit + 1);

		$editor.messageIndexToEdit = null;
		$editor.prompt = '';

		await handleCompletion($session.messages);
	}

	function handleSubmit() {
		if (!$editor.prompt) return;
		if (!$session.model) return;
		$editor.isCodeEditor = false;
		$editor.view = 'messages';

		if ($editor.messageIndexToEdit !== null) handleSubmitEditMessage();
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
		$editor.abortController = new AbortController();
		$editor.isCompletionInProgress = true;
		$editor.prompt = ''; // Reset the prompt form field
		$editor.completion = '';

		const ollamaChatRequest: ChatRequest = {
			model: $session.model,
			options: $session.options,
			messages: $session.systemPrompt.content ? [$session.systemPrompt, ...messages] : messages
		};

		try {
			await chat({
				model: $settingsStore.models.find((model) => model.name === $session.model) as Model,
				payload: ollamaChatRequest,
				abortSignal: $editor.abortController.signal,
				onChunk: async (chunk) => {
					$editor.completion += chunk;
					await scrollToBottom();
				}
			});

			// After the completion save the session
			const message: Message = { role: 'assistant', content: $editor.completion };
			$session.messages = [...$session.messages, message];
			$session.updatedAt = new Date().toISOString();
			saveSession($session);

			// Final housekeeping
			$editor.completion = '';
			$editor.shouldFocusTextarea = true;
			$editor.isCompletionInProgress = false;
			await scrollToBottom();
		} catch (error) {
			const typedError = error instanceof Error ? error : new Error(String(error));
			if (typedError.name === 'AbortError') return; // User aborted the request
			handleError(typedError);
		}
	}

	function stopCompletion() {
		$editor.prompt = $session.messages[$session.messages.length - 1].content; // Reset the prompt to the last sent message
		$editor.abortController?.abort();
		$editor.completion = '';
		$editor.isCompletionInProgress = false;
		$session.messages = $session.messages.slice(0, -1); // Remove the "incomplete" AI response
	}

	function handleError(error: Error) {
		if (error.message === 'Failed to fetch') {
			toast.error($LL.genericError(), { description: $LL.cantConnectToOllamaServer() });
		} else {
			toast.error($LL.genericError(), { description: error.toString() });
		}
		stopCompletion();
	}

	function handleScroll() {
		const { scrollTop, scrollHeight, clientHeight } = messagesWindow;
		userScrolledUp = scrollTop + clientHeight < scrollHeight;
	}

	async function scrollToBottom(shouldForceScroll = false) {
		if (!shouldForceScroll && (!messagesWindow || userScrolledUp)) return;
		await tick();
		requestAnimationFrame(() => (messagesWindow.scrollTop = messagesWindow.scrollHeight));
	}
</script>

<div class="session">
	<Head
		title={[$editor.isNewSession ? $LL.newSession() : getSessionTitle($session), $LL.sessions()]}
	/>
	<Header confirmDeletion={$shouldConfirmDeletion}>
		<p data-testid="session-id" class="font-bold leading-none">
			{$LL.session()}
			<Button variant="link" href={`/sessions/${$session.id}`}>#{$session.id}</Button>
		</p>
		<Metadata dataTestid="session-metadata">
			{$editor.isNewSession ? $LL.newSession() : formatSessionMetadata($session)}
		</Metadata>

		<svelte:fragment slot="nav">
			{#if !$editor.isNewSession}
				{#if !$shouldConfirmDeletion}
					<ButtonCopy content={JSON.stringify($session.messages, null, 2)} />
				{/if}
				<ButtonDelete sitemap={Sitemap.SESSIONS} id={$session.id} {shouldConfirmDeletion} />
			{/if}
		</svelte:fragment>
	</Header>

	{#if $editor.view === 'controls'}
		<Controls {session} />
	{:else}
		<div class="session__history" bind:this={messagesWindow}>
			<Messages {session} {editor} {handleRetry} />
		</div>
	{/if}

	<PromptEditor
		bind:model={$session.model}
		{editor}
		{handleSubmit}
		{stopCompletion}
		{scrollToBottom}
	/>
</div>

<style lang="postcss">
	.session {
		@apply flex h-full w-full flex-col overflow-hidden;
	}

	.session__history {
		@apply base-fieldset-container overflow-scrollbar flex-grow;
	}
</style>
