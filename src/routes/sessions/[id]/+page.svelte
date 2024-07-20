<script lang="ts">
	import { afterUpdate, tick } from 'svelte';
	import { writable } from 'svelte/store';
	import { Brain, StopCircle, UnfoldVertical } from 'lucide-svelte';

	import Button from '$lib/components/Button.svelte';
	import Article from './Article.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import Header from '$lib/components/Header.svelte';

	import { loadKnowledge, type Knowledge } from '$lib/knowledge';
	import { settingsStore, knowledgeStore } from '$lib/store';
	import { ollamaGenerate, type OllamaCompletionResponse } from '$lib/ollama';
	import {
		saveSession,
		type Message,
		type Session,
		loadSession,
		formatSessionMetadata
	} from '$lib/sessions';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import { Sitemap } from '$lib/sitemap';

	import type { PageData } from './$types';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import ButtonSubmit from '$lib/components/ButtonSubmit.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import Field from '$lib/components/Field.svelte';
	import CopyButton from './CopyButton.svelte';
	import ButtonDelete from '$lib/components/ButtonDelete.svelte';
	import Metadata from '$lib/components/Metadata.svelte';

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

	const shouldConfirmDeletion = writable(false);

	$: session = loadSession(data.id);
	$: isNewSession = !session?.messages.length;
	$: isLastMessageFromUser = session?.messages[session.messages.length - 1]?.role === 'user';
	$: session && scrollToBottom();
	$: if ($settingsStore?.ollamaModel) session.model = $settingsStore.ollamaModel;
	$: knowledge = knowledgeId ? loadKnowledge(knowledgeId) : null;
	$: shouldFocusTextarea = !isPromptFullscreen;

	afterUpdate(() => {
		if (shouldFocusTextarea && promptTextarea) {
			promptTextarea.focus();
			shouldFocusTextarea = false;
		}
	});

	async function scrollToBottom() {
		if (!messageWindow) return;
		await tick();
		messageWindow.scrollTop = messageWindow.scrollHeight;
	}

	function handleError(error: Error) {
		resetPrompt();

		let content: string;
		if (error.message === 'Failed to fetch') {
			content = `Couldn't connect to Ollama. Is the [server running](/settings)?`;
		} else {
			content = `Sorry, something went wrong.\n\`\`\`\n${error}\n\`\`\``;
		}

		const message: Message = { role: 'system', content };
		session.messages = [...session.messages, message];
	}

	async function handleCompletionDone(completion: string, context: number[]) {
		const message: Message = { role: 'ai', content: completion };
		session.messages = [...session.messages, message];
		session.updatedAt = new Date().toISOString();

		if (knowledge) {
			session.knowledge = knowledge;

			// Now that we used the knowledge, we no longer need an `id`
			// This will prevent `knowledge` from being used again
			knowledgeId = '';
		}

		completion = '';
		promptCached = '';
		shouldFocusTextarea = true;
		saveSession({ ...session, context });
	}

	async function handleSubmit() {
		if (!prompt) return;

		// Reset the prompt editor to its default state
		isPromptFullscreen = false;

		let knowledgeContext: Message | null = null;
		if (knowledge) {
			knowledgeContext = {
				role: 'system',
				knowledge,
				content: ''
			};
		}

		const message: Message = { role: 'user', content: prompt };
		abortController = new AbortController();
		promptCached = prompt;
		prompt = '';
		completion = '';
		session.messages = knowledgeContext
			? [knowledgeContext, ...session.messages, message]
			: [...session.messages, message];

		try {
			const ollama = await ollamaGenerate(session, abortController.signal);

			if (ollama && ollama.body) {
				const reader = ollama.body.pipeThrough(new TextDecoderStream()).getReader();

				while (true) {
					const { value, done } = await reader.read();

					if (!ollama.ok && value) throw new Error(JSON.parse(value).error);

					if (done) {
						handleCompletionDone(completion, session.context);
						break;
					}

					if (!value) continue;

					const jsonLines = value.split('\n').filter((line) => line);
					for (const line of jsonLines) {
						const { response, context } = JSON.parse(line) as OllamaCompletionResponse;
						completion += response;
						session.context = context;
					}
				}
			}
		} catch (error: any) {
			if (error.name === 'AbortError') return; // User aborted the request
			handleError(error);
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
</script>

<div class="session">
	<Header confirmDeletion={$shouldConfirmDeletion}>
		<p data-testid="session-id" class="text-sm font-bold leading-none">
			Session <Button size="link" variant="link" href={`/sessions/${session.id}`}
				>#{session.id}</Button
			>
		</p>
		<Metadata dataTestid="session-metadata">
			{isNewSession ? 'New session' : formatSessionMetadata(session)}
		</Metadata>

		<svelte:fragment slot="nav">
			{#if !isNewSession}
				<CopyButton content={JSON.stringify(session.messages, null, 2)} />
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
						<Article {message} />
					{/key}
				{/each}

				{#if isLastMessageFromUser}
					<Article message={{ role: 'ai', content: completion || '...' }} />
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
							<div class="prompt-editor__tools">
								<FieldSelectModel />
								<div class="prompt-editor__knowledge">
									<FieldSelect
										label="Knowledge"
										name="knowledge"
										disabled={!$knowledgeStore}
										options={$knowledgeStore?.map((k) => ({ value: k.id, option: k.name }))}
										bind:value={knowledgeId}
									/>

									<Button
										aria-label="New knowledge"
										variant="outline"
										size="icon"
										href={generateNewUrl(Sitemap.KNOWLEDGE)}
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
									<svelte:fragment slot="label">Prompt</svelte:fragment>
									<textarea
										name="prompt"
										class="prompt-editor__textarea"
										bind:this={promptTextarea}
										bind:value={prompt}
										on:keydown={handleKeyDown}
									/>
								</Field>
							{/if}
						{/key}

						<div class="flex w-full">
							<ButtonSubmit {handleSubmit} hasMetaKey={isPromptFullscreen} disabled={!prompt}>
								Run
							</ButtonSubmit>

							{#if isLastMessageFromUser}
								<div class="ml-2">
									<Button
										title="Stop response"
										variant="outline"
										size="icon"
										on:click={() => {
											abortController.abort();
											resetPrompt();
										}}
									>
										<StopCircle class="h-4 w-4" />
									</Button>
								</div>
							{/if}
						</div>
					</Fieldset>
				</div>
			</div>
		</div>
	{/key}
</div>

<style lang="scss">
	@import '$lib/mixins.scss';

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

	.prompt-editor__tools {
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
		@include base-input;
		@apply min-h-16;
	}
</style>
