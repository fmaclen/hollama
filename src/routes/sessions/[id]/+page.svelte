<script lang="ts">
	import { Ollama } from 'ollama/browser';
	import { afterUpdate, tick } from 'svelte';
	import { writable } from 'svelte/store';
	import { Brain, StopCircle, UnfoldVertical } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import { loadKnowledge, type Knowledge } from '$lib/knowledge';
	import { settingsStore, knowledgeStore } from '$lib/store';
	import { ollamaTags } from '$lib/ollama';
	import {
		saveSession,
		type Message,
		loadSession,
		formatSessionMetadata,
		getSessionTitle,
		type Session
	} from '$lib/sessions';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import { Sitemap } from '$lib/sitemap';
	import type { PageData } from './$types';

	import Button from '$lib/components/Button.svelte';
	import Article from './Article.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import Header from '$lib/components/Header.svelte';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import ButtonSubmit from '$lib/components/ButtonSubmit.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import Field from '$lib/components/Field.svelte';
	import ButtonCopy from '$lib/components/ButtonCopy.svelte';
	import ButtonDelete from '$lib/components/ButtonDelete.svelte';
	import Metadata from '$lib/components/Metadata.svelte';
	import Head from '$lib/components/Head.svelte';

	export let data: PageData;

	let messageWindow: HTMLElement;
	let knowledgeId: string;
	let knowledge: Knowledge | null;
	let session: Session;
	let completion: string;
	let abortController: AbortController;
	let prompt: string;
	let promptCached: string;
	let promptTextarea: HTMLTextAreaElement;
	let isPromptFullscreen = false;
	let shouldFocusTextarea = false;
	let userScrolledUp = false;

	const shouldConfirmDeletion = writable(false);

	$: session = loadSession(data.id);
	$: isNewSession = !session?.messages.length;
	$: isLastMessageFromUser = session?.messages[session.messages.length - 1]?.role === 'user';
	$: knowledge = knowledgeId ? loadKnowledge(knowledgeId) : null;
	$: shouldFocusTextarea = !isPromptFullscreen;
	$: if ($settingsStore?.ollamaModel) session.model = $settingsStore.ollamaModel;
	$: if (messageWindow) messageWindow.addEventListener('scroll', handleScroll);
	$: if (data.id) handleSessionChange();

	async function handleSessionChange() {
		if (!$settingsStore) return;
		try {
			$settingsStore.ollamaModels = (await ollamaTags()).models;
		} catch {
			$settingsStore.ollamaModels = [];
			toast.warning("Can't connect to Ollama server");
		}
		scrollToBottom();
	}

	function handleScroll() {
		const { scrollTop, scrollHeight, clientHeight } = messageWindow;
		userScrolledUp = scrollTop + clientHeight < scrollHeight;
	}

	async function handleSubmit() {
		if (!prompt) return;

		// Reset the prompt editor to its default state
		isPromptFullscreen = false;

		let knowledgeContext: Message | null = null;
		if (knowledge) {
			knowledgeContext = {
				role: 'system',
				// Ollama only needs the content of the knowledge
				content: knowledge.content,
				// But we include the entire knowledge object to use the metadata in the UI
				knowledge
			};
		}

		const message: Message = { role: 'user', content: prompt };
		promptCached = prompt;
		prompt = '';
		session.messages = knowledgeContext
			? [knowledgeContext, ...session.messages, message]
			: [...session.messages, message];

		let payload = {
			model: session.model,
			messages: session.messages,
			stream: true
		};

		await handleCompletion(payload);
	}

	async function handleRetry(index: number) {
		// Remove all the messages after the index
		session.messages = session.messages.slice(0, index);

		const mostRecentUserMessage = session.messages.filter((m) => m.role === 'user').at(-1);
		if (!mostRecentUserMessage) throw new Error('No user message to retry');

		let payload = {
			model: session.model,
			messages: session.messages,
			stream: true
		};

		await handleCompletion(payload);
	}

	async function handleCompletion(payload: { model: string; messages: Message[] }) {
		abortController = new AbortController();
		completion = '';

		try {
			if (!$settingsStore?.ollamaServer) throw Error('Ollama server not configured');

			const ollama = new Ollama({ host: $settingsStore.ollamaServer });
			const response = await ollama.chat({
				model: payload.model,
				messages: payload.messages,
				stream: true
			});

			for await (const part of response) {
				completion += part.message.content;
				await scrollToBottom();
			}

			// After the completion save the session
			const message: Message = { role: 'assistant', content: completion };
			session.messages = [...session.messages, message];
			session.updatedAt = new Date().toISOString();

			if (knowledge) {
				session.knowledge = knowledge;
				knowledgeId = '';
			}

			saveSession({ ...session });

			// Final housekeeping
			completion = '';
			promptCached = '';
			shouldFocusTextarea = true;
			await scrollToBottom();
		} catch (error) {
			const typedError = error instanceof Error ? error : new Error(String(error));
			if (typedError.name === 'AbortError') return; // User aborted the request
			handleError(typedError);
		}
	}

	function resetPrompt() {
		// Reset the prompt to the last sent message
		prompt = promptCached;
		promptCached = '';
		// Remove the "incomplete" AI response
		session.messages = session.messages.slice(0, -1);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.shiftKey) return;
		if (event.key !== 'Enter') return;
		event.preventDefault();
		handleSubmit();
	}

	async function scrollToBottom() {
		if (!messageWindow || userScrolledUp) return;
		await tick();
		messageWindow.scrollTop = messageWindow.scrollHeight;
	}

	function handleError(error: Error) {
		let content: string;
		if (error.message === 'Failed to fetch') {
			content = `Couldn't connect to Ollama. Is the [server running](/settings)?`;
		} else {
			content = `Sorry, something went wrong.\n\`\`\`\n${error}\n\`\`\``;
		}

		const message: Message = { role: 'system', content };
		session.messages = [...session.messages, message];
	}

	afterUpdate(() => {
		if (shouldFocusTextarea && promptTextarea) {
			promptTextarea.focus();
			shouldFocusTextarea = false;
		}
	});
</script>

<div class="session">
	<Head title={[isNewSession ? 'New session' : getSessionTitle(session), 'Sessions']} />
	<Header confirmDeletion={$shouldConfirmDeletion}>
		<p data-testid="session-id" class="text-sm font-bold leading-none">
			Session <Button variant="link" href={`/sessions/${session.id}`}>#{session.id}</Button>
		</p>
		<Metadata dataTestid="session-metadata">
			{isNewSession ? 'New session' : formatSessionMetadata(session)}
		</Metadata>

		<svelte:fragment slot="nav">
			{#if !isNewSession}
				{#if !$shouldConfirmDeletion}
					<ButtonCopy content={JSON.stringify(session.messages, null, 2)} />
				{/if}
				<ButtonDelete sitemap={Sitemap.SESSIONS} id={session.id} {shouldConfirmDeletion} />
			{/if}
		</svelte:fragment>
	</Header>
	{#key isNewSession}
		<div class="session__history" bind:this={messageWindow}>
			<div class="session__articles {isPromptFullscreen ? 'session__articles--fullscreen' : ''}">
				{#if isNewSession}
					<EmptyMessage>Write a prompt to start a new session</EmptyMessage>
				{/if}

				{#each session.messages as message, i (session.id + i)}
					{#key message.role}
						<Article
							{message}
							retryIndex={['assistant', 'system'].includes(message.role) ? i : undefined}
							{handleRetry}
						/>
					{/key}
				{/each}

				{#if isLastMessageFromUser}
					<Article message={{ role: 'assistant', content: completion || '...' }} />
				{/if}
			</div>

			<div class="prompt-editor {isPromptFullscreen ? 'prompt-editor--fullscreen' : ''}">
				<button
					class="prompt-editor__toggle"
					on:click={() => (isPromptFullscreen = !isPromptFullscreen)}
				>
					<UnfoldVertical class="mx-auto my-2 h-3 w-3 opacity-50" />
				</button>

				<div class="prompt-editor__form">
					<Fieldset isFullscreen={isPromptFullscreen}>
						{#if isNewSession}
							<div class="prompt-editor__project">
								<FieldSelectModel />
								<div class="prompt-editor__knowledge">
									<FieldSelect
										label="System prompt"
										name="knowledge"
										disabled={!$knowledgeStore}
										options={$knowledgeStore?.map((k) => ({ value: k.id, option: k.name }))}
										bind:value={knowledgeId}
									/>

									<Button
										aria-label="New knowledge"
										variant="outline"
										href={generateNewUrl(Sitemap.KNOWLEDGE)}
										class="h-full text-muted"
									>
										<Brain class="h-4 w-4" />
									</Button>
								</div>
							</div>
						{/if}

						{#key session}
							{#if isPromptFullscreen}
								<FieldTextEditor label="Prompt" {handleSubmit} bind:value={prompt} />
							{:else}
								<Field name="prompt">
									<textarea
										name="prompt"
										class="prompt-editor__textarea"
										placeholder="Write literally anything"
										bind:this={promptTextarea}
										bind:value={prompt}
										on:keydown={handleKeyDown}
									/>
								</Field>
							{/if}
						{/key}

						<nav class="prompt-editor__toolbar">
							<ButtonSubmit
								{handleSubmit}
								hasMetaKey={isPromptFullscreen}
								disabled={!prompt ||
									!$settingsStore?.ollamaModels.length ||
									!$settingsStore?.ollamaModel}
							>
								Run
							</ButtonSubmit>

							{#if isLastMessageFromUser}
								<Button
									title="Stop response"
									variant="outline"
									on:click={() => {
										abortController.abort();
										resetPrompt();
									}}
								>
									<StopCircle class="h-4 w-4" />
								</Button>
							{/if}
						</nav>
					</Fieldset>
				</div>
			</div>
		</div>
	{/key}
</div>

<style lang="postcss">
	.session {
		@apply flex h-full w-full flex-col overflow-y-auto;
	}

	.session__history {
		@apply flex h-full flex-grow flex-col overflow-y-auto;
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
		@apply grid grid-cols-[1fr,1fr] items-end gap-x-4;
	}

	.prompt-editor__knowledge {
		@apply grid grid-cols-[auto,max-content] items-end gap-x-1;
		@apply lg:gap-x-2;
	}

	.prompt-editor--fullscreen {
		@apply min-h-[60dvh];
	}

	.prompt-editor__form {
		@apply h-full overflow-y-auto bg-shade-1;
	}

	.prompt-editor__toggle {
		@apply border-b bg-shade-1;
		@apply hover:bg-shade-2 active:bg-shade-2;
		@apply 2xl:rounded-t-lg;
	}

	.prompt-editor__textarea {
		@apply base-input min-h-16 resize-none scroll-p-4;
		@apply md:min-h-20;
	}

	.prompt-editor__toolbar {
		@apply flex items-center gap-x-2;
	}
</style>
