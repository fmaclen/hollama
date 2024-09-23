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
		type Editor,
		type Message,
		type Session
	} from '$lib/sessions';
	import { Sitemap } from '$lib/sitemap';

	import type { PageData } from './$types';
	import Controls from './Controls.svelte';
	import Messages from './Messages.svelte';
	import PromptEditor from './Prompt.svelte';

	// DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
	// DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
	$: console.log('$session', $session);
	$: console.log('$prompt', $editor);
	// DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG
	// DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG

	const shouldConfirmDeletion = writable(false);

	export let data: PageData;

	let session: Writable<Session> = writable(loadSession(data.id));
	let editor: Writable<Editor> = writable({
		content: '',
		view: 'messages',
		messageIndexToEdit: null,
		isCodeEditor: false,
		isCompletionInProgress: false,
		shouldFocusTextarea: false,
		isNewSession: true
	});
	let editorWindow: HTMLElement;
	let userScrolledUp = false;

	$: $editor.isNewSession = !$session?.messages.length;
	$: if (data.id) handleSessionChange();
	$: if ($settingsStore.ollamaModel) $session.model = $settingsStore.ollamaModel;
	$: if (editorWindow) editorWindow.addEventListener('scroll', handleScroll);
	$: if ($editor.view === 'options') scrollToTop();
	$: if ($editor.view === 'messages') scrollToBottom(true);

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
		try {
			$settingsStore.ollamaModels = (await ollamaTags()).models;
		} catch {
			$settingsStore.ollamaModels = [];
			toast.warning($LL.cantConnectToOllamaServer());
		}
		$editor.view = 'messages';
		session = writable(loadSession(data.id));
		scrollToBottom();
	}

	function handleScroll() {
		const { scrollTop, scrollHeight, clientHeight } = editorWindow;
		userScrolledUp = scrollTop + clientHeight < scrollHeight;
	}

	async function handleSubmitNewMessage() {
		const message: Message = { role: 'user', content: $editor.content };
		$session.messages = [...$session.messages, message];

		await scrollToBottom(true); // Force scroll after submitting prompt
		await handleCompletion([...$session.messages, message]);
	}

	async function handleSubmitEditMessage() {
		if ($editor.messageIndexToEdit === null) return;

		$session.messages[$editor.messageIndexToEdit].content = $editor.content;

		// Remove all messages after the edited message
		$session.messages = $session.messages.slice(0, $editor.messageIndexToEdit + 1);

		$editor.messageIndexToEdit = null;
		$editor.content = '';

		await handleCompletion($session.messages);
	}

	function handleSubmit() {
		if (!$editor.content) return;
		$editor.isCodeEditor = false;
		$editor.view = 'messages';

		if ($editor.messageIndexToEdit !== null) handleSubmitEditMessage();
		else handleSubmitNewMessage();
	}

	async function handleCompletion(messages: Message[]) {
		$editor.abortController = new AbortController();
		$editor.isCompletionInProgress = true;
		$editor.content = ''; // Reset the prompt form field
		$editor.completion = '';

		const ollamaChatRequest: ChatRequest = {
			model: $session.model,
			options: $session.options,
			messages: [$session.systemPrompt, ...messages]
		};

		try {
			await ollamaChat(ollamaChatRequest, $editor.abortController.signal, async (chunk) => {
				$editor.completion += chunk;
				await scrollToBottom();
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

	async function handleRetry(index: number) {
		// Remove all the messages after the index
		$session.messages = $session.messages.slice(0, index);

		const mostRecentUserMessage = $session.messages.filter((m) => m.role === 'user').at(-1);
		if (!mostRecentUserMessage) throw new Error('No user message to retry');

		await handleCompletion($session.messages);
	}

	async function scrollToBottom(shouldForceScroll = false) {
		if (!shouldForceScroll && (!editorWindow || userScrolledUp)) return;
		await tick();
		requestAnimationFrame(() => (editorWindow.scrollTop = editorWindow.scrollHeight));
	}

	async function scrollToTop() {
		await tick();
		requestAnimationFrame(() => (editorWindow.scrollTop = 0));
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
		$editor.content = $session.messages[$session.messages.length - 1].content; // Reset the prompt to the last sent message
		$editor.abortController?.abort();
		$editor.completion = '';
		$editor.isCompletionInProgress = false;
		$session.messages = $session.messages.slice(0, -1); // Remove the "incomplete" AI response
	}
</script>

<div class="session">
	<Head
		title={[$editor.isNewSession ? $LL.newSession() : getSessionTitle($session), $LL.sessions()]}
	/>
	<Header confirmDeletion={$shouldConfirmDeletion}>
		<p data-testid="session-id" class="text-sm font-bold leading-none">
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

	<div class="session__history" bind:this={editorWindow}>
		{#if $editor.view === 'options'}
			<Controls {session} />
		{:else}
			<Messages {session} {editor} {handleRetry} />
		{/if}

		<PromptEditor {editor} {handleSubmit} {stopCompletion} />
	</div>
</div>

<style lang="postcss">
	.session {
		@apply overflow-scrollbar flex h-full w-full flex-col;
	}

	.session__history {
		@apply overflow-scrollbar flex h-full flex-grow flex-col;
	}
</style>
