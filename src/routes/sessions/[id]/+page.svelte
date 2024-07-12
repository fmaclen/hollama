<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { Brain, StopCircle, Trash2, UnfoldVertical } from 'lucide-svelte';

	import Button from '$lib/components/Button.svelte';
	import Article from './Article.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import Header from '$lib/components/Header.svelte';

	import { loadKnowledge, type Knowledge } from '$lib/knowledge';
	import { settingsStore, sessionsStore, knowledgeStore } from '$lib/store';
	import { ollamaGenerate, type OllamaCompletionResponse } from '$lib/ollama';
	import { saveSession, type Message, type Session, loadSession } from '$lib/sessions';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import { Sitemap } from '$lib/sitemap';

	import type { PageData } from './$types';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import ButtonSubmit from '$lib/components/ButtonSubmit.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';

	export let data: PageData;

	let messageWindow: HTMLElement;
	let session: Session;
	let completion: string;
	let prompt: string;
	let promptCached: string;
	let abortController: AbortController;
	let isPromptFullscreen = false;

	let knowledgeId: string;
	let knowledge: Knowledge | null;

	$: session = loadSession(data.id);
	$: isNewSession = !session?.messages.length;
	$: isLastMessageFromUser = session?.messages[session.messages.length - 1]?.role === 'user';
	$: session && scrollToBottom();
	$: if ($settingsStore?.ollamaModel) session.model = $settingsStore.ollamaModel;
	$: knowledge = knowledgeId ? loadKnowledge(knowledgeId) : null;

	async function scrollToBottom() {
		if (!messageWindow) return;
		await tick();
		messageWindow.scrollTop = messageWindow.scrollHeight;
	}

	function handleError(error: any) {
		const message: Message = {
			role: 'system',
			content: typeof error === 'string' ? error : 'Sorry, something went wrong.'
		};
		session.messages = [...session.messages, message];
	}

	function deleteSession() {
		const confirmed = confirm('Are you sure you want to delete this session?');
		if (!confirmed) return;

		if ($sessionsStore) {
			const updatedSessions = $sessionsStore.filter((s) => s.id !== session.id);
			$sessionsStore = updatedSessions;
		}
		goto('/sessions');
	}

	async function handleCompletionDone(completion: string, context: number[]) {
		const message: Message = { role: 'ai', content: completion };
		session.messages = [...session.messages, message];
		completion = '';
		promptCached = '';
		saveSession({ ...session, context });
	}

	async function handleSubmit() {
		if (!prompt) return;

		let knowledgeContext: Message | null = null;
		if (knowledge) {
			knowledgeContext = {
				role: 'system',
				knowledge,
				content: ''
			};

			// Now that we used the knowledge, we no longer need an `id`
			// This will prevent `knowledge` from being used again
			knowledgeId = '';
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
			} else {
				throw new Error("Couldn't connect to Ollama");
			}
		} catch (error: any) {
			if (error.name === 'AbortError') return; // User aborted the request
			handleError(error);
		}
	}

	function handleAbort() {
		abortController.abort();
		// Reset the prompt to the last sent message
		prompt = promptCached;
		promptCached = '';
		// Remove the "incomplete" AI response
		session.messages = session.messages.slice(0, -1);
	}
</script>

<div class="session">
	<Header>
		<p data-testid="session-id" class="text-sm font-bold leading-none">
			Session <Button size="link" variant="link" href={`/${session.id}`}>#{session.id}</Button>
		</p>
		<p data-testid="model-name" class="text-sm text-muted">
			{isNewSession ? 'New session' : session.model}
		</p>

		<svelte:fragment slot="nav">
			{#if !isNewSession}
				<Button title="Delete session" variant="outline" size="icon" on:click={deleteSession}>
					<Trash2 class="h-4 w-4" />
				</Button>
			{/if}
		</svelte:fragment>
	</Header>
	{#key isNewSession}
		<div class="article-list" bind:this={messageWindow}>
			{#if isNewSession}
				<EmptyMessage>Write a prompt to start a new session</EmptyMessage>
			{/if}

			{#each session.messages as message, i (session.id + i)}
				<Article {message} />
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
				<UnfoldVertical class="h-4 w-4 mx-auto my-2 opacity-50" />
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
						<FieldTextEditor label="Prompt" {handleSubmit} bind:value={prompt} />
					{/key}

					<div class="flex w-full">
						<ButtonSubmit {handleSubmit} disabled={!prompt}>Run</ButtonSubmit>
						{#if isLastMessageFromUser}
							<div class="ml-2">
								<Button title="Stop response" variant="outline" size="icon" on:click={handleAbort}>
									<StopCircle class="h-4 w-4" />
								</Button>
							</div>
						{/if}
					</div>
				</Fieldset>
			</div>
		</div>
	{/key}
</div>

<style lang="scss">
	.session {
		@apply relative flex h-full w-full flex-col overflow-y-auto;
	}

	.article-list {
		@apply flex flex-grow flex-col overflow-y-auto p-4;
		@apply lg:p-8;
	}

	.prompt-editor__tools {
		@apply grid grid-cols-[1fr,1fr] items-end gap-x-3;
		@apply lg:gap-x-6;
	}

	.prompt-editor__knowledge {
		@apply grid grid-cols-[auto,max-content] items-end gap-x-1;
		@apply lg:gap-x-2;
	}

	.prompt-editor {
		@apply sticky bottom-0 left-0 right-0 z-10 mt-auto flex w-full flex-col border-t;
		@apply 2xl:left-1/2 2xl:max-w-[80ch] 2xl:-translate-x-1/2 2xl:rounded-t-lg 2xl:border-l 2xl:border-r;
	}

	.prompt-editor--fullscreen {
		@apply h-full max-h-[75%];
	}

	.prompt-editor__form {
		@apply h-full overflow-y-auto p-4 bg-shade-1;
		@apply 2xl:p-8;
	}

	.prompt-editor__toggle {
		@apply bg-shade-1;
		@apply hover:bg-shade-2 active:bg-shade-2;
	}
</style>
