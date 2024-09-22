<script lang="ts">
	import { LoaderCircle, StopCircle, UnfoldVertical } from 'lucide-svelte';
	import MessageSquareText from 'lucide-svelte/icons/message-square-text';
	import Settings_2 from 'lucide-svelte/icons/settings-2';
	import type { ChatRequest } from 'ollama/browser';
	import { afterUpdate, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { writable, type Writable } from 'svelte/store';

	import LL from '$i18n/i18n-svelte';
	import { beforeNavigate } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import ButtonCopy from '$lib/components/ButtonCopy.svelte';
	import ButtonDelete from '$lib/components/ButtonDelete.svelte';
	import ButtonSubmit from '$lib/components/ButtonSubmit.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import Field from '$lib/components/Field.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
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
		type Session
	} from '$lib/sessions';
	import { Sitemap } from '$lib/sitemap';

	import type { PageData } from './$types';
	import Article from './Article.svelte';
	import Controls from './Controls.svelte';

	export let data: PageData;

	let session: Writable<Session> = writable(loadSession(data.id));
	let messageWindow: HTMLElement;
	let completion: string;
	let abortController: AbortController;
	let prompt: string;
	let promptTextarea: HTMLTextAreaElement;
	let isCompletionInProgress = false;
	let messageIndexToEdit: number | null = null;
	let isPromptFullscreen = false;
	let shouldFocusTextarea = false;
	let userScrolledUp = false;
	let view: 'messages' | 'options' = 'messages';
	const shouldConfirmDeletion = writable(false);

	$: isNewSession = !$session?.messages.length;
	$: shouldFocusTextarea = !isPromptFullscreen;
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
		const message: Message = { role: 'user', content: prompt };
		$session.messages = [...$session.messages, message];

		await scrollToBottom(true); // Force scroll after submitting prompt
		await handleCompletion([...$session.messages, message]);
	}

	async function handleSubmitEditMessage() {
		if (messageIndexToEdit === null) return;

		$session.messages[messageIndexToEdit].content = prompt;

		// Remove all messages after the edited message
		$session.messages = $session.messages.slice(0, messageIndexToEdit + 1);

		messageIndexToEdit = null;
		prompt = '';

		await handleCompletion($session.messages);
	}

	function handleSubmit() {
		if (!prompt) return;
		isPromptFullscreen = false;

		if (messageIndexToEdit !== null) handleSubmitEditMessage();
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
		abortController = new AbortController();
		isCompletionInProgress = true;
		prompt = ''; // Reset the prompt form field
		completion = '';

		const ollamaChatRequest: ChatRequest = {
			model: $session.model,
			options: $session.options,
			messages: [$session.systemPrompt, ...messages]
		};

		console.log(ollamaChatRequest);

		try {
			await ollamaChat(ollamaChatRequest, abortController.signal, async (chunk) => {
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
			shouldFocusTextarea = true;
			isCompletionInProgress = false;
			await scrollToBottom();
		} catch (error) {
			const typedError = error instanceof Error ? error : new Error(String(error));
			if (typedError.name === 'AbortError') return; // User aborted the request
			handleError(typedError);
		}
	}

	function handleEditMessage(message: Message) {
		messageIndexToEdit = $session.messages.findIndex((m) => m === message);
		isPromptFullscreen = true;
		prompt = message.content;
		promptTextarea.focus();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.shiftKey) return;
		if (event.key !== 'Enter') return;
		event.preventDefault();
		handleSubmit();
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
		prompt = $session.messages[$session.messages.length - 1].content; // Reset the prompt to the last sent message
		abortController.abort();
		completion = '';
		isCompletionInProgress = false;
		$session.messages = $session.messages.slice(0, -1); // Remove the "incomplete" AI response
	}

	beforeNavigate((navigation) => {
		if (!isCompletionInProgress) return;
		const userConfirmed = confirm($LL.areYouSureYouWantToLeave());
		if (userConfirmed) {
			stopCompletion();
			return;
		}
		navigation.cancel();
	});

	afterUpdate(() => {
		if (shouldFocusTextarea && promptTextarea) {
			promptTextarea.focus();
			shouldFocusTextarea = false;
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
		{#if view === 'options'}
			<Controls {session} />
		{:else}
			<div class="session__articles {isPromptFullscreen ? 'session__articles--fullscreen' : ''}">
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

				{#if isCompletionInProgress}
					<Article message={{ role: 'assistant', content: completion || '...' }} />
				{/if}
			</div>
		{/if}

		<div class="prompt-editor {isPromptFullscreen ? 'prompt-editor--fullscreen' : ''}">
			<button
				class="prompt-editor__toggle"
				on:click={() => (isPromptFullscreen = !isPromptFullscreen)}
			>
				<UnfoldVertical class="mx-auto my-2 h-3 w-3 opacity-50" />
			</button>

			<div class="prompt-editor__form">
				<Fieldset context={isPromptFullscreen ? 'editor' : undefined}>
					<div class="prompt-editor__project">
						<FieldSelectModel />

						<nav class="prompt-editor__segmented-nav-container">
							<Button
								variant="icon"
								class={`prompt-editor__segmented-nav ${view === 'messages' ? ' prompt-editor__segmented-nav--active' : ''}`}
								on:click={() => (view = 'messages')}
							>
								<MessageSquareText class="base-icon" />
							</Button>
							<Button
								variant="icon"
								class={`prompt-editor__segmented-nav ${view === 'options' ? ' prompt-editor__segmented-nav--active' : ''}`}
								on:click={() => (view = 'options')}
							>
								<Settings_2 class="base-icon" />
							</Button>
						</nav>
					</div>

					{#key session}
						{#if isPromptFullscreen}
							<FieldTextEditor label={$LL.prompt()} {handleSubmit} bind:value={prompt} />
						{:else}
							<Field name="prompt">
								<textarea
									name="prompt"
									class="prompt-editor__textarea"
									placeholder={$LL.promptPlaceholder()}
									bind:this={promptTextarea}
									bind:value={prompt}
									on:keydown={handleKeyDown}
								/>
							</Field>
						{/if}
					{/key}

					<nav class="prompt-editor__toolbar">
						{#if messageIndexToEdit !== null}
							<Button
								variant="outline"
								on:click={() => {
									prompt = '';
									messageIndexToEdit = null;
									isPromptFullscreen = false;
								}}
							>
								{$LL.cancel()}
							</Button>
						{/if}
						<ButtonSubmit
							{handleSubmit}
							hasMetaKey={isPromptFullscreen}
							disabled={!prompt ||
								$settingsStore.ollamaServerStatus === 'disconnected' ||
								$settingsStore.ollamaModels.length === 0 ||
								!$settingsStore.ollamaModel}
						>
							{$LL.run()}
						</ButtonSubmit>

						{#if isCompletionInProgress}
							<Button title="Stop completion" variant="outline" on:click={stopCompletion}>
								<div class="prompt-editor__stop">
									<span class="prompt-editor__stop-icon">
										<StopCircle class=" base-icon" />
									</span>
									<span class="prompt-editor__loading-icon">
										<LoaderCircle class="prompt-editor__loading-icon base-icon animate-spin" />
									</span>
								</div>
							</Button>
						{/if}
					</nav>
				</Fieldset>
			</div>
		</div>
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

	.prompt-editor {
		@apply sticky bottom-0 z-10 mx-auto flex w-full flex-col border-t;
		@apply 2xl:max-w-[80ch] 2xl:rounded-t-lg 2xl:border-l 2xl:border-r;
	}

	.prompt-editor__project {
		@apply grid grid-cols-[auto,max-content] items-end gap-x-2;
	}

	.prompt-editor__segmented-nav-container {
		@apply flex h-full items-center rounded bg-shade-2 p-1;
	}

	:global(.prompt-editor__segmented-nav) {
		@apply h-full;
	}

	:global(.prompt-editor__segmented-nav--active) {
		@apply bg-shade-0 shadow;
	}

	.prompt-editor--fullscreen {
		@apply min-h-[60dvh];
	}

	.prompt-editor__form {
		@apply overflow-scrollbar h-full bg-shade-1;
	}

	.prompt-editor__toggle {
		@apply border-b bg-shade-1;
		@apply hover:bg-shade-2 active:bg-shade-2;
		@apply 2xl:rounded-t-lg;
	}

	.prompt-editor__textarea {
		@apply base-input min-h-16 resize-none scroll-p-2 px-3 py-2;
		@apply md:min-h-20;
	}

	.prompt-editor__toolbar {
		@apply flex items-stretch gap-x-2;
	}

	.prompt-editor__stop {
		@apply relative -mx-3 -my-2 h-9 w-9;
	}

	.prompt-editor__stop:hover {
		.prompt-editor__stop-icon {
			@apply opacity-100;
		}

		.prompt-editor__loading-icon {
			@apply opacity-0;
		}
	}

	.prompt-editor__stop-icon,
	.prompt-editor__loading-icon {
		@apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2;
	}

	.prompt-editor__stop-icon {
		@apply opacity-0;
	}

	.prompt-editor__loading-icon {
		@apply opacity-100;
	}
</style>
